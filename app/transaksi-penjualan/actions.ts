"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

function createId(prefix: string, maxLength: number, counterLength: number) {
  const value = `${Date.now()}${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`;
  return `${prefix}${value.slice(-counterLength)}`.slice(0, maxLength);
}

export async function createTransaksi(formData: FormData) {
  const itemIds = formData.getAll("itemId").map(String);
  const quantities = formData.getAll("quantity").map(String);

  const items = itemIds
    .map((id_barang, index) => ({
      id_barang,
      jumlah: Number.parseInt(quantities[index] ?? "", 10),
    }))
    .filter((item) => item.id_barang);

  if (items.length === 0) {
    return { ok: false, message: "Minimal satu barang harus ditambahkan." };
  }
  if (items.some((item) => !Number.isInteger(item.jumlah) || item.jumlah <= 0)) {
    return { ok: false, message: "Jumlah barang harus lebih dari 0." };
  }

  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id_barang)) {
      return { ok: false, message: "Barang yang sama tidak boleh ditambahkan lebih dari satu kali." };
    }
    seen.add(item.id_barang);
  }

  const cashier = await prisma.pengguna.findFirst({
    where: { role: "Cashier" },
    orderBy: { id_pengguna: "asc" },
  });
  if (!cashier) {
    return { ok: false, message: "Tidak ada pengguna dengan role Cashier pada database." };
  }

  try {
    const saleId = await prisma.$transaction(async (tx) => {
      const barang = await tx.barang.findMany({
        where: { id_barang: { in: items.map((item) => item.id_barang) } },
      });

      if (barang.length !== items.length) {
        throw new Error("Satu atau lebih barang tidak ditemukan.");
      }

      const barangById = new Map(barang.map((item) => [item.id_barang, item]));
      for (const item of items) {
        const current = barangById.get(item.id_barang);
        if (!current || item.jumlah > current.stok_display) {
          throw new Error(
            `Stok display ${current?.nama_barang ?? "barang"} tidak mencukupi. Sisa ${current?.stok_display ?? 0} pcs.`,
          );
        }
      }

      const id_transaksi = createId("TRX-", 25, 10);
      await tx.transaksi_Penjualan.create({
        data: {
          id_transaksi,
          tgl_transaksi: new Date(),
          id_pengguna: cashier.id_pengguna,
        },
      });

      await tx.detail_Transaksi.createMany({
        data: items.map((item, index) => {
          const current = barangById.get(item.id_barang)!;
          return {
            id_detail_transaksi: createId("DT", 9, 7) + String(index + 1),
            jumlah: item.jumlah,
            harga_satuan: current.harga_jual,
            id_transaksi,
            id_barang: item.id_barang,
          };
        }),
      });

      for (const item of items) {
        await tx.barang.update({
          where: { id_barang: item.id_barang },
          data: { stok_display: { decrement: item.jumlah } },
        });
      }

      return id_transaksi;
    });

    revalidatePath("/transaksi-penjualan");
    revalidatePath("/dashboard");
    return { ok: true, message: "Transaksi berhasil disimpan.", saleId };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Transaksi gagal disimpan.",
    };
  }
}
