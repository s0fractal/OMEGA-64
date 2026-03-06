import type {
  DaemonInjectEnvelope,
  DaemonIngressMetrics,
} from "../DAEMON_INGRESS_POLICY.ts";

export type AdmissionShadowExpectation = {
  policyOk: boolean | null;
  policyReason: string | null;
  blocked: boolean;
  blockReason: string | null;
  severity: "LOW" | "MID" | "HIGH" | null;
  score: number | null;
  appliedAction: "DROP_PHEROMONE" | "INJECT_PLASMID" | "OBSERVE" | "BLOCKED";
  degraded: boolean | null;
  degradeReason: string | null;
  plasmidRiskLevel: "LOW" | "MID" | "HIGH" | null;
  plasmidRiskScore: number | null;
  plasmidRiskOpcode: number | null;
  reasons: string[];
};

export type AdmissionShadowCaseDefinition = {
  id: string;
  baselineTraceId: string;
  baselineEventKind: string;
  description: string;
  envelope: DaemonInjectEnvelope;
  metrics: DaemonIngressMetrics;
  dominantGenome: string;
  narrativeSeed: Record<string, unknown>;
  expected: AdmissionShadowExpectation;
};

export const ADMISSION_SHADOW_CASES: readonly AdmissionShadowCaseDefinition[] =
  Object.freeze([
    {
      id: "ac01_gt04_low_risk_accept",
      baselineTraceId: "gt04_plasmid_inject",
      baselineEventKind: "INJECT_PLASMID",
      description:
        "Low-intensity plasmid ingress from gt04 should stay policy-clean and remain an undegraded plasmid admission.",
      envelope: {
        action_type: "INJECT_PLASMID",
        payload: {
          target_x: 640,
          target_y: 360,
          intensity: 420,
          hex_code: "0102030405101180",
        },
      },
      metrics: {
        population: 64,
        avgEnergy: 173.654,
      },
      dominantGenome: "808103862DA8E71A",
      narrativeSeed: {},
      expected: {
        policyOk: true,
        policyReason: "PLASMID_POLICY_OK",
        blocked: false,
        blockReason: null,
        severity: "LOW",
        score: 0,
        appliedAction: "INJECT_PLASMID",
        degraded: false,
        degradeReason: null,
        plasmidRiskLevel: "LOW",
        plasmidRiskScore: 0,
        plasmidRiskOpcode: 0x01,
        reasons: ["RISK_LOW"],
      },
    },
    {
      id: "ac02_gt06_pheromone_accept",
      baselineTraceId: "gt06_daemon_admission_case",
      baselineEventKind: "DROP_PHEROMONE_ACCEPT",
      description:
        "The accepted gt06 pheromone ingress should remain a low-drift pheromone admission with no plasmid risk path involved.",
      envelope: {
        action_type: "DROP_PHEROMONE",
        payload: {
          target_x: 512,
          target_y: 320,
          intensity: 80,
        },
      },
      metrics: {
        population: 64,
        avgEnergy: 238.609,
      },
      dominantGenome: "808103862DA8E71A",
      narrativeSeed: {},
      expected: {
        policyOk: null,
        policyReason: null,
        blocked: false,
        blockReason: null,
        severity: "LOW",
        score: 0,
        appliedAction: "DROP_PHEROMONE",
        degraded: false,
        degradeReason: null,
        plasmidRiskLevel: null,
        plasmidRiskScore: null,
        plasmidRiskOpcode: null,
        reasons: ["DRIFT_LOW"],
      },
    },
    {
      id: "ac03_gt06_plasmid_high_degrade",
      baselineTraceId: "gt06_daemon_admission_case",
      baselineEventKind: "INJECT_PLASMID_DEGRADED",
      description:
        "The high-intensity gt06 plasmid ingress should stay policy-valid but degrade into a pheromone action under invariant pressure.",
      envelope: {
        action_type: "INJECT_PLASMID",
        payload: {
          target_x: 512,
          target_y: 320,
          intensity: 1100,
          hex_code: "001011120381A4A5",
        },
      },
      metrics: {
        population: 64,
        avgEnergy: 238.609,
      },
      dominantGenome: "808103862DA8E71A",
      narrativeSeed: {},
      expected: {
        policyOk: true,
        policyReason: "PLASMID_POLICY_OK",
        blocked: false,
        blockReason: null,
        severity: "HIGH",
        score: 4,
        appliedAction: "DROP_PHEROMONE",
        degraded: true,
        degradeReason: "INVARIANT_DRIFT_HIGH_DEGRADE_TO_PHEROMONE",
        plasmidRiskLevel: "MID",
        plasmidRiskScore: 2,
        plasmidRiskOpcode: 0x00,
        reasons: ["PLASMID_INTENSITY_HIGH", "RISK_INTENSITY_HIGH"],
      },
    },
    {
      id: "ac04_gt07_plasmid_policy_block",
      baselineTraceId: "gt07_daemon_policy_block",
      baselineEventKind: "INJECT_PLASMID_BLOCKED",
      description:
        "A blocked-opcode plasmid should fail at policy stage before any admission scoring or ingress degradation occurs.",
      envelope: {
        action_type: "INJECT_PLASMID",
        payload: {
          target_x: 512,
          target_y: 320,
          intensity: 420,
          hex_code: "FF02030405101180",
        },
      },
      metrics: {
        population: 64,
        avgEnergy: 173.654,
      },
      dominantGenome: "808103862DA8E71A",
      narrativeSeed: {},
      expected: {
        policyOk: false,
        policyReason: "PLASMID_OPCODE_BLOCKED_0xFF",
        blocked: true,
        blockReason: "PLASMID_OPCODE_BLOCKED_0xFF",
        severity: null,
        score: null,
        appliedAction: "BLOCKED",
        degraded: null,
        degradeReason: null,
        plasmidRiskLevel: null,
        plasmidRiskScore: null,
        plasmidRiskOpcode: null,
        reasons: [],
      },
    },
  ]);

const ADMISSION_SHADOW_CASE_BY_ID = new Map<string, AdmissionShadowCaseDefinition>(
  ADMISSION_SHADOW_CASES.map((definition) => [definition.id, definition]),
);

export const admissionShadowCaseById = (
  id: string,
): AdmissionShadowCaseDefinition | null =>
  ADMISSION_SHADOW_CASE_BY_ID.get(id) ?? null;
