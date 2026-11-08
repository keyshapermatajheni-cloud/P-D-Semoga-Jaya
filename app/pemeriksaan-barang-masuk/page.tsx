import { RoutePage } from "@/app/components/route-page";
import { prisma } from "@/app/lib/prisma";

export const instant = false;

export default async function PemeriksaanBarangMasukPage() {
  const incoming = await prisma.barang_Masuk.findMany({
    where: { status_periksa: { not: "Selesai" } },
    orderBy: [{ tgl_penerima: "desc" }, { id_barang_masuk: "desc" }],
  });
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);

  return (
    <RoutePage
      role="Admin"
      title="Pemeriksaan Barang Masuk"
      subtitle="Penerimaan yang belum selesai diperiksa"
      activeHref="/pemeriksaan-barang-masuk"
      columns={["Tanggal", "ID Penerimaan", "ID Pemesanan", "Status"]}
      rows={incoming.map((item) => [
        formatDate(item.tgl_penerima),
        item.id_barang_masuk,
        item.id_pemesanan,
        item.status_periksa,
      ])}
      emptyMessage="Tidak ada barang masuk yang perlu diperiksa."
    />
  );
}
