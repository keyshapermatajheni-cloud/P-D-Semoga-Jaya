"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@/app/lib/ids";
import { prisma } from "@/app/lib/prisma";

export async function createBarang(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const satuan = String(formData.get("satuan") ?? "").trim();
  const harga = Number(String(formData.get("harga") ?? "").replace(/\D/g, ""));
  const stokGudang = Number.parseInt(String(formData.get("stokGudang") ?? ""), 10);

  if (!nama || !satuan) {
    return { ok: false, message: "Nama barang dan satuan wajib diisi." };
  }
  if (!Number.isFinite(harga) || harga < 0) {
    return { ok: false, message: "Harga harus berupa angka yang valid." };
  }
  if (!Number.isInteger(stokGudang) || stokGudang < 0) {
    return { ok: false, message: "Stok gudang harus berupa angka 0 atau lebih." };
  }

  try {
    await prisma.barang.create({
      data: {
        id_barang: createId("B", 10),
        nama_barang: nama,
        satuan,
        harga_beli: harga,
        harga_jual: harga,
        stok_gudang: stokGudang,
        stok_display: 0,
        stok_minimum: 1,
      },
    });
    revalidatePath("/data-barang");
    return { ok: true, message: "Data Tersimpan: barang berhasil ditambahkan." };
  } catch (error) {
    console.error("Gagal menambahkan barang:", error);
    return { ok: false, message: "Barang gagal ditambahkan." };
  }
}

export async function updateBarang(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nama = String(formData.get("nama") ?? "").trim();
  const satuan = String(formData.get("satuan") ?? "").trim();
  const harga = Number(String(formData.get("harga") ?? "").replace(/\D/g, ""));
  const stokGudang = Number.parseInt(String(formData.get("stokGudang") ?? ""), 10);

  if (!id || !nama || !satuan) {
    return { ok: false, message: "Data barang tidak lengkap." };
  }
  if (!Number.isFinite(harga) || harga < 0) {
    return { ok: false, message: "Harga harus berupa angka yang valid." };
  }
  if (!Number.isInteger(stokGudang) || stokGudang < 0) {
    return { ok: false, message: "Stok gudang harus berupa angka 0 atau lebih." };
  }

  try {
    await prisma.barang.update({
      where: { id_barang: id },
      data: {
        nama_barang: nama,
        satuan,
        harga_beli: harga,
        stok_gudang: stokGudang,
      },
    });
    revalidatePath("/data-barang");
    return { ok: true, message: "Data Tersimpan: barang berhasil diperbarui." };
  } catch (error) {
    console.error("Gagal memperbarui barang:", error);
    return { ok: false, message: "Barang gagal diperbarui." };
  }
}

export async function deleteBarang(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Barang tidak ditemukan." };

  const [purchaseDetails, salesDetails, stockDetails, reports, adjustments] =
    await Promise.all([
      prisma.detail_Pemesanan.count({ where: { id_barang: id } }),
      prisma.detail_Transaksi.count({ where: { id_barang: id } }),
      prisma.detail_Barang_Masuk.count({ where: { id_barang: id } }),
      prisma.detail_Laporan.count({ where: { id_barang: id } }),
      prisma.penyesuaian_Stok.count({ where: { id_barang: id } }),
    ]);

  if (
    purchaseDetails + salesDetails + stockDetails + reports + adjustments > 0
  ) {
    return {
      ok: false,
      message: "Barang tidak dapat dihapus karena masih digunakan dalam data transaksi atau persediaan.",
    };
  }

  try {
    await prisma.barang.delete({ where: { id_barang: id } });
    revalidatePath("/data-barang");
    return { ok: true, message: "Barang berhasil dihapus." };
  } catch (error) {
    console.error("Gagal menghapus barang:", error);
    return { ok: false, message: "Barang gagal dihapus." };
  }
}
