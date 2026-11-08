"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

function createId(prefix: string, maxLength: number, counterLength = 8) {
  const value = `${Date.now()}${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`;
  const suffix = value.slice(-counterLength);
  return `${prefix}${suffix}`.slice(0, maxLength);
}

export async function createPemesanan(formData: FormData) {
  const supplierId = String(formData.get("supplierId") ?? "");
  const itemIds = formData.getAll("itemId").map(String);
  const quantities = formData.getAll("quantity").map(String);

  if (!supplierId) {
    return { ok: false, message: "Supplier wajib dipilih." };
  }

  const owner = await prisma.pengguna.findFirst({
    where: { role: "Owner" },
    orderBy: { id_pengguna: "asc" },
  });

  if (!owner) {
    return {
      ok: false,
      message: "Tidak ada pengguna dengan role Owner pada database.",
    };
  }

  const items = itemIds
    .map((id_barang, index) => ({
      id_barang,
      jumlah_dipesan: Number.parseInt(quantities[index] ?? "", 10),
    }))
    .filter((item) => item.id_barang);

  if (items.length === 0) {
    return { ok: false, message: "Minimal satu barang harus ditambahkan." };
  }

  if (
    items.some(
      (item) =>
        !Number.isInteger(item.jumlah_dipesan) || item.jumlah_dipesan <= 0,
    )
  ) {
    return { ok: false, message: "Jumlah barang harus lebih dari 0." };
  }

  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id_barang)) {
      return {
        ok: false,
        message: "Barang yang sama tidak boleh ditambahkan lebih dari satu kali.",
      };
    }
    seen.add(item.id_barang);
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id_supplier: supplierId },
  });
  if (!supplier) {
    return { ok: false, message: "Supplier tidak ditemukan." };
  }

  const validBarang = await prisma.barang.findMany({
    where: { id_barang: { in: items.map((item) => item.id_barang) } },
    select: { id_barang: true },
  });
  if (validBarang.length !== items.length) {
    return { ok: false, message: "Satu atau lebih barang tidak ditemukan." };
  }

  await prisma.$transaction(async (tx) => {
    const orderId = createId("PO-", 25, 8);
    await tx.pemesanan_Barang.create({
      data: {
        id_pemesanan: orderId,
        tgl_pemesanan: new Date(),
        status_pemesanan: "Dikirim",
        id_pengguna: owner.id_pengguna,
        id_supplier: supplierId,
      },
    });

    await tx.detail_Pemesanan.createMany({
      data: items.map((item, index) => ({
        id_detail_pemesanan: createId("DP", 9, 7) + String(index + 1),
        jumlah_dipesan: item.jumlah_dipesan,
        id_barang: item.id_barang,
        id_pemesanan: orderId,
      })),
    });
  });

  revalidatePath("/pemesanan-barang");
  return { ok: true, message: "Pemesanan berhasil dikirim." };
}
