import { type DaemonIngressMetrics, type DaemonInjectEnvelope, evaluateInvariantAdmission, normalizeDaemonNarrativeContext, planInvariantIngress } from "../03_governance/mod.ts";

const expect = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(`[daemon-glyph-admission] ${message}`);
};

const BASE_METRICS: DaemonIngressMetrics = {
  population: 64,
  avgEnergy: 240,
};

const PLASMID_ENVELOPE: DaemonInjectEnvelope = {
  action_type: "INJECT_PLASMID",
  payload: {
    target_x: 512,
    target_y: 320,
    intensity: 420,
    hex_code: "0102030405101180",
  },
};

const PHEROMONE_ENVELOPE: DaemonInjectEnvelope = {
  action_type: "DROP_PHEROMONE",
  payload: {
    target_x: 512,
    target_y: 320,
    intensity: 80,
  },
};

const main = () => {
  const neutralContext = normalizeDaemonNarrativeContext(
    {},
    "808103862DA8E71A",
  );
  expect(
    neutralContext.glyphRegime === "dormant",
    "neutral context must default to dormant glyph regime",
  );
  expect(
    neutralContext.glyphDominantRole === "none",
    "neutral context must default to no dominant glyph role",
  );

  const neutralPlasmid = evaluateInvariantAdmission(
    PLASMID_ENVELOPE,
    BASE_METRICS,
    neutralContext,
    null,
  );
  expect(
    neutralPlasmid.score === 0,
    "neutral plasmid ingress should remain low-drift",
  );
  expect(
    neutralPlasmid.severity === "LOW",
    "neutral plasmid ingress should remain LOW",
  );

  const plasmidPressureContext = normalizeDaemonNarrativeContext(
    {
      glyphStatus:
        "Glyph regime Plasmid Surge | dominant role Architect | source Actor Secretion | amplitude charged.",
      glyphRegime: "plasmid_surge",
      glyphDominantRole: "architect",
      glyphSourceMode: "actor_secretion",
    },
    "808103862DA8E71A",
  );
  const pressuredPlasmid = evaluateInvariantAdmission(
    PLASMID_ENVELOPE,
    BASE_METRICS,
    plasmidPressureContext,
    null,
  );
  expect(
    pressuredPlasmid.score === 2,
    "glyph plasmid pressure should add two drift points",
  );
  expect(
    pressuredPlasmid.severity === "MID",
    "glyph plasmid pressure should escalate low-risk plasmid ingress to MID",
  );
  expect(
    pressuredPlasmid.reasons.includes("GLYPH_REGIME_PLASMID_PRESSURE"),
    "glyph plasmid regime reason must be present",
  );
  expect(
    pressuredPlasmid.reasons.includes("GLYPH_ROLE_PLASMID_PRESSURE"),
    "glyph plasmid role reason must be present",
  );
  const plasmidPlan = planInvariantIngress(PLASMID_ENVELOPE, pressuredPlasmid);
  expect(
    plasmidPlan.degraded === true,
    "MID plasmid admission should degrade intensity",
  );
  expect(
    plasmidPlan.applied.action_type === "INJECT_PLASMID",
    "MID plasmid admission should stay in plasmid lane",
  );

  const pheromonePressureContext = normalizeDaemonNarrativeContext(
    {
      glyphStatus:
        "Glyph regime Pheromone Canopy | dominant role Guardian | source Actor Secretion | amplitude warm.",
      glyphRegime: "pheromone_canopy",
      glyphDominantRole: "guardian",
      glyphSourceMode: "actor_secretion",
    },
    "808103862DA8E71A",
  );
  const pressuredPheromone = evaluateInvariantAdmission(
    PHEROMONE_ENVELOPE,
    BASE_METRICS,
    pheromonePressureContext,
    null,
  );
  expect(
    pressuredPheromone.score === 2,
    "glyph pheromone pressure should add two drift points",
  );
  expect(
    pressuredPheromone.severity === "MID",
    "glyph pheromone pressure should escalate ingress to MID",
  );
  expect(
    pressuredPheromone.reasons.includes("GLYPH_REGIME_PHEROMONE_PRESSURE"),
    "glyph pheromone regime reason must be present",
  );
  expect(
    pressuredPheromone.reasons.includes("GLYPH_ROLE_PHEROMONE_PRESSURE"),
    "glyph pheromone role reason must be present",
  );

  console.log("[daemon-glyph-admission] glyph pressure contract passed.");
};

main();
