"use client";

import Link from "next/link";
import { useState } from "react";

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  type: "warning" | "request" | "alert" | "report";
};

export function NotificationBell({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const unreadCount = notifications.filter(
    (notification) => !readIds.includes(notification.id),
  ).length;

  const markAllRead = () => {
    setReadIds(notifications.map((notification) => notification.id));
  };

  return (
    <div className="notification-control">
      <button
        className="notification-toggle"
        type="button"
        aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <section
          className="notification-panel"
          role="dialog"
          aria-label="Notifikasi"
        >
          <header className="notification-panel-header">
            <strong>Notifikasi</strong>
            <span className="notification-count">{unreadCount} baru</span>
            <button type="button" onClick={markAllRead} disabled={!unreadCount}>
              Tandai semua dibaca
            </button>
            <button
              className="notification-close"
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>
          <div className="notification-items">
            {notifications.map((notification) => (
              <Link
                className={`notification-item ${readIds.includes(notification.id) ? "read" : ""}`}
                href={notification.href}
                key={notification.id}
                onClick={() => setOpen(false)}
              >
                <span className={`notification-icon ${notification.type}`} aria-hidden="true">
                  {notification.type === "warning" ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 3 2.8 20h18.4L12 3Z" />
                      <path d="M12 9v5m0 3h.01" />
                    </svg>
                  ) : notification.type === "request" ? (
                    <svg viewBox="0 0 24 24">
                      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                      <path d="m3 8 9 5 9-5m-18 5 9 5 9-5M12 13v8" />
                    </svg>
                  ) : notification.type === "alert" ? (
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v5m0 3h.01" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M6 3h8l4 4v14H6z" />
                      <path d="M14 3v5h5m-9 4h5m-5 4h5" />
                    </svg>
                  )}
                </span>
                <span className="notification-copy">
                  <strong>{notification.title}</strong>
                  <span>{notification.description}</span>
                </span>
                <span className="notification-time">{notification.time}</span>
                {!readIds.includes(notification.id) && (
                  <span className="notification-unread" aria-label="Belum dibaca" />
                )}
              </Link>
            ))}
            {notifications.length === 0 && (
              <p className="notification-empty">Belum ada notifikasi baru.</p>
            )}
          </div>
          <Link
            className="notification-all-link"
            href={
              notifications.some((item) => item.id.startsWith("request-"))
                ? "/notifikasi-permintaan"
                : notifications.some((item) => item.id.startsWith("order-"))
                  ? "/barang-masuk"
                  : "/laporan-persediaan"
            }
            onClick={() => setOpen(false)}
          >
            Lihat semua notifikasi
          </Link>
        </section>
      )}
    </div>
  );
}
