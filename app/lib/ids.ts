import { randomBytes } from "node:crypto";

export function createId(prefix: string, maxLength: number) {
  const suffixLength = maxLength - prefix.length;
  if (suffixLength < 1) {
    throw new Error("Panjang ID tidak cukup untuk membuat ID unik.");
  }
  const suffix = randomBytes(Math.ceil(suffixLength / 2))
    .toString("hex")
    .slice(0, suffixLength);
  return `${prefix}${suffix}`;
}
