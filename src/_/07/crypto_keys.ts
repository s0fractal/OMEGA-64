// SSoT: src/ontology/crypto/crypto_keys.md
import { base64_to_bytes } from "../06/mod.ts";

export type Ed25519SigningKey = {
  scheme: "ed25519/v1";
  private_key_pkcs8_b64: string;
};
export type Ed25519VerifyKey = { scheme: "ed25519/v1"; public_key_b64: string };
export type HmacKey = { scheme: "hmac-sha256/v1"; secret: string };

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
