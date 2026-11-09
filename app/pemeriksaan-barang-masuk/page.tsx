import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { InspectionList } from "./inspection-list";

export const instant = false;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

export default async function PemeriksaanBarangMasukPage() {
  const incoming = await prisma.barang_Masuk.findMany({
    where: { status_periksa: { not: "Selesai" } },
    orderBy: [{ tgl_penerima: "desc" }, { id_barang_masuk: "desc" }],
    include: {
      Pemesanan_Barang: {
        include: { Supplier: { select: { nama_supplier: true } } },
      },
      Detail_Barang_Masuk: {
        include: { Barang: { select: { nama_barang: true } } },
      },
    },
  });

  return (
    <AppShell
      role="Admin"
      title="Pemeriksaan Barang Masuk"
      subtitle="Cocokkan jumlah barang yang diterima dengan barang yang dikirim."
      activeHref="/pemeriksaan-barang-masuk"
    >
      <InspectionList
        rows={incoming.map((item) => ({
          receiptId: item.id_barang_masuk,
          orderId: item.id_pemesanan,
          supplier: item.Pemesanan_Barang.Supplier.nama_supplier,
          date: formatDate(item.tgl_penerima),
          details: item.Detail_Barang_Masuk.map((detail) => ({
            id: detail.id_detail_barang_masuk,
            barang: detail.Barang.nama_barang,
            dikirim: detail.jumlah_dikirim,
            diterima: detail.jumlah_diterima,
          })),
        }))}
      />
    </AppShell>
  );
}
