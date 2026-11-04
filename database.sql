-- P&D SEMOGA JAYA
-- PostgreSQL INSERT script based on Final ERD.vpp and Normalisasi UNF(1).xlsx
-- Run this after creating the tables according to the ERD.
-- IMPORTANT:
-- 1. Username/password values below are temporary placeholders; replace them before use.
-- 2. Product purchase prices and stock balances were not supplied; 0 is used as a placeholder.
-- 3. Sales transactions do not identify the operator in the workbook; U01 is used as a temporary FK.
-- 4. Detail IDs (DT..., DP..., DBM..., DLP...) are generated because the workbook does not provide them.

BEGIN;

-- 1. PENGGUNA
INSERT INTO "Pengguna" (id_pengguna, nama_pengguna, username, password, role) VALUES
('U01', 'Budi', 'budi_temp', 'CHANGE_ME_U01', 'Owner'),
('U03', 'Sari', 'sari_temp', 'CHANGE_ME_U03', 'Admin'),
('U04', 'Dedi', 'dedi_temp', 'CHANGE_ME_U04', 'Restocker');

-- 2. SUPPLIER
INSERT INTO "Supplier" (id_supplier, nama_supplier, alamat, no_telepon) VALUES
('S01', 'CV Sumber Rejeki', 'Jl. Raya Industri No. 5', '081234567801'),
('S02', 'PT Aneka Pangan Nusantara', 'Jl. Merdeka No. 18', '081234567802');

-- 3. BARANG
-- Harga jual diambil dari harga pada detail penjualan pertama yang tersedia.
-- harga_beli, stok_gudang, stok_display, stok_minimum tidak tersedia di file; sementara 0.
INSERT INTO "Barang"
(id_barang, nama_barang, satuan, harga_beli, harga_jual, stok_gudang, stok_display, stok_minimum)
VALUES
('00025', 'Mizone isi 12', 'dus', 0, 48000, 0, 0, 0),
('002692', 'New Luwak White Coffee isi 12*10', 'dus', 0, 167000, 0, 0, 0),
('000207', 'Teh Botol 350ml', 'dus', 0, 42000, 0, 0, 0),
('000412', 'Teh Gelas 24*180ml', 'dus', 0, 19500, 0, 0, 0),
('00508', 'Momogi 1000 Jagung Bakar 12gr', 'dus', 0, 101000, 0, 0, 0),
('005090', 'Momogi 1000 Coklat 12gr', 'dus', 0, 101000, 0, 0, 0),
('004377', 'Oriental/Layer Cake Pandan', 'dus', 0, 325000, 0, 0, 0),
('004378', 'Oriental/Layer Cake Coklat', 'dus', 0, 325000, 0, 0, 0),
('00721', 'Koko Drink Leci', 'dus', 0, 19000, 0, 0, 0),
('00385', 'Soya Naraya Milk', 'dus', 0, 98000, 0, 0, 0),
('003851', 'Soya Naraya Coklat', 'dus', 0, 98000, 0, 0, 0),
('00205', 'Tango 2000 Vanila 39gr', 'dus', 0, 101000, 0, 0, 0),
('01907', 'Tango 2000 Strawberry 39gr', 'dus', 0, 101000, 0, 0, 0),
('019089', 'Tango 2000 Milky Coklat 39gr', 'dus', 0, 101000, 0, 0, 0),
('8282552', 'Cannon Ball 6 Box @500', 'dus', 0, 60000, 0, 0, 0);

-- 4. TRANSAKSI_PENJUALAN
-- U01 hanya ID pengguna sementara karena operator penjualan tidak dicantumkan di workbook.
INSERT INTO "Transaksi_Penjualan" (id_transaksi, tgl_transaksi, id_pengguna) VALUES
('000443/JL/UTM/0125', '2025-11-01', 'U01'),
('001051/JL/UTM/0125', '2026-01-25', 'U01'),
('005630/JL/UTM/0626', '2026-06-06', 'U01'),
('006704/JL/UTM/0452', '2026-07-26', 'U01'),
('001694/JL/UTM/0225', '2026-08-02', 'U01');

-- 5. DETAIL_TRANSAKSI
INSERT INTO "Detail_Transaksi"
(id_detail_trans, jumlah, harga_satuan, id_transaksi, id_barang) VALUES
('DT001', 5, 48000, '000443/JL/UTM/0125', '00025'),
('DT002', 3, 167000, '000443/JL/UTM/0125', '002692'),
('DT003', 10, 42000, '001051/JL/UTM/0125', '000207'),
('DT004', 20, 19500, '001051/JL/UTM/0125', '000412'),
('DT005', 5, 48000, '001051/JL/UTM/0125', '00025'),
('DT006', 50, 19500, '005630/JL/UTM/0626', '000412'),
('DT007', 1, 101000, '005630/JL/UTM/0626', '00508'),
('DT008', 1, 101000, '005630/JL/UTM/0626', '005090'),
('DT009', 3, 325000, '006704/JL/UTM/0452', '004377'),
('DT010', 3, 325000, '006704/JL/UTM/0452', '004378'),
('DT011', 5, 19000, '006704/JL/UTM/0452', '00721'),
('DT012', 1, 98000, '006704/JL/UTM/0452', '00385'),
('DT013', 1, 98000, '006704/JL/UTM/0452', '003851'),
('DT014', 5, 51000, '006704/JL/UTM/0452', '00025'),
('DT015', 1, 101000, '001694/JL/UTM/0225', '00205'),
('DT016', 2, 101000, '001694/JL/UTM/0225', '01907'),
('DT017', 1, 101000, '001694/JL/UTM/0225', '019089'),
('DT018', 5, 60000, '001694/JL/UTM/0225', '8282552');

-- 6. PEMESANAN_BARANG
INSERT INTO "Pemesanan_Barang"
(id_pemesanan, tgl_pemesanan, status_pemesanan, id_pengguna, id_supplier) VALUES
('000031/PS/UTM/0826', '2026-08-03', 'Dipesan', 'U01', 'S01'),
('000032/PS/UTM/0826', '2026-08-11', 'Dipesan', 'U01', 'S02'),
('000033/PS/UTM/0826', '2026-08-24', 'Dipesan', 'U01', 'S01');

-- 7. DETAIL_PEMESANAN
INSERT INTO "Detail_Pemesanan"
(id_detail_pesanan, jumlah_dipesan, id_barang, id_pemesanan) VALUES
('DP001', 20, '00025', '000031/PS/UTM/0826'),
('DP002', 30, '000207', '000031/PS/UTM/0826'),
('DP003', 50, '000412', '000031/PS/UTM/0826'),
('DP004', 10, '00508', '000032/PS/UTM/0826'),
('DP005', 10, '005090', '000032/PS/UTM/0826'),
('DP006', 15, '00205', '000032/PS/UTM/0826'),
('DP007', 15, '00025', '000033/PS/UTM/0826'),
('DP008', 10, '002692', '000033/PS/UTM/0826');

-- 8. BARANG_MASUK
INSERT INTO "Barang_Masuk"
(id_barang_masuk, tgl_penerima, status_periksa, id_pemesanan, id_pengguna) VALUES
('000015/BM/UTM/0826', '2026-08-11', 'Tidak Sesuai', '000031/PS/UTM/0826', 'U03'),
('000016/BM/UTM/0826', '2026-08-14', 'Sesuai', '000031/PS/UTM/0826', 'U03'),
('000017/BM/UTM/0826', '2026-08-20', 'Sesuai', '000032/PS/UTM/0826', 'U03');

-- 9. DETAIL_BARANG_MASUK
INSERT INTO "Detail_Barang_Masuk"
(id_detail_barang_masuk, jumlah_dikirim, jumlah_diterima, id_barang, id_barang_masuk) VALUES
('DBM001', 20, 18, '00025', '000015/BM/UTM/0826'),
('DBM002', 30, 30, '000207', '000015/BM/UTM/0826'),
('DBM003', 50, 50, '000412', '000015/BM/UTM/0826'),
('DBM004', 2, 2, '00025', '000016/BM/UTM/0826'),
('DBM005', 10, 10, '00508', '000017/BM/UTM/0826'),
('DBM006', 10, 10, '005090', '000017/BM/UTM/0826'),
('DBM007', 15, 15, '00205', '000017/BM/UTM/0826');

-- 10. PENYESUAIAN_STOK
INSERT INTO "Penyesuaian_Stok"
(id_penyesuaian, tanggal, jenis, jumlah, id_barang, id_pengguna) VALUES
('PY0001/UTM/0826', '2026-08-12', 'Penambahan', 18, '00025', 'U04'),
('PY0002/UTM/0826', '2026-08-15', 'Pengurangan', 2, '000412', 'U03'),
('PY0003/UTM/0826', '2026-08-19', 'Penambahan', 5, '00721', 'U04');

-- 11. LAPORAN_PERSEDIAAN
INSERT INTO "Laporan_Persediaan"
(id_laporan, tgl_laporan, periode_awal, periode_akhir, id_pengguna) VALUES
('LP001/UTM/0826', '2026-08-31', '2026-08-01', '2026-08-31', 'U01'),
('LP002/UTM/0926', '2026-09-30', '2026-09-01', '2026-09-30', 'U01');

-- 12. DETAIL_LAPORAN
INSERT INTO "Detail_Laporan"
(id_detail_laporan, jumlah_masuk, jumlah_keluar, stok_akhir, id_laporan, id_barang) VALUES
('DLP001', 20, 12, 26, 'LP001/UTM/0826', '00025'),
('DLP002', 50, 30, 60, 'LP001/UTM/0826', '000412'),
('DLP003', 15, 1, 20, 'LP001/UTM/0826', '00205'),
('DLP004', 15, 20, 21, 'LP002/UTM/0926', '00025'),
('DLP005', 10, 6, 14, 'LP002/UTM/0926', '002692');

COMMIT;

-- Optional verification:
-- SELECT * FROM "Pengguna";
-- SELECT * FROM "Barang";
-- SELECT * FROM "Transaksi_Penjualan";
-- SELECT * FROM "Detail_Transaksi";
-- SELECT * FROM "Pemesanan_Barang";
-- SELECT * FROM "Detail_Pemesanan";
-- SELECT * FROM "Barang_Masuk";
-- SELECT * FROM "Detail_Barang_Masuk";
-- SELECT * FROM "Penyesuaian_Stok";
-- SELECT * FROM "Laporan_Persediaan";
-- SELECT * FROM "Detail_Laporan";
