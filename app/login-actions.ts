"use server";

import { scryptSync, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export async function login(formData: FormData) {
  const requestedRole = String(formData.get("role") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const roles = ["Owner", "Admin", "Restocker", "Cashier"] as const;

  if (!roles.some((role) => role === requestedRole)) {
    redirect("/?error=Role%20tidak%20valid.");
  }

  const role = requestedRole;
  if (!username || !password) {
    redirect(
      `/?role=${encodeURIComponent(role)}&error=${encodeURIComponent(
        "Username dan password wajib diisi.",
      )}`,
    );
  }

  const user = await prisma.pengguna.findFirst({
    where: { username, role },
    select: { password: true },
  });
  if (!user || !passwordMatches(password, user.password)) {
    redirect(
      `/?role=${encodeURIComponent(role)}&error=${encodeURIComponent(
        "Username atau password salah.",
      )}`,
    );
  }

  redirect(`/dashboard?role=${encodeURIComponent(role)}`);
}

function passwordMatches(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) {
    return password === stored;
  }

  const expected = Buffer.from(hash, "hex");
  if (expected.length !== 64 || !/^[0-9a-f]{128}$/i.test(hash)) {
    return false;
  }
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
