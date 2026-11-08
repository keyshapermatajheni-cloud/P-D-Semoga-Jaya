"use server";

import { redirect } from "next/navigation";

const credentials = {
  Owner: { username: "owner", password: "owner123" },
  Admin: { username: "admin", password: "admin123" },
  Restocker: { username: "restocker", password: "restocker123" },
  Cashier: { username: "cashier", password: "cashier123" },
} as const;

type LoginRole = keyof typeof credentials;

export async function login(formData: FormData) {
  const requestedRole = String(formData.get("role") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!(requestedRole in credentials)) {
    redirect("/?error=Role%20tidak%20valid.");
  }

  const role = requestedRole as LoginRole;
  if (!username || !password) {
    redirect(
      `/?role=${encodeURIComponent(role)}&error=${encodeURIComponent(
        "Username dan password wajib diisi.",
      )}`,
    );
  }

  const expected = credentials[role];
  if (username !== expected.username || password !== expected.password) {
    redirect(
      `/?role=${encodeURIComponent(role)}&error=${encodeURIComponent(
        "Username atau password salah.",
      )}`,
    );
  }

  redirect(`/dashboard?role=${encodeURIComponent(role)}`);
}
