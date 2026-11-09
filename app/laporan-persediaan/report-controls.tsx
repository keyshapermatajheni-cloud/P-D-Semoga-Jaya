"use client";

import { useState } from "react";
import Link from "next/link";
import { createLaporanPersediaan } from "./actions";

export function ReportControls({
  periodeAwalDefault,
  periodeAkhirDefault,
  laporanId,
}: {
  periodeAwalDefault: string;
  periodeAkhirDefault: string;
  laporanId?: string;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="report-controls">
      {laporanId ? (
        <Link
          className="report-export-button"
          href={`/api/laporan/${encodeURIComponent(laporanId)}`}
        >
          Unduh CSV
        </Link>
      ) : (
        <form
          action={async (formData) => {
            const result = await createLaporanPersediaan(formData);
            setMessage(result.message);
          }}
        >
          <label>
            <span>Periode awal</span>
            <input
              type="date"
              name="periodeAwal"
              defaultValue={periodeAwalDefault}
              required
            />
          </label>
          <label>
            <span>Periode akhir</span>
            <input
              type="date"
              name="periodeAkhir"
              defaultValue={periodeAkhirDefault}
              required
            />
          </label>
          <button type="submit">Buat Laporan</button>
          {message && <p className="request-message" role="status">{message}</p>}
        </form>
      )}
    </div>
  );
}
