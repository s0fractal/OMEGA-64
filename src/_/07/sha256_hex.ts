// SSoT: src/ontology/crypto/sha256_hex.md
import { bytes_to_hex } from "../06/mod.ts";

const crypto = globalThis.crypto;
const encoder = new TextEncoder();

export const sha256_hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return bytes_to_hex(new Uint8Array(digest));
};

export const sha256_hex_bytes = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes as unknown as BufferSource,
  );
  return bytes_to_hex(new Uint8Array(digest));
};
