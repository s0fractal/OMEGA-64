import { GLYPH_SPECS } from "./src/07/04/GlyphIR64.ts";

const kinds = [
  "core",
  "control",
  "transport",
  "structural",
  "catalytic",
  "regulatory",
  "memory",
  "reserve"
];

const getKindU8 = (kind: string) => kinds.indexOf(kind);

const arityArray = new Array(64).fill(0);
const energyArray = new Array(64).fill(0);
const rgbArray = new Array(64 * 3).fill(0);
const legacyOpcodeArray = new Array(64).fill(255); // 255 for unmapped
const stabilityArray = new Array(64).fill(0); // Optional: if we want a stability LUT

const stabilities = [
  "hard-invariant",
  "legacy-bridge",
  "bounded-dynamic",
  "reserve"
];

GLYPH_SPECS.forEach(spec => {
  const id = spec.id;
  arityArray[id] = spec.arity;
  energyArray[id] = spec.energyCost;
  
  if (spec.legacyOpcode !== undefined) {
    legacyOpcodeArray[id] = spec.legacyOpcode;
  }
  
  stabilityArray[id] = stabilities.indexOf(spec.stabilityClass);

  if (spec.rgb) {
    rgbArray[id * 3] = spec.rgb[0];
    rgbArray[id * 3 + 1] = spec.rgb[1];
    rgbArray[id * 3 + 2] = spec.rgb[2];
  }
});

const generateMd = (id: string, type: string, dataType: string, description: string, payloadStr: string) => {
  return `---
id: ${id}
type: ${type}
dataType: ${dataType}
description: "${description}"
deps: []
---

## payload: [${payloadStr}]
`;
};

const formatArray = (arr: number[], perLine: number) => {
  return arr.join(", ");
};

Deno.writeTextFileSync("src/ontology/core/GLYPH_TYPES.md", `---
id: GLYPH_TYPES
type: enum
dataType: u8
description: "Bitwise integer categories for the 64-codon GlyphIR matrix"
deps: []
values:
  KIND_CORE: 0
  KIND_CONTROL: 1
  KIND_TRANSPORT: 2
  KIND_STRUCTURAL: 3
  KIND_CATALYTIC: 4
  KIND_REGULATORY: 5
  KIND_MEMORY: 6
  KIND_RESERVE: 7

  STAB_HARD_INVARIANT: 0
  STAB_LEGACY_BRIDGE: 1
  STAB_BOUNDED_DYNAMIC: 2
  STAB_RESERVE: 3
---
`);

Deno.writeTextFileSync("src/ontology/core/get_glyph_kind.md", `---
id: get_glyph_kind
type: pure_fn
description: "O(1) resolve of glyph category using bitwise shifts"
deps: [GLYPH_TYPES]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---

### Rust
\`\`\`rust
if id <= 3 {
  return KIND_CORE;
}
if id <= 15 {
  return KIND_CONTROL;
}
return id >> 3;
\`\`\`

### TypeScript
\`\`\`typescript
import { KIND_CORE, KIND_CONTROL } from "../00/mod.ts";
export function get_glyph_kind(id: number): number {
  if (id <= 3) return KIND_CORE;
  if (id <= 15) return KIND_CONTROL;
  return id >> 3;
}
\`\`\`
`);

Deno.writeTextFileSync("src/ontology/core/GLYPH_ARITY_LUT.md", generateMd(
  "GLYPH_ARITY_LUT", "static_table", "u8", "O(1) lookup table for the number of arguments each glyph consumes", formatArray(arityArray, 16)
));

Deno.writeTextFileSync("src/ontology/core/get_glyph_arity.md", `---
id: get_glyph_arity
type: pure_fn
deps: [GLYPH_ARITY_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust
\`\`\`rust
GLYPH_ARITY_LUT[(id & 63) as usize]
\`\`\`

### TypeScript
\`\`\`typescript
import { GLYPH_ARITY_LUT } from "../00/mod.ts";
export function get_glyph_arity(id: number): number {
  return GLYPH_ARITY_LUT[id & 63];
}
\`\`\`
`);

Deno.writeTextFileSync("src/ontology/core/GLYPH_ENERGY_LUT.md", generateMd(
  "GLYPH_ENERGY_LUT", "static_table", "u8", "O(1) lookup table for the energy cost of each glyph", formatArray(energyArray, 16)
));

Deno.writeTextFileSync("src/ontology/core/get_glyph_energy.md", `---
id: get_glyph_energy
type: pure_fn
deps: [GLYPH_ENERGY_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust
\`\`\`rust
GLYPH_ENERGY_LUT[(id & 63) as usize]
\`\`\`

### TypeScript
\`\`\`typescript
import { GLYPH_ENERGY_LUT } from "../00/mod.ts";
export function get_glyph_energy(id: number): number {
  return GLYPH_ENERGY_LUT[id & 63];
}
\`\`\`
`);

Deno.writeTextFileSync("src/ontology/core/GLYPH_RGB_LUT.md", generateMd(
  "GLYPH_RGB_LUT", "static_table", "u8", "Pre-baked chromatic hashes (R, G, B) for all 64 glyphs. Index = id * 3", formatArray(rgbArray, 12)
));

Deno.writeTextFileSync("src/ontology/core/GLYPH_LEGACY_OPCODE_LUT.md", generateMd(
  "GLYPH_LEGACY_OPCODE_LUT", "static_table", "u8", "O(1) lookup table mapping a Glyph ID to its Legacy Syscall/Opcode (255 if unmapped)", formatArray(legacyOpcodeArray, 16)
));

Deno.writeTextFileSync("src/ontology/core/get_glyph_legacy_opcode.md", `---
id: get_glyph_legacy_opcode
type: pure_fn
deps: [GLYPH_LEGACY_OPCODE_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust
\`\`\`rust
GLYPH_LEGACY_OPCODE_LUT[(id & 63) as usize]
\`\`\`

### TypeScript
\`\`\`typescript
import { GLYPH_LEGACY_OPCODE_LUT } from "../00/mod.ts";
export function get_glyph_legacy_opcode(id: number): number {
  return GLYPH_LEGACY_OPCODE_LUT[id & 63];
}
\`\`\`
`);

console.log("Successfully generated all ontology files!");
