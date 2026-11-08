import { RoutePage } from "@/app/components/route-page";

export const instant = false;

export default async function NotifikasiPermintaanPage() {
  return (
    <RoutePage
      role="Restocker"
      title="Notifikasi Permintaan"
      subtitle="Permintaan tambahan stok dari kasir"
      activeHref="/notifikasi-permintaan"
      columns={["Tanggal", "Barang", "Jumlah", "Status"]}
      rows={[]}
      emptyMessage="Belum ada permintaan barang."
    />
  );
}
