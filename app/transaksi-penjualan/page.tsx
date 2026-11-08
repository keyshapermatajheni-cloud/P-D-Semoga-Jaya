import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { TransaksiForm } from "./transaksi-form";
import { ReceiptActions } from "./receipt-actions";
import { TransaksiHistory } from "./transaksi-history";

export const instant = false;

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

export default async function TransaksiPenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{ saleId?: string }>;
}) {
  const { saleId } = await searchParams;

  if (saleId) {
    const sale = await prisma.transaksi_Penjualan.findUnique({
      where: { id_transaksi: saleId },
      include: {
        Detail_Transaksi: {
          include: { Barang: { select: { nama_barang: true } } },
        },
      },
    });

    if (sale) {
      const total = sale.Detail_Transaksi.reduce(
        (sum, detail) => sum + detail.jumlah * Number(detail.harga_satuan),
        0,
      );

      return (
        <AppShell
          role="Cashier"
          title="Nota Transaksi"
          subtitle="Transaksi berhasil disimpan."
          activeHref="/transaksi-penjualan"
        >
          <section className="receipt-card" aria-label="Nota transaksi">
            <div className="receipt-heading">
              <strong>{sale.id_transaksi}</strong>
              <span>{formatDate(sale.tgl_transaksi)}</span>
            </div>
            <div className="receipt-table">
              <div className="receipt-header">
                <span>Barang</span>
                <span>Jumlah</span>
                <span>Subtotal</span>
              </div>
              {sale.Detail_Transaksi.map((detail) => (
                <div className="receipt-row" key={detail.id_detail_transaksi}>
                  <span>{detail.Barang.nama_barang}</span>
                  <span>{detail.jumlah}</span>
                  <span>{formatRupiah(detail.jumlah * Number(detail.harga_satuan))}</span>
                </div>
              ))}
            </div>
            <div className="receipt-total">
              <strong>{formatRupiah(total)}</strong>
            </div>
            <p>Serahkan barang ke customer.</p>
            <ReceiptActions />
          </section>
        </AppShell>
      );
    }
  }

  const barangs = await prisma.barang.findMany({
    orderBy: { nama_barang: "asc" },
    select: {
      id_barang: true,
      nama_barang: true,
      satuan: true,
      harga_jual: true,
      stok_display: true,
    },
  });

  return (
    <AppShell
      role="Cashier"
      title="Transaksi Penjualan"
      subtitle="Catat penjualan barang"
      activeHref="/transaksi-penjualan"
    >
      <TransaksiForm
        barangs={barangs.map((item) => ({
          ...item,
          harga_jual: Number(item.harga_jual).toString(),
        }))}
      />
      <TransaksiHistory />
    </AppShell>
  );
}
