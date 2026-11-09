"use client";

import { useState } from "react";
import { createPermintaanBarang } from "./actions";

type BarangOption = {
  id_barang: string;
  nama_barang: string;
  satuan: string;
  stok_display: number;
};

export function PermintaanForm({ barangs }: { barangs: BarangOption[] }) {
  const [message, setMessage] = useState("");

  return (
    <form
      className="request-form"
      action={async (formData) => {
        const result = await createPermintaanBarang(formData);
        setMessage(result.message);
      }}
    >
      <h2>Form Permintaan</h2>
      <label>
        <span>Barang</span>
        <select name="idBarang" defaultValue="" required disabled={barangs.length === 0}>
          <option value="" disabled>
            {barangs.length ? "Pilih barang" : "Data barang belum tersedia"}
          </option>
          {barangs.map((barang) => (
            <option key={barang.id_barang} value={barang.id_barang}>
              {barang.nama_barang} ({barang.stok_display} {barang.satuan} di display)
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Jumlah diminta</span>
        <input name="jumlah" type="number" min="1" required />
      </label>
      {message && (
        <p className="request-message" role="status">
          {message}
        </p>
      )}
      <button type="submit" disabled={barangs.length === 0}>
        Ajukan
      </button>
    </form>
  );
}
