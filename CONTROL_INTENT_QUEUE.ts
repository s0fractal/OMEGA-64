import { MAX_ATOMS, STATE_MATRIX } from "./STATE_MATRIX.ts";
import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { PRNG } from "./PRNG.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";
import { GLYPH_BUFFER } from "./GLYPH_BUFFER.ts";
import { P2P_CODEC } from "./P2P_CODEC.ts";

type CrisisIntent = {
  kind: "crisis";
  logicBytes: Uint8Array;
};

type FederateIntent = {
  kind: "federate";
  packet: Uint8Array;
  sourceNode: string;
};

type FederationAdmissionSeverity = "LOW" | "MID" | "HIGH";
type FederationAdmissionAction =
  | "accept"
  | "degrade"
  | "hybridize"
  | "reject";

type FederationRuleGenomeProfile = {
  signature: string;
  noveltySigned: number;
  symbiosisSigned: number;
  pressureRingScale: number;
  workerCount: number;
  strictDeterminism: boolean;
  generatedAt: string;
};

type FederationBehaviorProfile = {
  invariant: string;
  dominantRole: number;
  memberCount: number;
  generatedAt: string;
};

type FederationLocalBehaviorContext = {
  invariant: string;
  dominantRole: number;
  memberCount: number;
};

type FederationCodexProfile = {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
  generatedAt: string;
};

type FederationLocalCodexContext = {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
};

type FederationPolicyFragmentSource =
  | "rule_genome"
  | "behavior"
  | "codex";

type FederationPolicyFragmentMode = "tax" | "subsidy";

type FederationPolicyFragment = {
  id: string;
  source: FederationPolicyFragmentSource;
  mode: FederationPolicyFragmentMode;
  reason: string;
  scoreDelta: number;
  energyRatio: number;
  resonanceRatio: number;
};

type FederationAdmissionSnapshot = {
  tick: number;
  atomId: string;
  sourceNode: string;
  action: FederationAdmissionAction;
  severity: FederationAdmissionSeverity;
  score: number;
  reasons: string[];
  localSignature: string;
  peerSignature: string;
  strictMismatch: boolean;
  degraded: boolean;
  hybridized: boolean;
  localBehaviorInvariant: string;
  peerBehaviorInvariant: string;
  behaviorDistance: number;
  localCodexLabel: string;
  peerCodexLabel: string;
  codexDistance: number;
  policyFragments: FederationPolicyFragment[];
  policyEnergyRatio: number;
  policyResonanceRatio: number;
};

type FederateAdmissionResult = {
  action: FederationAdmissionAction;
  packet: {
    logicBytes: Uint8Array;
    energy: number;
    resonance: number;
  };
  admission: FederationAdmissionSnapshot;
};

type MutateIntent = {
  kind: "mutate";
  x: number;
  y: number;
  deltaEnergy: number;
  radius: number;
};

type AvatarIntent = {
  kind: "avatar";
  x: number;
  y: number;
  intensity: number;
  source: "external_ingress" | "external_daemon";
};

type PlasmidIntent = {
  kind: "plasmid";
  x: number;
  y: number;
  charge: number;
  plasmidBytes: Uint8Array;
  source: "external_ingress" | "external_daemon";
};

type SnapshotImportIntent = {
  kind: "snapshot_import";
  timestamp: string;
};

type ControlIntent =
  | CrisisIntent
  | FederateIntent
  | MutateIntent
  | AvatarIntent
  | PlasmidIntent
  | SnapshotImportIntent;

type QueueDecision = {
  ok: boolean;
  status: number;
  reason: string;
  size: number;
  max: number;
  admission?: FederationAdmissionSnapshot;
};

type ApplyStats = {
  drained: number;
  applied: number;
  failed: number;
  remaining: number;
};

const MAX_PENDING = RUNTIME_POLICY.controlIntent.maxPending;
const APPLY_BUDGET_PER_TICK = RUNTIME_POLICY.controlIntent.applyBudgetPerTick;
const FEDERATION_ADMISSION_POLICY = RUNTIME_POLICY.federation.admission;
const FEDERATION_ADMISSION_HISTORY_LIMIT = 24;
const GRID_W = 140;
const GRID_H = 80;
const GRID_CELL_BYTES = 8;
const WORLD_W = GRID_W * 10;
const WORLD_H = GRID_H * 10;
const FEDERATION_LOCAL_NOVELTY_SIGNED = RUNTIME_POLICY.pulse
  .noveltyPressureSigned;
const FEDERATION_LOCAL_SYMBIOSIS_SIGNED = RUNTIME_POLICY.pulse
  .symbiosisPressureSigned;
const FEDERATION_LOCAL_WORKER_COUNT = RUNTIME_POLICY.pulse.workerCount;
const FEDERATION_LOCAL_STRICT_DETERMINISM = RUNTIME_POLICY.pulse
  .strictDeterminism;
const FEDERATION_LOCAL_SIGNATURE_SOURCE = JSON.stringify({
  noveltySigned: FEDERATION_LOCAL_NOVELTY_SIGNED,
  symbiosisSigned: FEDERATION_LOCAL_SYMBIOSIS_SIGNED,
  workerCount: FEDERATION_LOCAL_WORKER_COUNT,
  strictDeterminism: FEDERATION_LOCAL_STRICT_DETERMINISM,
  pressureRingScale: RUNTIME_POLICY.pulse.pressureRing.scale,
});

const queue: ControlIntent[] = [];
let latestFederationAdmission: FederationAdmissionSnapshot | null = null;
let federationAdmissionHistory: FederationAdmissionSnapshot[] = [];

const telemetryForIntent = (
  intent: ControlIntent,
): { lane: "external_ingress" | "external_daemon"; kind: string } => {
  if (intent.kind === "avatar" || intent.kind === "plasmid") {
    if (intent.source === "external_daemon") {
      return { lane: "external_daemon", kind: "daemon_intent_enqueued" };
    }
  }
  return { lane: "external_ingress", kind: "control_intent_enqueued" };
};

const decision = (
  ok: boolean,
  status: number,
  reason: string,
  admission?: FederationAdmissionSnapshot,
): QueueDecision => ({
  ok,
  status,
  reason,
  size: queue.length,
  max: MAX_PENDING,
  ...(admission ? { admission } : {}),
});

const fnv1a32 = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
};

const FEDERATION_LOCAL_SIGNATURE = fnv1a32(FEDERATION_LOCAL_SIGNATURE_SOURCE);

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const toBoundedInt = (
  value: number,
  min: number,
  max: number,
  fallback: number,
): number => {
  if (!Number.isFinite(value)) return fallback;
  return clamp(Math.trunc(value), min, max);
};

const parseRuleGenomeProfile = (
  raw: unknown,
): FederationRuleGenomeProfile | null => {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const signature = typeof source.signature === "string"
    ? source.signature.trim().toUpperCase()
    : "";
  if (signature.length === 0) return null;
  return {
    signature,
    noveltySigned: toBoundedInt(
      Number(source.noveltySigned),
      -2048,
      2048,
      0,
    ),
    symbiosisSigned: toBoundedInt(
      Number(source.symbiosisSigned),
      -2048,
      2048,
      0,
    ),
    pressureRingScale: toBoundedInt(
      Number(source.pressureRingScale),
      0,
      4096,
      0,
    ),
    workerCount: toBoundedInt(Number(source.workerCount), 1, 64, 1),
    strictDeterminism: source.strictDeterminism === true,
    generatedAt: typeof source.generatedAt === "string" &&
        source.generatedAt.trim().length > 0
      ? source.generatedAt.trim()
      : "unknown",
  };
};

const parseBehaviorProfile = (
  raw: unknown,
): FederationBehaviorProfile | null => {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const invariant = typeof source.invariant === "string"
    ? source.invariant.trim()
    : "";
  if (invariant.length === 0) return null;
  return {
    invariant,
    dominantRole: toBoundedInt(Number(source.dominantRole), -1, 7, -1),
    memberCount: toBoundedInt(Number(source.memberCount), 0, 100_000, 0),
    generatedAt: typeof source.generatedAt === "string" &&
        source.generatedAt.trim().length > 0
      ? source.generatedAt.trim()
      : "unknown",
  };
};

const parseLocalBehaviorContext = (
  raw: unknown,
): FederationLocalBehaviorContext | null => {
  const parsed = parseBehaviorProfile(raw);
  if (!parsed) return null;
  return {
    invariant: parsed.invariant,
    dominantRole: parsed.dominantRole,
    memberCount: parsed.memberCount,
  };
};

const parseCodexProfile = (raw: unknown): FederationCodexProfile | null => {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const genome = typeof source.genome === "string"
    ? source.genome.trim().replace(/^0x/iu, "").toUpperCase()
    : "";
  if (!/^[0-9A-F]{16}$/u.test(genome)) return null;
  const label = typeof source.label === "string"
    ? source.label.trim().slice(0, 96)
    : "";
  const peakShareRaw = Number(source.peakShare);
  return {
    genome,
    label: label.length > 0 ? label : `Genome ${genome.slice(0, 8)}`,
    dominantEpochs: toBoundedInt(Number(source.dominantEpochs), 0, 10_000, 0),
    peakShare: Number.isFinite(peakShareRaw) ? clamp(peakShareRaw, 0, 1) : 0,
    known: source.known === true,
    generatedAt: typeof source.generatedAt === "string" &&
        source.generatedAt.trim().length > 0
      ? source.generatedAt.trim()
      : "unknown",
  };
};

const parseLocalCodexContext = (
  raw: unknown,
): FederationLocalCodexContext | null => {
  const parsed = parseCodexProfile(raw);
  if (!parsed) return null;
  return {
    genome: parsed.genome,
    label: parsed.label,
    dominantEpochs: parsed.dominantEpochs,
    peakShare: parsed.peakShare,
    known: parsed.known,
  };
};

const parseBehaviorInvariantAxes = (
  invariant: string,
): { r: number; s: number; b: number } | null => {
  const match = invariant
    .trim()
    .match(
      /^R([0-9]+(?:\.[0-9]+)?)\|S([0-9]+(?:\.[0-9]+)?)\|B([0-9]+(?:\.[0-9]+)?)$/i,
    );
  if (!match) return null;
  const r = Number.parseFloat(match[1]);
  const s = Number.parseFloat(match[2]);
  const b = Number.parseFloat(match[3]);
  if (!Number.isFinite(r) || !Number.isFinite(s) || !Number.isFinite(b)) {
    return null;
  }
  return {
    r: clamp(r, 0, 1),
    s: clamp(s, 0, 1),
    b: clamp(b, 0, 1),
  };
};

const behaviorInvariantDistance = (
  localInvariant: string,
  peerInvariant: string,
): number | null => {
  const left = parseBehaviorInvariantAxes(localInvariant);
  const right = parseBehaviorInvariantAxes(peerInvariant);
  if (!left || !right) return null;
  const delta = Math.abs(left.r - right.r) + Math.abs(left.s - right.s) +
    Math.abs(left.b - right.b);
  return Number(delta.toFixed(3));
};

const codexDistance = (
  localContext: FederationLocalCodexContext,
  peerProfile: FederationCodexProfile,
): number => {
  let distance = 0;
  if (localContext.genome !== peerProfile.genome) distance += 1;
  if (localContext.label !== peerProfile.label) distance += 1;
  if (localContext.known !== peerProfile.known) distance += 1;
  const epochDelta = Math.abs(
    localContext.dominantEpochs - peerProfile.dominantEpochs,
  );
  if (epochDelta >= 8) distance += 1;
  return distance;
};

const buildPolicyFragment = (
  source: FederationPolicyFragmentSource,
  mode: FederationPolicyFragmentMode,
  reason: string,
  scoreDelta: number,
  energyRatio: number,
  resonanceRatio: number,
): FederationPolicyFragment => ({
  id: fnv1a32(
    `${source}|${mode}|${reason}|${scoreDelta}|${energyRatio}|${resonanceRatio}`,
  ).slice(0, 12),
  source,
  mode,
  reason,
  scoreDelta,
  energyRatio: clamp(energyRatio, 0.25, 2),
  resonanceRatio: clamp(resonanceRatio, 0.25, 2),
});

const collapsePolicyRatios = (
  fragments: FederationPolicyFragment[],
): { energyRatio: number; resonanceRatio: number } => {
  let energyRatio = 1;
  let resonanceRatio = 1;
  for (const fragment of fragments) {
    energyRatio *= fragment.energyRatio;
    resonanceRatio *= fragment.resonanceRatio;
  }
  return {
    energyRatio: clamp(energyRatio, 0.25, 2),
    resonanceRatio: clamp(resonanceRatio, 0.25, 2),
  };
};

const setLatestFederationAdmission = (
  snapshot: FederationAdmissionSnapshot,
): void => {
  latestFederationAdmission = snapshot;
  federationAdmissionHistory = [snapshot, ...federationAdmissionHistory].slice(
    0,
    FEDERATION_ADMISSION_HISTORY_LIMIT,
  );
};

const signatureEntropyByte = (signature: string, index: number): number => {
  const normalized = signature.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  if (normalized.length >= 2) {
    const pairIndex = (index * 2) % normalized.length;
    const pair = normalized.slice(pairIndex, pairIndex + 2).padEnd(2, "0");
    const parsed = Number.parseInt(pair, 16);
    if (Number.isFinite(parsed)) return parsed & 0xFF;
  }
  const code = signature.charCodeAt(index % Math.max(1, signature.length));
  return Number.isFinite(code) ? code & 0xFF : 0;
};

const buildHybridTemplate = (
  seedPulseId: number,
  profile: FederationRuleGenomeProfile | null,
): Uint8Array => {
  const base = new Uint8Array(8);
  base[0] = (FEDERATION_LOCAL_NOVELTY_SIGNED + 2048) & 0xFF;
  base[1] = (FEDERATION_LOCAL_SYMBIOSIS_SIGNED + 2048) & 0xFF;
  base[2] = FEDERATION_LOCAL_WORKER_COUNT & 0xFF;
  base[3] = FEDERATION_LOCAL_STRICT_DETERMINISM ? 0xD1 : 0x2E;
  base[4] = seedPulseId & 0xFF;
  base[5] = (seedPulseId >>> 8) & 0xFF;
  base[6] = (seedPulseId >>> 16) & 0xFF;
  base[7] = (seedPulseId >>> 24) & 0xFF;

  for (let i = 0; i < 8; i++) {
    base[i] ^= signatureEntropyByte(FEDERATION_LOCAL_SIGNATURE, i);
    if (profile) {
      base[i] ^= signatureEntropyByte(profile.signature, i);
    }
  }

  return base;
};

const hybridizeLogicBytes = (
  remote: Uint8Array,
  template: Uint8Array,
): Uint8Array => {
  const out = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    out[i] = ((remote[i] * 3 + template[i]) >>> 2) & 0xFF;
  }
  if (out[0] === 0) out[0] = template[0] === 0 ? 0x01 : template[0];
  return out;
};

const evaluateFederateAdmission = (
  atomId: string,
  sourceNode: string,
  packet: {
    logicBytes: Uint8Array;
    energy: number;
    resonance: number;
    pulseId: number;
    ruleGenome: FederationRuleGenomeProfile | null;
    peerBehaviorProfile: FederationBehaviorProfile | null;
    localBehaviorContext: FederationLocalBehaviorContext | null;
    peerCodexProfile: FederationCodexProfile | null;
    localCodexContext: FederationLocalCodexContext | null;
  },
): FederateAdmissionResult => {
  const policy = FEDERATION_ADMISSION_POLICY;
  const localBehaviorInvariant = packet.localBehaviorContext?.invariant ??
    "none";
  const peerBehaviorInvariant = packet.peerBehaviorProfile?.invariant ?? "none";
  const localCodexLabel = packet.localCodexContext?.label ?? "unknown-lineage";
  const peerCodexLabel = packet.peerCodexProfile?.label ?? "unknown-lineage";
  let behaviorDistance = -1;
  let codexDistanceScore = -1;
  const policyFragments: FederationPolicyFragment[] = [];
  let policyFragmentSeq = 0;
  const pushFragment = (
    source: FederationPolicyFragmentSource,
    mode: FederationPolicyFragmentMode,
    reason: string,
    scoreDelta: number,
    energyRatio: number,
    resonanceRatio: number,
  ): void => {
    policyFragments.push({
      ...buildPolicyFragment(
        source,
        mode,
        reason,
        scoreDelta,
        energyRatio,
        resonanceRatio,
      ),
      id: `${reason}-${policyFragmentSeq.toString(16).padStart(2, "0")}`,
    });
    policyFragmentSeq++;
  };
  if (!policy.enabled) {
    const admission: FederationAdmissionSnapshot = {
      tick: packet.pulseId,
      atomId,
      sourceNode,
      action: "accept",
      severity: "LOW",
      score: 0,
      reasons: ["FEDERATION_ADMISSION_POLICY_DISABLED"],
      localSignature: FEDERATION_LOCAL_SIGNATURE,
      peerSignature: packet.ruleGenome?.signature ?? "NONE",
      strictMismatch: false,
      degraded: false,
      hybridized: false,
      localBehaviorInvariant,
      peerBehaviorInvariant,
      behaviorDistance,
      localCodexLabel,
      peerCodexLabel,
      codexDistance: codexDistanceScore,
      policyFragments,
      policyEnergyRatio: 1,
      policyResonanceRatio: 1,
    };
    return {
      action: "accept",
      packet: {
        logicBytes: packet.logicBytes,
        energy: packet.energy,
        resonance: packet.resonance,
      },
      admission,
    };
  }

  const profile = packet.ruleGenome;
  if (!profile) {
    const admission: FederationAdmissionSnapshot = {
      tick: packet.pulseId,
      atomId,
      sourceNode,
      action: "degrade",
      severity: "MID",
      score: policy.midScore,
      reasons: ["RULE_GENOME_PROFILE_MISSING"],
      localSignature: FEDERATION_LOCAL_SIGNATURE,
      peerSignature: "NONE",
      strictMismatch: false,
      degraded: true,
      hybridized: false,
      localBehaviorInvariant,
      peerBehaviorInvariant,
      behaviorDistance,
      localCodexLabel,
      peerCodexLabel,
      codexDistance: codexDistanceScore,
      policyFragments,
      policyEnergyRatio: policy.degradeEnergyRatio,
      policyResonanceRatio: policy.degradeResonanceRatio,
    };
    return {
      action: "degrade",
      packet: {
        logicBytes: packet.logicBytes,
        energy: Math.max(
          1,
          Math.round(packet.energy * policy.degradeEnergyRatio),
        ),
        resonance: Math.max(
          0,
          Math.round(packet.resonance * policy.degradeResonanceRatio),
        ),
      },
      admission,
    };
  }

  let score = 0;
  const reasons: string[] = [];
  let behaviorConflictScore = 0;

  const noveltyDelta = Math.abs(
    profile.noveltySigned - FEDERATION_LOCAL_NOVELTY_SIGNED,
  );
  if (noveltyDelta >= 768) {
    score += 3;
    reasons.push("NOVELTY_DELTA_HIGH");
    pushFragment("rule_genome", "tax", "NOVELTY_DELTA_HIGH", 3, 0.88, 0.92);
  } else if (noveltyDelta >= 384) {
    score += 2;
    reasons.push("NOVELTY_DELTA_MID");
    pushFragment("rule_genome", "tax", "NOVELTY_DELTA_MID", 2, 0.93, 0.96);
  } else if (noveltyDelta >= 192) {
    score += 1;
    reasons.push("NOVELTY_DELTA_LOW");
    pushFragment("rule_genome", "tax", "NOVELTY_DELTA_LOW", 1, 0.97, 0.98);
  }

  const symbiosisDelta = Math.abs(
    profile.symbiosisSigned - FEDERATION_LOCAL_SYMBIOSIS_SIGNED,
  );
  if (symbiosisDelta >= 768) {
    score += 3;
    reasons.push("SYMBIOSIS_DELTA_HIGH");
    pushFragment("rule_genome", "tax", "SYMBIOSIS_DELTA_HIGH", 3, 0.9, 0.86);
  } else if (symbiosisDelta >= 384) {
    score += 2;
    reasons.push("SYMBIOSIS_DELTA_MID");
    pushFragment("rule_genome", "tax", "SYMBIOSIS_DELTA_MID", 2, 0.94, 0.91);
  } else if (symbiosisDelta >= 192) {
    score += 1;
    reasons.push("SYMBIOSIS_DELTA_LOW");
    pushFragment("rule_genome", "tax", "SYMBIOSIS_DELTA_LOW", 1, 0.98, 0.96);
  }

  const workerDelta = Math.abs(
    profile.workerCount - FEDERATION_LOCAL_WORKER_COUNT,
  );
  if (workerDelta >= 6) {
    score += 2;
    reasons.push("WORKER_DELTA_HIGH");
    pushFragment("rule_genome", "tax", "WORKER_DELTA_HIGH", 2, 0.92, 0.92);
  } else if (workerDelta >= 3) {
    score += 1;
    reasons.push("WORKER_DELTA_MID");
    pushFragment("rule_genome", "tax", "WORKER_DELTA_MID", 1, 0.97, 0.97);
  }

  const strictMismatch = profile.strictDeterminism !==
    FEDERATION_LOCAL_STRICT_DETERMINISM;
  if (strictMismatch) {
    score += 2;
    reasons.push("STRICT_DETERMINISM_MISMATCH");
    pushFragment(
      "rule_genome",
      "tax",
      "STRICT_DETERMINISM_MISMATCH",
      2,
      0.89,
      0.89,
    );
  }

  if (
    profile.signature !== FEDERATION_LOCAL_SIGNATURE &&
    noveltyDelta + symbiosisDelta >= 512
  ) {
    score += 1;
    reasons.push("RULE_SIGNATURE_DRIFT");
    pushFragment("rule_genome", "tax", "RULE_SIGNATURE_DRIFT", 1, 0.96, 0.96);
  }

  if (peerBehaviorInvariant === "none") {
    score += 1;
    behaviorConflictScore += 1;
    reasons.push("PEER_BEHAVIOR_PROFILE_MISSING");
    pushFragment(
      "behavior",
      "tax",
      "PEER_BEHAVIOR_PROFILE_MISSING",
      1,
      0.95,
      0.95,
    );
  } else if (localBehaviorInvariant !== "none") {
    const delta = behaviorInvariantDistance(
      localBehaviorInvariant,
      peerBehaviorInvariant,
    );
    if (delta !== null) {
      behaviorDistance = delta;
      if (delta >= 1.35) {
        score += 3;
        behaviorConflictScore += 3;
        reasons.push("BEHAVIOR_INVARIANT_DELTA_HIGH");
        pushFragment(
          "behavior",
          "tax",
          "BEHAVIOR_INVARIANT_DELTA_HIGH",
          3,
          0.84,
          0.86,
        );
      } else if (delta >= 0.75) {
        score += 2;
        behaviorConflictScore += 2;
        reasons.push("BEHAVIOR_INVARIANT_DELTA_MID");
        pushFragment(
          "behavior",
          "tax",
          "BEHAVIOR_INVARIANT_DELTA_MID",
          2,
          0.9,
          0.92,
        );
      } else if (delta >= 0.35) {
        score += 1;
        behaviorConflictScore += 1;
        reasons.push("BEHAVIOR_INVARIANT_DELTA_LOW");
        pushFragment(
          "behavior",
          "tax",
          "BEHAVIOR_INVARIANT_DELTA_LOW",
          1,
          0.95,
          0.96,
        );
      } else {
        reasons.push("BEHAVIOR_INVARIANT_MATCH");
        pushFragment(
          "behavior",
          "subsidy",
          "BEHAVIOR_INVARIANT_MATCH",
          -1,
          1.04,
          1.05,
        );
      }
    } else {
      score += 1;
      behaviorConflictScore += 1;
      reasons.push("BEHAVIOR_INVARIANT_PARSE_FALLBACK");
      pushFragment(
        "behavior",
        "tax",
        "BEHAVIOR_INVARIANT_PARSE_FALLBACK",
        1,
        0.96,
        0.96,
      );
    }
  }

  const roleDelta = packet.localBehaviorContext && packet.peerBehaviorProfile
    ? Math.abs(
      packet.localBehaviorContext.dominantRole -
        packet.peerBehaviorProfile.dominantRole,
    )
    : 0;
  if (roleDelta >= 4) {
    score += 1;
    behaviorConflictScore += 1;
    reasons.push("BEHAVIOR_ROLE_DELTA_HIGH");
    pushFragment("behavior", "tax", "BEHAVIOR_ROLE_DELTA_HIGH", 1, 0.95, 0.94);
  }

  if (
    packet.localBehaviorContext && packet.peerBehaviorProfile &&
    packet.localBehaviorContext.memberCount > 0 &&
    packet.peerBehaviorProfile.memberCount >
      packet.localBehaviorContext.memberCount * 6
  ) {
    score += 1;
    behaviorConflictScore += 1;
    reasons.push("PEER_BEHAVIOR_SWARM_SCALE");
    pushFragment("behavior", "tax", "PEER_BEHAVIOR_SWARM_SCALE", 1, 0.94, 0.94);
  }

  if (!packet.peerCodexProfile) {
    score += 1;
    reasons.push("PEER_CODEX_PROFILE_MISSING");
    pushFragment("codex", "tax", "PEER_CODEX_PROFILE_MISSING", 1, 0.95, 0.96);
  } else if (packet.localCodexContext) {
    codexDistanceScore = codexDistance(
      packet.localCodexContext,
      packet.peerCodexProfile,
    );
    if (codexDistanceScore >= 3) {
      score += 2;
      reasons.push("CODEX_DISTANCE_HIGH");
      pushFragment("codex", "tax", "CODEX_DISTANCE_HIGH", 2, 0.87, 0.9);
    } else if (codexDistanceScore >= 2) {
      score += 1;
      reasons.push("CODEX_DISTANCE_MID");
      pushFragment("codex", "tax", "CODEX_DISTANCE_MID", 1, 0.93, 0.95);
    } else if (codexDistanceScore <= 0) {
      score = Math.max(0, score - 1);
      reasons.push("CODEX_ALIGNMENT_BONUS");
      pushFragment("codex", "subsidy", "CODEX_ALIGNMENT_BONUS", -1, 1.06, 1.04);
    }

    const epochDelta = Math.abs(
      packet.localCodexContext.dominantEpochs -
        packet.peerCodexProfile.dominantEpochs,
    );
    if (epochDelta >= 12) {
      score += 1;
      reasons.push("CODEX_EPOCH_DELTA_HIGH");
      pushFragment("codex", "tax", "CODEX_EPOCH_DELTA_HIGH", 1, 0.95, 0.95);
    }

    if (
      packet.localCodexContext.known && !packet.peerCodexProfile.known &&
      packet.localCodexContext.dominantEpochs >= 6
    ) {
      score += 1;
      reasons.push("CODEX_UNKNOWN_PEER_IN_MATURE_FIELD");
      pushFragment(
        "codex",
        "tax",
        "CODEX_UNKNOWN_PEER_IN_MATURE_FIELD",
        1,
        0.93,
        0.94,
      );
    }

    if (
      packet.peerCodexProfile.known &&
      packet.peerCodexProfile.peakShare >= 0.55 &&
      packet.peerCodexProfile.genome !== packet.localCodexContext.genome
    ) {
      score += 1;
      reasons.push("CODEX_PEER_PEAK_SHARE_HIGH");
      pushFragment(
        "codex",
        "tax",
        "CODEX_PEER_PEAK_SHARE_HIGH",
        1,
        0.94,
        0.95,
      );
    }
  }

  const severity: FederationAdmissionSeverity = score >= policy.highScore
    ? "HIGH"
    : score >= policy.midScore
    ? "MID"
    : "LOW";
  const policyRatios = collapsePolicyRatios(policyFragments);

  let action: FederationAdmissionAction = "accept";
  let logicBytes = packet.logicBytes;
  let energy = Math.max(
    1,
    Math.round(packet.energy * policyRatios.energyRatio),
  );
  let resonance = Math.max(
    0,
    Math.round(packet.resonance * policyRatios.resonanceRatio),
  );
  let degraded = false;
  let hybridized = false;
  const openWorld = policy.openWorld === true;

  if (severity === "LOW") {
    action = "accept";
    reasons.push("ADMISSION_LOW_ACCEPT");
  } else if (
    !openWorld &&
    severity === "HIGH" &&
    strictMismatch &&
    policy.rejectOnStrictMismatch
  ) {
    action = "reject";
    reasons.push("HIGH_STRICT_MISMATCH_REJECT");
  } else if (
    !openWorld &&
    severity === "HIGH" &&
    behaviorConflictScore >= 3 &&
    !policy.hybridizeEnabled
  ) {
    action = "reject";
    reasons.push("HIGH_BEHAVIOR_CONFLICT_REJECT");
  } else if (policy.hybridizeEnabled) {
    action = "hybridize";
    const template = buildHybridTemplate(packet.pulseId, profile);
    logicBytes = hybridizeLogicBytes(packet.logicBytes, template);
    const energyRatio = (policy.degradeEnergyRatio + 1) / 2;
    energy = Math.max(1, Math.round(energy * energyRatio));
    const resonanceBias = Math.max(
      0,
      Math.min(2048, 1024 + FEDERATION_LOCAL_SYMBIOSIS_SIGNED),
    );
    resonance = Math.max(
      0,
      Math.round((resonance + resonanceBias) / 2),
    );
    hybridized = true;
    degraded = true;
    reasons.push(
      openWorld && severity === "HIGH"
        ? "OPEN_WORLD_HYBRIDIZE"
        : severity === "HIGH"
        ? "HIGH_HYBRIDIZE_CONTAINMENT"
        : "MID_HYBRIDIZE_BRIDGE",
    );
  } else {
    action = "degrade";
    energy = Math.max(1, Math.round(energy * policy.degradeEnergyRatio));
    resonance = Math.max(
      0,
      Math.round(resonance * policy.degradeResonanceRatio),
    );
    degraded = true;
    reasons.push(
      openWorld && severity === "HIGH"
        ? "OPEN_WORLD_DEGRADE"
        : severity === "HIGH"
        ? "HIGH_DEGRADE_CONTAINMENT"
        : "MID_DEGRADE_CONTAINMENT",
    );
  }

  const admission: FederationAdmissionSnapshot = {
    tick: packet.pulseId,
    atomId,
    sourceNode,
    action,
    severity,
    score,
    reasons,
    localSignature: FEDERATION_LOCAL_SIGNATURE,
    peerSignature: profile.signature,
    strictMismatch,
    degraded,
    hybridized,
    localBehaviorInvariant,
    peerBehaviorInvariant,
    behaviorDistance,
    localCodexLabel,
    peerCodexLabel,
    codexDistance: codexDistanceScore,
    policyFragments: policyFragments.slice(0, 12),
    policyEnergyRatio: policyRatios.energyRatio,
    policyResonanceRatio: policyRatios.resonanceRatio,
  };
  return {
    action,
    packet: {
      logicBytes,
      energy,
      resonance,
    },
    admission,
  };
};

const enqueueInternal = (intent: ControlIntent): QueueDecision => {
  const telemetry = telemetryForIntent(intent);
  if (queue.length >= MAX_PENDING) {
    MUTATION_TELEMETRY.record({
      lane: telemetry.lane,
      kind: telemetry.lane === "external_daemon"
        ? "daemon_intent_reject_full"
        : "control_intent_reject_full",
      count: 1,
    });
    return decision(false, 503, "CONTROL_INTENT_QUEUE_FULL");
  }
  queue.push(intent);
  MUTATION_TELEMETRY.record({
    lane: telemetry.lane,
    kind: telemetry.kind,
    count: 1,
  });
  return decision(true, 202, "QUEUED");
};

const parseHex8 = (value: unknown): Uint8Array | null => {
  if (typeof value !== "string") return null;
  const hex = value.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{16}$/u.test(hex)) return null;
  const out = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const parseFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
};

const telemetryLaneForSource = (
  source: "external_ingress" | "external_daemon",
): "external_ingress" | "external_daemon" => source;

const toGridCell = (
  x: number,
  y: number,
): { gx: number; gy: number; cell: number } => {
  const wx = clamp(Math.round(x), 0, WORLD_W - 1);
  const wy = clamp(Math.round(y), 0, WORLD_H - 1);
  const gx = clamp(Math.floor(wx / 10), 0, GRID_W - 1);
  const gy = clamp(Math.floor(wy / 10), 0, GRID_H - 1);
  return { gx, gy, cell: gy * GRID_W + gx };
};

const writeMemoryCell = (
  gridIdx: number,
  charge: number,
  payload: Uint8Array,
): void => {
  const q = clamp(Math.round(charge), 0, 0xFFFF);
  STATE_MATRIX.memoryGrid[gridIdx] = q & 0xFF;
  STATE_MATRIX.memoryGrid[gridIdx + 1] = (q >> 8) & 0xFF;
  STATE_MATRIX.memoryGrid[gridIdx + 2] = 0;
  STATE_MATRIX.memoryGrid[gridIdx + 3] = 0;
  STATE_MATRIX.memoryGrid.set(payload, gridIdx + 4);
};

const applyFederateIntent = (intent: FederateIntent): boolean => {
  const idx = P2P_CODEC.unpackAtom(intent.packet);
  if (idx < 0) {
    LOGGER.warn(
      `🛸 [FEDERATION] Queue apply skipped for binary ingress from ${intent.sourceNode}: matrix full or invalid packet.`,
    );
    return false;
  }

  const idStr = STATE_MATRIX.getId(idx).toString();
  LOGGER.info(
    `🛸 [FEDERATION] Applied queued binary migration from ${intent.sourceNode}: ${idStr}`,
  );
  return true;
};

const applyMutateIntent = (intent: MutateIntent): boolean => {
  const r2 = intent.radius * intent.radius;
  let affected = 0;
  for (let i = 0; i < MAX_ATOMS; i++) {
    if (STATE_MATRIX.getId(i) === 0n) continue;
    const dx = STATE_MATRIX.getX(i) - intent.x;
    const dy = STATE_MATRIX.getY(i) - intent.y;
    if (dx * dx + dy * dy >= r2) continue;
    const current = STATE_MATRIX.getEnergy(i);
    STATE_MATRIX.setEnergy(i, Math.max(0, current + intent.deltaEnergy));
    affected++;
  }
  MUTATION_TELEMETRY.record({
    lane: "external_ingress",
    kind: "control_mutate_apply_targets",
    count: affected,
  });
  return true;
};

const applyPlasmidIntent = (intent: PlasmidIntent): boolean => {
  const { gx, cell } = toGridCell(intent.x, intent.y);
  const gridIdx = cell * GRID_CELL_BYTES;
  GLYPH_BUFFER.depositPlasmid(
    intent.x,
    intent.y,
    intent.charge,
    intent.plasmidBytes,
  );
  writeMemoryCell(gridIdx, intent.charge, intent.plasmidBytes.subarray(0, 4));
  let seededCells = 1;

  if (gx < GRID_W - 1) {
    const nextGridIdx = gridIdx + GRID_CELL_BYTES;
    if (nextGridIdx + 7 < STATE_MATRIX.memoryGrid.length) {
      writeMemoryCell(
        nextGridIdx,
        intent.charge - 128,
        intent.plasmidBytes.subarray(4, 8),
      );
      seededCells++;
    }
  }

  MUTATION_TELEMETRY.record({
    lane: telemetryLaneForSource(intent.source),
    kind: intent.source === "external_daemon"
      ? "daemon_plasmid_apply_cells"
      : "control_plasmid_apply_cells",
    count: seededCells,
  });
  return true;
};

const applyIntent = async (intent: ControlIntent): Promise<boolean> => {
  switch (intent.kind) {
    case "crisis":
      PREDICTION_MARKET.startCrisis(intent.logicBytes);
      return true;
    case "federate":
      return applyFederateIntent(intent);
    case "mutate":
      return applyMutateIntent(intent);
    case "avatar":
      AVATAR_ENGINE.dropPheromone(intent.x, intent.y, intent.intensity);
      MUTATION_TELEMETRY.record({
        lane: telemetryLaneForSource(intent.source),
        kind: intent.source === "external_daemon"
          ? "daemon_avatar_apply"
          : "control_avatar_apply",
        count: 1,
      });
      return true;
    case "plasmid":
      return applyPlasmidIntent(intent);
    case "snapshot_import": {
      const result = await SNAPSHOT_ENGINE.importSnapshot(intent.timestamp);
      return result.success === true;
    }
  }
};

const toBoundedIntensity = (value: unknown, fallback: number): number => {
  const parsed = parseFiniteNumber(value);
  if (parsed === null) return fallback;
  return clamp(parsed, 1, 2000);
};

export const CONTROL_INTENT_QUEUE = {
  config: {
    maxPending: MAX_PENDING,
    applyBudgetPerTick: APPLY_BUDGET_PER_TICK,
  },
  size: (): number => queue.length,
  enqueueCrisis: (logicHex: unknown): QueueDecision => {
    const explicit = parseHex8(logicHex);
    const logicBytes = explicit ?? crypto.getRandomValues(new Uint8Array(8));
    return enqueueInternal({ kind: "crisis", logicBytes });
  },
  enqueueFederate: (
    packet: Uint8Array,
    sourceNode: string,
    peerRuleGenome: unknown = null,
    peerBehaviorProfile: unknown = null,
    localBehaviorContext: unknown = null,
    peerCodexProfile: unknown = null,
    localCodexContext: unknown = null,
  ): QueueDecision => {
    const logicBytes = packet.subarray(24, 32);
    const view = new DataView(
      packet.buffer,
      packet.byteOffset,
      packet.byteLength,
    );
    const energy = view.getFloat32(12, true);
    const resonance = view.getInt32(16, true);
    const atomId = view.getBigUint64(0, true).toString();

    const admissionResult = evaluateFederateAdmission(atomId, sourceNode, {
      logicBytes,
      energy,
      resonance,
      pulseId: 0,
      ruleGenome: peerRuleGenome as any,
      peerBehaviorProfile: peerBehaviorProfile as any,
      localBehaviorContext: localBehaviorContext as any,
      peerCodexProfile: peerCodexProfile as any,
      localCodexContext: localCodexContext as any,
    });
    setLatestFederationAdmission(admissionResult.admission);

    const admissionKind = admissionResult.action === "reject"
      ? "federation_admission_reject"
      : admissionResult.action === "degrade"
      ? "federation_admission_degrade"
      : admissionResult.action === "hybridize"
      ? "federation_admission_hybridize"
      : "federation_admission_accept";

    MUTATION_TELEMETRY.record({
      lane: "external_ingress",
      kind: admissionKind,
      count: 1,
    });

    if (
      Array.isArray(admissionResult.admission.policyFragments) &&
      admissionResult.admission.policyFragments.length > 0
    ) {
      MUTATION_TELEMETRY.record({
        lane: "external_ingress",
        kind: "federation_policy_fragment_applied",
        count: admissionResult.admission.policyFragments.length,
      });
    }

    if (admissionResult.action === "reject") {
      LOGGER.warn(
        `🛸 [FEDERATION] Rejected binary ingress ${sourceNode}:${atomId} score=${admissionResult.admission.score} reasons=${
          admissionResult.admission.reasons.join("|")
        }`,
      );
      return decision(
        false,
        409,
        "FEDERATION_ADMISSION_REJECTED",
        admissionResult.admission,
      );
    }

    if (queue.length >= MAX_PENDING) {
      MUTATION_TELEMETRY.record({
        lane: "external_ingress",
        kind: "control_intent_reject_full",
        count: 1,
      });
      return decision(false, 503, "CONTROL_INTENT_QUEUE_FULL");
    }

    const queued = enqueueInternal({
      kind: "federate",
      packet,
      sourceNode,
    });
    return {
      ...queued,
      admission: admissionResult.admission,
    };
  },
  enqueueMutate: (
    x: unknown,
    y: unknown,
    deltaEnergy: unknown,
    radius: unknown,
  ): QueueDecision => {
    const px = parseFiniteNumber(x);
    const py = parseFiniteNumber(y);
    const pDelta = parseFiniteNumber(deltaEnergy);
    const pRadius = parseFiniteNumber(radius);
    if (px === null || py === null || pDelta === null || pRadius === null) {
      return decision(false, 400, "INVALID_MUTATE_PAYLOAD");
    }
    if (pRadius <= 0) return decision(false, 400, "INVALID_MUTATE_RADIUS");
    return enqueueInternal({
      kind: "mutate",
      x: px,
      y: py,
      deltaEnergy: pDelta,
      radius: pRadius,
    });
  },
  enqueueAvatar: (
    x: unknown,
    y: unknown,
    intensity: unknown = 100,
    source: "external_ingress" | "external_daemon" = "external_ingress",
  ): QueueDecision => {
    const px = parseFiniteNumber(x);
    const py = parseFiniteNumber(y);
    if (px === null || py === null) {
      return decision(false, 400, "INVALID_AVATAR_PAYLOAD");
    }
    return enqueueInternal({
      kind: "avatar",
      x: px,
      y: py,
      intensity: toBoundedIntensity(intensity, 100),
      source,
    });
  },
  enqueuePlasmid: (
    x: unknown,
    y: unknown,
    hexCode: unknown,
    charge: unknown = 1000,
    source: "external_ingress" | "external_daemon" = "external_ingress",
  ): QueueDecision => {
    const px = parseFiniteNumber(x);
    const py = parseFiniteNumber(y);
    const plasmidBytes = parseHex8(hexCode);
    if (px === null || py === null || !plasmidBytes) {
      return decision(false, 400, "INVALID_PLASMID_PAYLOAD");
    }
    const seedCharge = toBoundedIntensity(charge, 1000);
    return enqueueInternal({
      kind: "plasmid",
      x: px,
      y: py,
      charge: seedCharge,
      plasmidBytes,
      source,
    });
  },
  enqueueSnapshotImport: (timestamp: unknown): QueueDecision => {
    if (typeof timestamp !== "string" || timestamp.trim().length === 0) {
      return decision(false, 400, "INVALID_SNAPSHOT_TIMESTAMP");
    }
    return enqueueInternal({
      kind: "snapshot_import",
      timestamp: timestamp.trim(),
    });
  },
  applyHostLockBudget: async (): Promise<ApplyStats> => {
    let drained = 0;
    let applied = 0;
    let failed = 0;
    while (drained < APPLY_BUDGET_PER_TICK && queue.length > 0) {
      const intent = queue.shift()!;
      drained++;
      const ok = await applyIntent(intent);
      const lane = intent.kind === "avatar" || intent.kind === "plasmid"
        ? telemetryLaneForSource(intent.source)
        : "external_ingress";
      MUTATION_TELEMETRY.record({
        lane,
        kind: ok ? "control_intent_applied" : "control_intent_apply_failed",
        count: 1,
      });
      if (ok) applied++;
      else failed++;
    }
    if (failed > 0) {
      LOGGER.warn(
        `[CONTROL] host-lock apply failures=${failed} drained=${drained} remaining=${queue.length}`,
      );
    }
    return {
      drained,
      applied,
      failed,
      remaining: queue.length,
    };
  },
  getFederationAdmissionState: () => ({
    latest: latestFederationAdmission,
    history: federationAdmissionHistory.slice(),
    policy: FEDERATION_ADMISSION_POLICY,
  }),
};
