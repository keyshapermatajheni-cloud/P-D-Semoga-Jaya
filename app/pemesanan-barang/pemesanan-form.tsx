"use client";

import { useState } from "react";
import { createPemesanan } from "./actions";

type SupplierOption = { id_supplier: string; nama_supplier: string };
type BarangOption = { id_barang: string; nama_barang: string };

export function PemesananForm({
  suppliers,
  barangs,
}: {
  suppliers: SupplierOption[];
  barangs: BarangOption[];
}) {
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState([0]);
  const canSubmit = suppliers.length > 0 && barangs.length > 0;

  return (
    <form
      className="order-form"
      action={async (formData) => {
        const result = await createPemesanan(formData);
        setMessage(result.message);
      }}
    >
      <h2>Form Pemesanan</h2>

      <label className="order-field supplier-field">
        <span>Supplier</span>
        <select name="supplierId" defaultValue="" disabled={!canSubmit}>
          <option value="" disabled>
            {suppliers.length ? "Pilih supplier" : "Data supplier belum tersedia"}
          </option>
          {suppliers.map((supplier) => (
            <option key={supplier.id_supplier} value={supplier.id_supplier}>
              {supplier.nama_supplier}
            </option>
          ))}
        </select>
      </label>

      <div className="item-fields">
        <div className="item-label">Barang</div>
        <div className="quantity-label">Jumlah</div>
        {rows.map((row) => (
          <div className="item-row" key={row}>
            <select name="itemId" defaultValue="" disabled={!canSubmit}>
              <option value="" disabled>
                {barangs.length ? "Pilih barang" : "Data barang belum tersedia"}
              </option>
              {barangs.map((barang) => (
                <option key={barang.id_barang} value={barang.id_barang}>
                  {barang.nama_barang}
                </option>
              ))}
            </select>
            <input
              className="quantity-input"
              name="quantity"
              type="number"
              min="1"
              placeholder="0"
              disabled={!canSubmit}
              required
            />
          </div>
        ))}
      </div>

      <button
        className="add-item-button"
        type="button"
        onClick={() =>
          setRows((current) => [
            ...current,
            (current[current.length - 1] ?? 0) + 1,
          ])
        }
        disabled={!canSubmit}
      >
        <span>Tambah data barang</span>
        <b>+</b>
      </button>

      <div className="order-actions">
        <button className="submit-order-button" type="submit" disabled={!canSubmit}>
          Kirim Pesanan
        </button>
        {message && <p className="order-message" role="status">{message}</p>}
      </div>
    </form>
  );
}
