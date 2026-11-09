import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = await readFile(path.join(projectRoot, ".env"), "utf8");
const databaseLine = envFile
  .split(/\r?\n/)
  .find((line) => line.startsWith("DATABASE_URL="));

if (!databaseLine) {
  throw new Error("DATABASE_URL tidak ditemukan di .env.");
}

const connectionString = databaseLine
  .slice("DATABASE_URL=".length)
  .trim()
  .replace(/^(['"])(.*)\1$/, "$2");
const databaseUrl = new URL(connectionString);

if (!databaseUrl.hostname.endsWith(".neon.tech")) {
  throw new Error("Seed dibatalkan: DATABASE_URL bukan host Neon.");
}

const barangBaru = [
  // Sembako dan kebutuhan dapur
  ["Beras Setra Ramos 5 kg", "karung", 68000, 75000, 18, 8, 5],
  ["Beras Pandan Wangi 5 kg", "karung", 78000, 86000, 12, 6, 4],
  ["Minyak Goreng Tropical 1 L", "pouch", 16500, 18000, 30, 12, 6],
  ["Minyak Goreng Bimoli 2 L", "pouch", 34500, 37500, 20, 8, 4],
  ["Gula Pasir Gulaku 1 kg", "pak", 15800, 17500, 25, 10, 5],
  ["Tepung Terigu Segitiga Biru 1 kg", "pak", 12500, 14000, 20, 8, 4],
  ["Tepung Tapioka Rose Brand 500 g", "pak", 7200, 8500, 20, 8, 4],
  ["Garam Halus Dolphin 500 g", "pak", 4200, 5000, 25, 10, 5],
  ["Kecap Manis ABC 600 ml", "botol", 18500, 21000, 18, 8, 4],
  ["Saus Sambal Indofood 335 ml", "botol", 10500, 12000, 18, 8, 4],
  // Makanan dan bahan masak
  ["Mi Goreng Sedaap 90 g", "bungkus", 2700, 3200, 60, 24, 12],
  ["Mi Kuah Kari Ayam 75 g", "bungkus", 2600, 3100, 60, 24, 12],
  ["Bihun Jagung 320 g", "pak", 7800, 9500, 20, 8, 4],
  ["Sarden ABC Saus Tomat 155 g", "kaleng", 9800, 11500, 18, 8, 4],
  ["Kornet Sapi Pronas 198 g", "kaleng", 24500, 28000, 12, 5, 3],
  ["Santan Kara 200 ml", "pak", 6100, 7500, 24, 10, 5],
  ["Bumbu Nasi Goreng Sajiku 20 g", "sachet", 1800, 2500, 40, 16, 8],
  ["Kecap Asin ABC 135 ml", "botol", 6200, 7500, 16, 6, 3],
  ["Saus Tiram Saori  oyster 133 ml", "botol", 10500, 12500, 16, 6, 3],
  ["Makaroni Elbow 250 g", "pak", 8500, 10000, 18, 8, 4],
  // Makanan ringan
  ["Chitato Sapi Panggang 68 g", "bungkus", 8500, 10000, 24, 10, 5],
  ["Qtela Singkong Balado 60 g", "bungkus", 6200, 7500, 24, 10, 5],
  ["Taro Net Seaweed 65 g", "bungkus", 6500, 7800, 24, 10, 5],
  ["Biskuit Roma Kelapa 300 g", "pak", 11800, 14000, 18, 8, 4],
  ["Biskuit Marie Regal 125 g", "pak", 12500, 15000, 16, 6, 3],
  ["Wafer Nabati Keju 58 g", "bungkus", 2500, 3200, 40, 16, 8],
  ["Permen Kopiko 120 g", "pak", 10800, 13000, 16, 6, 3],
  ["Kacang Garuda Atom 100 g", "pak", 7800, 9500, 18, 8, 4],
  ["Roti Tawar Sari Roti", "bungkus", 15500, 18000, 12, 5, 3],
  ["Cokelat SilverQueen Chunky Bar 33 g", "pcs", 10500, 12500, 14, 6, 3],
  // Minuman
  ["Air Mineral Aqua 600 ml", "botol", 3000, 4000, 48, 24, 12],
  ["Air Mineral Le Minerale 600 ml", "botol", 2800, 3800, 48, 24, 12],
  ["Teh Pucuk Harum 350 ml", "botol", 3200, 4500, 36, 18, 9],
  ["Teh Kotak Jasmine 300 ml", "kotak", 3500, 5000, 30, 15, 8],
  ["Susu UHT Ultra Milk Cokelat 250 ml", "kotak", 5200, 6500, 24, 12, 6],
  ["Susu Kental Manis Frisian Flag 370 g", "kaleng", 12800, 15000, 18, 8, 4],
  ["Kopi Instan Kapal Api Special Mix 10 sachet", "pak", 11200, 13500, 18, 8, 4],
  ["Kopi Instan Good Day Cappuccino 10 sachet", "pak", 12800, 15000, 16, 6, 3],
  ["Sirup ABC Squash Orange 450 ml", "botol", 14500, 17000, 14, 6, 3],
  ["Minuman Isotonik Pocari Sweat 500 ml", "botol", 6500, 8000, 24, 12, 6],
  // Produk kebersihan
  ["Deterjen Rinso Anti Noda 770 g", "pak", 20500, 23500, 16, 7, 4],
  ["Deterjen Daia Floral 800 g", "pak", 15500, 18000, 18, 8, 4],
  ["Pelembut Molto Blue 700 ml", "pouch", 10500, 12500, 18, 8, 4],
  ["Pembersih Lantai Wipol Cemara 780 ml", "botol", 14500, 17000, 14, 6, 3],
  ["Pembersih Kaca Mr Muscle 500 ml", "botol", 18000, 21000, 10, 4, 2],
  ["Sabun Cuci Piring Sunlight Jeruk Nipis 755 ml", "pouch", 14500, 17000, 18, 8, 4],
  ["Pemutih Pakaian Bayclin 500 ml", "botol", 8500, 10500, 14, 6, 3],
  ["Pewangi Pakaian Kispray Violet 318 ml", "botol", 12500, 15000, 12, 5, 3],
  ["Pembersih Toilet Harpic Power Plus 450 ml", "botol", 18500, 21500, 10, 4, 2],
  ["Spons Cuci Piring Scotch-Brite", "pcs", 4500, 6000, 20, 8, 4],
  // Perlengkapan mandi dan perawatan diri
  ["Sabun Mandi Lifebuoy Total 10 110 g", "pcs", 4200, 5500, 30, 12, 6],
  ["Sabun Mandi Lux Soft Touch 110 g", "pcs", 4300, 5500, 24, 10, 5],
  ["Sampo Pantene Anti Ketombe 170 ml", "botol", 22500, 26000, 12, 5, 3],
  ["Sampo Sunsilk Black Shine 170 ml", "botol", 20500, 24000, 12, 5, 3],
  ["Pasta Gigi Pepsodent Complete 190 g", "pcs", 11500, 14000, 18, 8, 4],
  ["Sikat Gigi Formula Strong Protector", "pcs", 6500, 8500, 18, 8, 4],
  ["Deodoran Rexona Men Roll On 45 ml", "pcs", 12500, 15000, 12, 5, 3],
  ["Pembalut Laurier Relax Night 16 pcs", "pak", 16500, 19500, 12, 5, 3],
  ["Tisu Wajah Paseo 250 sheet", "pak", 11500, 14000, 18, 8, 4],
  ["Kapas Selection 35 g", "pak", 5500, 7000, 14, 6, 3],
  // Perlengkapan rumah dan kebutuhan harian
  ["Tisu Toilet Nice 10 roll", "pak", 26500, 31000, 12, 5, 3],
  ["Baterai Alkaline AA Energizer 2 pcs", "pak", 14500, 17500, 12, 5, 3],
  ["Baterai Alkaline AAA Energizer 2 pcs", "pak", 13500, 16500, 12, 5, 3],
  ["Lampu LED Philips 9 W", "pcs", 24500, 29000, 10, 4, 2],
  ["Korek Api Gas Cricket", "pcs", 4500, 6000, 20, 8, 4],
  ["Korek Api Kayu 10 kotak", "pak", 6000, 8000, 16, 6, 3],
  ["Obat Nyamuk Bakar Baygon 10 pcs", "pak", 8500, 10500, 14, 6, 3],
  ["Obat Nyamuk Semprot Baygon 600 ml", "kaleng", 38500, 44000, 8, 3, 2],
  ["Kantong Sampah Hitam 60 x 100 cm", "pak", 10500, 13000, 12, 5, 3],
  ["Plastik Klip Ukuran  kecil 100 pcs", "pak", 7500, 9500, 14, 6, 3],
  // Peralatan sederhana dan perlengkapan rumah tangga
  ["Sendok Makan Stainless", "pcs", 3500, 5000, 18, 8, 4],
  ["Gelas Kaca Bening 250 ml", "pcs", 6500, 8500, 14, 6, 3],
  ["Piring Melamin Putih 8 inci", "pcs", 8500, 11000, 12, 5, 3],
  ["Mangkok Melamin 6 inci", "pcs", 7000, 9000, 12, 5, 3],
  ["Gantungan Baju Plastik 5 pcs", "pak", 9500, 12000, 12, 5, 3],
  ["Jepitan Baju Plastik 20 pcs", "pak", 6500, 8500, 14, 6, 3],
  ["Sapu Ijuk Rumah Tangga", "pcs", 18500, 22000, 8, 3, 2],
  ["Serok Sampah Plastik", "pcs", 9500, 12000, 10, 4, 2],
  ["Lap Microfiber Serbaguna 30 x 30 cm", "pcs", 7500, 9500, 14, 6, 3],
  ["Tali Rafia Putih 1 kg", "rol", 18500, 22000, 8, 3, 2],
];

const normalizedName = (value) =>
  value.normalize("NFKC").trim().toLocaleLowerCase("id-ID");
const seenNames = new Set();
const items = barangBaru.map((barang, index) => {
  const [nama_barang, satuan, harga_beli, harga_jual, stok_gudang, stok_display, stok_minimum] =
    barang;
  const id_barang = `SJ${String(index + 1).padStart(8, "0")}`;
  const key = normalizedName(nama_barang);

  if (seenNames.has(key)) {
    throw new Error(`Nama barang seed duplikat: ${nama_barang}`);
  }
  seenNames.add(key);

  if (
    id_barang.length > 10 ||
    nama_barang.length > 100 ||
    satuan.length > 20 ||
    harga_beli <= 0 ||
    harga_jual < harga_beli ||
    ![stok_gudang, stok_display, stok_minimum].every(
      (value) => Number.isInteger(value) && value >= 0,
    )
  ) {
    throw new Error(`Data barang tidak valid: ${nama_barang}`);
  }

  return {
    id_barang,
    nama_barang,
    satuan,
    harga_beli,
    harga_jual,
    stok_gudang,
    stok_display,
    stok_minimum,
  };
});

if (items.length !== 80) {
  throw new Error(`Jumlah barang seed harus 80, ditemukan ${items.length}.`);
}

const client = new Client({ connectionString });
await client.connect();

try {
  await client.query("BEGIN");
  await client.query('LOCK TABLE "Barang" IN SHARE ROW EXCLUSIVE MODE');

  const database = await client.query(
    "SELECT current_database() AS database, current_schema() AS schema",
  );
  if (database.rows[0].schema !== "public") {
    throw new Error("Seed dibatalkan: schema database bukan public.");
  }

  const tables = await client.query(
    "SELECT count(*)::int AS total FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
  );
  if (tables.rows[0].total !== 12) {
    throw new Error(
      `Seed dibatalkan: ditemukan ${tables.rows[0].total} tabel public, seharusnya 12.`,
    );
  }

  const existingResult = await client.query(
    'SELECT id_barang, nama_barang FROM "Barang"',
  );
  const existingById = new Map(
    existingResult.rows.map((row) => [row.id_barang, row.nama_barang]),
  );
  const existingByName = new Map(
    existingResult.rows.map((row) => [normalizedName(row.nama_barang), row.id_barang]),
  );
  const newItems = [];

  for (const item of items) {
    const sameIdName = existingById.get(item.id_barang);
    const sameNameId = existingByName.get(normalizedName(item.nama_barang));

    if (sameIdName !== undefined) {
      if (sameIdName !== item.nama_barang) {
        throw new Error(
          `Seed dibatalkan: ID ${item.id_barang} sudah dipakai barang lain.`,
        );
      }
      continue;
    }

    if (sameNameId !== undefined) {
      throw new Error(
        `Seed dibatalkan: nama "${item.nama_barang}" sudah digunakan oleh ID ${sameNameId}.`,
      );
    }

    newItems.push(item);
  }

  if (newItems.length > 0) {
    const values = [];
    const placeholders = newItems.map((item, index) => {
      const offset = index * 8;
      values.push(
        item.id_barang,
        item.nama_barang,
        item.satuan,
        item.harga_beli,
        item.harga_jual,
        item.stok_gudang,
        item.stok_display,
        item.stok_minimum,
      );
      return `(${Array.from({ length: 8 }, (_, column) => `$${offset + column + 1}`).join(", ")})`;
    });

    const inserted = await client.query(
      `INSERT INTO "Barang" (id_barang, nama_barang, satuan, harga_beli, harga_jual, stok_gudang, stok_display, stok_minimum) VALUES ${placeholders.join(", ")}`,
      values,
    );
    if (inserted.rowCount !== newItems.length) {
      throw new Error(
        `Jumlah insert tidak sesuai: ${inserted.rowCount} dari ${newItems.length}.`,
      );
    }
  }

  const verification = await client.query(
    'SELECT id_barang, nama_barang FROM "Barang" WHERE id_barang = ANY($1::varchar[])',
    [items.map((item) => item.id_barang)],
  );
  const verified = new Map(
    verification.rows.map((row) => [row.id_barang, row.nama_barang]),
  );

  for (const item of items) {
    if (verified.get(item.id_barang) !== item.nama_barang) {
      throw new Error(`Verifikasi gagal untuk ID ${item.id_barang}.`);
    }
  }

  const total = await client.query('SELECT count(*)::int AS total FROM "Barang"');
  await client.query("COMMIT");

  console.log(
    JSON.stringify(
      {
        database: database.rows[0].database,
        inserted: newItems.length,
        seedItemsVerified: verified.size,
        totalBarang: total.rows[0].total,
        unchangedExistingRecords: true,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
