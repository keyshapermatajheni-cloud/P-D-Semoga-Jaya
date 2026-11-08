import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";
import { BarangManager } from "./barang-manager";

export const instant = false;
const PAGE_SIZE = 6;

export default async function DataBarangPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const search = q.trim();

  const where = search
    ? {
        OR: [
          { nama_barang: { contains: search, mode: "insensitive" as const } },
          { satuan: { contains: search, mode: "insensitive" as const } },
          { id_barang: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const total = await prisma.barang.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const barang = await prisma.barang.findMany({
    where,
    orderBy: [{ nama_barang: "asc" }, { id_barang: "asc" }],
    skip: start,
    take: PAGE_SIZE,
  });

  return (
    <AppShell
      role="Admin"
      title="Data Utama Barang"
      subtitle="Kelola barang yang tersedia di toko"
      activeHref="/data-barang"
    >
      <BarangManager
        q={q}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        firstVisible={total === 0 ? 0 : start + 1}
        lastVisible={Math.min(start + PAGE_SIZE, total)}
        rows={barang.map((item) => ({
          ...item,
          harga_beli: Number(item.harga_beli).toString(),
          harga_jual: Number(item.harga_jual).toString(),
        }))}
      />
    </AppShell>
  );
}
