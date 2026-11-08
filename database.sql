-- 1. TABEL PENGGUNA
CREATE TABLE IF NOT EXISTS "Pengguna" (
    id_pengguna VARCHAR(10) PRIMARY KEY,
    nama_pengguna VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- 2. TABEL SUPPLIER
CREATE TABLE IF NOT EXISTS "Supplier" (
    id_supplier VARCHAR(10) PRIMARY KEY,
    nama_supplier VARCHAR(100) NOT NULL,
    alamat VARCHAR(255),
    no_telepon VARCHAR(15)
);

-- 3. TABEL BARANG
CREATE TABLE IF NOT EXISTS "Barang" (
    id_barang VARCHAR(10) PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    satuan VARCHAR(20),
    harga_beli NUMERIC(12,2),
    harga_jual NUMERIC(12,2),
    stok_gudang INTEGER DEFAULT 0,
    stok_display INTEGER DEFAULT 0,
    stok_minimum INTEGER DEFAULT 0
);

-- 4. TABEL TRANSAKSI PENJUALAN
CREATE TABLE IF NOT EXISTS "Transaksi_Penjualan" (
    id_transaksi VARCHAR(25) PRIMARY KEY,
    tgl_transaksi DATE NOT NULL,
    id_pengguna VARCHAR(10),
    FOREIGN KEY (id_pengguna)
        REFERENCES "Pengguna"(id_pengguna)
);

-- 5. TABEL DETAIL TRANSAKSI
CREATE TABLE IF NOT EXISTS "Detail_Transaksi" (
    id_detail_transaksi VARCHAR(10) PRIMARY KEY,
    jumlah INTEGER NOT NULL,
    harga_satuan NUMERIC(12,2) NOT NULL,
    id_transaksi VARCHAR(25),
    id_barang VARCHAR(10),
    FOREIGN KEY (id_transaksi)
        REFERENCES "Transaksi_Penjualan"(id_transaksi),
    FOREIGN KEY (id_barang)
        REFERENCES "Barang"(id_barang)
);

-- 6. TABEL PEMESANAN BARANG
CREATE TABLE IF NOT EXISTS "Pemesanan_Barang" (
    id_pemesanan VARCHAR(25) PRIMARY KEY,
    tgl_pemesanan DATE NOT NULL,
    status_pemesanan VARCHAR(20),
    id_pengguna VARCHAR(10),
    id_supplier VARCHAR(10),
    FOREIGN KEY (id_pengguna)
        REFERENCES "Pengguna"(id_pengguna),
    FOREIGN KEY (id_supplier)
        REFERENCES "Supplier"(id_supplier)
);

-- 7. TABEL DETAIL PEMESANAN
CREATE TABLE IF NOT EXISTS "Detail_Pemesanan" (
    id_detail_pemesanan VARCHAR(10) PRIMARY KEY,
    jumlah_dipesan INTEGER NOT NULL,
    id_barang VARCHAR(10),
    id_pemesanan VARCHAR(25),
    FOREIGN KEY (id_barang)
        REFERENCES "Barang"(id_barang),
    FOREIGN KEY (id_pemesanan)
        REFERENCES "Pemesanan_Barang"(id_pemesanan)
);

-- 8. TABEL BARANG MASUK
CREATE TABLE IF NOT EXISTS "Barang_Masuk" (
    id_barang_masuk VARCHAR(25) PRIMARY KEY,
    tgl_penerima DATE NOT NULL,
    status_periksa VARCHAR(15),
    id_pemesanan VARCHAR(25),
    id_pengguna VARCHAR(10),
    FOREIGN KEY (id_pemesanan)
        REFERENCES "Pemesanan_Barang"(id_pemesanan),
    FOREIGN KEY (id_pengguna)
        REFERENCES "Pengguna"(id_pengguna)
);

-- 9. TABEL DETAIL BARANG MASUK
CREATE TABLE IF NOT EXISTS "Detail_Barang_Masuk" (
    id_detail_barang_masuk VARCHAR(10) PRIMARY KEY,
    jumlah_dikirim INTEGER NOT NULL,
    jumlah_diterima INTEGER NOT NULL,
    id_barang VARCHAR(10),
    id_barang_masuk VARCHAR(25),
    FOREIGN KEY (id_barang)
        REFERENCES "Barang"(id_barang),
    FOREIGN KEY (id_barang_masuk)
        REFERENCES "Barang_Masuk"(id_barang_masuk)
);

-- 10. TABEL PENYESUAIAN STOK
CREATE TABLE IF NOT EXISTS "Penyesuaian_Stok" (
    id_penyesuaian VARCHAR(25) PRIMARY KEY,
    tanggal DATE NOT NULL,
    jenis VARCHAR(20),
    jumlah INTEGER NOT NULL,
    id_barang VARCHAR(10),
    id_pengguna VARCHAR(10),
    FOREIGN KEY (id_barang)
        REFERENCES "Barang"(id_barang),
    FOREIGN KEY (id_pengguna)
        REFERENCES "Pengguna"(id_pengguna)
);

-- 11. TABEL LAPORAN PERSEDIAAN
CREATE TABLE IF NOT EXISTS "Laporan_Persediaan" (
    id_laporan VARCHAR(25) PRIMARY KEY,
    tgl_laporan DATE NOT NULL,
    periode_awal DATE,
    periode_akhir DATE,
    id_pengguna VARCHAR(10),
    FOREIGN KEY (id_pengguna)
        REFERENCES "Pengguna"(id_pengguna)
);

-- 12. TABEL DETAIL LAPORAN
CREATE TABLE IF NOT EXISTS "Detail_Laporan" (
    id_detail_laporan VARCHAR(10) PRIMARY KEY,
    jumlah_masuk INTEGER DEFAULT 0,
    jumlah_keluar INTEGER DEFAULT 0,
    stok_akhir INTEGER DEFAULT 0,
    id_laporan VARCHAR(25),
    id_barang VARCHAR(10),
    FOREIGN KEY (id_laporan)
        REFERENCES "Laporan_Persediaan"(id_laporan),
    FOREIGN KEY (id_barang)
        REFERENCES "Barang"(id_barang)
);