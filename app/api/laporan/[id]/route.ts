import { connection, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function escapeCsv(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();
  const { id } = await params;
  const report = await prisma.laporan_Persediaan.findUnique({
    where: { id_laporan: id },
    include: {
      Detail_Laporan: {
        include: { Barang: { select: { nama_barang: true, satuan: true } } },
        orderBy: { id_detail_laporan: "asc" },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
  }

  const date = (value: Date) => value.toISOString().slice(0, 10);
  const rows = [
    ["ID Laporan", report.id_laporan],
    ["Tanggal", date(report.tgl_laporan)],
    ["Periode Awal", date(report.periode_awal)],
    ["Periode Akhir", date(report.periode_akhir)],
    [],
    ["Barang", "Satuan", "Jumlah Masuk", "Jumlah Keluar", "Stok Akhir"],
    ...report.Detail_Laporan.map((detail) => [
      detail.Barang.nama_barang,
      detail.Barang.satuan,
      detail.jumlah_masuk,
      detail.jumlah_keluar,
      detail.stok_akhir,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-${id.replace(/[^a-zA-Z0-9_-]/g, "")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
