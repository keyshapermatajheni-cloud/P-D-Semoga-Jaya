import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { PermintaanForm } from "./permintaan-form";

export const instant = false;

export default async function PermintaanBarangPage() {
  const [barangs, requests] = await Promise.all([
    prisma.barang.findMany({
      orderBy: { nama_barang: "asc" },
      select: {
        id_barang: true,
        nama_barang: true,
        satuan: true,
        stok_display: true,
      },
    }),
    prisma.penyesuaian_Stok.findMany({
      where: {
        jenis: { in: ["Permintaan", "Diproses", "Dipenuhi", "Ditolak"] },
      },
      orderBy: [{ tanggal: "desc" }, { id_penyesuaian: "desc" }],
      include: {
        Barang: { select: { nama_barang: true, satuan: true } },
      },
      take: 50,
    }),
  ]);
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);

  return (
    <AppShell
      role="Cashier"
      title="Permintaan Barang"
      subtitle="Ajukan permintaan barang tambahan kepada Restocker."
      activeHref="/permintaan-barang"
    >
      <section className="request-page-grid" aria-label="Permintaan barang">
        <PermintaanForm barangs={barangs} />
        <section className="request-history-card">
          <h2>Permintaan Hari Ini</h2>
          <div className="request-history-table">
            <div className="request-history-header">
              <span>Tanggal</span>
              <span>Barang</span>
              <span>Jumlah</span>
              <span>Status</span>
            </div>
            {requests.map((request) => (
              <div className="request-history-row" key={request.id_penyesuaian}>
                <span>{formatDate(request.tanggal)}</span>
                <span>{request.Barang.nama_barang}</span>
                <span>
                  {request.jumlah} {request.Barang.satuan}
                </span>
                <span>{request.jenis}</span>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="route-empty">Belum ada permintaan barang yang dibuat.</p>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
