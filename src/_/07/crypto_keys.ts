// SSoT: file:///Users/s0fractal/OMEGA/I/crypto/crypto_keys.md
import { base64_to_bytes, Ed25519SigningKey, Ed25519VerifyKey, HmacKey } from "@g06";

const crypto = globalThis.crypto;
const encoder = new TextEncoder();

export const import_hmac = async (
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

export const import_ed25519_private = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "pkcs8",
    base64_to_bytes(b64) as unknown as BufferSource,
    { name: "Ed25519" },
    false,
    ["sign"],
  );

export const import_ed25519_public = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "spki",
    base64_to_bytes(b64) as unknown as BufferSource,
    { name: "Ed25519" },
    false,
    ["verify"],
  );
