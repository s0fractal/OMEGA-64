import {
  type ArchitectPlasmidExecutionMode,
} from "../runtime_bridge/architect_plasmid_hybrid.ts";

export type ArchitectPlasmidModeCaseDefinition = {
  id: string;
  baselineTraceId: string;
  description: string;
  neuralCoherence: number;
  legacyAllowed: boolean;
  scriptKind: "architect" | "guardian" | "custom";
  script?: Uint8Array;
  expected: Record<
    ArchitectPlasmidExecutionMode,
    {
      allowed: boolean;
      status: "legacy" | "shadow" | "hybrid" | "fallback";
      branch: "emit" | "suppress" | "unknown";
      shadowSuppressed: boolean;
      hybridSuppressed: boolean;
    }
  >;
};

export const ARCHITECT_PLASMID_MODE_CASES:
  readonly ArchitectPlasmidModeCaseDefinition[] = Object.freeze([
    {
      id: "ah01_gt04_architect_emit_modes",
      baselineTraceId: "gt04_plasmid_inject",
      description:
        "Canonical architect loop should preserve legacy behavior in shadow mode and remain allowed in hybrid mode.",
      neuralCoherence: 200,
      legacyAllowed: true,
      scriptKind: "architect",
      expected: {
        "legacy-execute": {
          allowed: true,
          status: "legacy",
          branch: "unknown",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
        "shadow-reduce": {
          allowed: true,
          status: "shadow",
          branch: "emit",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
        "hybrid-reduce": {
          allowed: true,
          status: "hybrid",
          branch: "emit",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
      },
    },
    {
      id: "ah02_gt04_architect_suppress_modes",
      baselineTraceId: "gt04_plasmid_inject",
      description:
        "A signaling-only script should preserve legacy behavior in shadow mode but suppress architect plasmid emission in hybrid mode.",
      neuralCoherence: 200,
      legacyAllowed: true,
      scriptKind: "guardian",
      expected: {
        "legacy-execute": {
          allowed: true,
          status: "legacy",
          branch: "unknown",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
        "shadow-reduce": {
          allowed: true,
          status: "shadow",
          branch: "suppress",
          shadowSuppressed: true,
          hybridSuppressed: false,
        },
        "hybrid-reduce": {
          allowed: false,
          status: "hybrid",
          branch: "suppress",
          shadowSuppressed: false,
          hybridSuppressed: true,
        },
      },
    },
    {
      id: "ah03_gt04_architect_fallback_modes",
      baselineTraceId: "gt04_plasmid_inject",
      description:
        "Unsupported architect scripts must fall back to legacy behavior in shadow and hybrid modes.",
      neuralCoherence: 200,
      legacyAllowed: true,
      scriptKind: "custom",
      script: new Uint8Array([0xFF, 0, 0]),
      expected: {
        "legacy-execute": {
          allowed: true,
          status: "legacy",
          branch: "unknown",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
        "shadow-reduce": {
          allowed: true,
          status: "fallback",
          branch: "unknown",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
        "hybrid-reduce": {
          allowed: true,
          status: "fallback",
          branch: "unknown",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
      },
    },
  ]);

const CASE_BY_ID = new Map(
  ARCHITECT_PLASMID_MODE_CASES.map((definition) => [definition.id, definition]),
);

export const architectPlasmidModeCaseById = (
  id: string,
): ArchitectPlasmidModeCaseDefinition | null => CASE_BY_ID.get(id) ?? null;
