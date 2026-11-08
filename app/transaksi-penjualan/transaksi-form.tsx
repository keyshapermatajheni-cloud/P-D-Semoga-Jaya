"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaksi } from "./actions";

type BarangOption = {
  id_barang: string;
  nama_barang: string;
  satuan: string;
  harga_jual: string;
  stok_display: number;
};

export function TransaksiForm({ barangs }: { barangs: BarangOption[] }) {
  const router = useRouter();
  const [rows, setRows] = useState([1]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const getItem = (rowId: number) =>
    barangs.find((item) => item.id_barang === selected[String(rowId)]);

  const cart = rows.map((rowId) => {
    const item = getItem(rowId);
    const quantity = Number.parseInt(quantities[String(rowId)] ?? "0", 10) || 0;
    return item ? { item, quantity, subtotal: quantity * Number(item.harga_jual) } : null;
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null && entry.quantity > 0);

  const total = cart.reduce((sum, entry) => sum + entry.subtotal, 0);
  const itemCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const warning = cart.find((entry) => entry.quantity > entry.item.stok_display);
  const canSubmit = barangs.length > 0 && cart.length > 0 && !warning;

  return (
    <div className="sales-layout">
      <section className="sales-entry-card">
        <div className="sales-entry-form">
          {rows.map((rowId) => {
            const item = getItem(rowId);
            return (
              <div className="sales-row" key={rowId}>
                <label>
                  <span>Barang</span>
                  <select
                    name="itemId"
                    value={selected[String(rowId)] ?? ""}
                    onChange={(event) =>
                      setSelected((current) => ({
                        ...current,
                        [String(rowId)]: event.target.value,
                      }))
                    }
                  >
                    <option value="" disabled>
                      {barangs.length ? "Pilih barang" : "Data barang belum tersedia"}
                    </option>
                    {barangs.map((barang) => (
                      <option key={barang.id_barang} value={barang.id_barang}>
                        {barang.nama_barang} ({barang.stok_display} pcs)
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Jumlah</span>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={quantities[String(rowId)] ?? ""}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [String(rowId)]: event.target.value,
                      }))
                    }
                    disabled={!item}
                  />
                </label>
              </div>
            );
          })}

          {warning && (
            <p className="sales-warning">
              Stok display {warning.item.nama_barang} hanya {warning.item.stok_display} pcs. Kurangi jumlah atau batalkan transaksi.
            </p>
          )}
        </div>

        <button
          type="button"
          className="sales-add-button"
          disabled={!barangs.length}
          onClick={() =>
            setRows((current) => [
              ...current,
              (current[current.length - 1] ?? 0) + 1,
            ])
          }
        >
          + Tambah
        </button>

        <section className="sales-cart-card">
          <h2>Daftar Belanja</h2>
          <div className="sales-cart-table">
            <div className="sales-cart-header">
              <span>Barang</span>
              <span>Jumlah</span>
              <span>Harga</span>
              <span>Subtotal</span>
            </div>
            {cart.map((entry) => (
              <div className="sales-cart-row" key={entry.item.id_barang}>
                <span>{entry.item.nama_barang}</span>
                <span>{entry.quantity}</span>
                <span>{formatRupiah(Number(entry.item.harga_jual))}</span>
                <span>{formatRupiah(entry.subtotal)}</span>
              </div>
            ))}
            {cart.length === 0 && <p className="sales-empty">Belum ada barang dipilih.</p>}
          </div>
        </section>
      </section>

      <aside className="sales-summary-card">
        <div>
          <p>Ringkasan</p>
          <strong>{itemCount} item</strong>
        </div>
        <div className="sales-total">
          <span>Total</span>
          <strong>{formatRupiah(total)}</strong>
        </div>
        <form action={async (formData) => {
          const result = await createTransaksi(formData);
          setMessage(result.message);
          if (result.ok && result.saleId) {
            router.push(`/transaksi-penjualan?saleId=${encodeURIComponent(result.saleId)}`);
          }
        }}>
          {rows.map((rowId) => (
            <input type="hidden" name="itemId" value={selected[String(rowId)] ?? ""} key={`item-${rowId}`} />
          ))}
          {rows.map((rowId) => (
            <input type="hidden" name="quantity" value={quantities[String(rowId)] ?? ""} key={`qty-${rowId}`} />
          ))}
          <button className="sales-save-button" type="submit" disabled={!canSubmit}>
            Simpan Transaksi
          </button>
        </form>
        <button
          className="sales-cancel-button"
          type="button"
          onClick={() => {
            setRows([1]);
            setSelected({});
            setQuantities({});
            setMessage("");
          }}
        >
          Batalkan Transaksi
        </button>
        {message && <p className="sales-message" role="status">{message}</p>}
      </aside>
    </div>
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
