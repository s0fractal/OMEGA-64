// OMEGA-64 | crypto_shim.ts
// Legacy Compliance Shims - Cryptography, Hashing, and Signing

const crypto = globalThis.crypto;
const encoder = new TextEncoder();

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

export const hexToBytes = (hex: string): Uint8Array | null => {
  if (!/^[0-9a-fA-F]*$/u.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (!Number.isFinite(byte)) return null;
    out[i] = byte;
  }
  return out;
};

export const bytesToBase64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));

export const base64ToBytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));

export const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return "[" + value.map((v) => stableStringify(v)).join(",") + "]";
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    return "{" +
      entries.map(([k, v]) => JSON.stringify(k) + ":" + stableStringify(v))
        .join(",") +
      "}";
  }
  return JSON.stringify(value);
};

export const sha256Hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return bytesToHex(new Uint8Array(digest));
};

export const sha256HexBytes = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes as unknown as BufferSource,
  );
  return bytesToHex(new Uint8Array(digest));
};

export const normalizeHex64 = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return /^[a-f0-9]{64}$/u.test(t) ? t : null;
};

export const fnv1a32 = (input: string): number => {
  let hash = 0x811C9DC5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

export type Ed25519SigningKey = {
  scheme: "ed25519/v1";
  private_key_pkcs8_b64: string;
};
export type Ed25519VerifyKey = { scheme: "ed25519/v1"; public_key_b64: string };
export type HmacKey = { scheme: "hmac-sha256/v1"; secret: string };

export const importHmac = async (
  secret: string,
  usages: KeyUsage[],
): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );

export const importEd25519Private = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "pkcs8",
    base64ToBytes(b64) as unknown as BufferSource,
    { name: "Ed25519" },
    false,
    ["sign"],
  );

export const importEd25519Public = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "spki",
    base64ToBytes(b64) as unknown as BufferSource,
    { name: "Ed25519" },
    false,
    ["verify"],
  );
