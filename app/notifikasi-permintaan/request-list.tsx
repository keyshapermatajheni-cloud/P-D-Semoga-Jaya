"use client";

import { useState } from "react";
import { fulfillPermintaanBarang } from "@/app/permintaan-barang/actions";

export type RequestRow = {
  id: string;
  tanggal: string;
  barang: string;
  jumlah: number;
  satuan: string;
  gudang: number;
  display: number;
  pemohon: string;
  status: string;
};

export function RequestList({ rows }: { rows: RequestRow[] }) {
  const [message, setMessage] = useState("");

  return (
    <>
      {rows.map((row) => (
        <article className="request-card" key={row.id}>
          <div className="request-card-heading">
            <strong>{row.barang}</strong>
            <span className={`request-status ${row.status === "Permintaan" ? "pending" : "done"}`}>
              {row.status === "Permintaan" ? "Baru" : row.status}
            </span>
          </div>
          <p>
            {row.jumlah} {row.satuan} · {row.pemohon} · {row.tanggal}
          </p>
          <p>
            Stok gudang {row.gudang} {row.satuan} · stok display {row.display} {row.satuan}
          </p>
          {row.status === "Permintaan" && (
            <form
              action={async (formData) => {
                const result = await fulfillPermintaanBarang(formData);
                setMessage(result.message);
              }}
            >
              <input type="hidden" name="idPermintaan" value={row.id} />
              <button type="submit" disabled={row.gudang < row.jumlah}>
                Isi Ulang ke Display
              </button>
              {row.gudang < row.jumlah && (
                <span className="request-inline-warning">Stok gudang tidak mencukupi.</span>
              )}
            </form>
          )}
        </article>
      ))}
      {rows.length === 0 && (
        <p className="route-empty">Belum ada permintaan barang dari kasir.</p>
      )}
      {message && <p className="request-message" role="status">{message}</p>}
    </>
  );
}
