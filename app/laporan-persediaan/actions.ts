"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@/app/lib/ids";
import { prisma } from "@/app/lib/prisma";

function parseDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : parsed;
}

export async function createLaporanPersediaan(formData: FormData) {
  const periodeAwal = parseDate(String(formData.get("periodeAwal") ?? ""));
  const periodeAkhir = parseDate(String(formData.get("periodeAkhir") ?? ""));

  if (!periodeAwal || !periodeAkhir || periodeAwal > periodeAkhir) {
    return { ok: false, message: "Periode laporan tidak valid." };
  }

  const owner = await prisma.pengguna.findFirst({
    where: { role: "Owner" },
    orderBy: { id_pengguna: "asc" },
  });
  if (!owner) {
    return { ok: false, message: "Akun Owner belum tersedia di database." };
  }

  const endExclusive = new Date(periodeAkhir);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  const [barangs, incoming, sales] = await Promise.all([
    prisma.barang.findMany({
      orderBy: { id_barang: "asc" },
      select: {
        id_barang: true,
        stok_gudang: true,
        stok_display: true,
      },
    }),
    prisma.detail_Barang_Masuk.findMany({
      where: {
        Barang_Masuk: {
          tgl_penerima: { gte: periodeAwal, lt: endExclusive },
        },
      },
      select: { id_barang: true, jumlah_diterima: true },
    }),
    prisma.detail_Transaksi.findMany({
      where: {
        Transaksi_Penjualan: {
          tgl_transaksi: { gte: periodeAwal, lt: endExclusive },
        },
      },
      select: { id_barang: true, jumlah: true },
    }),
  ]);
  if (barangs.length === 0) {
    return { ok: false, message: "Tidak ada data barang untuk dibuatkan laporan." };
  }

  const masukPerBarang = new Map<string, number>();
  const keluarPerBarang = new Map<string, number>();
  for (const detail of incoming) {
    masukPerBarang.set(
      detail.id_barang,
      (masukPerBarang.get(detail.id_barang) ?? 0) + detail.jumlah_diterima,
    );
  }
  for (const detail of sales) {
    keluarPerBarang.set(
      detail.id_barang,
      (keluarPerBarang.get(detail.id_barang) ?? 0) + detail.jumlah,
    );
  }

  try {
    const reportId = createId("RPT-", 25);
    await prisma.$transaction(async (tx) => {
      await tx.laporan_Persediaan.create({
        data: {
          id_laporan: reportId,
          tgl_laporan: new Date(),
          periode_awal: periodeAwal,
          periode_akhir: periodeAkhir,
          id_pengguna: owner.id_pengguna,
        },
      });
      await tx.detail_Laporan.createMany({
        data: barangs.map((barang) => ({
          id_detail_laporan: createId("DL-", 10),
          jumlah_masuk: masukPerBarang.get(barang.id_barang) ?? 0,
          jumlah_keluar: keluarPerBarang.get(barang.id_barang) ?? 0,
          stok_akhir: barang.stok_gudang + barang.stok_display,
          id_laporan: reportId,
          id_barang: barang.id_barang,
        })),
      });
    });

    revalidatePath("/laporan-persediaan");
    revalidatePath("/dashboard");
    return { ok: true, message: "Laporan persediaan berhasil dibuat." };
  } catch (error) {
    console.error("Gagal membuat laporan persediaan:", error);
    return { ok: false, message: "Laporan persediaan gagal dibuat." };
  }
}
