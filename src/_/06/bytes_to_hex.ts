// SSoT: src/ontology/crypto/bytes_to_hex.md

export const bytes_to_hex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
