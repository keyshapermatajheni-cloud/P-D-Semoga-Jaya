import { readFile } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = await readFile(path.join(root, ".env"), "utf8");
const databaseLine = env
  .split(/\r?\n/)
  .find((line) => line.startsWith("DATABASE_URL="));

if (!databaseLine) {
  throw new Error("DATABASE_URL tidak ditemukan di .env.");
}

const connectionString = databaseLine
  .slice("DATABASE_URL=".length)
  .trim()
  .replace(/^(['"])(.*)\1$/, "$2");
if (!new URL(connectionString).hostname.endsWith(".neon.tech")) {
  throw new Error("Seed dibatalkan: DATABASE_URL bukan host Neon.");
}

const client = new Client({ connectionString });
const today = new Date();
const dateOnly = today.toISOString().slice(0, 10);
await client.connect();

try {
  await client.query("BEGIN");

  const tableCount = await client.query(
    "SELECT count(*)::int AS total FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
  );
  if (tableCount.rows[0].total !== 12) {
    throw new Error(`Seed dibatalkan: terdapat ${tableCount.rows[0].total} tabel, bukan 12.`);
  }

  const team = [
    { id: "DEMO-OWN", name: "Owner Semoga Jaya", username: "owner", password: "owner123", role: "Owner" },
    { id: "DEMO-ADM", name: "Admin Semoga Jaya", username: "admin", password: "admin123", role: "Admin" },
    { id: "DEMO-RST", name: "Nia Restocker", username: "restocker", password: "restocker123", role: "Restocker" },
    { id: "DEMO-CAS", name: "Kasir Semoga Jaya", username: "cashier", password: "cashier123", role: "Cashier" },
  ];
  const staff = {};
  for (const person of team) {
    const existing = await client.query(
      'SELECT id_pengguna, username, role FROM "Pengguna" WHERE id_pengguna = $1 OR username = $2',
      [person.id, person.username],
    );
    if (existing.rowCount > 1 || (existing.rowCount === 1 &&
      (existing.rows[0].id_pengguna !== person.id ||
       existing.rows[0].username !== person.username ||
       existing.rows[0].role !== person.role))) {
      throw new Error(`Seed dibatalkan: ID atau username pengguna ${person.username} sudah dipakai.`);
    }
    if (existing.rowCount === 0) {
      const salt = randomBytes(16).toString("hex");
      const passwordHash = `scrypt$${salt}$${scryptSync(person.password, salt, 64).toString("hex")}`;
      await client.query(
        'INSERT INTO "Pengguna" (id_pengguna, nama_pengguna, username, password, role) VALUES ($1, $2, $3, $4, $5)',
        [person.id, person.name, person.username, passwordHash, person.role],
      );
    }
    staff[person.role] = person.id;
  }

  const supplierSeed = [
    { id: "DEMO-SUP1", name: "PT Sinar Jaya", address: "Pasar Pusat, Tanah Datar", phone: "081234567890" },
    { id: "DEMO-SUP2", name: "CV Maju Bersama", address: "Batusangkar, Tanah Datar", phone: "081298765432" },
  ];
  const suppliers = {};
  for (const supplier of supplierSeed) {
    const existing = await client.query(
      'SELECT id_supplier, nama_supplier FROM "Supplier" WHERE id_supplier = $1',
      [supplier.id],
    );
    if (existing.rowCount === 1 && existing.rows[0].nama_supplier !== supplier.name) {
      throw new Error(`Seed dibatalkan: ID supplier ${supplier.id} sudah digunakan.`);
    }
    if (existing.rowCount === 0) {
      await client.query(
        'INSERT INTO "Supplier" (id_supplier, nama_supplier, alamat, no_telepon) VALUES ($1, $2, $3, $4)',
        [supplier.id, supplier.name, supplier.address, supplier.phone],
      );
    }
    suppliers[supplier.name] = supplier.id;
  }

  const productNames = [
    "Beras Setra Ramos 5 kg",
    "Minyak Goreng Tropical 1 L",
    "Gula Pasir Gulaku 1 kg",
    "Air Mineral Aqua 600 ml",
    "Biskuit Marie Regal 125 g",
    "Tepung Terigu Segitiga Biru 1 kg",
  ];
  const productResult = await client.query(
    'SELECT id_barang, nama_barang, satuan, stok_gudang, stok_display, stok_minimum, harga_jual FROM "Barang" WHERE nama_barang = ANY($1::varchar[])',
    [productNames],
  );
  const product = new Map(productResult.rows.map((item) => [item.nama_barang, item]));
  for (const name of productNames) {
    if (!product.has(name)) {
      throw new Error(`Seed dibatalkan: barang "${name}" tidak ditemukan.`);
    }
  }

  const pendingOrderId = "DEMO-PO-PENDING";
  const receivedOrderId = "DEMO-PO-RECEIVED";
  const pendingOrder = await client.query(
    'INSERT INTO "Pemesanan_Barang" (id_pemesanan, tgl_pemesanan, status_pemesanan, id_pengguna, id_supplier) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id_pemesanan) DO NOTHING',
    [pendingOrderId, dateOnly, "Dikirim", staff.Owner, suppliers["PT Sinar Jaya"]],
  );
  if (pendingOrder.rowCount === 1) {
    await client.query(
      'INSERT INTO "Detail_Pemesanan" (id_detail_pemesanan, jumlah_dipesan, id_barang, id_pemesanan) VALUES ($1, $2, $3, $4), ($5, $6, $7, $4)',
      [
        "DPO0000001", 20, product.get("Gula Pasir Gulaku 1 kg").id_barang,
        pendingOrderId, "DPO0000002", 15, product.get("Minyak Goreng Tropical 1 L").id_barang,
      ],
    );
  }

  const receivedOrder = await client.query(
    'INSERT INTO "Pemesanan_Barang" (id_pemesanan, tgl_pemesanan, status_pemesanan, id_pengguna, id_supplier) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id_pemesanan) DO NOTHING',
    ["DEMO-PO-RECEIVED", dateOnly, "Diterima", staff.Owner, suppliers["CV Maju Bersama"]],
  );
  if (receivedOrder.rowCount === 1) {
    await client.query(
      'INSERT INTO "Detail_Pemesanan" (id_detail_pemesanan, jumlah_dipesan, id_barang, id_pemesanan) VALUES ($1, $2, $3, $4)',
      ["DPO0000003", 20, product.get("Beras Setra Ramos 5 kg").id_barang, receivedOrderId],
    );
    await client.query(
      'INSERT INTO "Barang_Masuk" (id_barang_masuk, tgl_penerima, status_periksa, id_pemesanan, id_pengguna) VALUES ($1, $2, $3, $4, $5)',
      ["DEMO-RCV-001", dateOnly, "Belum Diperiksa", receivedOrderId, staff.Admin],
    );
    await client.query(
      'INSERT INTO "Detail_Barang_Masuk" (id_detail_barang_masuk, jumlah_dikirim, jumlah_diterima, id_barang, id_barang_masuk) VALUES ($1, $2, $3, $4, $5)',
      [
        "DBMDEMO001", 20, 18,
        product.get("Beras Setra Ramos 5 kg").id_barang,
        "DEMO-RCV-001",
      ],
    );
    await client.query(
      'UPDATE "Barang" SET stok_gudang = stok_gudang + 18 WHERE id_barang = $1',
      [product.get("Beras Setra Ramos 5 kg").id_barang],
    );
  }

  const saleId = "DEMO-TRX-001";
  const sale = await client.query(
    'INSERT INTO "Transaksi_Penjualan" (id_transaksi, tgl_transaksi, id_pengguna) VALUES ($1, $2, $3) ON CONFLICT (id_transaksi) DO NOTHING',
    [saleId, dateOnly, staff.Cashier],
  );
  if (sale.rowCount === 1) {
    const saleItems = [
      { id: product.get("Air Mineral Aqua 600 ml").id_barang, qty: 3, detail: "DTRX000001" },
      { id: product.get("Biskuit Marie Regal 125 g").id_barang, qty: 1, detail: "DTRX000002" },
    ];
    for (const [index, item] of saleItems.entries()) {
      const current = product.get(index === 0 ? "Air Mineral Aqua 600 ml" : "Biskuit Marie Regal 125 g");
      if (current.stok_display < item.qty) {
        throw new Error(`Seed dibatalkan: stok display ${current.nama_barang} tidak mencukupi.`);
      }
      await client.query(
        'INSERT INTO "Detail_Transaksi" (id_detail_transaksi, jumlah, harga_satuan, id_transaksi, id_barang) VALUES ($1, $2, $3, $4, $5)',
        [item.detail, item.qty, current.harga_jual, saleId, item.id],
      );
      const decremented = await client.query(
        'UPDATE "Barang" SET stok_display = stok_display - $1 WHERE id_barang = $2 AND stok_display >= $1',
        [item.qty, item.id],
      );
      if (decremented.rowCount !== 1) {
        throw new Error(`Seed dibatalkan: stok ${current.nama_barang} berubah saat seed berjalan.`);
      }
    }
  }

  const requestId = "DEMO-REQ-001";
  await client.query(
    'INSERT INTO "Penyesuaian_Stok" (id_penyesuaian, tanggal, jenis, jumlah, id_barang, id_pengguna) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id_penyesuaian) DO NOTHING',
    [
      requestId,
      dateOnly,
      "Permintaan",
      3,
      product.get("Gula Pasir Gulaku 1 kg").id_barang,
      staff.Cashier,
    ],
  );

  const movementId = "DEMO-MOV-001";
  const movement = await client.query(
    'INSERT INTO "Penyesuaian_Stok" (id_penyesuaian, tanggal, jenis, jumlah, id_barang, id_pengguna) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id_penyesuaian) DO NOTHING',
    [movementId, dateOnly, "Pemindahan", 6, product.get("Tepung Terigu Segitiga Biru 1 kg").id_barang, staff.Restocker],
  );
  if (movement.rowCount === 1) {
    const adjusted = await client.query(
      'UPDATE "Barang" SET stok_gudang = stok_gudang - 6, stok_display = stok_display + 6 WHERE id_barang = $1 AND stok_gudang >= 6',
      [product.get("Tepung Terigu Segitiga Biru 1 kg").id_barang],
    );
    if (adjusted.rowCount !== 1) {
      throw new Error("Seed dibatalkan: stok Tepung Terigu Segitiga Biru 1 kg tidak mencukupi.");
    }
  }

  const reportId = "DEMO-RPT-001";
  const report = await client.query(
    'INSERT INTO "Laporan_Persediaan" (id_laporan, tgl_laporan, periode_awal, periode_akhir, id_pengguna) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id_laporan) DO NOTHING',
    [reportId, dateOnly, dateOnly, dateOnly, staff.Owner],
  );
  if (report.rowCount === 1) {
    const allItems = await client.query(
      'SELECT id_barang, stok_gudang + stok_display AS stok_akhir FROM "Barang" ORDER BY id_barang',
    );
    for (const [index, item] of allItems.rows.entries()) {
      await client.query(
        'INSERT INTO "Detail_Laporan" (id_detail_laporan, jumlah_masuk, jumlah_keluar, stok_akhir, id_laporan, id_barang) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          `DRPT${String(index + 1).padStart(6, "0")}`,
          item.id_barang === product.get("Beras Setra Ramos 5 kg").id_barang ? 18 : 0,
          item.id_barang === product.get("Air Mineral Aqua 600 ml").id_barang ? 3 :
            item.id_barang === product.get("Biskuit Marie Regal 125 g").id_barang ? 1 : 0,
          item.stok_akhir,
          reportId,
          item.id_barang,
        ],
      );
    }
  }

  const finalCounts = await client.query(
    `SELECT
      (SELECT count(*)::int FROM "Pengguna") AS pengguna,
      (SELECT count(*)::int FROM "Supplier") AS supplier,
      (SELECT count(*)::int FROM "Barang") AS barang,
      (SELECT count(*)::int FROM "Transaksi_Penjualan") AS transaksi,
      (SELECT count(*)::int FROM "Pemesanan_Barang") AS pemesanan,
      (SELECT count(*)::int FROM "Barang_Masuk") AS penerimaan,
      (SELECT count(*)::int FROM "Penyesuaian_Stok") AS penyesuaian,
      (SELECT count(*)::int FROM "Laporan_Persediaan") AS laporan`,
  );
  await client.query("COMMIT");

  console.log(JSON.stringify({ date: dateOnly, counts: finalCounts.rows[0], safeToRunAgain: true }, null, 2));
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
