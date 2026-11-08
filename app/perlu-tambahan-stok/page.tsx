import { RoutePage } from "@/app/components/route-page";
import { prisma } from "@/app/lib/prisma";

export const instant = false;

export default async function PerluTambahanStokPage() {
  const barang = await prisma.barang.findMany({
    where: { stok_display: { gt: -1 } },
    orderBy: { nama_barang: "asc" },
  });
  const rows = barang.filter((item) => item.stok_display < item.stok_minimum);

  return (
    <RoutePage
      role="Restocker"
      title="Perlu Tambahan Stok"
      subtitle="Barang display yang berada di bawah stok minimum"
      activeHref="/perlu-tambahan-stok"
      columns={["Barang", "Satuan", "Gudang", "Display", "Minimum", "Tambahan"]}
      rows={rows.map((item) => [
        item.nama_barang,
        item.satuan,
        String(item.stok_gudang),
        String(item.stok_display),
        String(item.stok_minimum),
        String(Math.max(0, item.stok_minimum - item.stok_display)),
      ])}
      emptyMessage="Tidak ada barang yang perlu ditambahkan ke display."
    />
  );
}
