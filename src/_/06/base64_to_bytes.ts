// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/base64_to_bytes.md
import { TYPES } from "@g05";

export const base64_to_bytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
