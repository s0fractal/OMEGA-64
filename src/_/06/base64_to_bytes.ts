/** SSoT: {@link ../../ontology/crypto/base64_to_bytes.md} */

export const base64_to_bytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
