"use client";

import { useState } from "react";
import { receivePemesanan } from "./actions";

export type OrderItem = {
  id_barang: string;
  nama_barang: string;
  jumlah_dipesan: number;
};

export function ReceiveForm({
  orderId,
  supplier,
  date,
  items,
}: {
  orderId: string;
  supplier: string;
  date: string;
  items: OrderItem[];
}) {
  const [message, setMessage] = useState("");

  return (
    <form
      className="receive-form"
      action={async (formData) => {
        const result = await receivePemesanan(formData);
        setMessage(result.message);
      }}
    >
      <h2>Terima Barang Masuk</h2>
      <p>Pesanan {supplier} · {date} · {orderId}</p>
      <div className="receive-table">
        <div className="receive-table-header">
          <span>Barang</span>
          <span>Dipesan</span>
          <span>Dikirim</span>
          <span>Diterima</span>
        </div>
        {items.map((item) => (
          <div className="receive-table-row" key={item.id_barang}>
            <span>{item.nama_barang}</span>
            <span>{item.jumlah_dipesan}</span>
            <input type="hidden" name="itemId" value={item.id_barang} />
            <input
              aria-label={`Jumlah dikirim ${item.nama_barang}`}
              name="jumlahDikirim"
              type="number"
              min="0"
              defaultValue={item.jumlah_dipesan}
              required
            />
            <input
              aria-label={`Jumlah diterima ${item.nama_barang}`}
              name="jumlahDiterima"
              type="number"
              min="0"
              defaultValue={item.jumlah_dipesan}
              required
            />
          </div>
        ))}
      </div>
      <input type="hidden" name="orderId" value={orderId} />
      {message && <p className="request-message" role="status">{message}</p>}
      <button type="submit">Simpan Barang Masuk</button>
    </form>
  );
}
