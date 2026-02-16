// i.L99.core.QUANTUM_PACK.ts
// OMEGA-64 | QUANTUM PACK (Aggregate Helper)

import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";
import { U16_LIMITS } from "./i.L00.core.U16_LIMITS.ts";

type QState = { hue: number; phi: number; evt: number };

export const QUANTUM_PACK = () => {
  const i16 = I16_LIMITS();
  const u16 = U16_LIMITS();

  const assertU16 = (value: number, label: string) => {
    if (!Number.isInteger(value) || value < u16.min || value > u16.max) {
      throw new Error(`QUANTUM_PACK: ${label} out of u16 bounds (${value}).`);
    }
  };

  const assertI16 = (value: number, label: string) => {
    if (!Number.isInteger(value) || value < i16.min || value > i16.max) {
      throw new Error(`QUANTUM_PACK: ${label} out of i16 bounds (${value}).`);
    }
  };

  const toHexU16 = (value: number): string => {
    assertU16(value, "u16");
    return value.toString(16).padStart(4, "0");
  };

  const toHexI16 = (value: number): string => {
    assertI16(value, "i16");
    const raw = (value % i16.cycle + i16.cycle) % i16.cycle;
    return raw.toString(16).padStart(4, "0");
  };

  const fromHexU16 = (hex: string): number => {
    if (!/^[0-9a-f]{4}$/.test(hex)) {
      throw new Error(`QUANTUM_PACK: invalid u16 hex (${hex}).`);
    }
    return Number.parseInt(hex, 16);
  };

  const fromHexI16 = (hex: string): number => {
    const raw = fromHexU16(hex);
    return raw > i16.max ? raw - i16.cycle : raw;
  };

  const pack = (state: QState): string => {
    const hue = toHexU16(state.hue);
    const phi = toHexU16(state.phi);
    const evt = toHexI16(state.evt);
    return `${hue}${phi}${evt}`;
  };

  const unpack = (packed: string): QState => {
    const clean = packed.trim().toLowerCase();
    if (!/^[0-9a-f]{12}$/.test(clean)) {
      throw new Error(`QUANTUM_PACK: invalid packed q (${packed}).`);
    }
    const hue = fromHexU16(clean.slice(0, 4));
    const phi = fromHexU16(clean.slice(4, 8));
    const evt = fromHexI16(clean.slice(8, 12));
    return { hue, phi, evt };
  };

  const format = (state: QState): string => `${pack(state)}\n`;

  return { pack, unpack, format };
};
