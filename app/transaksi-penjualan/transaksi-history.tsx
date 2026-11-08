"use client";

import { useEffect, useState } from "react";

type Transaction = {
  idTransaksi: string;
  namaBarang: string;
  jumlah: number;
  hargaSatuan: number;
  tanggal: string;
  kasir: string;
};

type TransactionResponse = {
  summary: {
    jumlahTransaksi: number;
    totalNilaiTransaksi: number;
  };
  transactions: Transaction[];
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export function TransaksiHistory() {
  const [data, setData] = useState<TransactionResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      try {
        const response = await fetch("/api/transaksi", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Gagal memuat data transaksi.");
        }
        const result = (await response.json()) as TransactionResponse;
        if (active) {
          setData(result);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data transaksi.",
          );
        }
      }
    };

    void loadTransactions();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="transaction-history-section" aria-label="Riwayat transaksi">
      <div className="transaction-summary-grid">
        <article className="transaction-summary-card">
          <span>Jumlah Transaksi</span>
          <strong>{data?.summary.jumlahTransaksi ?? 0}</strong>
        </article>
        <article className="transaction-summary-card">
          <span>Total Nilai Transaksi</span>
          <strong>{formatRupiah(data?.summary.totalNilaiTransaksi ?? 0)}</strong>
        </article>
      </div>

      {error && <p className="transaction-history-error">{error}</p>}

      <div className="transaction-history-card">
        <h2>Daftar Transaksi</h2>
        <div className="transaction-history-table">
          <div className="transaction-history-header">
            <span>ID Transaksi</span>
            <span>Nama Barang</span>
            <span>Jumlah</span>
            <span>Harga Satuan</span>
            <span>Tanggal</span>
            <span>Kasir</span>
          </div>
          {data?.transactions.map((transaction) => (
            <div
              className="transaction-history-row"
              key={`${transaction.idTransaksi}-${transaction.namaBarang}-${transaction.tanggal}`}
            >
              <span>{transaction.idTransaksi}</span>
              <span>{transaction.namaBarang}</span>
              <span>{transaction.jumlah}</span>
              <span>{formatRupiah(transaction.hargaSatuan)}</span>
              <span>{formatDate(transaction.tanggal)}</span>
              <span>{transaction.kasir}</span>
            </div>
          ))}
          {data && data.transactions.length === 0 && (
            <p className="transaction-history-empty">Belum ada transaksi.</p>
          )}
          {!data && !error && (
            <p className="transaction-history-empty">Memuat transaksi...</p>
          )}
        </div>
      </div>
    </section>
  );
}
