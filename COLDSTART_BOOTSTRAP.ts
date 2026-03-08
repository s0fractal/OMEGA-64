import { STATE_MATRIX } from "./STATE_MATRIX.ts";

type ColdstartConfig = {
  enabled: boolean;
  count: number;
  replicatorRatio: number;
  guardianRatio: number;
  seed: number;
  energy: number;
  resonance: number;
};

type ColdstartResult = {
  attempted: boolean;
  skipped: boolean;
  reason: string;
  configuredCount: number;
  seeded: number;
  replicators: number;
  guardians: number;
  architects: number;
  seed: number;
};

const WORLD_W = 1400;
const WORLD_H = 800;
const MARGIN = 20;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const createLcg = (seed: number): () => number => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
};

const makeReplicatorScript = (): Uint8Array => {
  const script = new Uint8Array(8);
  let pc = 0;
  script[pc++] = STATE_MATRIX.RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_PRODUCER;
  script[pc++] = STATE_MATRIX.RISC.OP_SPORE_DRIVE;
  script[pc++] = STATE_MATRIX.RISC.OP_REPLICATE;
  script[pc++] = STATE_MATRIX.RISC.OP_SIGNAL;
  script[pc++] = STATE_MATRIX.RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeArchitectScript = (emit: boolean): Uint8Array => {
  const script = new Uint8Array(8);
  let pc = 0;
  const RISC = STATE_MATRIX.RISC;

  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;

  if (emit) {
    script[pc++] = RISC.OP_BUILD;
    script[pc++] = 1; // STRUCTURE.WIRE
    script[pc++] = 1; // state=1
  } else {
    script[pc++] = RISC.OP_SIGNAL;
  }

  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;

  return script;
};

const makeGuardianScript = (stable: boolean): Uint8Array => {
  const script = new Uint8Array(16);
  let pc = 0;
  const RISC = STATE_MATRIX.RISC;

  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_GUARDIAN;

  if (stable) {
    script[pc++] = RISC.OP_SIGNAL;
  } else {
    script[pc++] = RISC.OP_BUILD;
  }

  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;

  return script;
};

const buildGenome = (
  nextU32: () => number,
  mode: "replicator" | "architect" | "guardian",
): Uint8Array => {
  const genome = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    genome[i] = nextU32() & 0xFF;
  }
  if (mode === "replicator") {
    genome[0] = 0x80;
    genome[1] = 0x81;
  } else if (mode === "architect") {
    genome[0] = 0xA8;
    genome[1] = 0xA7;
  } else { // guardian
    genome[0] = 0xA7;
    genome[1] = 0x81;
  }
  return genome;
};

const variedResource = (
  base: number,
  nextU32: () => number,
  pctSwing = 0.15,
): number => {
  const span = Math.max(1, Math.floor(base * pctSwing));
  const delta = (nextU32() % (span * 2 + 1)) - span;
  return Math.max(1, base + delta);
};

const seedPosition = (
  index: number,
  count: number,
  nextU32: () => number,
): { x: number; y: number } => {
  const usableW = Math.max(1, WORLD_W - MARGIN * 2);
  const usableH = Math.max(1, WORLD_H - MARGIN * 2);
  const aspect = usableW / usableH;
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect)));
  const rows = Math.max(1, Math.ceil(count / cols));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const cellW = Math.max(1, Math.floor(usableW / cols));
  const cellH = Math.max(1, Math.floor(usableH / rows));

  const baseX = MARGIN + Math.floor(cellW * col + cellW / 2);
  const baseY = MARGIN + Math.floor(cellH * row + cellH / 2);

  const jitterSpanX = Math.max(0, Math.floor(cellW * 0.35));
  const jitterSpanY = Math.max(0, Math.floor(cellH * 0.35));
  const jitterX = jitterSpanX > 0
    ? (nextU32() % (jitterSpanX * 2 + 1)) - jitterSpanX
    : 0;
  const jitterY = jitterSpanY > 0
    ? (nextU32() % (jitterSpanY * 2 + 1)) - jitterSpanY
    : 0;

  return {
    x: clamp(baseX + jitterX, MARGIN, WORLD_W - MARGIN),
    y: clamp(baseY + jitterY, MARGIN, WORLD_H - MARGIN),
  };
};

const coldstartSeed = (config: ColdstartConfig): ColdstartResult => {
  if (!config.enabled) {
    return {
      attempted: false,
      skipped: true,
      reason: "COLDSTART_DISABLED",
      configuredCount: config.count,
      seeded: 0,
      replicators: 0,
      guardians: 0,
      architects: 0,
      seed: config.seed,
    };
  }

  if (config.count <= 0) {
    return {
      attempted: false,
      skipped: true,
      reason: "COLDSTART_COUNT_ZERO",
      configuredCount: config.count,
      seeded: 0,
      replicators: 0,
      guardians: 0,
      architects: 0,
      seed: config.seed,
    };
  }

  const existing = STATE_MATRIX.getActiveIndices().length;
  if (existing > 0) {
    return {
      attempted: false,
      skipped: true,
      reason: `WORLD_ALREADY_POPULATED_${existing}`,
      configuredCount: config.count,
      seeded: 0,
      replicators: 0,
      guardians: 0,
      architects: 0,
      seed: config.seed,
    };
  }

  const nextU32 = createLcg(config.seed);
  const replicatorTarget = Math.max(
    1,
    Math.round(config.count * config.replicatorRatio),
  );
  const guardianTarget = Math.max(
    1,
    Math.round(config.count * config.guardianRatio),
  );
  const architectTarget = Math.max(
    0,
    config.count - replicatorTarget - guardianTarget,
  );

  const replicatorScript = makeReplicatorScript();
  const architectEmitScript = makeArchitectScript(true);
  const architectSuppressScript = makeArchitectScript(false);
  const guardianStableScript = makeGuardianScript(true);
  const guardianRepairScript = makeGuardianScript(false);

  let seeded = 0;
  let replicators = 0;
  let guardians = 0;
  let architects = 0;

  for (let i = 0; i < config.count; i++) {
    const slot = STATE_MATRIX.findFreeSlot();
    if (slot < 0) break;

    let mode: "replicator" | "architect" | "guardian";
    if (i < replicatorTarget) {
      mode = "replicator";
    } else if (i < replicatorTarget + guardianTarget) {
      mode = "guardian";
    } else {
      mode = "architect";
    }

    const genome = buildGenome(nextU32, mode);
    const pos = seedPosition(i, config.count, nextU32);
    const energy = variedResource(config.energy, nextU32, 0.18);
    const resonance = variedResource(config.resonance, nextU32, 0.22);
    const id = (BigInt(config.seed >>> 0) << 32n) ^
      BigInt(i + 11) ^
      0xA17EA17En;

    let script: Uint8Array;
    let role: number;

    if (mode === "replicator") {
      script = replicatorScript;
      role = STATE_MATRIX.ROLE_PRODUCER;
      replicators++;
    } else if (mode === "guardian") {
      script = guardians % 2 === 0
        ? guardianStableScript
        : guardianRepairScript;
      role = STATE_MATRIX.ROLE_GUARDIAN;
      guardians++;
    } else {
      script = architects % 2 === 0
        ? architectEmitScript
        : architectSuppressScript;
      role = STATE_MATRIX.ROLE_ARCHITECT;
      architects++;
    }

    STATE_MATRIX.seedAtom(
      slot,
      id,
      pos.x,
      pos.y,
      energy,
      resonance,
      genome,
      script,
    );
    STATE_MATRIX.setRole(slot, role);
    seeded++;
  }

  return {
    attempted: true,
    skipped: false,
    reason: seeded > 0 ? "COLDSTART_SEEDED" : "COLDSTART_NO_FREE_SLOT",
    configuredCount: config.count,
    seeded,
    replicators,
    guardians,
    architects,
    seed: config.seed,
  };
};

export const COLDSTART_BOOTSTRAP = {
  seed: coldstartSeed,
};
