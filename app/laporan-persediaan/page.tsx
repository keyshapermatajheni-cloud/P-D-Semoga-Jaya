import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { ReportControls } from "./report-controls";

export const instant = false;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function LaporanPersediaanPage() {
  const laporan = await prisma.laporan_Persediaan.findMany({
    orderBy: [{ tgl_laporan: "desc" }, { id_laporan: "desc" }],
    take: 50,
    include: { Pengguna: { select: { nama_pengguna: true } } },
  });
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  return (
    <AppShell
      role="Owner"
      title="Laporan Persediaan"
      subtitle="Riwayat dan ringkasan barang masuk, barang keluar, serta stok akhir."
      activeHref="/laporan-persediaan"
    >
      <ReportControls
        periodeAwalDefault={toInputDate(monthStart)}
        periodeAkhirDefault={toInputDate(now)}
      />
      {laporan.length > 0 ? (
        <section className="route-page-card report-history-card" aria-label="Riwayat laporan persediaan">
          <div className="route-table" role="table">
            <div className="route-table-row route-table-header report-table-row" role="row">
              {["Tanggal", "Periode Awal", "Periode Akhir", "Pembuat", "Aksi"].map(
                (column) => <span role="columnheader" key={column}>{column}</span>,
              )}
            </div>
            {laporan.map((item) => (
              <div className="route-table-row report-table-row" role="row" key={item.id_laporan}>
                <span role="cell">{formatDate(item.tgl_laporan)}</span>
                <span role="cell">{formatDate(item.periode_awal)}</span>
                <span role="cell">{formatDate(item.periode_akhir)}</span>
                <span role="cell">{item.Pengguna.nama_pengguna}</span>
                <span role="cell">
                  <ReportControls
                    laporanId={item.id_laporan}
                    periodeAwalDefault=""
                    periodeAkhirDefault=""
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="route-empty">Belum ada laporan persediaan.</p>
      )}
    </AppShell>
  );
}
