import Link from "next/link";
import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { ReceiveForm } from "./receive-form";

export const instant = false;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

export default async function BarangMasukPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const [incoming, pendingOrders, selectedOrder] = await Promise.all([
    prisma.barang_Masuk.findMany({
      orderBy: [{ tgl_penerima: "desc" }, { id_barang_masuk: "desc" }],
      include: {
        Pemesanan_Barang: {
          include: { Supplier: { select: { nama_supplier: true } } },
        },
        Pengguna: { select: { nama_pengguna: true } },
      },
    }),
    prisma.pemesanan_Barang.findMany({
      where: { status_pemesanan: { not: "Diterima" } },
      orderBy: [{ tgl_pemesanan: "asc" }, { id_pemesanan: "asc" }],
      include: {
        Supplier: { select: { nama_supplier: true } },
        Detail_Pemesanan: {
          include: { Barang: { select: { id_barang: true, nama_barang: true } } },
        },
      },
    }),
    orderId
      ? prisma.pemesanan_Barang.findUnique({
          where: { id_pemesanan: orderId },
          include: {
            Supplier: { select: { nama_supplier: true } },
            Detail_Pemesanan: {
              include: { Barang: { select: { id_barang: true, nama_barang: true } } },
            },
          },
        })
      : Promise.resolve(null),
  ]);
  const canReceive = selectedOrder && selectedOrder.status_pemesanan !== "Diterima";

  return (
    <AppShell
      role="Admin"
      title={canReceive ? "Terima Barang Masuk" : "Data Barang Masuk"}
      subtitle={
        canReceive
          ? `Pemesanan ${selectedOrder.Supplier.nama_supplier}, ${formatDate(selectedOrder.tgl_pemesanan)}`
          : "Riwayat penerimaan dan pesanan supplier yang menunggu."
      }
      activeHref="/barang-masuk"
    >
      {canReceive && (
        <ReceiveForm
          orderId={selectedOrder.id_pemesanan}
          supplier={selectedOrder.Supplier.nama_supplier}
          date={formatDate(selectedOrder.tgl_pemesanan)}
          items={selectedOrder.Detail_Pemesanan.map((item) => ({
            id_barang: item.id_barang,
            nama_barang: item.Barang.nama_barang,
            jumlah_dipesan: item.jumlah_dipesan,
          }))}
        />
      )}

      {!canReceive && pendingOrders.length > 0 && (
        <section className="pending-orders-card" aria-label="Pesanan menunggu penerimaan">
          <h2>Pesanan Menunggu Penerimaan</h2>
          <div className="pending-order-list">
            {pendingOrders.map((order) => (
              <article className="pending-order-row" key={order.id_pemesanan}>
                <div>
                  <strong>{order.Supplier.nama_supplier}</strong>
                  <span>{formatDate(order.tgl_pemesanan)} · {order.id_pemesanan}</span>
                </div>
                <Link
                  className="pending-order-action"
                  href={`/barang-masuk?orderId=${encodeURIComponent(order.id_pemesanan)}`}
                >
                  Terima Barang
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {incoming.length > 0 ? (
        <section className="route-page-card incoming-history-card" aria-label="Riwayat barang masuk">
          <div className="route-table" role="table">
            <div className="route-table-row route-table-header incoming-history-row" role="row">
              {["Tanggal", "ID Penerimaan", "ID Pemesanan", "Supplier", "Status", "Penerima"].map(
                (column) => <span role="columnheader" key={column}>{column}</span>,
              )}
            </div>
            {incoming.map((item) => (
              <div className="route-table-row incoming-history-row" role="row" key={item.id_barang_masuk}>
                <span role="cell">{formatDate(item.tgl_penerima)}</span>
                <span role="cell">{item.id_barang_masuk}</span>
                <span role="cell">{item.Pemesanan_Barang.id_pemesanan}</span>
                <span role="cell">{item.Pemesanan_Barang.Supplier.nama_supplier}</span>
                <span role="cell">{item.status_periksa}</span>
                <span role="cell">{item.Pengguna.nama_pengguna}</span>
              </div>
            ))}
          </div>
        </section>
      ) : pendingOrders.length === 0 && !canReceive ? (
        <p className="route-empty">Belum ada data barang masuk atau pesanan yang menunggu.</p>
      ) : null}
    </AppShell>
  );
}
