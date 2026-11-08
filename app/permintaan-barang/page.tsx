import { RoutePage } from "@/app/components/route-page";

export const instant = false;

export default async function PermintaanBarangPage() {
  return (
    <RoutePage
      role="Cashier"
      title="Permintaan Barang"
      subtitle="Permintaan barang tambahan kepada Restocker"
      activeHref="/permintaan-barang"
      columns={["Tanggal", "Barang", "Jumlah", "Status"]}
      rows={[]}
      emptyMessage="Belum ada permintaan barang yang dibuat."
    />
  );
}
