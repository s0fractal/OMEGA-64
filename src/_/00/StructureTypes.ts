// SSoT: file:///Users/s0fractal/OMEGA/I/core/StructureTypes.md

// Enum: StructureTypes
export const STR_VOID: number = 0;
export const STR_WIRE: number = 1;
export const STR_NODE: number = 2;
export const STR_DIODE: number = 3;
export const STR_SOURCE: number = 4;
export const STR_SINK: number = 5;
export const STR_CAPACITOR: number = 6;
export const STR_INVERTER: number = 7;
export const STR_LATCH: number = 8;
export const StructureTypes = {
  VOID: 0,
  WIRE: 1,
  NODE: 2,
  DIODE: 3,
  SOURCE: 4,
  SINK: 5,
  CAPACITOR: 6,
  INVERTER: 7,
  LATCH: 8,
} as const;
