// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/normalize_hex64.md
import { TYPES } from "@g05";

export const normalize_hex64 = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return /^[a-f0-9]{64}$/u.test(t) ? t : null;
};
