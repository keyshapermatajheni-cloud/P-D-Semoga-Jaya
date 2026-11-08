import { RoutePage } from "@/app/components/route-page";
import { prisma } from "@/app/lib/prisma";

export const instant = false;

export default async function BarangMasukPage() {
  const incoming = await prisma.barang_Masuk.findMany({
    orderBy: [{ tgl_penerima: "desc" }, { id_barang_masuk: "desc" }],
    include: {
      Pemesanan_Barang: { select: { id_pemesanan: true } },
      Pengguna: { select: { nama_pengguna: true } },
    },
  });
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);

  return (
    <RoutePage
      role="Admin"
      title="Data Barang Masuk"
      subtitle="Riwayat penerimaan barang dari supplier"
      activeHref="/barang-masuk"
      columns={["Tanggal", "ID Penerimaan", "ID Pemesanan", "Status", "Penerima"]}
      rows={incoming.map((item) => [
        formatDate(item.tgl_penerima),
        item.id_barang_masuk,
        item.Pemesanan_Barang.id_pemesanan,
        item.status_periksa,
        item.Pengguna.nama_pengguna,
      ])}
      emptyMessage="Belum ada data barang masuk."
    />
  );
}
