// SSoT: src/ontology/crypto/bytes_to_base64.md

export const bytes_to_base64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
