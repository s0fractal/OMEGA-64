/** SSoT: {@link ../../ontology/host/glyph_ir_64.md} */

import {
  KIND_CORE, KIND_CONTROL, KIND_TRANSPORT, KIND_STRUCTURAL,
  KIND_CATALYTIC, KIND_REGULATORY, KIND_MEMORY, KIND_RESERVE,
  GLYPH_ARITY_LUT, GLYPH_ENERGY_LUT, GLYPH_RGB_LUT, GLYPH_LEGACY_OPCODE_LUT
} from "../00/mod.ts";

import { get_glyph_kind } from "../06/mod.ts";

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
  vertexIndex?: number;
  rgb?: [number, number, number];
};

const KIND_MAPPING: Record<number, GlyphKind> = {
  [KIND_CORE]: "core",
  [KIND_CONTROL]: "control",
  [KIND_TRANSPORT]: "transport",
  [KIND_STRUCTURAL]: "structural",
  [KIND_CATALYTIC]: "catalytic",
  [KIND_REGULATORY]: "regulatory",
  [KIND_MEMORY]: "memory",
  [KIND_RESERVE]: "reserve",
};

export const defaultReductionRuleRef = (kind: GlyphKind): string => {
  if (kind === "core") return "reduction/core";
  if (kind === "control") return "bridge/control";
  if (kind === "transport") return "bridge/transport";
  if (kind === "structural") return "bridge/structural";
  if (kind === "catalytic") return "bridge/catalytic";
  if (kind === "regulatory") return "bridge/regulatory";
  if (kind === "memory") return "bridge/memory";
  return "reserve/unassigned";
};

export const defaultStabilityClass = (kind: GlyphKind): GlyphStabilityClass => {
  if (kind === "core") return "hard-invariant";
  if (kind === "reserve") return "reserve";
  if (kind === "regulatory" || kind === "memory") return "bounded-dynamic";
  return "legacy-bridge";
};

const UI_OVERRIDES = new Map<number, Partial<GlyphSpec>>([
  [0, { mnemonic: "S", reductionRuleRef: "reduction/core/S", notes: "Hard invariant combinator." }],
  [1, { mnemonic: "K", reductionRuleRef: "reduction/core/K", notes: "Hard invariant combinator." }],
  [2, { mnemonic: "I", reductionRuleRef: "reduction/core/I", notes: "Hard invariant combinator." }],
  [3, { mnemonic: "Y", reductionRuleRef: "reduction/core/Y", notes: "Bounded recursion anchor under fuel budget." }],
  [8, { mnemonic: "SET", reductionRuleRef: "bridge/control/set" }],
  [9, { mnemonic: "GET", reductionRuleRef: "bridge/control/get" }],
  [10, { mnemonic: "PUT", reductionRuleRef: "bridge/control/put" }],
  [11, { mnemonic: "ADD", reductionRuleRef: "bridge/control/add" }],
  [12, { mnemonic: "SUB", reductionRuleRef: "bridge/control/sub" }],
  [13, { mnemonic: "JNZ", reductionRuleRef: "bridge/control/jnz" }],
  [14, { mnemonic: "JMP", reductionRuleRef: "bridge/control/jmp" }],
  [15, { mnemonic: "JZ", reductionRuleRef: "bridge/control/jz" }],
  [16, { mnemonic: "REPLICATE", reductionRuleRef: "bridge/transport/replicate" }],
  [17, { mnemonic: "SIGNAL", reductionRuleRef: "bridge/transport/signal" }],
  [18, { mnemonic: "SHARE", reductionRuleRef: "bridge/transport/share" }],
  [19, { mnemonic: "BIND", reductionRuleRef: "bridge/transport/bind" }],
  [20, { mnemonic: "SPORE_DRIVE", reductionRuleRef: "bridge/transport/spore_drive" }],
  [21, { mnemonic: "ENTANGLE", reductionRuleRef: "bridge/transport/entangle" }],
  [22, { mnemonic: "SYSCALL", reductionRuleRef: "bridge/transport/syscall", notes: "Universal Host Interface." }],
  [24, { mnemonic: "PLUG", reductionRuleRef: "bridge/structural/plug" }],
  [25, { mnemonic: "TENSEGRITY", reductionRuleRef: "bridge/structural/tensegrity" }],
  [26, { mnemonic: "BUILD", reductionRuleRef: "bridge/structural/build" }],
  [27, { mnemonic: "SENSE", reductionRuleRef: "bridge/structural/sense" }],
  [32, { mnemonic: "COLLECTIVE", reductionRuleRef: "bridge/catalytic/collective" }],
  [33, { mnemonic: "ROLE", reductionRuleRef: "bridge/catalytic/role" }],
  [34, { mnemonic: "RESOLVE", reductionRuleRef: "bridge/catalytic/resolve" }],
  [35, { mnemonic: "BIND", reductionRuleRef: "bridge/catalytic/bind" }],
]);

export const buildGlyphSpecs = (): GlyphSpec[] => {
  const specs: GlyphSpec[] = [];
  for (let id = 0; id < 64; id++) {
    const rawKind = get_glyph_kind(id);
    const kind = KIND_MAPPING[rawKind];
    const arity = GLYPH_ARITY_LUT[id];
    const energyCost = GLYPH_ENERGY_LUT[id];
    const rawLegacyOpcode = GLYPH_LEGACY_OPCODE_LUT[id];
    
    const ui = UI_OVERRIDES.get(id) ?? {};
    const stabilityClass = defaultStabilityClass(kind);

    specs.push({
      id,
      mnemonic: ui.mnemonic ?? `${kind.toUpperCase()}_${id.toString().padStart(2, "0")}`,
      kind,
      arity,
      energyCost,
      stabilityClass,
      reductionRuleRef: ui.reductionRuleRef ?? defaultReductionRuleRef(kind),
      legacyOpcode: rawLegacyOpcode !== 255 ? rawLegacyOpcode : undefined,
      notes: ui.notes ?? (stabilityClass === "reserve" ? "Reserved for sandboxed semantic evolution only." : "Unassigned placeholder within the fixed 64-glyph lattice."),
      vertexIndex: id >= 4 ? id - 4 : undefined,
      rgb: [
        GLYPH_RGB_LUT[id * 3],
        GLYPH_RGB_LUT[id * 3 + 1],
        GLYPH_RGB_LUT[id * 3 + 2]
      ]
    });
  }
  return specs;
};

export const GLYPH_SPECS: readonly GlyphSpec[] = Object.freeze(
  buildGlyphSpecs().map((spec) => Object.freeze({ ...spec })),
);

export const GLYPH_SPEC_BY_ID = new Map<number, GlyphSpec>(
  GLYPH_SPECS.map((spec) => [spec.id, spec]),
);

export const GLYPH_SPEC_BY_OPCODE = new Map<number, GlyphSpec>(
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
