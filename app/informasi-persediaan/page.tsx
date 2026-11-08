import { RoutePage } from "@/app/components/route-page";
import { prisma } from "@/app/lib/prisma";

export const instant = false;

export default async function InformasiPersediaanPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: requestedRole } = await searchParams;
  const role = requestedRole === "Admin" ? "Admin" : "Owner";
  const barang = await prisma.barang.findMany({
    orderBy: { nama_barang: "asc" },
    select: {
      nama_barang: true,
      satuan: true,
      stok_gudang: true,
      stok_display: true,
      stok_minimum: true,
    },
  });

  return (
    <RoutePage
      role={role}
      title="Informasi Persediaan"
      subtitle="Ketersediaan stok gudang dan display"
      activeHref="/informasi-persediaan"
      columns={["Barang", "Satuan", "Gudang", "Display", "Minimum"]}
      rows={barang.map((item) => [
        item.nama_barang,
        item.satuan,
        String(item.stok_gudang),
        String(item.stok_display),
        String(item.stok_minimum),
      ])}
      emptyMessage="Belum ada data persediaan."
    />
  );
}
