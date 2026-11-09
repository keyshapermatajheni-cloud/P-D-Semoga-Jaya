"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@/app/lib/ids";
import { prisma } from "@/app/lib/prisma";

export async function createPermintaanBarang(formData: FormData) {
  const idBarang = String(formData.get("idBarang") ?? "");
  const jumlah = Number.parseInt(String(formData.get("jumlah") ?? ""), 10);

  if (!idBarang || !Number.isInteger(jumlah) || jumlah <= 0) {
    return { ok: false, message: "Pilih barang dan masukkan jumlah lebih dari 0." };
  }

  const [cashier, barang] = await Promise.all([
    prisma.pengguna.findFirst({
      where: { role: "Cashier" },
      orderBy: { id_pengguna: "asc" },
    }),
    prisma.barang.findUnique({
      where: { id_barang: idBarang },
      select: { id_barang: true, nama_barang: true },
    }),
  ]);

  if (!cashier) {
    return { ok: false, message: "Akun kasir belum tersedia di database." };
  }
  if (!barang) {
    return { ok: false, message: "Barang tidak ditemukan." };
  }

  try {
    await prisma.penyesuaian_Stok.create({
      data: {
        id_penyesuaian: createId("REQ-", 25),
        tanggal: new Date(),
        jenis: "Permintaan",
        jumlah,
        id_barang: idBarang,
        id_pengguna: cashier.id_pengguna,
      },
    });

    revalidatePath("/permintaan-barang");
    revalidatePath("/notifikasi-permintaan");
    revalidatePath("/dashboard");
    return {
      ok: true,
      message: `Permintaan ${barang.nama_barang} berhasil dikirim ke Restocker.`,
    };
  } catch (error) {
    console.error("Gagal menyimpan permintaan barang:", error);
    return { ok: false, message: "Permintaan barang gagal disimpan." };
  }
}

export async function fulfillPermintaanBarang(formData: FormData) {
  const idPermintaan = String(formData.get("idPermintaan") ?? "");
  if (!idPermintaan) {
    return { ok: false, message: "Permintaan tidak ditemukan." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.penyesuaian_Stok.findUnique({
        where: { id_penyesuaian: idPermintaan },
        include: { Barang: { select: { nama_barang: true } } },
      });

      if (!request || request.jenis !== "Permintaan") {
        throw new Error("Permintaan ini sudah diproses atau tidak tersedia.");
      }

      const claimed = await tx.penyesuaian_Stok.updateMany({
        where: { id_penyesuaian: idPermintaan, jenis: "Permintaan" },
        data: { jenis: "Diproses" },
      });
      if (claimed.count !== 1) {
        throw new Error("Permintaan ini sudah diproses oleh pengguna lain.");
      }

      const transfer = await tx.barang.updateMany({
        where: {
          id_barang: request.id_barang,
          stok_gudang: { gte: request.jumlah },
        },
        data: {
          stok_gudang: { decrement: request.jumlah },
          stok_display: { increment: request.jumlah },
        },
      });
      if (transfer.count !== 1) {
        throw new Error(
          `Stok gudang ${request.Barang.nama_barang} tidak mencukupi untuk memenuhi permintaan.`,
        );
      }

      await tx.penyesuaian_Stok.update({
        where: { id_penyesuaian: idPermintaan },
        data: { jenis: "Dipenuhi" },
      });
      return request.Barang.nama_barang;
    });

    revalidatePath("/permintaan-barang");
    revalidatePath("/notifikasi-permintaan");
    revalidatePath("/perlu-tambahan-stok");
    revalidatePath("/stok-terkini");
    revalidatePath("/informasi-persediaan");
    revalidatePath("/dashboard");
    return {
      ok: true,
      message: `Stok ${result} berhasil dipindahkan ke display.`,
    };
  } catch (error) {
    console.error("Gagal memenuhi permintaan barang:", error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Permintaan gagal dipenuhi.",
    };
  }
}
