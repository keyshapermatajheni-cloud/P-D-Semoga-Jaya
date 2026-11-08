import { AppShell, type UserRole } from "../components/app-shell";
import { DashboardAction } from "../components/dashboard-action";
import { MetricCard } from "../components/metric-card";
import { prisma } from "../lib/prisma";
import { io } from "next/cache";

const roles: UserRole[] = ["Owner", "Admin", "Restocker", "Cashier"];
export const instant = false;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: requestedRole } = await searchParams;
  const role = roles.includes(requestedRole as UserRole)
    ? (requestedRole as UserRole)
    : "Owner";

  await io();
  const jakartaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [year, month, day] = jakartaDate.split("-").map(Number);
  const today = new Date(Date.UTC(year, month - 1, day));
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const barang = await prisma.barang.findMany({
    orderBy: { nama_barang: "asc" },
    select: {
      id_barang: true,
      nama_barang: true,
      stok_gudang: true,
      stok_display: true,
      stok_minimum: true,
    },
  });

  const [
    totalBarang,
    pesananBelumDiterima,
    barangMasukHariIni,
    belumDiperiksa,
    transaksiHariIni,
    detailTransaksiHariIni,
    recentIncoming,
    recentSales,
  ] = await Promise.all([
    prisma.barang.count(),
    prisma.pemesanan_Barang.count({
      where: { status_pemesanan: { not: "Diterima" } },
    }),
    prisma.barang_Masuk.count({
      where: { tgl_penerima: { gte: today, lt: tomorrow } },
    }),
    prisma.barang_Masuk.count({
      where: { status_periksa: { not: "Selesai" } },
    }),
    prisma.transaksi_Penjualan.count({
      where: { tgl_transaksi: { gte: today, lt: tomorrow } },
    }),
    prisma.detail_Transaksi.findMany({
      where: {
        Transaksi_Penjualan: {
          tgl_transaksi: { gte: today, lt: tomorrow },
        },
      },
      select: {
        jumlah: true,
        harga_satuan: true,
        Barang: { select: { nama_barang: true } },
      },
    }),
    prisma.barang_Masuk.findMany({
      take: 7,
      orderBy: [{ tgl_penerima: "desc" }, { id_barang_masuk: "desc" }],
      select: { tgl_penerima: true, status_periksa: true },
    }),
    prisma.transaksi_Penjualan.findMany({
      take: 20,
      orderBy: [{ tgl_transaksi: "desc" }, { id_transaksi: "desc" }],
      include: { Detail_Transaksi: true },
    }),
  ]);

  const totalPenjualanHariIni = detailTransaksiHariIni.reduce(
    (sum, detail) =>
      sum + detail.jumlah * Number(detail.harga_satuan),
    0,
  );
  const stokMenipis = barang.filter(
    (item) =>
      item.stok_gudang + item.stok_display < item.stok_minimum,
  ).length;
  const stokDisplayMenipis = barang.filter(
    (item) => item.stok_display < item.stok_minimum,
  );
  const perluTambahanStok = barang.filter(
    (item) => item.stok_display < item.stok_minimum,
  );
  const barangTerlarisMap = detailTransaksiHariIni.reduce(
    (result, detail) => {
      const name = detail.Barang.nama_barang;
      result.set(name, (result.get(name) ?? 0) + detail.jumlah);
      return result;
    },
    new Map<string, number>(),
  );
  const barangTerlaris = Array.from(barangTerlarisMap.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  const dailySales = new Map<string, number>();
  for (let day = 0; day < 7; day += 1) {
    const date = new Date(sevenDaysAgo);
    date.setUTCDate(sevenDaysAgo.getUTCDate() + day);
    dailySales.set(
      date.toISOString().slice(0, 10),
      0,
    );
  }
  for (const sale of recentSales) {
    const dateKey = sale.tgl_transaksi.toISOString().slice(0, 10);
    const total = sale.Detail_Transaksi.reduce(
      (sum, detail) => sum + detail.jumlah * Number(detail.harga_satuan),
      0,
    );
    if (dailySales.has(dateKey)) {
      dailySales.set(dateKey, (dailySales.get(dateKey) ?? 0) + total);
    }
  }
  const salesSeries = Array.from(dailySales.entries()).map(([date, total]) => ({
    date,
    label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(new Date(`${date}T00:00:00`)),
    total,
  }));

  const incomingSeries = recentIncoming.map((item) => ({
    date: item.tgl_penerima.toISOString().slice(0, 10),
    label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(item.tgl_penerima),
    status: item.status_periksa,
  }));
  const cukupStok = barang.filter((item) =>
    item.stok_gudang + item.stok_display >= item.stok_minimum,
  ).length;
  const menipisStok = barang.filter((item) =>
    item.stok_gudang + item.stok_display > 0 &&
    item.stok_gudang + item.stok_display < item.stok_minimum,
  ).length;
  const habisStok = barang.filter((item) =>
    item.stok_gudang + item.stok_display === 0,
  ).length;

  const actions: Record<UserRole, Array<{ title: string; description: string; href: string }>> = {
    Owner: [
      { title: "Pemesanan Barang", description: "Pesan kebutuhan barang ke supplier", href: "/pemesanan-barang" },
      { title: "Laporan Persediaan", description: "Lihat barang masuk, barang keluar, dan stok akhir", href: "/laporan-persediaan" },
      { title: "Informasi Persediaan", description: "Ketersediaan stok barang di gudang dan display", href: "/informasi-persediaan?role=Owner" },
      { title: "Ketidaksesuaian Barang", description: "Pantau barang yang diterima tidak sesuai pesanan", href: "/ketidaksesuaian-barang" },
    ],
    Admin: [
      { title: "Data Utama Barang", description: "Tambah, cari, ubah, dan hapus", href: "/data-barang" },
      { title: "Data Barang Masuk", description: "Terima pesanan supplier", href: "/barang-masuk" },
      { title: "Pemeriksaan Barang Masuk", description: "Cocokkan jumlah fisik", href: "/pemeriksaan-barang-masuk" },
      { title: "Informasi Persediaan", description: "Ketersediaan gudang dan display", href: "/informasi-persediaan?role=Admin" },
    ],
    Restocker: [
      { title: "Perlu Tambahan Stok", description: "Kelola barang yang perlu dipindahkan ke display", href: "/perlu-tambahan-stok" },
      { title: "Stok Terkini", description: "Lihat persediaan gudang dan display", href: "/stok-terkini" },
      { title: "Notifikasi Permintaan", description: "Tinjau permintaan barang dari kasir", href: "/notifikasi-permintaan" },
    ],
    Cashier: [
      { title: "Transaksi Penjualan", description: "Catat barang yang dibeli customer", href: "/transaksi-penjualan" },
      { title: "Permintaan Barang", description: "Ajukan barang ke Restocker", href: "/permintaan-barang" },
    ],
  };

  return (
    <AppShell
      role={role}
      title={`Selamat Datang, ${role}`}
      subtitle="Ringkasan operasional sistem persediaan"
      activeHref="/dashboard"
    >
      <section className="metric-grid dashboard-metric-grid" aria-label="Ringkasan persediaan">
        {role === "Owner" && (
          <>
            <MetricCard label="Total Barang" value={totalBarang} note="jenis barang" tone="neutral" />
            <MetricCard label="Stok Menipis" value={stokMenipis} note="jenis barang" tone={stokMenipis > 0 ? "warning" : "positive"} />
            <MetricCard label="Barang Masuk Hari Ini" value={barangMasukHariIni} note="penerimaan" tone="positive" />
            <MetricCard label="Pesanan Belum Diterima" value={pesananBelumDiterima} note="pesanan" tone={pesananBelumDiterima > 0 ? "warning" : "positive"} />
          </>
        )}
        {role === "Admin" && (
          <>
            <MetricCard label="Total Barang" value={totalBarang} note="jenis barang" tone="neutral" />
            <MetricCard label="Pesanan Belum Diterima" value={pesananBelumDiterima} note="pesanan" tone={pesananBelumDiterima > 0 ? "warning" : "positive"} />
            <MetricCard label="Belum Diperiksa" value={belumDiperiksa} note="barang masuk" tone={belumDiperiksa > 0 ? "warning" : "positive"} />
            <MetricCard label="Barang Masuk Hari Ini" value={barangMasukHariIni} note="jenis" tone="positive" />
          </>
        )}
        {role === "Restocker" && (
          <>
            <MetricCard label="Perlu Tambahan Stok" value={perluTambahanStok.length} note="barang" tone={perluTambahanStok.length > 0 ? "warning" : "positive"} />
            <MetricCard label="Stok Display" value={barang.reduce((sum, item) => sum + item.stok_display, 0)} note="unit" tone="positive" />
            <MetricCard label="Stok Gudang" value={barang.reduce((sum, item) => sum + item.stok_gudang, 0)} note="unit" tone="positive" />
            <MetricCard label="Jenis Barang Menipis" value={stokDisplayMenipis.length} note="barang" tone={stokDisplayMenipis.length > 0 ? "warning" : "positive"} />
          </>
        )}
        {role === "Cashier" && (
          <>
            <MetricCard label="Transaksi Hari Ini" value={transaksiHariIni} note="transaksi" tone="positive" />
            <MetricCard label="Total Penjualan" value={`Rp ${totalPenjualanHariIni.toLocaleString("id-ID")}`} note="hari ini" tone="positive" />
            <MetricCard label="Permintaan Diajukan" value="Tidak tersedia" note="entitas belum ada" tone="warning" />
            <MetricCard label="Stok Display Menipis" value={stokDisplayMenipis.length} note="barang" tone={stokDisplayMenipis.length > 0 ? "warning" : "positive"} />
          </>
        )}
      </section>

      <section className={`action-grid action-grid-${role.toLowerCase()}`}>
        {actions[role].map((action) => (
          <DashboardAction {...action} key={action.title} />
        ))}
      </section>

      {(role === "Owner" || role === "Admin") && (
        <section className="dashboard-detail-grid" aria-label="Analisis persediaan">
          <article className="dashboard-chart-card">
            <h2>{role === "Owner" ? "Penjualan 7 Hari Terakhir" : "Barang Masuk 7 Hari Terakhir"}</h2>
            <p>{role === "Owner" ? `Rp ${salesSeries.reduce((sum, item) => sum + item.total, 0).toLocaleString("id-ID")} dalam 7 hari` : `${recentIncoming.length} penerimaan dalam data terbaru`}</p>
            {role === "Owner" ? (
              <div className="dashboard-bar-chart">
                {salesSeries.map((item) => {
                  const max = Math.max(...salesSeries.map((entry) => entry.total), 1);
                  const height = item.total === 0 ? 4 : Math.max(10, Math.round((item.total / max) * 90));
                  return (
                    <div className="dashboard-bar-column" key={item.date}>
                      <div className="dashboard-bar" style={{ height }} title={item.total.toLocaleString("id-ID")} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-bar-chart">
                {incomingSeries.length === 0 ? (
                  <p className="dashboard-empty">Belum ada barang masuk.</p>
                ) : incomingSeries.map((item, index) => (
                  <div className="dashboard-bar-column" key={`${item.date}-${index}`}>
                    <div className="dashboard-bar incoming" style={{ height: 60 }} title={item.status} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="dashboard-status-card">
            <h2>{role === "Owner" ? "Status Stok" : "Hasil Pemeriksaan"}</h2>
            {role === "Owner" ? (
              <div className="dashboard-status-list">
                <div><span className="status-dot enough" /> Cukup <strong>{cukupStok}</strong></div>
                <div><span className="status-dot low" /> Menipis <strong>{menipisStok}</strong></div>
                <div><span className="status-dot empty" /> Habis <strong>{habisStok}</strong></div>
              </div>
            ) : (
              <div className="dashboard-status-list">
                <div><span className="status-dot enough" /> Selesai <strong>{Math.max(barangMasukHariIni - belumDiperiksa, 0)}</strong></div>
                <div><span className="status-dot low" /> Belum Diperiksa <strong>{belumDiperiksa}</strong></div>
              </div>
            )}
          </article>
        </section>
      )}

      {(role === "Restocker" || role === "Cashier") && (
        <section className="dashboard-low-stock-card" aria-label="Barang stok rendah">
          <h2>{role === "Restocker" ? "Stok Display Terendah" : "Barang Terlaris Hari Ini"}</h2>
          {role === "Cashier" && barangTerlaris.length === 0 && (
            <p className="dashboard-empty">Belum ada penjualan hari ini.</p>
          )}
          {role === "Restocker" && stokDisplayMenipis.length === 0 ? (
            <p className="dashboard-empty">Tidak ada barang stok display yang menipis.</p>
          ) : role === "Restocker" ? (
            <div className="dashboard-low-stock-list">
              {stokDisplayMenipis.slice(0, 5).map((item) => (
                <div className="dashboard-low-stock-row" key={item.id_barang}>
                  <span>{item.nama_barang}</span>
                  <strong>{item.stok_display} / {item.stok_minimum} unit</strong>
                </div>
              ))}
            </div>
          ) : barangTerlaris.length > 0 ? (
            <div className="dashboard-low-stock-list">
              {barangTerlaris.map((item) => (
                <div className="dashboard-low-stock-row" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.quantity} unit</strong>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}
    </AppShell>
  );
}
