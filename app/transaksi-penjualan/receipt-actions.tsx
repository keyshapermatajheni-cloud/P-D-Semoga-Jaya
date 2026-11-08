"use client";

import Link from "next/link";

export function ReceiptActions() {
  return (
    <div className="receipt-actions">
      <button type="button" className="receipt-check-button" onClick={() => window.print()}>
        Cek Nota
      </button>
      <Link href="/transaksi-penjualan" className="receipt-done-button">
        Selesai
      </Link>
    </div>
  );
}
