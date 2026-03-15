/** SSoT: {@link ../../ontology/crypto/normalize_hex64.md} */

export const normalize_hex64 = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return /^[a-f0-9]{64}$/u.test(t) ? t : null;
};
