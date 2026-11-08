import Link from "next/link";
import { AppShell } from "@/app/components/app-shell";
import { prisma } from "@/app/lib/prisma";

export const instant = false;

const PAGE_SIZE = 5;

export default async function StokTerkiniPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q = "", status = "Semua status", page = "1" } = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(page, 10) || 1);

  const barang = await prisma.barang.findMany({
    where: q.trim()
      ? { nama_barang: { contains: q.trim(), mode: "insensitive" } }
      : undefined,
    orderBy: { nama_barang: "asc" },
    select: {
      id_barang: true,
      nama_barang: true,
      satuan: true,
      stok_gudang: true,
      stok_display: true,
      stok_minimum: true,
    },
  });

  const rows = barang.map((item) => {
    const total = item.stok_gudang + item.stok_display;
    return {
      ...item,
      total,
      status: total < item.stok_minimum ? "Menipis" : "Aman",
    };
  });

  const filteredRows =
    status === "Aman" || status === "Menipis"
      ? rows.filter((item) => item.status === status)
      : rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = filteredRows.slice(start, start + PAGE_SIZE);
  const firstVisible = filteredRows.length === 0 ? 0 : start + 1;
  const lastVisible = Math.min(start + PAGE_SIZE, filteredRows.length);

  const buildHref = (nextPage: number, nextStatus = status, nextQuery = q) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextStatus !== "Semua status") params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return `/stok-terkini${query ? `?${query}` : ""}`;
  };

  return (
    <AppShell
      role="Restocker"
      title="Stok Terkini"
      subtitle="Stok gudang dan display setiap barang."
      activeHref="/stok-terkini"
    >
      <section className="current-stock-section" aria-label="Stok terkini">
        <form className="stock-filter-form" action="/stok-terkini" method="get">
          <label className="stock-search">
            <span aria-hidden="true">⌕</span>
            <input name="q" defaultValue={q} placeholder="Cari barang..." />
          </label>
          <select name="status" defaultValue={status} aria-label="Filter status stok">
            <option>Semua status</option>
            <option>Aman</option>
            <option>Menipis</option>
          </select>
        </form>

        <div className="current-stock-card">
          <div className="current-stock-table" role="table" aria-label="Daftar stok barang">
            <div className="current-stock-row current-stock-header" role="row">
              <span role="columnheader">Barang</span>
              <span role="columnheader">Stok Gudang</span>
              <span role="columnheader">Stok Display</span>
              <span role="columnheader">Total</span>
              <span role="columnheader">Status</span>
            </div>
            {visibleRows.map((item) => (
              <div className="current-stock-row" role="row" key={item.id_barang}>
                <span role="cell">{item.nama_barang}</span>
                <span role="cell">{item.stok_gudang}</span>
                <span role="cell">{item.stok_display}</span>
                <span role="cell">{item.total}</span>
                <span role="cell">
                  <span className={`stock-status ${item.status === "Aman" ? "safe" : "low"}`}>
                    {item.status}
                  </span>
                </span>
              </div>
            ))}
            {visibleRows.length === 0 && (
              <p className="current-stock-empty">Belum ada barang yang sesuai filter.</p>
            )}
          </div>

          <footer className="current-stock-footer">
            <span>
              Menampilkan {firstVisible}-{lastVisible} dari {filteredRows.length} barang
            </span>
            <nav className="stock-pagination" aria-label="Paginasi stok">
              <Link
                className={`stock-page-button ${currentPage === 1 ? "disabled" : ""}`}
                href={currentPage === 1 ? buildHref(1) : buildHref(currentPage - 1)}
                aria-disabled={currentPage === 1}
              >
                ‹
              </Link>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((pageNumber) =>
                  totalPages <= 7 ||
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 1,
                )
                .map((pageNumber, index, pageNumbers) => (
                  <span className="stock-page-item" key={pageNumber}>
                    {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && (
                      <span className="stock-page-ellipsis">...</span>
                    )}
                    <Link
                      className={`stock-page-button ${pageNumber === currentPage ? "active" : ""}`}
                      href={buildHref(pageNumber)}
                    >
                      {pageNumber}
                    </Link>
                  </span>
                ))}
              <Link
                className={`stock-page-button ${currentPage === totalPages ? "disabled" : ""}`}
                href={currentPage === totalPages ? buildHref(totalPages) : buildHref(currentPage + 1)}
                aria-disabled={currentPage === totalPages}
              >
                ›
              </Link>
            </nav>
          </footer>
        </div>
      </section>
    </AppShell>
  );
}
