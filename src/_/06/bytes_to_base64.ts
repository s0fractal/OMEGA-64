// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/bytes_to_base64.md
import { TYPES } from "@g05";

export const bytes_to_base64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
