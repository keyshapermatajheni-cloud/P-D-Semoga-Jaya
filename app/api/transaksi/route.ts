import { connection, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  await connection();

  try {
    const [jumlahTransaksi, detailTransaksi] = await Promise.all([
      prisma.transaksi_Penjualan.count(),
      prisma.detail_Transaksi.findMany({
        orderBy: {
          Transaksi_Penjualan: {
            tgl_transaksi: "desc",
          },
        },
        include: {
          Barang: {
            select: {
              nama_barang: true,
            },
          },
          Transaksi_Penjualan: {
            select: {
              id_transaksi: true,
              tgl_transaksi: true,
              Pengguna: {
                select: {
                  nama_pengguna: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalNilaiTransaksi = detailTransaksi.reduce(
      (total, detail) =>
        total + detail.jumlah * Number(detail.harga_satuan),
      0,
    );

    return NextResponse.json({
      summary: {
        jumlahTransaksi,
        totalNilaiTransaksi,
      },
      transactions: detailTransaksi.map((detail) => ({
        idTransaksi: detail.Transaksi_Penjualan.id_transaksi,
        namaBarang: detail.Barang.nama_barang,
        jumlah: detail.jumlah,
        hargaSatuan: Number(detail.harga_satuan),
        tanggal: detail.Transaksi_Penjualan.tgl_transaksi.toISOString(),
        kasir: detail.Transaksi_Penjualan.Pengguna.nama_pengguna,
      })),
    });
  } catch (error) {
    console.error("Gagal mengambil data transaksi:", error);
    return NextResponse.json(
      {
        error: "Gagal mengambil data transaksi.",
      },
      { status: 500 },
    );
  }
}
