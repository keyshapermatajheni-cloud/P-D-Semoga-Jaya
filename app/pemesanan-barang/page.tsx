import { AppShell, type UserRole } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { PemesananForm } from "./pemesanan-form";

export const instant = false;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

export default async function PemesananBarangPage() {
  const role: UserRole = "Owner";

  const [suppliers, barangs, orders] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: { nama_supplier: "asc" },
      select: { id_supplier: true, nama_supplier: true },
    }),
    prisma.barang.findMany({
      orderBy: { nama_barang: "asc" },
      select: { id_barang: true, nama_barang: true },
    }),
    prisma.pemesanan_Barang.findMany({
      orderBy: [{ tgl_pemesanan: "desc" }, { id_pemesanan: "desc" }],
      include: { Supplier: { select: { nama_supplier: true } } },
    }),
  ]);

  return (
    <AppShell
      role={role}
      title="Pemesanan Barang"
      subtitle="Pesan kebutuhan barang ke supplier"
      activeHref="/pemesanan-barang"
    >
      <section className="order-page-grid" aria-label="Pemesanan barang">
        <PemesananForm suppliers={suppliers} barangs={barangs} />

        <section className="order-status-card">
          <h2>Status Pemesanan</h2>
          <div className="order-status-table" role="table" aria-label="Status pemesanan">
            <div className="order-status-row order-status-header" role="row">
              <span role="columnheader">Tanggal</span>
              <span role="columnheader">Supplier</span>
              <span role="columnheader">Status</span>
            </div>
            {orders.map((order) => (
              <div className="order-status-row" role="row" key={order.id_pemesanan}>
                <span role="cell">{formatDate(order.tgl_pemesanan)}</span>
                <span role="cell">{order.Supplier.nama_supplier}</span>
                <span role="cell">{order.status_pemesanan}</span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="order-empty">Belum ada pemesanan barang.</p>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
