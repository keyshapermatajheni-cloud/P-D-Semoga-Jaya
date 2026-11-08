--
-- PostgreSQL database dump
--

\restrict FsVcxX608kZnYTC0FV9XMAVHTnrkrX9FT54bZyciXZm4K3Q3W94oyFF07AGJT0N

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Barang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Barang" (
    id_barang character varying(10) NOT NULL,
    nama_barang character varying(100) NOT NULL,
    satuan character varying(20) NOT NULL,
    harga_beli numeric(12,2) NOT NULL,
    harga_jual numeric(12,2) NOT NULL,
    stok_gudang integer NOT NULL,
    stok_display integer NOT NULL,
    stok_minimum integer NOT NULL
);


ALTER TABLE public."Barang" OWNER TO postgres;

--
-- Name: Barang_Masuk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Barang_Masuk" (
    id_barang_masuk character varying(25) NOT NULL,
    tgl_penerima date NOT NULL,
    status_periksa character varying(15) NOT NULL,
    id_pemesanan character varying(25) NOT NULL,
    id_pengguna character varying(10) NOT NULL
);


ALTER TABLE public."Barang_Masuk" OWNER TO postgres;

--
-- Name: Detail_Barang_Masuk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Detail_Barang_Masuk" (
    id_detail_barang_masuk character varying(10) NOT NULL,
    jumlah_dikirim integer NOT NULL,
    jumlah_diterima integer NOT NULL,
    id_barang character varying(10) NOT NULL,
    id_barang_masuk character varying(25) NOT NULL
);


ALTER TABLE public."Detail_Barang_Masuk" OWNER TO postgres;

--
-- Name: Detail_Laporan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Detail_Laporan" (
    id_detail_laporan character varying(10) NOT NULL,
    jumlah_masuk integer NOT NULL,
    jumlah_keluar integer NOT NULL,
    stok_akhir integer NOT NULL,
    id_laporan character varying(25) NOT NULL,
    id_barang character varying(10) NOT NULL
);


ALTER TABLE public."Detail_Laporan" OWNER TO postgres;

--
-- Name: Detail_Pemesanan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Detail_Pemesanan" (
    id_detail_pesanan character varying(10) NOT NULL,
    jumlah_dipesan integer NOT NULL,
    id_barang character varying(10) NOT NULL,
    id_pemesanan character varying(25) NOT NULL
);


ALTER TABLE public."Detail_Pemesanan" OWNER TO postgres;

--
-- Name: Detail_Transaksi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Detail_Transaksi" (
    id_detail_trans character varying(10) NOT NULL,
    jumlah integer NOT NULL,
    harga_satuan numeric(12,2) NOT NULL,
    id_transaksi character varying(25) NOT NULL,
    id_barang character varying(10) NOT NULL
);


ALTER TABLE public."Detail_Transaksi" OWNER TO postgres;

--
-- Name: Laporan_Persediaan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Laporan_Persediaan" (
    id_laporan character varying(25) NOT NULL,
    tgl_laporan date NOT NULL,
    periode_awal date NOT NULL,
    periode_akhir date NOT NULL,
    id_pengguna character varying(10) NOT NULL
);


ALTER TABLE public."Laporan_Persediaan" OWNER TO postgres;

--
-- Name: Pemesanan_Barang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pemesanan_Barang" (
    id_pemesanan character varying(25) NOT NULL,
    tgl_pemesanan date NOT NULL,
    status_pemesanan character varying(20) NOT NULL,
    id_pengguna character varying(10) NOT NULL,
    id_supplier character varying(10) NOT NULL
);


ALTER TABLE public."Pemesanan_Barang" OWNER TO postgres;

--
-- Name: Pengguna; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pengguna" (
    id_pengguna character varying(10) NOT NULL,
    nama_pengguna character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL
);


ALTER TABLE public."Pengguna" OWNER TO postgres;

--
-- Name: Penyesuaian_Stok; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Penyesuaian_Stok" (
    id_penyesuaian character varying(25) NOT NULL,
    tanggal date NOT NULL,
    jenis character varying(20) NOT NULL,
    jumlah integer NOT NULL,
    id_barang character varying(10) NOT NULL,
    id_pengguna character varying(10) NOT NULL
);


ALTER TABLE public."Penyesuaian_Stok" OWNER TO postgres;

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Supplier" (
    id_supplier character varying(10) NOT NULL,
    nama_supplier character varying(100) NOT NULL,
    alamat character varying(255) NOT NULL,
    no_telepon character varying(15) NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO postgres;

--
-- Name: Transaksi_Penjualan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaksi_Penjualan" (
    id_transaksi character varying(25) NOT NULL,
    tgl_transaksi date NOT NULL,
    id_pengguna character varying(10) NOT NULL
);


ALTER TABLE public."Transaksi_Penjualan" OWNER TO postgres;

--
-- Name: contoh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contoh (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    deskripsi text
);


ALTER TABLE public.contoh OWNER TO postgres;

--
-- Name: contoh_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contoh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contoh_id_seq OWNER TO postgres;

--
-- Name: contoh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contoh_id_seq OWNED BY public.contoh.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id_user integer NOT NULL,
    nama character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    role character varying(20) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_user_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_user_seq OWNER TO postgres;

--
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_user_seq OWNED BY public.users.id_user;


--
-- Name: contoh id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contoh ALTER COLUMN id SET DEFAULT nextval('public.contoh_id_seq'::regclass);


--
-- Name: users id_user; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id_user SET DEFAULT nextval('public.users_id_user_seq'::regclass);


--
-- Data for Name: Barang; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Barang" (id_barang, nama_barang, satuan, harga_beli, harga_jual, stok_gudang, stok_display, stok_minimum) FROM stdin;
\.


--
-- Data for Name: Barang_Masuk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Barang_Masuk" (id_barang_masuk, tgl_penerima, status_periksa, id_pemesanan, id_pengguna) FROM stdin;
\.


--
-- Data for Name: Detail_Barang_Masuk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Detail_Barang_Masuk" (id_detail_barang_masuk, jumlah_dikirim, jumlah_diterima, id_barang, id_barang_masuk) FROM stdin;
\.


--
-- Data for Name: Detail_Laporan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Detail_Laporan" (id_detail_laporan, jumlah_masuk, jumlah_keluar, stok_akhir, id_laporan, id_barang) FROM stdin;
\.


--
-- Data for Name: Detail_Pemesanan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Detail_Pemesanan" (id_detail_pesanan, jumlah_dipesan, id_barang, id_pemesanan) FROM stdin;
\.


--
-- Data for Name: Detail_Transaksi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Detail_Transaksi" (id_detail_trans, jumlah, harga_satuan, id_transaksi, id_barang) FROM stdin;
\.


--
-- Data for Name: Laporan_Persediaan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Laporan_Persediaan" (id_laporan, tgl_laporan, periode_awal, periode_akhir, id_pengguna) FROM stdin;
\.


--
-- Data for Name: Pemesanan_Barang; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pemesanan_Barang" (id_pemesanan, tgl_pemesanan, status_pemesanan, id_pengguna, id_supplier) FROM stdin;
\.


--
-- Data for Name: Pengguna; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pengguna" (id_pengguna, nama_pengguna, username, password, role) FROM stdin;
\.


--
-- Data for Name: Penyesuaian_Stok; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Penyesuaian_Stok" (id_penyesuaian, tanggal, jenis, jumlah, id_barang, id_pengguna) FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Supplier" (id_supplier, nama_supplier, alamat, no_telepon) FROM stdin;
\.


--
-- Data for Name: Transaksi_Penjualan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaksi_Penjualan" (id_transaksi, tgl_transaksi, id_pengguna) FROM stdin;
\.


--
-- Data for Name: contoh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contoh (id, nama, deskripsi) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id_user, nama, username, role) FROM stdin;
\.


--
-- Name: contoh_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contoh_id_seq', 1, false);


--
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_user_seq', 1, false);


--
-- Name: Barang_Masuk Barang_Masuk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Barang_Masuk"
    ADD CONSTRAINT "Barang_Masuk_pkey" PRIMARY KEY (id_barang_masuk);


--
-- Name: Barang Barang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Barang"
    ADD CONSTRAINT "Barang_pkey" PRIMARY KEY (id_barang);


--
-- Name: Detail_Barang_Masuk Detail_Barang_Masuk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Barang_Masuk"
    ADD CONSTRAINT "Detail_Barang_Masuk_pkey" PRIMARY KEY (id_detail_barang_masuk);


--
-- Name: Detail_Laporan Detail_Laporan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Laporan"
    ADD CONSTRAINT "Detail_Laporan_pkey" PRIMARY KEY (id_detail_laporan);


--
-- Name: Detail_Pemesanan Detail_Pemesanan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Pemesanan"
    ADD CONSTRAINT "Detail_Pemesanan_pkey" PRIMARY KEY (id_detail_pesanan);


--
-- Name: Detail_Transaksi Detail_Transaksi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Transaksi"
    ADD CONSTRAINT "Detail_Transaksi_pkey" PRIMARY KEY (id_detail_trans);


--
-- Name: Laporan_Persediaan Laporan_Persediaan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Laporan_Persediaan"
    ADD CONSTRAINT "Laporan_Persediaan_pkey" PRIMARY KEY (id_laporan);


--
-- Name: Pemesanan_Barang Pemesanan_Barang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pemesanan_Barang"
    ADD CONSTRAINT "Pemesanan_Barang_pkey" PRIMARY KEY (id_pemesanan);


--
-- Name: Pengguna Pengguna_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pengguna"
    ADD CONSTRAINT "Pengguna_pkey" PRIMARY KEY (id_pengguna);


--
-- Name: Penyesuaian_Stok Penyesuaian_Stok_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Penyesuaian_Stok"
    ADD CONSTRAINT "Penyesuaian_Stok_pkey" PRIMARY KEY (id_penyesuaian);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id_supplier);


--
-- Name: Transaksi_Penjualan Transaksi_Penjualan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaksi_Penjualan"
    ADD CONSTRAINT "Transaksi_Penjualan_pkey" PRIMARY KEY (id_transaksi);


--
-- Name: contoh contoh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contoh
    ADD CONSTRAINT contoh_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_barang_masuk_pemesanan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_barang_masuk_pemesanan ON public."Barang_Masuk" USING btree (id_pemesanan);


--
-- Name: idx_barang_masuk_pengguna; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_barang_masuk_pengguna ON public."Barang_Masuk" USING btree (id_pengguna);


--
-- Name: idx_detail_barang_masuk_barang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_barang_masuk_barang ON public."Detail_Barang_Masuk" USING btree (id_barang);


--
-- Name: idx_detail_barang_masuk_header; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_barang_masuk_header ON public."Detail_Barang_Masuk" USING btree (id_barang_masuk);


--
-- Name: idx_detail_laporan_barang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_laporan_barang ON public."Detail_Laporan" USING btree (id_barang);


--
-- Name: idx_detail_laporan_laporan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_laporan_laporan ON public."Detail_Laporan" USING btree (id_laporan);


--
-- Name: idx_detail_pemesanan_barang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_pemesanan_barang ON public."Detail_Pemesanan" USING btree (id_barang);


--
-- Name: idx_detail_pemesanan_pemesanan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_pemesanan_pemesanan ON public."Detail_Pemesanan" USING btree (id_pemesanan);


--
-- Name: idx_detail_transaksi_barang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_transaksi_barang ON public."Detail_Transaksi" USING btree (id_barang);


--
-- Name: idx_detail_transaksi_transaksi; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detail_transaksi_transaksi ON public."Detail_Transaksi" USING btree (id_transaksi);


--
-- Name: idx_laporan_pengguna; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_laporan_pengguna ON public."Laporan_Persediaan" USING btree (id_pengguna);


--
-- Name: idx_pemesanan_pengguna; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pemesanan_pengguna ON public."Pemesanan_Barang" USING btree (id_pengguna);


--
-- Name: idx_pemesanan_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pemesanan_supplier ON public."Pemesanan_Barang" USING btree (id_supplier);


--
-- Name: idx_penyesuaian_barang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_penyesuaian_barang ON public."Penyesuaian_Stok" USING btree (id_barang);


--
-- Name: idx_penyesuaian_pengguna; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_penyesuaian_pengguna ON public."Penyesuaian_Stok" USING btree (id_pengguna);


--
-- Name: idx_transaksi_pengguna; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transaksi_pengguna ON public."Transaksi_Penjualan" USING btree (id_pengguna);


--
-- Name: Barang_Masuk fk_barang_masuk_pemesanan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Barang_Masuk"
    ADD CONSTRAINT fk_barang_masuk_pemesanan FOREIGN KEY (id_pemesanan) REFERENCES public."Pemesanan_Barang"(id_pemesanan) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Barang_Masuk fk_barang_masuk_pengguna; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Barang_Masuk"
    ADD CONSTRAINT fk_barang_masuk_pengguna FOREIGN KEY (id_pengguna) REFERENCES public."Pengguna"(id_pengguna) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Barang_Masuk fk_detail_barang_masuk_barang; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Barang_Masuk"
    ADD CONSTRAINT fk_detail_barang_masuk_barang FOREIGN KEY (id_barang) REFERENCES public."Barang"(id_barang) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Barang_Masuk fk_detail_barang_masuk_header; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Barang_Masuk"
    ADD CONSTRAINT fk_detail_barang_masuk_header FOREIGN KEY (id_barang_masuk) REFERENCES public."Barang_Masuk"(id_barang_masuk) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Laporan fk_detail_laporan_barang; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Laporan"
    ADD CONSTRAINT fk_detail_laporan_barang FOREIGN KEY (id_barang) REFERENCES public."Barang"(id_barang) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Laporan fk_detail_laporan_laporan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Laporan"
    ADD CONSTRAINT fk_detail_laporan_laporan FOREIGN KEY (id_laporan) REFERENCES public."Laporan_Persediaan"(id_laporan) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Pemesanan fk_detail_pemesanan_barang; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Pemesanan"
    ADD CONSTRAINT fk_detail_pemesanan_barang FOREIGN KEY (id_barang) REFERENCES public."Barang"(id_barang) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Pemesanan fk_detail_pemesanan_pemesanan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Pemesanan"
    ADD CONSTRAINT fk_detail_pemesanan_pemesanan FOREIGN KEY (id_pemesanan) REFERENCES public."Pemesanan_Barang"(id_pemesanan) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Transaksi fk_detail_transaksi_barang; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Transaksi"
    ADD CONSTRAINT fk_detail_transaksi_barang FOREIGN KEY (id_barang) REFERENCES public."Barang"(id_barang) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Detail_Transaksi fk_detail_transaksi_transaksi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Detail_Transaksi"
    ADD CONSTRAINT fk_detail_transaksi_transaksi FOREIGN KEY (id_transaksi) REFERENCES public."Transaksi_Penjualan"(id_transaksi) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Laporan_Persediaan fk_laporan_pengguna; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Laporan_Persediaan"
    ADD CONSTRAINT fk_laporan_pengguna FOREIGN KEY (id_pengguna) REFERENCES public."Pengguna"(id_pengguna) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pemesanan_Barang fk_pemesanan_pengguna; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pemesanan_Barang"
    ADD CONSTRAINT fk_pemesanan_pengguna FOREIGN KEY (id_pengguna) REFERENCES public."Pengguna"(id_pengguna) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pemesanan_Barang fk_pemesanan_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pemesanan_Barang"
    ADD CONSTRAINT fk_pemesanan_supplier FOREIGN KEY (id_supplier) REFERENCES public."Supplier"(id_supplier) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Penyesuaian_Stok fk_penyesuaian_barang; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Penyesuaian_Stok"
    ADD CONSTRAINT fk_penyesuaian_barang FOREIGN KEY (id_barang) REFERENCES public."Barang"(id_barang) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Penyesuaian_Stok fk_penyesuaian_pengguna; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Penyesuaian_Stok"
    ADD CONSTRAINT fk_penyesuaian_pengguna FOREIGN KEY (id_pengguna) REFERENCES public."Pengguna"(id_pengguna) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaksi_Penjualan fk_transaksi_pengguna; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaksi_Penjualan"
    ADD CONSTRAINT fk_transaksi_pengguna FOREIGN KEY (id_pengguna) REFERENCES public."Pengguna"(id_pengguna) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict FsVcxX608kZnYTC0FV9XMAVHTnrkrX9FT54bZyciXZm4K3Q3W94oyFF07AGJT0N

