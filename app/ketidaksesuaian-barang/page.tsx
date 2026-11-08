import { RoutePage } from "@/app/components/route-page";
import { prisma } from "@/app/lib/prisma";

export const instant = false;

export default async function KetidaksesuaianBarangPage() {
  const details = await prisma.detail_Barang_Masuk.findMany({
    where: { jumlah_dikirim: { not: undefined } },
    include: {
      Barang: { select: { nama_barang: true } },
      Barang_Masuk: { select: { id_barang_masuk: true } },
    },
    take: 100,
  });
  const mismatches = details.filter((item) => item.jumlah_dikirim !== item.jumlah_diterima);

  return (
    <RoutePage
      role="Owner"
      title="Ketidaksesuaian Barang"
      subtitle="Daftar barang yang jumlah diterima berbeda dari dikirim"
      activeHref="/ketidaksesuaian-barang"
      columns={["ID Penerimaan", "Barang", "Dikirim", "Diterima", "Selisih"]}
      rows={mismatches.map((item) => [
        item.Barang_Masuk.id_barang_masuk,
        item.Barang.nama_barang,
        String(item.jumlah_dikirim),
        String(item.jumlah_diterima),
        String(item.jumlah_diterima - item.jumlah_dikirim),
      ])}
      emptyMessage="Tidak ada ketidaksesuaian barang."
    />
  );
}
