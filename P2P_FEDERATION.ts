// OMEGA-64 | P2P_FEDERATION.ts | Era 15: The Stabilized Monad
// Reliable inter-system atom migration.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./ATOM_INDEX.ts";
import { PRNG } from "./PRNG.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { AKASHA_CODEX } from "./AKASHA_CODEX.ts";
import { P2P_CODEC } from "./P2P_CODEC.ts";

export interface AtomPacket {
  id: string;
  logic: string;
  energy: number;
  resonance: number;
  sourceNode: string;
  pulseId: number;
  ruleGenome?: RuleGenomeProfile;
  behaviorProfile?: BehaviorProfile;
  codexProfile?: CodexProfile;
}

export interface RuleGenomeProfile {
  signature: string;
  noveltySigned: number;
  symbiosisSigned: number;
  pressureRingScale: number;
  workerCount: number;
  strictDeterminism: boolean;
  generatedAt: string;
}

export interface BehaviorProfile {
  invariant: string;
  dominantRole: number;
  memberCount: number;
  generatedAt: string;
}

export interface CodexProfile {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
  generatedAt: string;
}

const CURRENT_PORT = RUNTIME_POLICY.system.port;
const migrationQueue: number[] = [];
let isProcessingMigration = false;
const FEDERATION_ENABLED = RUNTIME_POLICY.federation.enabled;
const CONTROL_TOKEN = RUNTIME_POLICY.federation.controlToken;
const REQUEST_TIMEOUT_MS = RUNTIME_POLICY.federation.timeoutMs;
const RULE_PROFILE_SOURCE = JSON.stringify({
  noveltySigned: RUNTIME_POLICY.pulse.noveltyPressureSigned,
  symbiosisSigned: RUNTIME_POLICY.pulse.symbiosisPressureSigned,
  pressureRingScale: RUNTIME_POLICY.pulse.pressureRing.scale,
  workerCount: RUNTIME_POLICY.pulse.workerCount,
  strictDeterminism: RUNTIME_POLICY.pulse.strictDeterminism,
});
const fnv1a32 = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};
const RULE_GENOME_SIGNATURE = fnv1a32(RULE_PROFILE_SOURCE).toUpperCase();
const LOCAL_RULE_GENOME: RuleGenomeProfile = {
  signature: RULE_GENOME_SIGNATURE,
  noveltySigned: RUNTIME_POLICY.pulse.noveltyPressureSigned,
  symbiosisSigned: RUNTIME_POLICY.pulse.symbiosisPressureSigned,
  pressureRingScale: RUNTIME_POLICY.pulse.pressureRing.scale,
  workerCount: RUNTIME_POLICY.pulse.workerCount,
  strictDeterminism: RUNTIME_POLICY.pulse.strictDeterminism,
  generatedAt: new Date().toISOString(),
};
const peerRuleProfiles = new Map<string, RuleGenomeProfile>();
const normalizeRuleGenome = (raw: unknown): RuleGenomeProfile | null => {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const signature = typeof source.signature === "string"
    ? source.signature.trim().toUpperCase()
    : "";
  if (signature.length === 0) return null;
  const noveltySigned = typeof source.noveltySigned === "number" &&
      Number.isFinite(source.noveltySigned)
    ? Math.trunc(source.noveltySigned)
    : 0;
  const symbiosisSigned = typeof source.symbiosisSigned === "number" &&
      Number.isFinite(source.symbiosisSigned)
    ? Math.trunc(source.symbiosisSigned)
    : 0;
  const pressureRingScale = typeof source.pressureRingScale === "number" &&
      Number.isFinite(source.pressureRingScale)
    ? Math.max(0, Math.trunc(source.pressureRingScale))
    : 0;
  const workerCount = typeof source.workerCount === "number" &&
      Number.isFinite(source.workerCount)
    ? Math.max(1, Math.trunc(source.workerCount))
    : 1;
  const strictDeterminism = source.strictDeterminism === true;
  const generatedAt = typeof source.generatedAt === "string" &&
      source.generatedAt.trim().length > 0
    ? source.generatedAt.trim()
    : new Date().toISOString();
  return {
    signature,
    noveltySigned,
    symbiosisSigned,
    pressureRingScale,
    workerCount,
    strictDeterminism,
    generatedAt,
  };
};

export const P2P_FEDERATION = {
  peers: new Set<string>(
    CURRENT_PORT === 8000
      ? ["http://localhost:8001"]
      : ["http://localhost:8000"],
  ),
  nodeId: `OMEGA-${CURRENT_PORT}`,
  enabled: FEDERATION_ENABLED,
  localRuleGenome: LOCAL_RULE_GENOME,

  serialize: (idx: number, pulseId: number = 0): Uint8Array | null => {
    const id = STATE_MATRIX.getId(idx);
    if (!id) return null;
    return P2P_CODEC.packAtom(idx);
  },

  observePeerRuleGenome: (sourceNode: string, rawProfile: unknown) => {
    const profile = normalizeRuleGenome(rawProfile);
    if (!profile) return;
    const key = typeof sourceNode === "string" && sourceNode.trim().length > 0
      ? sourceNode.trim()
      : "unknown";
    peerRuleProfiles.set(key, profile);
  },

  getPeerRuleProfiles: () =>
    Array.from(peerRuleProfiles.entries()).map(([peer, profile]) => ({
      peer,
      profile,
    })),

  migrate: (_idx: number, _pulseId: number) => {
    // Deprecated in Era 71: Handled synchronously inside PULSE via NEXUS_DAEMON.routeAtom
  },

  processQueue: async (_pulseId: number) => {
    LOGGER.warn("🛸 [FEDERATION] processQueue is deprecated. Migration is handled via NEXUS WebSocket streaming.");
  },
};
