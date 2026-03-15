---
id: DAEMON_INGRESS_POLICY
type: module
tags:
  - substrate
deps:
  - RUNTIME_POLICY
---

```typescript
import { RUNTIME_POLICY } from "@generated";

export type DaemonAction = "DROP_PHEROMONE" | "INJECT_PLASMID" | "OBSERVE";

export type DaemonInjectEnvelope = {
  action_type: DaemonAction;
  payload: {
    target_x: number;
    target_y: number;
    intensity: number;
    hex_code?: string;
  };
};

export type DaemonNarrativeContext = {
  mood: string;
  sharedCenter: string;
  dominantInvariantVector: string;
  codexLineageLabel: string;
  codexLineageGuardScore: number;
  codexLineageGuardReasons: string[];
  glyphStatus: string;
  glyphRegime: string;
  glyphDominantRole: string;
  glyphSourceMode: string;
  metabolicPressure: number;
  hormoneRegime: string;
};

export type DaemonInvariantAdmission = {
  score: number;
  severity: "LOW" | "MID" | "HIGH";
  reasons: string[];
  context: DaemonNarrativeContext;
};

export type PlasmidRiskProfile = {
  level: "LOW" | "MID" | "HIGH";
  score: number;
  reasons: string[];
  opcode: number;
};

export type DaemonIngressPlan = {
  requested: DaemonInjectEnvelope;
  applied: DaemonInjectEnvelope;
  degraded: boolean;
  degradeReason: string | null;
  admission: DaemonInvariantAdmission;
};

export type DaemonIngressMetrics = {
  population: number;
  avgEnergy: number;
};

const DAEMON_POLICY = RUNTIME_POLICY.daemon;

export const DAEMON_INGRESS_POLICY_LIMITS = {
  maxPheromoneIntensity: DAEMON_POLICY.maxPheromoneIntensity,
  maxPlasmidCharge: DAEMON_POLICY.maxPlasmidCharge,
  safeMinPopulation: DAEMON_POLICY.safeMinPopulation,
  safeMinAvgEnergy: DAEMON_POLICY.safeMinAvgEnergy,
  invariantDriftMidScore: 2,
  invariantDriftHighScore: 4,
  invariantMidRatio: 0.6,
  invariantHighRatio: 0.35,
  invariantMinDegradedIntensity: 24,
  codexLineageLongevityEpochs: 6,
  codexLineagePeakShare: 0.35,
  codexLineageGuardMax: 3,
} as const satisfies Record<string, number>;

export const snapshotDaemonIngressPolicyLimits = () => ({
  ...DAEMON_INGRESS_POLICY_LIMITS,
});

export const syncDaemonIngressMaxPheromoneIntensity = (
  value: number,
): number => {
  const bounded = clamp(Math.round(value), 1, 4096);
  (DAEMON_INGRESS_POLICY_LIMITS as { maxPheromoneIntensity: number })
    .maxPheromoneIntensity = bounded;
  return bounded;
};

export const resetDaemonIngressMaxPheromoneIntensity = (): number =>
  syncDaemonIngressMaxPheromoneIntensity(DAEMON_POLICY.maxPheromoneIntensity);

export const syncDaemonIngressMaxPlasmidCharge = (
  value: number,
): number => {
  const bounded = clamp(Math.round(value), 1, 4096);
  (DAEMON_INGRESS_POLICY_LIMITS as { maxPlasmidCharge: number })
    .maxPlasmidCharge = bounded;
  return bounded;
};

export const resetDaemonIngressMaxPlasmidCharge = (): number =>
  syncDaemonIngressMaxPlasmidCharge(DAEMON_POLICY.maxPlasmidCharge);

const ALLOWED_DAEMON_OPCODES = new Set<number>([
  0x00,
  0x01,
  0x02,
  0x03,
  0x04,
  0x05,
  0x10,
  0x11,
  0x12,
  0x80,
  0x81,
  0x83,
  0xA4,
  0xA5,
  0xA6,
  0xA7,
  0xA8,
  0xA9,
  0xAA,
  0xAB,
]);

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const asFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeGlyphValue = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim().toLowerCase()
    : fallback;

const parseHex8Strict = (value: string): Uint8Array | null => {
  const normalized = value.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{16}$/u.test(normalized)) return null;
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

export const evaluatePlasmidPolicy = (
  hexCode: string,
): { ok: boolean; reason: string } => {
  const bytes = parseHex8Strict(hexCode);
  if (!bytes) return { ok: false, reason: "INVALID_HEX_CODE" };
  if (bytes.every((b) => b === 0)) {
    return { ok: false, reason: "PLASMID_ZERO_VECTOR_BLOCKED" };
  }
  const opcode = bytes[0];
  if (!ALLOWED_DAEMON_OPCODES.has(opcode)) {
    return {
      ok: false,
      reason: `PLASMID_OPCODE_BLOCKED_0x${
        opcode.toString(16).toUpperCase().padStart(2, "0")
      }`,
    };
  }
  return { ok: true, reason: "PLASMID_POLICY_OK" };
};

export const evaluatePlasmidRisk = (
  hexCode: string,
  intensity: number,
): PlasmidRiskProfile => {
  const bytes = parseHex8Strict(hexCode);
  if (!bytes) {
    return {
      level: "HIGH",
      score: 4,
      reasons: ["PLASMID_HEX_INVALID"],
      opcode: 0,
    };
  }
  const opcode = bytes[0];
  let score = 0;
  const reasons: string[] = [];

  if (opcode === 0x80) {
    score += 2;
    reasons.push("RISK_OPCODE_REPLICATE");
  } else if (opcode === 0xA8 || opcode === 0xA5 || opcode === 0xA6) {
    score += 1;
    reasons.push("RISK_OPCODE_COMPLEX_STRUCT");
  } else if (opcode === 0xAA || opcode === 0xAB) {
    score += 2;
    reasons.push("RISK_OPCODE_GLOBAL_TRANSFER");
  }

  const intensityRatio = clamp(
    intensity / DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge,
    0,
    1,
  );
  if (intensityRatio >= 0.85) {
    score += 2;
    reasons.push("RISK_INTENSITY_HIGH");
  } else if (intensityRatio >= 0.55) {
    score += 1;
    reasons.push("RISK_INTENSITY_MID");
  }

  const level = score >= 4 ? "HIGH" : score >= 2 ? "MID" : "LOW";
  if (reasons.length === 0) reasons.push("RISK_LOW");
  return {
    level,
    score,
    reasons,
    opcode,
  };
};

export const normalizeDaemonNarrativeContext = (
  narrative: unknown,
  dominantGenome: string,
): DaemonNarrativeContext => {
  const root = narrative && typeof narrative === "object"
    ? narrative as Record<string, unknown>
    : {};
  const mood = typeof root.mood === "string"
    ? root.mood.trim().toUpperCase()
    : "STABLE";
  const sharedCenter = typeof root.sharedCenter === "string" &&
      root.sharedCenter.trim().length > 0
    ? root.sharedCenter.trim()
    : "tick.exists";
  const invariantHighlights = Array.isArray(root.invariantHighlights)
    ? root.invariantHighlights
    : [];
  const glyphStatus = typeof root.glyphStatus === "string" &&
      root.glyphStatus.trim().length > 0
    ? root.glyphStatus.trim()
    : "Glyph transport status unavailable.";
  const glyphRegime = normalizeGlyphValue(root.glyphRegime, "dormant");
  const glyphDominantRole = normalizeGlyphValue(
    root.glyphDominantRole,
    "none",
  );
  const glyphSourceMode = normalizeGlyphValue(root.glyphSourceMode, "none");
  // Stage 7.3: hormone regime from Codex narrative (written by Stage 7.2)
  const hormoneRegime = normalizeGlyphValue(
    root.hormoneRegime,
    "dormant_baseline",
  );
  const dominantInvariantVector = typeof invariantHighlights[0] === "object" &&
      invariantHighlights[0] !== null &&
      typeof (invariantHighlights[0] as Record<string, unknown>)
          .dominantVector === "string" &&
      ((invariantHighlights[0] as Record<string, unknown>)
          .dominantVector as string)
          .trim()
          .length > 0
    ? ((invariantHighlights[0] as Record<string, unknown>)
      .dominantVector as string)
      .trim()
    : "none";

  const normalizedDominantGenome = dominantGenome.trim().toUpperCase();
  const highlights = Array.isArray(root.speciesHighlights)
    ? root.speciesHighlights.filter((entry) =>
      entry && typeof entry === "object"
    )
    : [];
  const matchedSpecies =
    highlights.find((entry) =>
      typeof (entry as Record<string, unknown>).genome === "string" &&
      ((entry as Record<string, unknown>).genome as string).toUpperCase() ===
        normalizedDominantGenome
    ) ?? highlights[0];

  let codexLineageLabel = "none";
  let codexLineageGuardScore = 0;
  const codexLineageGuardReasons: string[] = [];
  if (matchedSpecies && typeof matchedSpecies === "object") {
    const species = matchedSpecies as Record<string, unknown>;
    const dominantEpochs = asFiniteNumber(species.dominantEpochs, 0);
    const peakShare = asFiniteNumber(species.peakShare, 0);
    codexLineageLabel = typeof species.latinName === "string" &&
        species.latinName.trim().length > 0
      ? species.latinName.trim()
      : typeof species.genome === "string"
      ? `Genome ${species.genome.slice(0, 8)}`
      : "unknown-lineage";
    if (
      dominantEpochs >= DAEMON_INGRESS_POLICY_LIMITS
        .codexLineageLongevityEpochs
    ) {
      codexLineageGuardScore += 1;
      codexLineageGuardReasons.push("CODEX_LINEAGE_LONGEVITY");
    }
    if (peakShare >= DAEMON_INGRESS_POLICY_LIMITS.codexLineagePeakShare) {
      codexLineageGuardScore += 1;
      codexLineageGuardReasons.push("CODEX_LINEAGE_DOMINANCE");
    }
    if (
      normalizedDominantGenome.length > 0 &&
      typeof species.genome === "string" &&
      species.genome.toUpperCase() === normalizedDominantGenome
    ) {
      codexLineageGuardScore += 1;
      codexLineageGuardReasons.push("CODEX_ACTIVE_LINEAGE_MATCH");
    }
  }

  codexLineageGuardScore = clamp(
    Math.round(codexLineageGuardScore),
    0,
    DAEMON_INGRESS_POLICY_LIMITS.codexLineageGuardMax,
  );

  return {
    mood,
    sharedCenter,
    dominantInvariantVector,
    codexLineageLabel,
    codexLineageGuardScore,
    codexLineageGuardReasons,
    glyphStatus,
    glyphRegime,
    glyphDominantRole,
    glyphSourceMode,
    metabolicPressure: asFiniteNumber(root.metabolicPressure, 0),
    hormoneRegime,
  };
};

export const evaluateInvariantAdmission = (
  envelope: DaemonInjectEnvelope,
  metrics: DaemonIngressMetrics,
  context: DaemonNarrativeContext,
  plasmidRisk: PlasmidRiskProfile | null = null,
): DaemonInvariantAdmission => {
  let score = 0;
  const reasons: string[] = [];
  if (context.mood === "FRAGILE") {
    score += 2;
    reasons.push("NARRATIVE_MOOD_FRAGILE");
  }

  if (
    metrics.population <= Math.max(
      DAEMON_INGRESS_POLICY_LIMITS.safeMinPopulation * 2,
      24,
    )
  ) {
    score += 1;
    reasons.push("POPULATION_NEAR_SAFE_FLOOR");
  }
  if (metrics.avgEnergy <= DAEMON_INGRESS_POLICY_LIMITS.safeMinAvgEnergy + 4) {
    score += 2;
    reasons.push("ENERGY_NEAR_SAFE_FLOOR");
  } else if (
    metrics.avgEnergy <= DAEMON_INGRESS_POLICY_LIMITS.safeMinAvgEnergy + 12
  ) {
    score += 1;
    reasons.push("ENERGY_LOW_GRADIENT");
  }

  const normalizedVector = context.dominantInvariantVector.toUpperCase();
  if (normalizedVector.includes("SCARCITY")) {
    score += 1;
    reasons.push("INVARIANT_SCARCITY_VECTOR");
  } else if (normalizedVector.includes("TENSION")) {
    score += 1;
    reasons.push("INVARIANT_TENSION_VECTOR");
  }

  if (context.codexLineageGuardScore > 0) {
    if (envelope.action_type === "INJECT_PLASMID") {
      const codexGuardAdd = Math.min(2, context.codexLineageGuardScore);
      score += codexGuardAdd;
      reasons.push(
        ...context.codexLineageGuardReasons.slice(0, codexGuardAdd),
      );
      reasons.push("CODEX_LINEAGE_GUARD_PLASMID");
    } else if (envelope.action_type === "DROP_PHEROMONE") {
      const pheromoneRatio = envelope.payload.intensity /
        DAEMON_INGRESS_POLICY_LIMITS.maxPheromoneIntensity;
      if (pheromoneRatio >= 0.9) {
        score += 1;
        reasons.push("CODEX_LINEAGE_GUARD_PHEROMONE_HIGH");
      }
    }
  }

  if (envelope.action_type === "INJECT_PLASMID") {
    if (
      context.glyphRegime === "plasmid_surge" ||
      context.glyphRegime === "agent_flux"
    ) {
      score += 1;
      reasons.push("GLYPH_REGIME_PLASMID_PRESSURE");
    }
    if (
      context.glyphDominantRole === "architect" ||
      context.glyphDominantRole === "parasite"
    ) {
      score += 1;
      reasons.push("GLYPH_ROLE_PLASMID_PRESSURE");
    }
  } else if (envelope.action_type === "DROP_PHEROMONE") {
    if (
      context.glyphRegime === "pheromone_canopy" ||
      context.glyphRegime === "agent_flux"
    ) {
      score += 1;
      reasons.push("GLYPH_REGIME_PHEROMONE_PRESSURE");
    }
    if (context.glyphDominantRole === "guardian") {
      score += 1;
      reasons.push("GLYPH_ROLE_PHEROMONE_PRESSURE");
    }
  }

  // Stage 7.3: Hormone regime pressure terms
  if (context.hormoneRegime === "high_entropy") {
    score += 1;
    reasons.push("HORMONE_HIGH_ENTROPY_RISK");
  }
  if (
    context.hormoneRegime === "aggressive_bloom" &&
    envelope.action_type === "INJECT_PLASMID"
  ) {
    score += 1;
    reasons.push("HORMONE_AGGRESSIVE_BLOOM_PLASMID");
  }
  if (
    context.hormoneRegime === "repair_surge" &&
    envelope.action_type === "DROP_PHEROMONE"
  ) {
    score = Math.max(0, score - 1);
    reasons.push("HORMONE_REPAIR_SURGE_PHEROMONE_ACCEPT");
  }

  if (envelope.action_type === "INJECT_PLASMID") {
    const ratio = envelope.payload.intensity /
      DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge;
    if (ratio >= 0.8) {
      score += 2;
      reasons.push("PLASMID_INTENSITY_HIGH");
    } else if (ratio >= 0.55) {
      score += 1;
      reasons.push("PLASMID_INTENSITY_MID");
    }
    if (context.mood === "FRAGILE") {
      score += 1;
      reasons.push("PLASMID_IN_FRAGILE_MOOD");
    }
    if (plasmidRisk) {
      score += plasmidRisk.score;
      reasons.push(...plasmidRisk.reasons);
      if (plasmidRisk.level === "HIGH") {
        score += 1;
        reasons.push("PLASMID_RISK_HIGH");
      }
    }
  } else if (envelope.action_type === "DROP_PHEROMONE") {
    const ratio = envelope.payload.intensity /
      DAEMON_INGRESS_POLICY_LIMITS.maxPheromoneIntensity;
    if (ratio >= 0.85) {
      score += 1;
      reasons.push("PHEROMONE_INTENSITY_HIGH");
    }
  }

  if (context.metabolicPressure > 0.8) {
    score += 2;
    reasons.push("METABOLIC_PRESSURE_SATURED");
  } else if (context.metabolicPressure > 0.5) {
    score += 1;
    reasons.push("METABOLIC_PRESSURE_HIGH");
  }

  const severity = score >= DAEMON_INGRESS_POLICY_LIMITS.invariantDriftHighScore
    ? "HIGH"
    : score >= DAEMON_INGRESS_POLICY_LIMITS.invariantDriftMidScore
    ? "MID"
    : "LOW";
  if (reasons.length === 0) reasons.push("DRIFT_LOW");
  return { score, severity, reasons, context };
};

export const planInvariantIngress = (
  envelope: DaemonInjectEnvelope,
  admission: DaemonInvariantAdmission,
): DaemonIngressPlan => {
  if (admission.severity === "LOW") {
    return {
      requested: envelope,
      applied: envelope,
      degraded: false,
      degradeReason: null,
      admission,
    };
  }

  if (admission.severity === "MID") {
    if (envelope.action_type === "INJECT_PLASMID") {
      const capped = Math.max(
        DAEMON_INGRESS_POLICY_LIMITS.invariantMinDegradedIntensity,
        Math.round(
          DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge *
            DAEMON_INGRESS_POLICY_LIMITS.invariantMidRatio,
        ),
      );
      return {
        requested: envelope,
        applied: {
          action_type: "INJECT_PLASMID",
          payload: {
            ...envelope.payload,
            intensity: clamp(envelope.payload.intensity, 1, capped),
          },
        },
        degraded: true,
        degradeReason: "INVARIANT_DRIFT_MID_DEGRADE_INTENSITY",
        admission,
      };
    }
    const capped = Math.max(
      DAEMON_INGRESS_POLICY_LIMITS.invariantMinDegradedIntensity,
      Math.round(
        DAEMON_INGRESS_POLICY_LIMITS.maxPheromoneIntensity *
          DAEMON_INGRESS_POLICY_LIMITS.invariantMidRatio,
      ),
    );
    return {
      requested: envelope,
      applied: {
        action_type: "DROP_PHEROMONE",
        payload: {
          ...envelope.payload,
          intensity: clamp(envelope.payload.intensity, 1, capped),
        },
      },
      degraded: true,
      degradeReason: "INVARIANT_DRIFT_MID_DEGRADE_INTENSITY",
      admission,
    };
  }

  if (envelope.action_type === "INJECT_PLASMID") {
    const softened = clamp(
      Math.round(
        envelope.payload.intensity *
          DAEMON_INGRESS_POLICY_LIMITS.invariantHighRatio,
      ),
      DAEMON_INGRESS_POLICY_LIMITS.invariantMinDegradedIntensity,
      DAEMON_INGRESS_POLICY_LIMITS.maxPheromoneIntensity,
    );
    return {
      requested: envelope,
      applied: {
        action_type: "DROP_PHEROMONE",
        payload: {
          target_x: envelope.payload.target_x,
          target_y: envelope.payload.target_y,
          intensity: softened,
        },
      },
      degraded: true,
      degradeReason: "INVARIANT_DRIFT_HIGH_DEGRADE_TO_PHEROMONE",
      admission,
    };
  }

  const softened = clamp(
    Math.round(
      envelope.payload.intensity *
        DAEMON_INGRESS_POLICY_LIMITS.invariantHighRatio,
    ),
    DAEMON_INGRESS_POLICY_LIMITS.invariantMinDegradedIntensity,
    DAEMON_INGRESS_POLICY_LIMITS.maxPheromoneIntensity,
  );
  return {
    requested: envelope,
    applied: {
      action_type: "DROP_PHEROMONE",
      payload: {
        ...envelope.payload,
        intensity: softened,
      },
    },
    degraded: true,
    degradeReason: "INVARIANT_DRIFT_HIGH_DEGRADE_INTENSITY",
    admission,
  };
};

export const DAEMON_INGRESS_POLICY = {
  DAEMON_INGRESS_POLICY_LIMITS,
  snapshotDaemonIngressPolicyLimits,
  syncDaemonIngressMaxPheromoneIntensity,
  resetDaemonIngressMaxPheromoneIntensity,
  syncDaemonIngressMaxPlasmidCharge,
  resetDaemonIngressMaxPlasmidCharge,
  evaluatePlasmidPolicy,
  evaluatePlasmidRisk,
  normalizeDaemonNarrativeContext,
  evaluateInvariantAdmission,
  planInvariantIngress
};

```
