"use client";

import { useState } from "react";
import { createBarang, deleteBarang, updateBarang } from "./actions";

export type BarangRow = {
  id_barang: string;
  nama_barang: string;
  satuan: string;
  harga_beli: string;
  harga_jual: string;
  stok_gudang: number;
  stok_display: number;
  stok_minimum: number;
};

export function BarangManager({
  rows,
  q,
  currentPage,
  totalPages,
  firstVisible,
  lastVisible,
  total,
}: {
  rows: BarangRow[];
  q: string;
  currentPage: number;
  totalPages: number;
  firstVisible: number;
  lastVisible: number;
  total: number;
}) {
  const [mode, setMode] = useState<"closed" | "add" | "edit" | "delete">("closed");
  const [selected, setSelected] = useState<BarangRow | null>(null);
  const [message, setMessage] = useState("");

  const close = () => {
    setMode("closed");
    setSelected(null);
    setMessage("");
  };

  return (
    <>
      <form className="barang-toolbar" action="/data-barang" method="get">
        <input name="q" defaultValue={q} placeholder="Cari barang, stok, atau pesanan..." />
        <button type="submit">Cari</button>
        <button
          type="button"
          className="barang-add-button"
          onClick={() => {
            setSelected(null);
            setMessage("");
            setMode("add");
          }}
        >
          + Tambah Barang
        </button>
      </form>

      <section className="barang-table-card" aria-label="Data utama barang">
        <div className="barang-table" role="table">
          <div className="barang-table-row barang-table-header" role="row">
            <span role="columnheader">Kode Item</span>
            <span role="columnheader">Nama Barang</span>
            <span role="columnheader">Satuan</span>
            <span role="columnheader">Stok Gudang</span>
            <span role="columnheader">Stok Display</span>
            <span role="columnheader">Aksi</span>
          </div>
          {rows.map((item) => (
            <div className="barang-table-row" role="row" key={item.id_barang}>
              <span role="cell">{item.id_barang}</span>
              <span role="cell">{item.nama_barang}</span>
              <span role="cell">{item.satuan}</span>
              <span role="cell">{item.stok_gudang}</span>
              <span role="cell">{item.stok_display}</span>
              <span role="cell" className="barang-actions">
                <button
                  type="button"
                  className="barang-edit-button"
                  onClick={() => {
                    setSelected(item);
                    setMessage("");
                    setMode("edit");
                  }}
                >
                  Ubah
                </button>
                <button
                  type="button"
                  className="barang-delete-button"
                  onClick={() => {
                    setSelected(item);
                    setMessage("");
                    setMode("delete");
                  }}
                >
                  Hapus
                </button>
              </span>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="barang-empty">Belum ada data barang.</p>
          )}
        </div>

        <footer className="barang-footer">
          <span>Menampilkan {firstVisible}-{lastVisible} dari {total} barang</span>
          <nav className="barang-pagination" aria-label="Paginasi barang">
            {currentPage > 1 && (
              <a href={`/data-barang?${new URLSearchParams({
                ...(q ? { q } : {}),
                page: String(currentPage - 1),
              })}`}>‹</a>
            )}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <a
                key={page}
                className={page === currentPage ? "active" : ""}
                href={`/data-barang?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(page > 1 ? { page: String(page) } : {}),
                })}`}
              >
                {page}
              </a>
            ))}
            {currentPage < totalPages && (
              <a href={`/data-barang?${new URLSearchParams({
                ...(q ? { q } : {}),
                page: String(currentPage + 1),
              })}`}>›</a>
            )}
          </nav>
        </footer>
      </section>

      {mode !== "closed" && (
        <div className="barang-modal-backdrop" role="presentation">
          <section className="barang-modal" role="dialog" aria-modal="true">
            {mode === "delete" ? (
              <>
                <h2>Hapus Barang</h2>
                <p>Apakah Anda yakin ingin menghapus {selected?.nama_barang}?</p>
                <form action={async (formData) => {
                  const result = await deleteBarang(formData);
                  setMessage(result.message);
                  if (result.ok) close();
                }}>
                  <input type="hidden" name="id" value={selected?.id_barang ?? ""} />
                  <div className="barang-modal-actions">
                    <button className="barang-modal-danger" type="submit">Hapus</button>
                    <button className="barang-modal-cancel" type="button" onClick={close}>Batal</button>
                  </div>
                </form>
                {message && <p className="barang-modal-message error">{message}</p>}
              </>
            ) : (
              <>
                <h2>{mode === "add" ? "Tambah Barang" : "Ubah Barang"}</h2>
                <form action={async (formData) => {
                  const result = mode === "add"
                    ? await createBarang(formData)
                    : await updateBarang(formData);
                  setMessage(result.message);
                  if (result.ok) close();
                }}>
                  <input type="hidden" name="id" value={selected?.id_barang ?? ""} />
                  <label>
                    <span>Nama barang</span>
                    <input name="nama" defaultValue={selected?.nama_barang ?? ""} required />
                  </label>
                  <label>
                    <span>Satuan</span>
                    <input name="satuan" defaultValue={selected?.satuan ?? ""} required />
                  </label>
                  <label>
                    <span>Harga (Rp)</span>
                    <input
                      name="harga"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={selected ? Number(selected.harga_beli) : ""}
                      required
                    />
                  </label>
                  <label>
                    <span>Stok Gudang</span>
                    <input
                      name="stokGudang"
                      type="number"
                      min="0"
                      defaultValue={selected?.stok_gudang ?? ""}
                      required
                    />
                  </label>
                  <div className="barang-modal-actions">
                    <button className="barang-modal-save" type="submit">Simpan</button>
                    <button className="barang-modal-cancel" type="button" onClick={close}>Batal</button>
                  </div>
                </form>
                {message && <p className="barang-modal-message error">{message}</p>}
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
