import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { RequestList } from "./request-list";

export const instant = false;

export default async function NotifikasiPermintaanPage() {
  const requests = await prisma.penyesuaian_Stok.findMany({
    where: {
      jenis: { in: ["Permintaan", "Diproses", "Dipenuhi", "Ditolak"] },
    },
    orderBy: [{ tanggal: "desc" }, { id_penyesuaian: "desc" }],
    include: {
      Barang: {
        select: {
          nama_barang: true,
          satuan: true,
          stok_gudang: true,
          stok_display: true,
        },
      },
      Pengguna: { select: { nama_pengguna: true } },
    },
    take: 50,
  });
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);

  return (
    <AppShell
      role="Restocker"
      title="Notifikasi Permintaan"
      subtitle="Permintaan barang yang diajukan kasir."
      activeHref="/notifikasi-permintaan"
    >
      <section className="request-list" aria-label="Daftar permintaan barang">
        <RequestList
          rows={requests.map((request) => ({
            id: request.id_penyesuaian,
            tanggal: formatDate(request.tanggal),
            barang: request.Barang.nama_barang,
            jumlah: request.jumlah,
            satuan: request.Barang.satuan,
            gudang: request.Barang.stok_gudang,
            display: request.Barang.stok_display,
            pemohon: request.Pengguna.nama_pengguna,
            status: request.jenis,
          }))}
        />
      </section>
    </AppShell>
  );
}
