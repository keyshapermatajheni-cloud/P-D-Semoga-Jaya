import Image from "next/image";
import { login } from "./login-actions";

export const instant = false;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login-page">
      <div className="login-branding">
        <Image
          className="login-background"
          src="/login-background.png"
          alt=""
          fill
          sizes="100vw"
          priority
        />
        <div className="login-brand-copy">
          <h1>
            P&amp;D
            <br />
            SEMOGA JAYA
          </h1>
          <p className="login-product">
            Sistem Informasi Persediaan
            <br />
            Toko P&amp;D Semoga Jaya
          </p>
          <p className="login-tagline">
            Kelola stok dengan lebih mudah,
            <br />
            untuk bisnis yang lebih maju
          </p>
        </div>
      </div>

      <section className="role-panel login-panel" aria-labelledby="login-title">
        <header>
          <h2 id="login-title">Selamat Datang!</h2>
          <p>Silakan login untuk melanjutkan</p>
        </header>
        <form className="login-form" action={login}>
          <label className="login-field">
            <span>Username</span>
            <input
              className="login-input"
              type="text"
              name="username"
              placeholder="Masukkan username"
              autoComplete="username"
              required
            />
          </label>
          <label className="login-field">
            <span>Password</span>
            <input
              className="login-input"
              type="password"
              name="password"
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <div className="login-actions">
            <button className="login-submit" type="submit">
              Login
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
