import {
  type GuardianSignalExecutionMode,
} from "../runtime_bridge/guardian_signal_hybrid.ts";

export type GuardianSignalModeCaseDefinition = {
  id: string;
  baselineTraceId: string;
  description: string;
  neuralCoherence: number;
  legacyAllowed: boolean;
  useGuardianScript: boolean;
  script?: Uint8Array;
  expected: Record<
    GuardianSignalExecutionMode,
    {
      allowed: boolean;
      status: "legacy" | "shadow" | "hybrid" | "fallback";
      branch: "stable" | "repair" | "unknown";
      shadowSuppressed: boolean;
      hybridSuppressed: boolean;
    }
  >;
};

export const GUARDIAN_SIGNAL_MODE_CASES:
  readonly GuardianSignalModeCaseDefinition[] = Object.freeze([
    {
      id: "gh01_gt03_guardian_stable_modes",
      baselineTraceId: "gt03_pheromone_inject",
      description:
        "Stable guardian signaling should preserve legacy behavior across all three execution modes.",
      neuralCoherence: 200,
      legacyAllowed: true,
      useGuardianScript: true,
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
          branch: "stable",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
        "hybrid-reduce": {
          allowed: true,
          status: "hybrid",
          branch: "stable",
          shadowSuppressed: false,
          hybridSuppressed: false,
        },
      },
    },
    {
      id: "gh02_gt03_guardian_repair_modes",
      baselineTraceId: "gt03_pheromone_inject",
      description:
        "Repair-branch guardians should preserve legacy behavior in shadow mode but be suppressed in hybrid mode.",
      neuralCoherence: 0,
      legacyAllowed: true,
      useGuardianScript: true,
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
          branch: "repair",
          shadowSuppressed: true,
          hybridSuppressed: false,
        },
        "hybrid-reduce": {
          allowed: false,
          status: "hybrid",
          branch: "repair",
          shadowSuppressed: false,
          hybridSuppressed: true,
        },
      },
    },
    {
      id: "gh03_gt03_guardian_fallback_modes",
      baselineTraceId: "gt03_pheromone_inject",
      description:
        "Unsupported guardian scripts must fall back to legacy behavior in shadow and hybrid modes.",
      neuralCoherence: 200,
      legacyAllowed: true,
      useGuardianScript: false,
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
  GUARDIAN_SIGNAL_MODE_CASES.map((definition) => [definition.id, definition]),
);

export const guardianSignalModeCaseById = (
  id: string,
): GuardianSignalModeCaseDefinition | null => CASE_BY_ID.get(id) ?? null;
