import { RoutePage } from "@/app/components/route-page";
import { prisma } from "@/app/lib/prisma";

export const instant = false;

export default async function LaporanPersediaanPage() {
  const laporan = await prisma.laporan_Persediaan.findMany({
    orderBy: [{ tgl_laporan: "desc" }, { id_laporan: "desc" }],
    take: 50,
    include: { Pengguna: { select: { nama_pengguna: true } } },
  });
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);

  return (
    <RoutePage
      role="Owner"
      title="Laporan Persediaan"
      subtitle="Riwayat laporan persediaan barang"
      activeHref="/laporan-persediaan"
      columns={["Tanggal", "Periode Awal", "Periode Akhir", "Pembuat"]}
      rows={laporan.map((item) => [
        formatDate(item.tgl_laporan),
        formatDate(item.periode_awal),
        formatDate(item.periode_akhir),
        item.Pengguna.nama_pengguna,
      ])}
      emptyMessage="Belum ada laporan persediaan."
    />
  );
}
