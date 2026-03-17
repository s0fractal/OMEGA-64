// SSoT: file:///Users/s0fractal/OMEGA/I/core/GLYPH_TYPES.md

// Enum: GLYPH_TYPES
export const KIND_CORE: number = 0;
export const KIND_CONTROL: number = 1;
export const KIND_TRANSPORT: number = 2;
export const KIND_STRUCTURAL: number = 3;
export const KIND_CATALYTIC: number = 4;
export const KIND_REGULATORY: number = 5;
export const KIND_MEMORY: number = 6;
export const KIND_RESERVE: number = 7;
export const STAB_HARD_INVARIANT: number = 0;
export const STAB_LEGACY_BRIDGE: number = 1;
export const STAB_BOUNDED_DYNAMIC: number = 2;
export const STAB_RESERVE: number = 3;
export const GLYPH_TYPES = {
  KIND_CORE: 0,
  KIND_CONTROL: 1,
  KIND_TRANSPORT: 2,
  KIND_STRUCTURAL: 3,
  KIND_CATALYTIC: 4,
  KIND_REGULATORY: 5,
  KIND_MEMORY: 6,
  KIND_RESERVE: 7,
  STAB_HARD_INVARIANT: 0,
  STAB_LEGACY_BRIDGE: 1,
  STAB_BOUNDED_DYNAMIC: 2,
  STAB_RESERVE: 3,
} as const;
