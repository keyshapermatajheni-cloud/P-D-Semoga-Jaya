import type { UserRole } from "@/app/components/app-shell";
import type { AppNotification } from "@/app/components/notification-bell";
import { prisma } from "@/app/lib/prisma";

function relativeTime(date: Date) {
  const elapsedHours = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / (60 * 60 * 1000)),
  );
  if (elapsedHours < 1) return "Baru";
  if (elapsedHours < 24) return `${elapsedHours} jam`;
  return `${Math.floor(elapsedHours / 24)} hari`;
}

export async function getNotifications(role: UserRole): Promise<AppNotification[]> {
  const [barang, requests, orders, incomingDetails, reports, cashier] =
    await Promise.all([
      prisma.barang.findMany({
        select: {
          id_barang: true,
          nama_barang: true,
          satuan: true,
          stok_gudang: true,
          stok_display: true,
          stok_minimum: true,
        },
        orderBy: { nama_barang: "asc" },
      }),
      prisma.penyesuaian_Stok.findMany({
        where: { jenis: "Permintaan" },
        take: 4,
        orderBy: [{ tanggal: "desc" }, { id_penyesuaian: "desc" }],
        include: {
          Barang: { select: { nama_barang: true, satuan: true } },
          Pengguna: { select: { id_pengguna: true, nama_pengguna: true, role: true } },
        },
      }),
      prisma.pemesanan_Barang.findMany({
        where: { status_pemesanan: { not: "Diterima" } },
        take: 4,
        orderBy: [{ tgl_pemesanan: "desc" }, { id_pemesanan: "desc" }],
        include: { Supplier: { select: { nama_supplier: true } } },
      }),
      prisma.detail_Barang_Masuk.findMany({
        take: 40,
        orderBy: { id_detail_barang_masuk: "desc" },
        include: {
          Barang: { select: { nama_barang: true } },
          Barang_Masuk: {
            select: {
              id_barang_masuk: true,
              tgl_penerima: true,
              Pemesanan_Barang: {
                select: { Supplier: { select: { nama_supplier: true } } },
              },
            },
          },
        },
      }),
      prisma.laporan_Persediaan.findMany({
        take: 2,
        orderBy: [{ tgl_laporan: "desc" }, { id_laporan: "desc" }],
        select: { id_laporan: true, tgl_laporan: true, periode_awal: true, periode_akhir: true },
      }),
      prisma.pengguna.findFirst({
        where: { role: "Cashier" },
        orderBy: { id_pengguna: "asc" },
        select: { id_pengguna: true },
      }),
    ]);

  const lowStock = barang.filter(
    (item) => item.stok_display < item.stok_minimum,
  );
  const mismatches = incomingDetails.filter(
    (item) => item.jumlah_dikirim !== item.jumlah_diterima,
  );
  const notifications: AppNotification[] = [];

  if (role === "Admin") {
    for (const order of orders) {
      notifications.push({
        id: `order-${order.id_pemesanan}`,
        title: "Pesanan baru dari Owner",
        description: `${order.Supplier.nama_supplier} · ${order.id_pemesanan}`,
        time: relativeTime(order.tgl_pemesanan),
        href: `/barang-masuk?orderId=${encodeURIComponent(order.id_pemesanan)}`,
        type: "request",
      });
    }
  }

  if (role === "Admin" || role === "Owner") {
    for (const mismatch of mismatches.slice(0, 3)) {
      notifications.push({
        id: `mismatch-${mismatch.id_detail_barang_masuk}`,
        title: `Selisih penerimaan ${mismatch.Barang_Masuk.Pemesanan_Barang.Supplier.nama_supplier}`,
        description: `${mismatch.Barang.nama_barang} · selisih ${mismatch.jumlah_diterima - mismatch.jumlah_dikirim} unit`,
        time: relativeTime(mismatch.Barang_Masuk.tgl_penerima),
        href: "/ketidaksesuaian-barang",
        type: "alert",
      });
    }
  }

  if (role === "Owner") {
    for (const item of lowStock.slice(0, 3)) {
      notifications.push({
        id: `stock-${item.id_barang}`,
        title: `${item.nama_barang} menipis`,
        description: `Display tersisa ${item.stok_display} ${item.satuan}, minimum ${item.stok_minimum}`,
        time: "Perlu dicek",
        href: "/perlu-tambahan-stok",
        type: "warning",
      });
    }
    for (const report of reports) {
      notifications.push({
        id: `report-${report.id_laporan}`,
        title: "Laporan persediaan siap dilihat",
        description: `Periode ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(report.periode_awal)}–${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(report.periode_akhir)}`,
        time: relativeTime(report.tgl_laporan),
        href: "/laporan-persediaan",
        type: "report",
      });
    }
  }

  if (role === "Restocker") {
    for (const request of requests) {
      notifications.push({
        id: `request-${request.id_penyesuaian}`,
        title: `Permintaan baru dari ${request.Pengguna.nama_pengguna}`,
        description: `${request.Barang.nama_barang} · ${request.jumlah} ${request.Barang.satuan}`,
        time: relativeTime(request.tanggal),
        href: "/notifikasi-permintaan",
        type: "request",
      });
    }
    for (const item of lowStock.slice(0, 3)) {
      notifications.push({
        id: `stock-${item.id_barang}`,
        title: `${item.nama_barang} perlu tambahan stok`,
        description: `Gudang ${item.stok_gudang} ${item.satuan} · display ${item.stok_display} ${item.satuan}`,
        time: "Perlu dicek",
        href: "/perlu-tambahan-stok",
        type: "warning",
      });
    }
  }

  if (role === "Cashier" && cashier) {
    const ownRequests = await prisma.penyesuaian_Stok.findMany({
      where: {
        id_pengguna: cashier.id_pengguna,
        jenis: { in: ["Dipenuhi", "Ditolak"] },
      },
      take: 4,
      orderBy: [{ tanggal: "desc" }, { id_penyesuaian: "desc" }],
      include: { Barang: { select: { nama_barang: true } } },
    });
    for (const request of ownRequests) {
      notifications.push({
        id: `request-${request.id_penyesuaian}`,
        title: `Permintaan ${request.jenis.toLocaleLowerCase("id-ID")}`,
        description: request.Barang.nama_barang,
        time: relativeTime(request.tanggal),
        href: "/permintaan-barang",
        type: request.jenis === "Dipenuhi" ? "request" : "alert",
      });
    }
  }

  return notifications.slice(0, 4);
}
