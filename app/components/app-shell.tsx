import Link from "next/link";
import type { ReactNode } from "react";
import { getNotifications } from "@/app/lib/notifications";
import { NotificationBell } from "./notification-bell";

export type UserRole = "Owner" | "Admin" | "Restocker" | "Cashier";

const navigationByRole: Record<UserRole, Array<{ label: string; href: string }>> = {
  Owner: [
    { label: "Dashboard", href: "/dashboard?role=Owner" },
    { label: "Laporan Persediaan", href: "/laporan-persediaan" },
    { label: "Ketidaksesuaian Barang", href: "/ketidaksesuaian-barang" },
    { label: "Pemesanan Barang", href: "/pemesanan-barang" },
    { label: "Informasi Persediaan", href: "/informasi-persediaan?role=Owner" },
    { label: "Tentang UMKM", href: "/tentang-umkm?role=Owner" },
  ],
  Admin: [
    { label: "Dashboard", href: "/dashboard?role=Admin" },
    { label: "Data Utama Barang", href: "/data-barang" },
    { label: "Data Barang Masuk", href: "/barang-masuk" },
    { label: "Pemeriksaan Barang Masuk", href: "/pemeriksaan-barang-masuk" },
    { label: "Informasi Persediaan", href: "/informasi-persediaan?role=Admin" },
    { label: "Tentang UMKM", href: "/tentang-umkm?role=Admin" },
  ],
  Restocker: [
    { label: "Dashboard", href: "/dashboard?role=Restocker" },
    { label: "Perlu Tambahan Stok", href: "/perlu-tambahan-stok" },
    { label: "Stok Terkini", href: "/stok-terkini" },
    { label: "Notifikasi Permintaan", href: "/notifikasi-permintaan" },
    { label: "Tentang UMKM", href: "/tentang-umkm?role=Restocker" },
  ],
  Cashier: [
    { label: "Dashboard", href: "/dashboard?role=Cashier" },
    { label: "Transaksi Penjualan", href: "/transaksi-penjualan" },
    { label: "Permintaan Barang", href: "/permintaan-barang" },
    { label: "Tentang UMKM", href: "/tentang-umkm?role=Cashier" },
  ],
};

export async function AppShell({
  role,
  title,
  subtitle,
  children,
  activeHref,
}: {
  role: UserRole;
  title: string;
  subtitle: string;
  children: ReactNode;
  activeHref?: string;
}) {
  const items = navigationByRole[role];
  const notifications = await getNotifications(role);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Kembali ke login">
          <span>P&amp;D</span>
          <span>Semoga Jaya</span>
        </Link>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {items.map((item, index) => (
            <Link
              className={`nav-item${
                (
                  activeHref
                      ? item.href.split("?")[0] === activeHref ||
                      (activeHref === "/dashboard" && item.href.startsWith("/dashboard"))
                    : index === 0
                ) ? " active" : ""
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-actions">
            <NotificationBell notifications={notifications} />
            <span className="role-label">{role}</span>
            <Link className="logout-button" href="/">
              Logout
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
