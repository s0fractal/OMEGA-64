import { RISC } from "../STATE_MATRIX.ts";

export type GlyphKind =
  | "core"
  | "control"
  | "transport"
  | "structural"
  | "catalytic"
  | "regulatory"
  | "memory"
  | "reserve";

export type GlyphStabilityClass =
  | "hard-invariant"
  | "legacy-bridge"
  | "bounded-dynamic"
  | "reserve";

export type GlyphSpec = {
  id: number;
  mnemonic: string;
  kind: GlyphKind;
  arity: number;
  energyCost: number;
  stabilityClass: GlyphStabilityClass;
  reductionRuleRef: string;
  legacyOpcode?: number;
  notes?: string;
  vertexIndex?: number; // C60 Vertex (0..59)
  rgb?: [number, number, number]; // Chromatic Hash
};

/**
 * Calculates a deterministic RGB color for a given vertex index (0..59).
 * Uses a basic spherical projection into the RGB cube.
 */
const calculateChromaticHash = (index: number): [number, number, number] => {
  const phi = (Math.sqrt(5) + 1) / 2;
  const t = index / 60;
  
  // Golden angle distribution for hue, with saturation/value variation
  const h = (t * 360) % 360;
  const s = 0.7 + 0.3 * Math.sin(t * Math.PI * 2);
  const v = 0.8 + 0.2 * Math.cos(t * Math.PI * 4);

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

const glyphKindForId = (id: number): GlyphKind => {
  if (id <= 3) return "core";
  if (id <= 15) return "control";
  if (id <= 23) return "transport";
  if (id <= 31) return "structural";
  if (id <= 39) return "catalytic";
  if (id <= 47) return "regulatory";
  if (id <= 55) return "memory";
  return "reserve";
};

const defaultReductionRuleRef = (kind: GlyphKind): string => {
  if (kind === "core") return "reduction/core";
  if (kind === "control") return "bridge/control";
  if (kind === "transport") return "bridge/transport";
  if (kind === "structural") return "bridge/structural";
  if (kind === "catalytic") return "bridge/catalytic";
  if (kind === "regulatory") return "bridge/regulatory";
  if (kind === "memory") return "bridge/memory";
  return "reserve/unassigned";
};

const defaultStabilityClass = (kind: GlyphKind): GlyphStabilityClass => {
  if (kind === "core") return "hard-invariant";
  if (kind === "reserve") return "reserve";
  if (kind === "regulatory" || kind === "memory") return "bounded-dynamic";
  return "legacy-bridge";
};

const defaultGlyphSpec = (id: number): GlyphSpec => {
  const kind = glyphKindForId(id);
  const stabilityClass = defaultStabilityClass(kind);
  return {
    id,
    mnemonic: `${kind.toUpperCase()}_${id.toString().padStart(2, "0")}`,
    kind,
    arity: 0,
    energyCost: kind === "core" ? 0 : 1,
    stabilityClass,
    reductionRuleRef: defaultReductionRuleRef(kind),
    notes: stabilityClass === "reserve"
      ? "Reserved for sandboxed semantic evolution only."
      : "Unassigned placeholder within the fixed 64-glyph lattice.",
    ...(id >= 4 ? { 
      vertexIndex: id - 4,
      rgb: calculateChromaticHash(id - 4)
    } : {
      // Core Glyphs (0..3) are the stabilizers, mapped to grayscale/secondary colors
      rgb: id === 0 ? [255, 255, 255] : // S (White)
           id === 1 ? [128, 128, 128] : // K (Gray)
           id === 2 ? [0, 0, 0] :       // I (Black)
                    [255, 0, 255]      // Y (Magenta)
    }),
  };
};

const overrides = new Map<number, Partial<GlyphSpec>>([
  [0, {
    mnemonic: "S",
    kind: "core",
    energyCost: 0,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/S",
    notes: "Hard invariant combinator.",
  }],
  [1, {
    mnemonic: "K",
    kind: "core",
    energyCost: 0,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/K",
    notes: "Hard invariant combinator.",
  }],
  [2, {
    mnemonic: "I",
    kind: "core",
    energyCost: 0,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/I",
    notes: "Hard invariant combinator.",
  }],
  [3, {
    mnemonic: "Y",
    kind: "core",
    energyCost: 1,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/Y",
    notes: "Bounded recursion anchor under fuel budget.",
  }],
  [8, {
    mnemonic: "SET",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_SET,
    reductionRuleRef: "bridge/control/set",
  }],
  [9, {
    mnemonic: "GET",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_GET,
    reductionRuleRef: "bridge/control/get",
  }],
  [10, {
    mnemonic: "PUT",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_PUT,
    reductionRuleRef: "bridge/control/put",
  }],
  [11, {
    mnemonic: "ADD",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_ADD,
    reductionRuleRef: "bridge/control/add",
  }],
  [12, {
    mnemonic: "SUB",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_SUB,
    reductionRuleRef: "bridge/control/sub",
  }],
  [13, {
    mnemonic: "JNZ",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_JNZ,
    reductionRuleRef: "bridge/control/jnz",
  }],
  [14, {
    mnemonic: "JMP",
    arity: 1,
    energyCost: 1,
    legacyOpcode: RISC.OP_JMP,
    reductionRuleRef: "bridge/control/jmp",
  }],
  [15, {
    mnemonic: "JZ",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_JZ,
    reductionRuleRef: "bridge/control/jz",
  }],
  [16, {
    mnemonic: "REPLICATE",
    kind: "transport",
    arity: 0,
    energyCost: 6,
    legacyOpcode: RISC.OP_REPLICATE,
    reductionRuleRef: "bridge/transport/replicate",
  }],
  [17, {
    mnemonic: "SIGNAL",
    kind: "transport",
    arity: 0,
    energyCost: 3,
    legacyOpcode: RISC.OP_SIGNAL,
    reductionRuleRef: "bridge/transport/signal",
  }],
  [18, {
    mnemonic: "SHARE",
    kind: "transport",
    arity: 2,
    energyCost: 2,
    legacyOpcode: RISC.OP_SHARE,
    reductionRuleRef: "bridge/transport/share",
  }],
  [19, {
    mnemonic: "BIND",
    kind: "transport",
    arity: 0,
    energyCost: 20,
    legacyOpcode: RISC.OP_BIND,
    reductionRuleRef: "bridge/transport/bind",
  }],
  [20, {
    mnemonic: "SPORE_DRIVE",
    kind: "transport",
    arity: 0,
    energyCost: 50,
    legacyOpcode: RISC.OP_SPORE_DRIVE,
    reductionRuleRef: "bridge/transport/spore_drive",
  }],
  [21, {
    mnemonic: "ENTANGLE",
    kind: "transport",
    arity: 0,
    energyCost: 10,
    legacyOpcode: RISC.OP_ENTANGLE,
    reductionRuleRef: "bridge/transport/entangle",
  }],
  [24, {
    mnemonic: "PLUG",
    kind: "structural",
    arity: 2,
    energyCost: 3,
    legacyOpcode: 0xA4,
    reductionRuleRef: "bridge/structural/plug",
  }],
  [25, {
    mnemonic: "TENSEGRITY",
    kind: "structural",
    arity: 3,
    energyCost: 4,
    legacyOpcode: RISC.OP_TENSEGRITY,
    reductionRuleRef: "bridge/structural/tensegrity",
  }],
  [26, {
    mnemonic: "BUILD",
    kind: "structural",
    arity: 2,
    energyCost: 6,
    legacyOpcode: RISC.OP_BUILD,
    reductionRuleRef: "bridge/structural/build",
  }],
  [27, {
    mnemonic: "SENSE",
    kind: "structural",
    arity: 2,
    energyCost: 2,
    legacyOpcode: RISC.OP_SENSE,
    reductionRuleRef: "bridge/structural/sense",
  }],
  [32, {
    mnemonic: "COLLECTIVE",
    kind: "catalytic",
    arity: 3,
    energyCost: 4,
    legacyOpcode: RISC.OP_COLLECTIVE,
    reductionRuleRef: "bridge/catalytic/collective",
  }],
  [33, {
    mnemonic: "ROLE",
    kind: "catalytic",
    arity: 2,
    energyCost: 2,
    legacyOpcode: RISC.OP_ROLE,
    reductionRuleRef: "bridge/catalytic/role",
  }],
  [34, {
    mnemonic: "RESOLVE",
    kind: "catalytic",
    arity: 2,
    energyCost: 5,
    legacyOpcode: RISC.OP_RESOLVE,
    reductionRuleRef: "bridge/catalytic/resolve",
  }],
]);

const buildGlyphSpecs = (): GlyphSpec[] => {
  const specs: GlyphSpec[] = [];
  for (let id = 0; id < 64; id++) {
    specs.push({
      ...defaultGlyphSpec(id),
      ...(overrides.get(id) ?? {}),
      id,
    });
  }
  return specs;
};

export const GLYPH_SPECS: readonly GlyphSpec[] = Object.freeze(
  buildGlyphSpecs().map((spec) => Object.freeze({ ...spec })),
);

const GLYPH_SPEC_BY_ID = new Map<number, GlyphSpec>(
  GLYPH_SPECS.map((spec) => [spec.id, spec]),
);

const GLYPH_SPEC_BY_OPCODE = new Map<number, GlyphSpec>(
  GLYPH_SPECS
    .filter((spec) => typeof spec.legacyOpcode === "number")
    .map((spec) => [spec.legacyOpcode!, spec]),
);

export const BRIDGE_GLYPH_IDS = Object.freeze(
  GLYPH_SPECS
    .filter((spec) => typeof spec.legacyOpcode === "number")
    .map((spec) => spec.id)
    .sort((a, b) => a - b),
);

export const glyphSpecById = (id: number): GlyphSpec | null =>
  GLYPH_SPEC_BY_ID.get(Math.trunc(id)) ?? null;

export const glyphSpecByLegacyOpcode = (opcode: number): GlyphSpec | null =>
  GLYPH_SPEC_BY_OPCODE.get(Math.trunc(opcode)) ?? null;

export const isCoreGlyph = (id: number): boolean => {
  const spec = glyphSpecById(id);
  return spec?.kind === "core";
};

export const listGlyphSpecsByKind = (kind: GlyphKind): GlyphSpec[] =>
  GLYPH_SPECS.filter((spec) => spec.kind === kind);
