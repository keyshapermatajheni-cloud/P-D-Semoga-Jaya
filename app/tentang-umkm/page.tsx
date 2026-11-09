import { AppShell, type UserRole } from "@/app/components/app-shell";

export const instant = false;

const roles: UserRole[] = ["Owner", "Admin", "Restocker", "Cashier"];

export default async function TentangUmkmPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: requestedRole } = await searchParams;
  const role = roles.includes(requestedRole as UserRole)
    ? (requestedRole as UserRole)
    : "Owner";

  return (
    <AppShell
      role={role}
      title="Tentang UMKM"
      subtitle="Profil singkat, visi, dan misi usaha."
      activeHref="/tentang-umkm"
    >
      <section className="umkm-profile-card">
        <div className="umkm-mark" aria-hidden="true">SJ</div>
        <div>
          <h2>P&amp;D Semoga Jaya</h2>
          <p>UMKM penyedia kebutuhan sehari-hari untuk pelanggan eceran dan grosir.</p>
          <div className="umkm-tags">
            <span>Sembako</span>
            <span>Minuman</span>
            <span>Makanan Ringan</span>
          </div>
          <p className="umkm-contact">Informasi alamat dan kontak dapat diperbarui melalui data usaha.</p>
        </div>
      </section>

      <section className="umkm-values-grid">
        <article className="umkm-value-card">
          <h2>Visi</h2>
          <p>
            Menjadi toko kebutuhan sehari-hari yang terpercaya, lengkap, dan selalu
            tersedia bagi pelanggan di sekitar kami.
          </p>
        </article>
        <article className="umkm-value-card">
          <h2>Misi</h2>
          <ul>
            <li>Menyediakan barang berkualitas dengan harga bersaing.</li>
            <li>Menjaga ketersediaan stok yang lengkap dan beragam.</li>
            <li>Melayani pelanggan dengan ramah dan cepat.</li>
          </ul>
        </article>
      </section>
      <section className="umkm-summary-card">
        <h2>Profil Singkat</h2>
        <p>
          P&amp;D Semoga Jaya merupakan UMKM di bidang perdagangan barang kebutuhan
          sehari-hari, seperti sembako dan berbagai produk rumah tangga. Usaha ini
          hadir untuk memenuhi kebutuhan masyarakat dengan menyediakan barang yang
          diperlukan dalam aktivitas sehari-hari.
        </p>
        <p>
          Sistem persediaan ini membantu Owner, Admin, Restocker, dan Cashier
          menjaga kelancaran operasional, ketersediaan barang, serta pelayanan
          pelanggan.
        </p>
      </section>
    </AppShell>
  );
}
