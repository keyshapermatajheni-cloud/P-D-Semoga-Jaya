"use client";

import { useState } from "react";
import { completePemeriksaan } from "@/app/barang-masuk/actions";

export type InspectionRow = {
  receiptId: string;
  orderId: string;
  supplier: string;
  date: string;
  details: Array<{
    id: string;
    barang: string;
    dikirim: number;
    diterima: number;
  }>;
};

export function InspectionList({ rows }: { rows: InspectionRow[] }) {
  const [message, setMessage] = useState("");

  return (
    <section className="inspection-list" aria-label="Penerimaan yang perlu diperiksa">
      {rows.map((row) => (
        <article className="inspection-card" key={row.receiptId}>
          <h2>Pemeriksaan Barang Masuk</h2>
          <p>
            {row.supplier} · {row.date} · {row.receiptId} · Pesanan {row.orderId}
          </p>
          <div className="inspection-table">
            <div className="inspection-table-header">
              <span>Barang</span>
              <span>Dikirim</span>
              <span>Diterima</span>
              <span>Selisih</span>
            </div>
            {row.details.map((detail) => (
              <div className="inspection-table-row" key={detail.id}>
                <span>{detail.barang}</span>
                <span>{detail.dikirim}</span>
                <span>{detail.diterima}</span>
                <span>{detail.diterima - detail.dikirim}</span>
              </div>
            ))}
          </div>
          <form
            action={async (formData) => {
              const result = await completePemeriksaan(formData);
              setMessage(result.message);
            }}
          >
            <input type="hidden" name="receiptId" value={row.receiptId} />
            <button type="submit">Selesaikan Pemeriksaan</button>
          </form>
        </article>
      ))}
      {rows.length === 0 && (
        <p className="route-empty">Tidak ada barang masuk yang perlu diperiksa.</p>
      )}
      {message && <p className="request-message" role="status">{message}</p>}
    </section>
  );
}
