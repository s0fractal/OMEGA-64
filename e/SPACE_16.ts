// e/SPACE_16.ts
// The Bitwise Physics of the 16-bit Omega Space.

export type Address = number; // 0..65535

export interface Coord {
  L: number; // 0..63
  D: number; // 0..63
  V: number; // 0..15
}

export const SPACE_16 = {
  // packing: L(6) | D(6) | V(4)
  // total 16 bits

  encode: (c: Coord): Address => {
    const L = (c.L & 0x3F) << 10;
    const D = (c.D & 0x3F) << 4;
    const V = c.V & 0x0F;
    return (L | D | V) as Address;
  },

  decode: (addr: Address): Coord => {
    const L = (addr >> 10) & 0x3F;
    const D = (addr >> 4) & 0x3F;
    const V = addr & 0x0F;
    return { L, D, V };
  },

  // Utilities
  info: (addr: Address): string => {
    const { L, D, V } = SPACE_16.decode(addr);
    const hex = addr.toString(16).toUpperCase().padStart(4, "0");
    const bin = addr.toString(2).padStart(16, "0");
    const prettyBin = `${bin.slice(0, 6)}:${bin.slice(6, 12)}:${bin.slice(12)}`;
    return `[0x${hex}] ${prettyBin} -> L${L} D${D} V${V}`;
  },
};

// Test if run directly
if (import.meta.main) {
  console.log("--- SPACE_16 PROBE ---");

  // Example: Genesis (Level 63, Angle 0, V Max)
  const genesis = SPACE_16.encode({ L: 63, D: 0, V: 15 });
  console.log("Genesis:", SPACE_16.info(genesis));

  // Example: Surface (Level 0, Angle 0, V Min)
  const surface = SPACE_16.encode({ L: 0, D: 0, V: 0 });
  console.log("Surface:", SPACE_16.info(surface));

  // Example: Ribosome (Level 32, Angle 0, V standard)
  const ribosome = SPACE_16.encode({ L: 32, D: 0, V: 1 });
  console.log("Ribosome:", SPACE_16.info(ribosome));
}
