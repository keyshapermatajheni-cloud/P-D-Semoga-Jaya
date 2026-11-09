"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@/app/lib/ids";
import { prisma } from "@/app/lib/prisma";

export async function receivePemesanan(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const itemIds = formData.getAll("itemId").map(String);
  const sentValues = formData.getAll("jumlahDikirim").map(String);
  const receivedValues = formData.getAll("jumlahDiterima").map(String);

  if (!orderId || !itemIds.length || itemIds.length !== sentValues.length || itemIds.length !== receivedValues.length) {
    return { ok: false, message: "Data penerimaan barang tidak lengkap." };
  }

  const receivedItems = itemIds.map((id_barang, index) => ({
    id_barang,
    jumlah_dikirim: Number.parseInt(sentValues[index] ?? "", 10),
    jumlah_diterima: Number.parseInt(receivedValues[index] ?? "", 10),
  }));
  if (receivedItems.some((item) =>
    !item.id_barang ||
    !Number.isInteger(item.jumlah_dikirim) ||
    !Number.isInteger(item.jumlah_diterima) ||
    item.jumlah_dikirim < 0 ||
    item.jumlah_diterima < 0 ||
    item.jumlah_diterima > item.jumlah_dikirim
  )) {
    return {
      ok: false,
      message: "Jumlah diterima harus bilangan 0 atau lebih dan tidak melebihi jumlah dikirim.",
    };
  }
  if (new Set(itemIds).size !== itemIds.length) {
    return { ok: false, message: "Barang yang sama tercantum lebih dari satu kali." };
  }

  const admin = await prisma.pengguna.findFirst({
    where: { role: "Admin" },
    orderBy: { id_pengguna: "asc" },
  });
  if (!admin) {
    return { ok: false, message: "Akun Admin belum tersedia di database." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.pemesanan_Barang.findUnique({
        where: { id_pemesanan: orderId },
        include: { Detail_Pemesanan: true },
      });
      if (!order || order.status_pemesanan === "Diterima") {
        throw new Error("Pesanan tidak ditemukan atau sudah diterima.");
      }

      const claimed = await tx.pemesanan_Barang.updateMany({
        where: {
          id_pemesanan: orderId,
          status_pemesanan: { notIn: ["Diterima", "Diproses"] },
        },
        data: { status_pemesanan: "Diproses" },
      });
      if (claimed.count !== 1) {
        throw new Error("Pesanan sedang atau sudah diproses oleh pengguna lain.");
      }

      const expectedIds = new Set(order.Detail_Pemesanan.map((item) => item.id_barang));
      if (
        receivedItems.length !== expectedIds.size ||
        receivedItems.some((item) => !expectedIds.has(item.id_barang))
      ) {
        throw new Error("Daftar barang penerimaan tidak sesuai dengan detail pesanan.");
      }

      const receiptId = createId("RCV-", 25);
      await tx.barang_Masuk.create({
        data: {
          id_barang_masuk: receiptId,
          tgl_penerima: new Date(),
          status_periksa: "Belum Diperiksa",
          id_pemesanan: orderId,
          id_pengguna: admin.id_pengguna,
        },
      });
      await tx.detail_Barang_Masuk.createMany({
        data: receivedItems.map((item) => ({
          id_detail_barang_masuk: createId("DBM", 10),
          jumlah_dikirim: item.jumlah_dikirim,
          jumlah_diterima: item.jumlah_diterima,
          id_barang: item.id_barang,
          id_barang_masuk: receiptId,
        })),
      });

      for (const item of receivedItems) {
        if (item.jumlah_diterima === 0) continue;
        await tx.barang.update({
          where: { id_barang: item.id_barang },
          data: { stok_gudang: { increment: item.jumlah_diterima } },
        });
      }
      await tx.pemesanan_Barang.update({
        where: { id_pemesanan: orderId },
        data: { status_pemesanan: "Diterima" },
      });
    });

    revalidatePath("/barang-masuk");
    revalidatePath("/pemeriksaan-barang-masuk");
    revalidatePath("/ketidaksesuaian-barang");
    revalidatePath("/informasi-persediaan");
    revalidatePath("/stok-terkini");
    revalidatePath("/dashboard");
    return { ok: true, message: "Barang masuk berhasil disimpan dan stok gudang diperbarui." };
  } catch (error) {
    console.error("Gagal menyimpan penerimaan barang:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Penerimaan barang gagal disimpan.",
    };
  }
}

export async function completePemeriksaan(formData: FormData) {
  const receiptId = String(formData.get("receiptId") ?? "");
  if (!receiptId) {
    return { ok: false, message: "Data penerimaan tidak ditemukan." };
  }

  try {
    const updated = await prisma.barang_Masuk.updateMany({
      where: {
        id_barang_masuk: receiptId,
        status_periksa: { not: "Selesai" },
      },
      data: { status_periksa: "Selesai" },
    });
    if (updated.count !== 1) {
      return {
        ok: false,
        message: "Penerimaan ini sudah selesai diperiksa atau tidak ditemukan.",
      };
    }

    revalidatePath("/pemeriksaan-barang-masuk");
    revalidatePath("/barang-masuk");
    revalidatePath("/dashboard");
    return { ok: true, message: "Pemeriksaan barang masuk berhasil diselesaikan." };
  } catch (error) {
    console.error("Gagal menyelesaikan pemeriksaan barang:", error);
    return { ok: false, message: "Pemeriksaan barang gagal disimpan." };
  }
}
