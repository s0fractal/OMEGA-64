// OMEGA-64 | AKASHA_CODEX.ts | Era 70: The Human Pheromone
// Persistent, human-readable archive of species, chronicles, and relics.

import { RISC, STATE_MATRIX } from "../00_substrate/mod.ts";
import type { GlyphSnapshot } from "../01_physics/mod.ts";
import { LLM_SYNAPSE } from "../05_exocortex/mod.ts";
import { LOGGER } from "../00_substrate/mod.ts";

const CODEX_ROOT = "codex";
const SPECIES_DIR = `${CODEX_ROOT}/species`;
const CHRONICLES_DIR = `${CODEX_ROOT}/chronicles`;
const RELICS_DIR = `${CODEX_ROOT}/relics`;
const INVARIANTS_DIR = `${CODEX_ROOT}/invariants`;

const STATE_FILE = `${CODEX_ROOT}/state.json`;
const SPECIES_INDEX_FILE = `${SPECIES_DIR}/index.json`;
const CHRONICLES_INDEX_FILE = `${CHRONICLES_DIR}/index.json`;
const RELICS_INDEX_FILE = `${RELICS_DIR}/index.json`;
const INVARIANTS_INDEX_FILE = `${INVARIANTS_DIR}/index.json`;
const DAEMON_INVARIANT_PATH = "./daemon_invariants.json";

const EPOCH_TICKS = 10_000;
const DOMINANCE_THRESHOLD = 0.05;
const MIN_EPOCHS_FOR_DISCOVERY = 3;
const RELIC_MIN_BLOCKS = 48;
const MAX_CHRONICLES = 512;
const MAX_RELICS = 256;
const MAX_RELIC_SIGNATURES = 512;
const MAX_INVARIANTS = 512;
const MAX_INVARIANT_SIGNATURES = 2048;
const INVARIANT_SYNC_INTERVAL_MS = 15_000;
const GLYPH_TRANSPORT_RECORD_INTERVAL = 256;

type SpeciesEntry = {
  id: string;
  genome: string;
  latinName: string;
  behavior: string;
  philosophy: string;
  dominantInstructions: string[];
  firstRecordedTick: number;
  lastDominantTick: number;
  dominantEpochs: number;
  peakShare: number;
  filePath: string;
  createdAt: string;
};

type ChronicleEntry = {
  id: string;
  tick: number;
  epoch: number;
  type: string;
  title: string;
  body: string;
  createdAt: string;
};

type RelicEntry = {
  id: string;
  tick: number;
  epoch: number;
  signature: string;
  size: number;
  bounds: { x0: number; y0: number; x1: number; y1: number };
  summary: string;
  snapshotPath: string;
  filePath: string;
  createdAt: string;
};

type InvariantSignal = {
  key: string;
  vector: string;
  weight: number;
  evidence: string[];
};

type InvariantEntry = {
  id: string;
  tick: number;
  epoch: number;
  center: string;
  signature: string;
  summary: string;
  dominantVector: string;
  signals: InvariantSignal[];
  source: string;
  filePath: string;
  createdAt: string;
  hormones: number[];
};

type DaemonInvariantFrame = {
  tick: number;
  epoch: number;
  center: string;
  signature: string;
  summary: string;
  invariants: InvariantSignal[];
  created_at: string;
  hormones: number[];
};

type CodexNarrative = {
  tick: number;
  epoch: number;
  mood: "ASCENDANT" | "STABLE" | "FRAGILE";
  title: string;
  summary: string;
  sharedCenter: string;
  speciesHighlights: Array<{
    latinName: string;
    genome: string;
    dominantEpochs: number;
    peakShare: number;
  }>;
  invariantHighlights: Array<{
    tick: number;
    epoch: number;
    center: string;
    signature: string;
    dominantVector: string;
    summary: string;
  }>;
  recentChronicles: Array<{
    tick: number;
    epoch: number;
    type: string;
    title: string;
  }>;
  relicStatus: string;
  glyphStatus: string;
  glyphRegime: string;
  glyphDominantRole: string;
  glyphSourceMode: string;
  metabolicPressure: number;
  daemonEffectStatus: string;
  daemonEffectLineage: string;
  daemonEffectDeltaBand: string;
  hormoneRegime: string;
  promptBridge: string;
  hippocampusRecall?: {
    tick: number;
    epoch: number;
    summary: string;
    distance: number;
    distanceType: string;
  };
};

type CodexState = {
  version: number;
  epochTicks: number;
  lastEpochScanTick: number;
  populationPeak: number;
  lastPopulation: number;
  lastMassExtinctionTick: number;
  lastDecree: string;
  lastDecreeTick: number;
  genomeEpochs: Record<string, number[]>;
  relicSignatures: string[];
  invariantSignatures: string[];
  lastGlyphTransportSignature: string;
  lastGlyphTransportTick: number;
  lastGlyphTransportRegime: string;
  lastGlyphTransportSummary: string;
  lastGlyphTransportDominantRole: string;
  lastGlyphTransportSourceMode: string;
  lastHormoneRegimeSignature: string;
  lastHormoneRegimeTick: number;
  lastHormoneRegimeSummary: string;
  lastDaemonEffectTick: number;
  lastDaemonEffectSummary: string;
  lastDaemonEffectLineage: string;
  lastDaemonEffectDeltaBand: string;
  lastSyntropy: number;
  lastImmunePurgeTick: number;
  lastImmunePurgeCount: number;
};

type GenomeStats = {
  genome: string;
  count: number;
  share: number;
  sampleIndices: number[];
};

type RelicCandidate = {
  cells: number[];
  bounds: { x0: number; y0: number; x1: number; y1: number };
  size: number;
  signatureBase: string;
};

type TaxonomyResult = {
  latinName: string;
  behavior: string;
  philosophy: string;
};

export type CodexLineageProfile = {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
  generatedAt: string;
};

const OPCODE_NAMES: Record<number, string> = {
  0x00: "NOP",
  0x01: "SET",
  0x02: "GET",
  0x03: "PUT",
  0x04: "ADD",
  0x05: "SUB",
  0x10: "JZ",
  0x11: "JNZ",
  0x12: "JMP",
  0x80: "REPLICATE",
  0x81: "SIGNAL",
  0x82: "BIND",
  0x83: "SHARE",
  0xA4: "PLUG",
  0xA5: "TENSEGRITY",
  0xA6: "COLLECTIVE",
  0xA7: "ROLE",
  [RISC.OP_BUILD]: "BUILD",
  [RISC.OP_SENSE]: "SENSE",
  [RISC.OP_WISDOM]: "WISDOM",
  [RISC.OP_RESONATE_KURAMOTO]: "RESONATE",
};

const fallbackState = (): CodexState => ({
  version: 1,
  epochTicks: EPOCH_TICKS,
  lastEpochScanTick: -1,
  populationPeak: 0,
  lastPopulation: 0,
  lastMassExtinctionTick: -1,
  lastDecree: "NONE",
  lastDecreeTick: -1,
  genomeEpochs: {},
  relicSignatures: [],
  invariantSignatures: [],
  lastGlyphTransportSignature: "dormant|none|none|low",
  lastGlyphTransportTick: -1,
  lastGlyphTransportRegime: "dormant",
  lastGlyphTransportSummary: "Glyph transport remains dormant.",
  lastGlyphTransportDominantRole: "none",
  lastGlyphTransportSourceMode: "none",
  lastHormoneRegimeSignature: "baseline",
  lastHormoneRegimeTick: -1,
  lastHormoneRegimeSummary: "Hormone lattice at baseline.",
  lastDaemonEffectTick: -1,
  lastDaemonEffectSummary: "No daemon effect contour recorded yet.",
  lastDaemonEffectLineage: "none",
  lastDaemonEffectDeltaBand: "none",
  lastSyntropy: 0,
  lastImmunePurgeTick: -1,
  lastImmunePurgeCount: 0,
});

let started = false;
let loadPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let pendingEpochScanTick = -1;
let state: CodexState = fallbackState();
let speciesIndex: SpeciesEntry[] = [];
let chronicleIndex: ChronicleEntry[] = [];
let relicIndex: RelicEntry[] = [];
let invariantIndex: InvariantEntry[] = [];
let lastInvariantSyncAt = 0;

const nowIso = (): string => new Date().toISOString();

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
    .toUpperCase();

const asArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value as T[] : [];
const asObject = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
const asFiniteNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const readJsonFile = async <T>(path: string, fallback: T): Promise<T> => {
  try {
    const raw = await Deno.readTextFile(path);
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJsonFile = async (path: string, value: unknown): Promise<void> => {
  await Deno.writeTextFile(path, JSON.stringify(value, null, 2));
};

const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 64) || "unnamed";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const stableId = (kind: string, tick: number, entropy: string): string => {
  const compact = entropy.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "seed";
  return `${kind}-${tick}-${compact}`;
};

const opcodeLength = (op: number): number => {
  if (
    op === 0x01 || op === 0x02 || op === 0x03 || op === 0x04 || op === 0x05 ||
    op === 0x10 || op === 0x11 || op === 0x12 || op === 0xA7 || op === 0x83 ||
    op === 0xA8 || op === 0xA9 || op === 0xA4
  ) return 3;
  if (op === 0xA5 || op === 0xA6) return 4;
  return 1;
};

const summarizeInstructions = (sampleIndices: number[]): string[] => {
  const counts = new Map<string, number>();
  for (const idx of sampleIndices) {
    const script = STATE_MATRIX.getInstructions(idx);
    let pc = 0;
    let steps = 0;
    while (pc >= 0 && pc < 64 && steps < 16) {
      const op = script[pc];
      if (op === 0x00) break;
      const name = OPCODE_NAMES[op] ?? `OP_${op.toString(16).toUpperCase()}`;
      counts.set(name, (counts.get(name) ?? 0) + 1);
      pc += opcodeLength(op);
      steps++;
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);
};

const speciesNameForGenome = (genome: string): string => {
  const hit = speciesIndex.find((entry) => entry.genome === genome);
  return hit ? hit.latinName : `Genome ${genome.slice(0, 8)}`;
};

const inferNarrativeMood = (): "ASCENDANT" | "STABLE" | "FRAGILE" => {
  if (state.populationPeak >= 100) {
    const collapse = Math.floor(state.populationPeak * 0.2);
    if (state.lastPopulation <= collapse) return "FRAGILE";
  }
  if (
    chronicleIndex[0]?.type === "species_discovery" ||
    chronicleIndex[0]?.type === "market_resolution"
  ) {
    return "ASCENDANT";
  }
  return "STABLE";
};

const narrativeTitleForMood = (mood: CodexNarrative["mood"]): string => {
  if (mood === "FRAGILE") return "Lattice in Recovery Arc";
  if (mood === "ASCENDANT") return "Lattice in Expansion Arc";
  return "Lattice in Coherence Arc";
};

type GlyphTransportEvidence = {
  active: boolean;
  regime: string;
  dominantRole: string;
  sourceMode: string;
  amplitudeBand: string;
  signature: string;
  title: string;
  body: string;
  summary: string;
  metabolicPressure: number;
};

const dominantGlyphRole = (snapshot: GlyphSnapshot): string => {
  const counters = {
    neutral: snapshot.atomRolePheromone.neutral +
      snapshot.atomRolePlasmid.neutral,
    producer: snapshot.atomRolePheromone.producer +
      snapshot.atomRolePlasmid.producer,
    guardian: snapshot.atomRolePheromone.guardian +
      snapshot.atomRolePlasmid.guardian,
    architect: snapshot.atomRolePheromone.architect +
      snapshot.atomRolePlasmid.architect,
    parasite: snapshot.atomRolePheromone.parasite +
      snapshot.atomRolePlasmid.parasite,
  };
  const entries = Object.entries(counters).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[1] && entries[0][1] > 0 ? entries[0][0] : "none";
};

const glyphAmplitudeBand = (snapshot: GlyphSnapshot): string => {
  if (snapshot.totalAmplitude >= 4096 || snapshot.maxAmplitude >= 512) {
    return "surged";
  }
  if (snapshot.totalAmplitude >= 1024 || snapshot.maxAmplitude >= 256) {
    return "charged";
  }
  if (snapshot.totalAmplitude > 0) return "warm";
  return "low";
};

const glyphSourceMode = (snapshot: GlyphSnapshot): string => {
  const atomSeeds = snapshot.internalAtomPheromoneSeeds +
    snapshot.internalAtomPlasmidSeeds;
  const substrateSeeds = snapshot.internalSignalSeeds +
    snapshot.internalMemorySeeds;
  if (atomSeeds > 0 && substrateSeeds > 0) return "hybrid";
  if (atomSeeds > 0) return "actor_secretion";
  if (substrateSeeds > 0) return "substrate_leak";
  return "none";
};

const glyphRegime = (snapshot: GlyphSnapshot): string => {
  if (snapshot.activeCells <= 0 || snapshot.totalAmplitude <= 0) {
    return "dormant";
  }
  const pheromoneBias = snapshot.pheromoneCells +
    snapshot.internalAtomPheromoneSeeds;
  const plasmidBias = snapshot.plasmidCells + snapshot.internalAtomPlasmidSeeds;
  if (pheromoneBias >= plasmidBias * 2 && pheromoneBias > 0) {
    return "pheromone_canopy";
  }
  if (plasmidBias >= pheromoneBias * 2 && plasmidBias > 0) {
    return "plasmid_surge";
  }
  if (
    snapshot.internalAtomPheromoneSeeds > 0 ||
    snapshot.internalAtomPlasmidSeeds > 0
  ) {
    return "agent_flux";
  }
  return "hybrid_field";
};

const titleCase = (value: string): string =>
  value.split("_").map((part) =>
    part.length > 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part
  ).join(" ");

const daemonEffectDeltaBand = (
  deltaPopulation: number,
  deltaAvgEnergy: number,
  deltaNeuralCoherence: number,
): string => {
  if (
    deltaPopulation >= 2 || deltaAvgEnergy >= 6 || deltaNeuralCoherence >= 0.12
  ) {
    return "amplifying";
  }
  if (
    deltaPopulation <= -2 || deltaAvgEnergy <= -6 ||
    deltaNeuralCoherence <= -0.12
  ) {
    return "dissipative";
  }
  return "stabilizing";
};

const buildGlyphTransportEvidence = (
  tick: number,
  snapshot: GlyphSnapshot,
): GlyphTransportEvidence => {
  const regime = glyphRegime(snapshot);
  const dominantRole = dominantGlyphRole(snapshot);
  const sourceMode = glyphSourceMode(snapshot);
  const amplitudeBand = glyphAmplitudeBand(snapshot);
  const signature = `${regime}|${dominantRole}|${sourceMode}|${amplitudeBand}`;
  const active = snapshot.activeCells > 0 ||
    snapshot.internalSignalSeeds > 0 ||
    snapshot.internalMemorySeeds > 0 ||
    snapshot.internalAtomPheromoneSeeds > 0 ||
    snapshot.internalAtomPlasmidSeeds > 0;
  const metabolicPressure = clamp(snapshot.totalAmplitude / 16384, 0, 1);
  const title = `Glyph Transport Regime: ${titleCase(regime)}`;
  const body =
    `Tick ${tick} registered ${titleCase(regime)} with dominant role ${
      titleCase(dominantRole)
    } ` +
    `via ${titleCase(sourceMode)}. Active cells=${snapshot.activeCells}, ` +
    `pheromone=${snapshot.pheromoneCells}, plasmid=${snapshot.plasmidCells}, ` +
    `totalAmplitude=${snapshot.totalAmplitude}, maxAmplitude=${snapshot.maxAmplitude}, ` +
    `atomPheromone=${snapshot.internalAtomPheromoneSeeds}, atomPlasmid=${snapshot.internalAtomPlasmidSeeds}.`;
  const summary =
    `Glyph regime ${titleCase(regime)} | dominant role ${
      titleCase(dominantRole)
    } | ` +
    `source ${titleCase(sourceMode)} | amplitude ${amplitudeBand} | pressure ${
      metabolicPressure.toFixed(3)
    }.`;
  return {
    active,
    regime,
    dominantRole,
    sourceMode,
    amplitudeBand,
    signature,
    title,
    body,
    summary,
    metabolicPressure,
  };
};

// ── Stage 7.2: Hormone Regime Evidence ──────────────────────────────────────
// id 0=entropy_pressure 1=time_viscosity 2=aggression
//    3=replication_bias  4=repair_drive   5=mutation_friction

const HORMONE_RECORD_INTERVAL = 512;

type HormoneRegimeEvidence = {
  signature: string;
  title: string;
  body: string;
  summary: string;
};

const hormoneRegimeLabel = (h: number[]): string => {
  if (h[0] > 1500) return "high_entropy";
  if (h[2] > 1500) return "aggressive_bloom";
  if (h[4] > 1500) return "repair_surge";
  if (h[1] > 1500) return "viscous_stasis";
  if (h[0] < 256 && h[2] < 256 && h[4] < 256) return "dormant_baseline";
  return "balanced_homeostasis";
};

const buildHormoneRegimeEvidence = (tick: number): HormoneRegimeEvidence => {
  const h = [0, 1, 2, 3, 4, 5].map((id) => STATE_MATRIX.getHormone(id));
  const regime = hormoneRegimeLabel(h);
  // Coarse 4-band signature per hormone: A=0-511 B=512-1023 C=1024-1535 D=1536-2048
  const sig = h.map((v) => String.fromCharCode(65 + Math.min(3, v >> 9))).join(
    "",
  );
  const signature = `${regime}|${sig}`;
  const [ep, tv, ag, rb, rd, mf] = h;
  const title = `Hormone Regime: ${titleCase(regime)}`;
  const body =
    `Tick ${tick} | entropy_pressure=${ep} time_viscosity=${tv} aggression=${ag} ` +
    `replication_bias=${rb} repair_drive=${rd} mutation_friction=${mf}. ` +
    `Regime: '${regime}'.`;
  const summary = `Hormone regime ${
    titleCase(regime)
  } | entropy=${ep} aggr=${ag} repair=${rd}.`;
  return { signature, title, body, summary };
};

const parseInvariantSignal = (value: unknown): InvariantSignal | null => {
  const node = asObject(value);
  if (!node) return null;
  const key = typeof node.key === "string" ? node.key.trim() : "";
  const vector = typeof node.vector === "string" ? node.vector.trim() : "";
  if (key.length === 0 || vector.length === 0) return null;
  const evidence = asArray<unknown>(node.evidence)
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(0, 8);
  return {
    key,
    vector,
    weight: Math.max(0, Math.min(1, asFiniteNumber(node.weight, 0))),
    evidence,
  };
};

const parseDaemonInvariantFrame = (
  value: unknown,
): DaemonInvariantFrame | null => {
  const node = asObject(value);
  if (!node) return null;
  const signatureRaw = typeof node.signature === "string"
    ? node.signature.trim().toLowerCase()
    : "";
  if (!/^[0-9a-f]{6,64}$/u.test(signatureRaw)) return null;
  const tick = Math.max(0, Math.floor(asFiniteNumber(node.tick, 0)));
  const inferredEpoch = Math.floor(tick / EPOCH_TICKS);
  const epoch = Math.max(
    0,
    Math.floor(asFiniteNumber(node.epoch, inferredEpoch)),
  );
  const center =
    typeof node.center === "string" && node.center.trim().length > 0
      ? node.center.trim()
      : "tick.exists";
  const summary =
    typeof node.summary === "string" && node.summary.trim().length > 0
      ? node.summary.trim()
      : `center=${center} | signature=${signatureRaw.slice(0, 8)}`;

  const parsedSignals = asArray<unknown>(node.invariants)
    .map((entry) => parseInvariantSignal(entry))
    .filter((entry): entry is InvariantSignal => entry !== null)
    .slice(0, 8);
  const signals = parsedSignals.length > 0 ? parsedSignals : [{
    key: "center_anchor",
    vector: center,
    weight: 0.5,
    evidence: [summary.slice(0, 96)],
  }];

  const createdAt = typeof node.created_at === "string" &&
      node.created_at.trim().length > 0
    ? node.created_at.trim()
    : nowIso();

  const hormones = asArray<unknown>(node.hormones)
    .map((v) => asFiniteNumber(v, 0))
    .slice(0, 6);
  while (hormones.length < 6) hormones.push(0);

  return {
    tick,
    epoch,
    center,
    signature: signatureRaw,
    summary,
    invariants: signals,
    created_at: createdAt,
    hormones,
  };
};

const dominantInvariantVector = (signals: InvariantSignal[]): string => {
  if (signals.length === 0) return "none";
  const sorted = [...signals].sort((a, b) => b.weight - a.weight);
  return sorted[0]?.vector ?? "none";
};

const recordInvariantFrame = async (
  frame: DaemonInvariantFrame,
): Promise<boolean> => {
  if (state.invariantSignatures.includes(frame.signature)) return false;
  const id = stableId("invariant", frame.tick, frame.signature);
  const dominantVector = dominantInvariantVector(frame.invariants);
  const filePath = `${INVARIANTS_DIR}/${id}.md`;
  const entry: InvariantEntry = {
    id,
    tick: frame.tick,
    epoch: frame.epoch,
    center: frame.center,
    signature: frame.signature,
    summary: frame.summary,
    dominantVector,
    signals: frame.invariants,
    source: DAEMON_INVARIANT_PATH,
    filePath,
    createdAt: frame.created_at,
    hormones: frame.hormones,
  };

  invariantIndex.unshift(entry);
  if (invariantIndex.length > MAX_INVARIANTS) {
    invariantIndex.length = MAX_INVARIANTS;
  }

  state.invariantSignatures.push(frame.signature);
  if (state.invariantSignatures.length > MAX_INVARIANT_SIGNATURES) {
    state.invariantSignatures = state.invariantSignatures.slice(
      -MAX_INVARIANT_SIGNATURES,
    );
  }

  const signalRows = entry.signals.map((signal) => {
    const evidence = signal.evidence.length > 0
      ? ` | evidence: ${signal.evidence.join("; ")}`
      : "";
    return `- ${signal.key}: ${signal.vector} (w=${
      signal.weight.toFixed(2)
    })${evidence}`;
  }).join("\n");

  await Deno.writeTextFile(
    filePath,
    [
      `# Invariant ${entry.id}`,
      "",
      `- Tick: ${entry.tick}`,
      `- Epoch: ${entry.epoch}`,
      `- Center: ${entry.center}`,
      `- Signature: ${entry.signature}`,
      `- Dominant Vector: ${entry.dominantVector}`,
      `- Source: ${entry.source}`,
      `- Recorded: ${entry.createdAt}`,
      `- Hormones: [${entry.hormones.join(", ")}]`,
      "",
      "## Summary",
      entry.summary,
      "",
      "## Signals",
      signalRows || "- none",
      "",
    ].join("\n"),
  );

  return true;
};

const syncDaemonInvariants = async (force = false): Promise<void> => {
  await ensureStorage();
  const now = Date.now();
  if (!force && now - lastInvariantSyncAt < INVARIANT_SYNC_INTERVAL_MS) return;
  lastInvariantSyncAt = now;

  const daemonFrames = asArray<unknown>(
    await readJsonFile<unknown[]>(DAEMON_INVARIANT_PATH, []),
  )
    .map((entry) => parseDaemonInvariantFrame(entry))
    .filter((entry): entry is DaemonInvariantFrame => entry !== null);
  if (daemonFrames.length === 0) return;

  let inserted = 0;
  for (const frame of daemonFrames) {
    if (await recordInvariantFrame(frame)) inserted++;
  }

  if (inserted > 0) {
    invariantIndex.sort((a, b) => b.tick - a.tick);
    if (invariantIndex.length > MAX_INVARIANTS) {
      invariantIndex.length = MAX_INVARIANTS;
    }
    await persistIndexes();
    LOGGER.info(
      `📚 [CODEX] synced ${inserted} invariant frame(s) from daemon memory`,
    );
  }
};

const ensureStorage = async (): Promise<void> => {
  if (!loadPromise) {
    loadPromise = (async () => {
      await Deno.mkdir(SPECIES_DIR, { recursive: true });
      await Deno.mkdir(CHRONICLES_DIR, { recursive: true });
      await Deno.mkdir(RELICS_DIR, { recursive: true });
      await Deno.mkdir(INVARIANTS_DIR, { recursive: true });

      state = await readJsonFile<CodexState>(STATE_FILE, fallbackState());
      if (typeof state.version !== "number") {
        state = fallbackState();
      }
      state.epochTicks = EPOCH_TICKS;
      state.genomeEpochs = state.genomeEpochs ?? {};
      state.relicSignatures = asArray<string>(state.relicSignatures).slice(
        -MAX_RELIC_SIGNATURES,
      );
      state.invariantSignatures = asArray<string>(state.invariantSignatures)
        .map((sig) => sig.trim().toLowerCase())
        .filter((sig) => /^[0-9a-f]{6,64}$/u.test(sig))
        .slice(-MAX_INVARIANT_SIGNATURES);
      state.lastGlyphTransportSignature =
        typeof state.lastGlyphTransportSignature === "string" &&
          state.lastGlyphTransportSignature.trim().length > 0
          ? state.lastGlyphTransportSignature
          : fallbackState().lastGlyphTransportSignature;
      state.lastGlyphTransportTick = Math.max(
        -1,
        Math.floor(asFiniteNumber(state.lastGlyphTransportTick, -1)),
      );
      state.lastGlyphTransportRegime =
        typeof state.lastGlyphTransportRegime === "string" &&
          state.lastGlyphTransportRegime.trim().length > 0
          ? state.lastGlyphTransportRegime
          : fallbackState().lastGlyphTransportRegime;
      state.lastGlyphTransportSummary =
        typeof state.lastGlyphTransportSummary === "string" &&
          state.lastGlyphTransportSummary.trim().length > 0
          ? state.lastGlyphTransportSummary
          : fallbackState().lastGlyphTransportSummary;
      state.lastGlyphTransportDominantRole =
        typeof state.lastGlyphTransportDominantRole === "string" &&
          state.lastGlyphTransportDominantRole.trim().length > 0
          ? state.lastGlyphTransportDominantRole
          : fallbackState().lastGlyphTransportDominantRole;
      state.lastGlyphTransportSourceMode =
        typeof state.lastGlyphTransportSourceMode === "string" &&
          state.lastGlyphTransportSourceMode.trim().length > 0
          ? state.lastGlyphTransportSourceMode
          : fallbackState().lastGlyphTransportSourceMode;
      state.lastDaemonEffectTick = Math.max(
        -1,
        Math.floor(asFiniteNumber(state.lastDaemonEffectTick, -1)),
      );
      state.lastDaemonEffectSummary =
        typeof state.lastDaemonEffectSummary === "string" &&
          state.lastDaemonEffectSummary.trim().length > 0
          ? state.lastDaemonEffectSummary
          : fallbackState().lastDaemonEffectSummary;
      state.lastDaemonEffectLineage =
        typeof state.lastDaemonEffectLineage === "string" &&
          state.lastDaemonEffectLineage.trim().length > 0
          ? state.lastDaemonEffectLineage
          : fallbackState().lastDaemonEffectLineage;
      state.lastDaemonEffectDeltaBand =
        typeof state.lastDaemonEffectDeltaBand === "string" &&
          state.lastDaemonEffectDeltaBand.trim().length > 0
          ? state.lastDaemonEffectDeltaBand
          : fallbackState().lastDaemonEffectDeltaBand;
      state.lastImmunePurgeTick = Math.max(
        -1,
        Math.floor(asFiniteNumber(state.lastImmunePurgeTick, -1)),
      );
      state.lastImmunePurgeCount = Math.max(
        0,
        Math.floor(asFiniteNumber(state.lastImmunePurgeCount, 0)),
      );

      speciesIndex = asArray<SpeciesEntry>(
        await readJsonFile<SpeciesEntry[]>(SPECIES_INDEX_FILE, []),
      );
      chronicleIndex = asArray<ChronicleEntry>(
        await readJsonFile<ChronicleEntry[]>(CHRONICLES_INDEX_FILE, []),
      ).sort((a, b) => b.tick - a.tick);
      relicIndex = asArray<RelicEntry>(
        await readJsonFile<RelicEntry[]>(RELICS_INDEX_FILE, []),
      ).sort((a, b) => b.tick - a.tick);
      invariantIndex = asArray<InvariantEntry>(
        await readJsonFile<InvariantEntry[]>(INVARIANTS_INDEX_FILE, []),
      )
        .filter((entry) => typeof entry.signature === "string")
        .map((entry) => ({
          ...entry,
          tick: Math.max(0, Math.floor(asFiniteNumber(entry.tick, 0))),
          epoch: Math.max(0, Math.floor(asFiniteNumber(entry.epoch, 0))),
          center:
            typeof entry.center === "string" && entry.center.trim().length > 0
              ? entry.center.trim()
              : "tick.exists",
          summary: typeof entry.summary === "string" ? entry.summary : "",
          dominantVector: typeof entry.dominantVector === "string"
            ? entry.dominantVector
            : "none",
          signature: entry.signature.trim().toLowerCase(),
          signals: asArray<InvariantSignal>(entry.signals).slice(0, 8),
        }))
        .sort((a, b) => b.tick - a.tick);
      if (state.invariantSignatures.length === 0 && invariantIndex.length > 0) {
        state.invariantSignatures = invariantIndex
          .map((entry) => entry.signature)
          .slice(0, MAX_INVARIANT_SIGNATURES);
      }
    })();
  }
  await loadPromise;
};

const persistState = async (): Promise<void> => {
  await writeJsonFile(STATE_FILE, state);
};

const persistIndexes = async (): Promise<void> => {
  await Promise.all([
    writeJsonFile(SPECIES_INDEX_FILE, speciesIndex),
    writeJsonFile(CHRONICLES_INDEX_FILE, chronicleIndex),
    writeJsonFile(RELICS_INDEX_FILE, relicIndex),
    writeJsonFile(INVARIANTS_INDEX_FILE, invariantIndex),
    persistState(),
  ]);
};

const enqueueWrite = (job: () => Promise<void>): void => {
  writeQueue = writeQueue.then(job).catch((err) => {
    LOGGER.warn(`📚 [CODEX] write queue error: ${String(err)}`);
  });
};

const appendChronicle = async (
  tick: number,
  type: string,
  title: string,
  body: string,
): Promise<void> => {
  const epoch = Math.floor(tick / EPOCH_TICKS);
  const id = stableId("chronicle", tick, `${type}-${title}`);
  const entry: ChronicleEntry = {
    id,
    tick,
    epoch,
    type,
    title,
    body,
    createdAt: nowIso(),
  };
  chronicleIndex.unshift(entry);
  if (chronicleIndex.length > MAX_CHRONICLES) {
    chronicleIndex.length = MAX_CHRONICLES;
  }

  const path = `${CHRONICLES_DIR}/${id}.md`;
  const markdown = [
    `# ${title}`,
    "",
    `- Tick: ${tick}`,
    `- Epoch: ${epoch}`,
    `- Type: ${type}`,
    `- Recorded: ${entry.createdAt}`,
    "",
    body,
    "",
  ].join("\n");
  await Deno.writeTextFile(path, markdown);
  await persistIndexes();
};

const collectGenomeStats = (): {
  population: number;
  dominant: GenomeStats[];
} => {
  const active = STATE_MATRIX.getActiveIndices();
  const population = active.length;
  if (population === 0) return { population, dominant: [] };

  const statsMap = new Map<
    string,
    { count: number; sampleIndices: number[] }
  >();
  for (const idx of active) {
    const genome = toHex(STATE_MATRIX.getLogic(idx));
    const slot = statsMap.get(genome) ?? { count: 0, sampleIndices: [] };
    slot.count++;
    if (slot.sampleIndices.length < 16) slot.sampleIndices.push(idx);
    statsMap.set(genome, slot);
  }

  const dominant: GenomeStats[] = [];
  for (const [genome, stat] of statsMap.entries()) {
    const share = stat.count / population;
    if (share >= DOMINANCE_THRESHOLD) {
      dominant.push({
        genome,
        count: stat.count,
        share,
        sampleIndices: stat.sampleIndices,
      });
    }
  }
  dominant.sort((a, b) => b.share - a.share);
  return { population, dominant };
};

const fallbackTaxonomy = (
  genome: string,
  dominantInstructions: string[],
  hormoneRegime: string,
): TaxonomyResult => {
  const genusMap: Record<string, string[]> = {
    "high_entropy": ["Metabolix", "Entropia", "Vortex"],
    "aggressive_bloom": ["Agressor", "Praedo", "Bellum"],
    "repair_surge": ["Sano", "Medicus", "Regen"],
    "viscous_stasis": ["Stasix", "Tenax", "Fixus"],
    "dormant_baseline": ["Structura", "Mycelia", "Nexa"],
    "balanced_homeostasis": ["Equil", "Harmonia", "Lattice"],
  };
  const genusList = genusMap[hormoneRegime] || genusMap["dormant_baseline"];
  const species = [
    "stabilis",
    "migrans",
    "tenax",
    "resonans",
    "noctis",
    "lucens",
    "silentis",
    "orbitae",
  ];
  const a = Number.parseInt(genome.slice(0, 2), 16) % genusList.length;
  const b = Number.parseInt(genome.slice(2, 4), 16) % species.length;
  const stack = dominantInstructions.length > 0
    ? dominantInstructions.join(", ")
    : "adaptive scripts";
  return {
    latinName: `${genusList[a]} ${species[b]}`,
    behavior: `Dominant lineage specializing in ${stack} under ${
      titleCase(hormoneRegime)
    } conditions.`,
    philosophy:
      `Survival through iterative structure influenced by ${hormoneRegime} pressure.`,
  };
};

const discoverSpecies = async (
  tick: number,
  stat: GenomeStats,
  epochs: number,
): Promise<void> => {
  if (speciesIndex.some((entry) => entry.genome === stat.genome)) return;

  const dominantInstructions = summarizeInstructions(stat.sampleIndices);
  // Stage 7.4: Fetch current hormone regime label
  const h = [0, 1, 2, 3, 4, 5].map((id) => STATE_MATRIX.getHormone(id));
  const regime = hormoneRegimeLabel(h);

  const fallback = fallbackTaxonomy(stat.genome, dominantInstructions, regime);
  let taxonomy: TaxonomyResult = fallback;
  try {
    const llmTaxonomy = await LLM_SYNAPSE.generateSpeciesTaxonomy({
      genome: stat.genome,
      dominantInstructions,
      dominanceShare: stat.share,
      epochs,
      hormoneRegime: regime,
    });
    if (
      llmTaxonomy.latinName.trim().length > 0 &&
      llmTaxonomy.behavior.trim().length > 0
    ) {
      taxonomy = llmTaxonomy;
    }
  } catch {
    taxonomy = fallback;
  }

  const id = stableId("species", tick, stat.genome);
  const slug = slugify(taxonomy.latinName);
  const filePath = `${SPECIES_DIR}/${slug}_${stat.genome.slice(0, 8)}.md`;
  const entry: SpeciesEntry = {
    id,
    genome: stat.genome,
    latinName: taxonomy.latinName,
    behavior: taxonomy.behavior,
    philosophy: taxonomy.philosophy,
    dominantInstructions,
    firstRecordedTick: tick,
    lastDominantTick: tick,
    dominantEpochs: epochs,
    peakShare: stat.share,
    filePath,
    createdAt: nowIso(),
  };

  speciesIndex.unshift(entry);
  await Deno.writeTextFile(
    filePath,
    [
      `# ${entry.latinName}`,
      "",
      `- Genome: \`${entry.genome}\``,
      `- First Recorded Tick: ${entry.firstRecordedTick}`,
      `- Dominant Epochs: ${entry.dominantEpochs}`,
      `- Peak Share: ${(entry.peakShare * 100).toFixed(2)}%`,
      `- Dominant Instructions: ${
        entry.dominantInstructions.join(", ") || "n/a"
      }`,
      `- Hormone Regime: ${titleCase(regime)}`,
      `- Created At: ${entry.createdAt}`,
      "",
      "## Behavioral Profile",
      entry.behavior,
      "",
      "## Structural Philosophy",
      entry.philosophy,
      "",
    ].join("\n"),
  );

  await appendChronicle(
    tick,
    "species_discovery",
    `New Species Recorded: ${entry.latinName} (${titleCase(regime)})`,
    `Genome ${entry.genome} crossed ${
      (stat.share * 100).toFixed(2)
    }% population share under ${
      titleCase(regime)
    } conditions, persisting across ${epochs} macro-epochs.`,
  );
};

const typeSymbol = (value: number): string => {
  if (value === 0) return ".";
  if (value === 1) return "w";
  if (value === 2) return "n";
  if (value === 3) return "d";
  if (value === 4) return "s";
  if (value === 5) return "k";
  if (value === 6) return "c";
  return "x";
};

const hashHex = async (input: string): Promise<string> => {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
};

const findRelicCandidate = (): RelicCandidate | null => {
  const grid = STATE_MATRIX.structureGrid;
  const visited = new Uint8Array(140 * 80);
  const active = STATE_MATRIX.getActiveIndices();
  const occupied = new Uint8Array(140 * 80);
  for (const idx of active) {
    const x = STATE_MATRIX.getX(idx);
    const y = STATE_MATRIX.getY(idx);
    const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 10);
    const gy = Math.floor(Math.max(0, Math.min(799, y)) / 10);
    occupied[gy * 140 + gx] = 1;
  }

  let best: RelicCandidate | null = null;
  const queue = new Int32Array(140 * 80);

  for (let i = 0; i < 140 * 80; i++) {
    const type = grid[i] & 0xFF;
    if (type === 0 || visited[i] === 1) continue;

    let head = 0;
    let tail = 0;
    queue[tail++] = i;
    visited[i] = 1;
    const cells: number[] = [];
    let x0 = 139;
    let y0 = 79;
    let x1 = 0;
    let y1 = 0;
    let hasOccupant = occupied[i] === 1;

    while (head < tail) {
      const cur = queue[head++];
      cells.push(cur);
      const cx = cur % 140;
      const cy = Math.floor(cur / 140);
      if (cx < x0) x0 = cx;
      if (cy < y0) y0 = cy;
      if (cx > x1) x1 = cx;
      if (cy > y1) y1 = cy;

      const nbs = [cur - 140, cur + 140, cur - 1, cur + 1];
      for (const n of nbs) {
        if (n < 0 || n >= 140 * 80) continue;
        const nx = n % 140;
        const ny = Math.floor(n / 140);
        if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
        if (visited[n] === 1) continue;
        if ((grid[n] & 0xFF) === 0) continue;
        visited[n] = 1;
        queue[tail++] = n;
        if (occupied[n] === 1) hasOccupant = true;
      }
    }

    if (hasOccupant) continue;
    if (cells.length < RELIC_MIN_BLOCKS) continue;

    const signatureBase = cells
      .slice(0, 512)
      .map((cell) => `${cell}:${grid[cell] & 0xFF}`)
      .join("|");

    const candidate: RelicCandidate = {
      cells,
      bounds: { x0, y0, x1, y1 },
      size: cells.length,
      signatureBase,
    };
    if (!best || candidate.size > best.size) best = candidate;
  }

  return best;
};

const recordRelic = async (tick: number): Promise<void> => {
  const candidate = findRelicCandidate();
  if (!candidate) return;

  const signature = await hashHex(candidate.signatureBase);
  if (state.relicSignatures.includes(signature)) return;

  const { x0, y0, x1, y1 } = candidate.bounds;
  const rows: string[] = [];
  for (let y = y0; y <= y1; y++) {
    let row = "";
    for (let x = x0; x <= x1; x++) {
      const idx = y * 140 + x;
      row += typeSymbol(STATE_MATRIX.structureGrid[idx] & 0xFF);
    }
    rows.push(row);
  }

  const hints = [
    `Relic bounds: (${x0},${y0})-(${x1},${y1})`,
    `Relic size: ${candidate.size} blocks`,
    `Symbol map: ${rows.slice(0, 8).join(" / ")}`,
  ];
  const report = await LLM_SYNAPSE.generateArchaeologicalReport(hints);

  const id = stableId("relic", tick, signature);
  const snapshotPath = `${RELICS_DIR}/${id}.json`;
  const filePath = `${RELICS_DIR}/${id}.md`;
  const epoch = Math.floor(tick / EPOCH_TICKS);
  const entry: RelicEntry = {
    id,
    tick,
    epoch,
    signature,
    size: candidate.size,
    bounds: candidate.bounds,
    summary: report,
    snapshotPath,
    filePath,
    createdAt: nowIso(),
  };

  await writeJsonFile(snapshotPath, {
    tick,
    epoch,
    signature,
    bounds: candidate.bounds,
    rows,
  });
  await Deno.writeTextFile(
    filePath,
    [
      `# Relic ${id}`,
      "",
      `- Tick: ${tick}`,
      `- Epoch: ${epoch}`,
      `- Size: ${candidate.size} blocks`,
      `- Bounds: (${x0},${y0})-(${x1},${y1})`,
      `- Signature: ${signature}`,
      "",
      "## Archaeological Note",
      report,
      "",
      "## Snapshot",
      `JSON: ${snapshotPath}`,
      "",
    ].join("\n"),
  );

  relicIndex.unshift(entry);
  if (relicIndex.length > MAX_RELICS) relicIndex.length = MAX_RELICS;
  state.relicSignatures.push(signature);
  if (state.relicSignatures.length > MAX_RELIC_SIGNATURES) {
    state.relicSignatures = state.relicSignatures.slice(-MAX_RELIC_SIGNATURES);
  }

  await appendChronicle(
    tick,
    "relic_discovery",
    "Archaeological Relic Cataloged",
    `A dormant structure of ${candidate.size} blocks was archived as ${id}.`,
  );
};

const runEpochScan = async (tick: number): Promise<void> => {
  await ensureStorage();
  if (tick <= state.lastEpochScanTick) return;

  const epoch = Math.floor(tick / EPOCH_TICKS);
  const { population, dominant } = collectGenomeStats();
  state.lastPopulation = population;
  if (population > state.populationPeak) state.populationPeak = population;

  for (const stat of dominant) {
    const seen = state.genomeEpochs[stat.genome] ?? [];
    if (!seen.includes(epoch)) seen.push(epoch);
    state.genomeEpochs[stat.genome] = seen.sort((a, b) => a - b).slice(-16);

    const known = speciesIndex.find((entry) => entry.genome === stat.genome);
    if (known) {
      known.lastDominantTick = tick;
      known.dominantEpochs = state.genomeEpochs[stat.genome].length;
      if (stat.share > known.peakShare) known.peakShare = stat.share;
      if (known.dominantInstructions.length === 0) {
        known.dominantInstructions = summarizeInstructions(stat.sampleIndices);
      }
      continue;
    }

    if (state.genomeEpochs[stat.genome].length >= MIN_EPOCHS_FOR_DISCOVERY) {
      await discoverSpecies(
        tick,
        stat,
        state.genomeEpochs[stat.genome].length,
      );
    }
  }

  await recordRelic(tick);
  state.lastEpochScanTick = tick;
  await persistIndexes();
};

export const AKASHA_CODEX = {
  // Test/Internal surface (Stage 7.4)
  _discoverSpecies: discoverSpecies,
  _fallbackTaxonomy: fallbackTaxonomy,
  _getSpeciesIndex: () => speciesIndex,
  _getChronicleIndex: () => chronicleIndex,

  appendObserverCommentary: async (tick: number, epoch: number, narrative: string): Promise<void> => {
    await ensureStorage();
    await appendChronicle(tick, "observer_commentary", `Psychohistorian's Log - Epoch ${epoch}`, narrative);
  },

  start: async (): Promise<void> => {
    if (started) return;
    started = true;
    await ensureStorage();
    await syncDaemonInvariants(true);
    LOGGER.info(
      `📚 [CODEX] activated at ./${CODEX_ROOT} (epochTicks=${EPOCH_TICKS})`,
    );
  },
  isStarted: (): boolean => started,
  observePulse: (
    tick: number,
    activePopulation: number,
    glyphTransport?: GlyphSnapshot,
    syntropy?: number,
  ): void => {
    if (!started) return;
    state.lastPopulation = activePopulation;
    if (syntropy !== undefined) state.lastSyntropy = syntropy;
    if (activePopulation > state.populationPeak) {
      state.populationPeak = activePopulation;
    }

    if (glyphTransport) {
      const glyphEvidence = buildGlyphTransportEvidence(tick, glyphTransport);
      state.lastGlyphTransportRegime = glyphEvidence.regime;
      state.lastGlyphTransportSummary = glyphEvidence.summary;
      state.lastGlyphTransportDominantRole = glyphEvidence.dominantRole;
      state.lastGlyphTransportSourceMode = glyphEvidence.sourceMode;

      const recordDue =
        glyphEvidence.signature !== state.lastGlyphTransportSignature &&
        glyphEvidence.active &&
        (state.lastGlyphTransportTick < 0 ||
          tick - state.lastGlyphTransportTick >=
            GLYPH_TRANSPORT_RECORD_INTERVAL);
      if (recordDue) {
        state.lastGlyphTransportSignature = glyphEvidence.signature;
        state.lastGlyphTransportTick = tick;
        enqueueWrite(async () => {
          await appendChronicle(
            tick,
            "glyph_transport_regime",
            glyphEvidence.title,
            glyphEvidence.body,
          );
        });
      }
    }

    // Stage 7.2: Hormone regime chronicle
    const hormoneEvidence = buildHormoneRegimeEvidence(tick);
    state.lastHormoneRegimeSummary = hormoneEvidence.summary;
    const hormoneRecordDue =
      hormoneEvidence.signature !== state.lastHormoneRegimeSignature &&
      (state.lastHormoneRegimeTick < 0 ||
        tick - state.lastHormoneRegimeTick >= HORMONE_RECORD_INTERVAL);
    if (hormoneRecordDue) {
      state.lastHormoneRegimeSignature = hormoneEvidence.signature;
      state.lastHormoneRegimeTick = tick;
      enqueueWrite(async () => {
        await appendChronicle(
          tick,
          "hormone_regime",
          hormoneEvidence.title,
          hormoneEvidence.body,
        );
      });
    }

    const extinctionThreshold = Math.floor(state.populationPeak * 0.2);
    if (
      state.populationPeak >= 100 &&
      activePopulation <= extinctionThreshold &&
      (state.lastMassExtinctionTick < 0 ||
        tick - state.lastMassExtinctionTick >= EPOCH_TICKS)
    ) {
      state.lastMassExtinctionTick = tick;
      const dominantName = speciesIndex[0]?.latinName ??
        "Unclassified lineages";
      enqueueWrite(async () => {
        await appendChronicle(
          tick,
          "mass_extinction",
          "Great Die-off Recorded",
          `Population collapsed to ${activePopulation} after peaking at ${state.populationPeak}. Dominant lineage before collapse: ${dominantName}.`,
        );
      });
    }

    if (
      tick > 0 &&
      tick % EPOCH_TICKS === 0 &&
      tick !== state.lastEpochScanTick &&
      tick !== pendingEpochScanTick
    ) {
      pendingEpochScanTick = tick;
      enqueueWrite(async () => {
        try {
          await runEpochScan(tick);
        } finally {
          pendingEpochScanTick = -1;
        }
      });
    }
  },
  recordDecreeShift: (
    tick: number,
    decree: string,
    regentGenome: string,
    legitimacy: number,
  ): void => {
    if (!started) return;
    if (decree === state.lastDecree && tick === state.lastDecreeTick) return;
    state.lastDecree = decree;
    state.lastDecreeTick = tick;

    enqueueWrite(async () => {
      const species = speciesNameForGenome(regentGenome);
      await appendChronicle(
        tick,
        "decree_shift",
        `Decree Shift: ${decree}`,
        `Regent ${species} enforced ${decree} with legitimacy ${
          legitimacy.toFixed(2)
        }.`,
      );
    });
  },
  recordMarketResolution: (
    tick: number,
    adopted: boolean,
    energyBet: number,
    genomeHex: string,
  ): void => {
    if (!started) return;
    enqueueWrite(async () => {
      const species = speciesNameForGenome(genomeHex);
      const title = adopted
        ? "Market Mutation Adopted"
        : "Market Mutation Rejected";
      const body = adopted
        ? `Prediction market passed genome ${genomeHex} (${species}) with energy pool ${
          energyBet.toFixed(2)
        }.`
        : `Prediction market rejected genome ${genomeHex} after energy pool ${
          energyBet.toFixed(2)
        } failed threshold.`;
      await appendChronicle(tick, "market_resolution", title, body);
    });
  },
  recordDaemonAdmission: (
    tick: number,
    requestedAction: string,
    appliedAction: string,
    severity: "LOW" | "MID" | "HIGH" | "BLOCKED",
    score: number,
    reason: string,
    sharedCenter: string,
    dominantVector: string,
    glyphTransport?: GlyphSnapshot,
  ): void => {
    if (!started) return;
    if (severity === "LOW") return;
    enqueueWrite(async () => {
      const glyphEvidence = glyphTransport
        ? buildGlyphTransportEvidence(tick, glyphTransport)
        : null;
      const glyphContext = glyphEvidence
        ? ` Glyph transport context: ${glyphEvidence.summary}`
        : state.lastGlyphTransportSummary.length > 0
        ? ` Glyph transport context: ${state.lastGlyphTransportSummary}`
        : "";
      const actionDisposition = severity === "BLOCKED" ? "blocked" : "degraded";
      const title =
        `Daemon Admission ${severity}: ${requestedAction} -> ${appliedAction}`;
      const body =
        `Ingress action was ${actionDisposition} due to invariant drift score ${score}. ` +
        `Reason: ${reason}. Shared center: ${sharedCenter}. ` +
        `Dominant invariant vector: ${dominantVector}.${glyphContext}`;
      await appendChronicle(tick, "daemon_admission", title, body);
    });
  },
  recordDaemonEffect: (
    tick: number,
    auditId: string,
    requestedAction: string,
    appliedAction: string,
    sharedCenter: string,
    dominantVector: string,
    baselinePopulation: number,
    outcomePopulation: number,
    baselineAvgEnergy: number,
    outcomeAvgEnergy: number,
    baselineNeuralCoherence: number,
    outcomeNeuralCoherence: number,
    dominantGenome: string,
  ): void => {
    if (!started) return;
    enqueueWrite(async () => {
      const lineage = AKASHA_CODEX.lookupLineageProfile(dominantGenome);
      const deltaPopulation = outcomePopulation - baselinePopulation;
      const deltaAvgEnergy = Number(
        (outcomeAvgEnergy - baselineAvgEnergy).toFixed(3),
      );
      const deltaNeuralCoherence = Number(
        (outcomeNeuralCoherence - baselineNeuralCoherence).toFixed(3),
      );
      const deltaBand = daemonEffectDeltaBand(
        deltaPopulation,
        deltaAvgEnergy,
        deltaNeuralCoherence,
      );
      const glyphContext = state.lastGlyphTransportSummary.length > 0
        ? ` Glyph transport context: ${state.lastGlyphTransportSummary}`
        : "";
      state.lastDaemonEffectTick = tick;
      state.lastDaemonEffectLineage = lineage.label;
      state.lastDaemonEffectDeltaBand = deltaBand;
      state.lastDaemonEffectSummary =
        `Daemon effect ${
          titleCase(deltaBand)
        } via ${appliedAction.toLowerCase()} on ${lineage.label}. ` +
        `Population delta ${
          deltaPopulation >= 0 ? "+" : ""
        }${deltaPopulation}, ` +
        `energy delta ${deltaAvgEnergy >= 0 ? "+" : ""}${
          deltaAvgEnergy.toFixed(3)
        }, ` +
        `coherence delta ${deltaNeuralCoherence >= 0 ? "+" : ""}${
          deltaNeuralCoherence.toFixed(3)
        }.`;
      const title = `Daemon Effect ${appliedAction}: ${auditId}`;
      const body =
        `Deferred effect audit for ${requestedAction} -> ${appliedAction}. ` +
        `Shared center: ${sharedCenter}. Dominant invariant vector: ${dominantVector}. ` +
        `Population ${baselinePopulation} -> ${outcomePopulation} (delta ${
          deltaPopulation >= 0 ? "+" : ""
        }${deltaPopulation}), ` +
        `avgEnergy ${baselineAvgEnergy.toFixed(3)} -> ${
          outcomeAvgEnergy.toFixed(3)
        } (delta ${deltaAvgEnergy >= 0 ? "+" : ""}${
          deltaAvgEnergy.toFixed(3)
        }), ` +
        `neuralCoherence ${baselineNeuralCoherence.toFixed(3)} -> ${
          outcomeNeuralCoherence.toFixed(3)
        } ` +
        `(delta ${deltaNeuralCoherence >= 0 ? "+" : ""}${
          deltaNeuralCoherence.toFixed(3)
        }). ` +
        `Observed lineage: ${lineage.label}.${glyphContext}`;
      await appendChronicle(tick, "daemon_effect", title, body);
    });
  },
  getChronicleContext: async (limit: number = 3): Promise<string> => {
    await ensureStorage();
    const take = Math.max(1, Math.min(12, Math.floor(limit)));
    if (chronicleIndex.length === 0) return "No codex chronicle yet.";
    return chronicleIndex.slice(0, take).map((entry) =>
      `[Epoch ${entry.epoch}] ${entry.title}: ${entry.body}`
    ).join(" | ");
  },
  getSnapshot: async (limit: number = 8) => {
    await ensureStorage();
    await syncDaemonInvariants();
    const take = Math.max(1, Math.min(64, Math.floor(limit)));
    return {
      enabled: started,
      root: CODEX_ROOT,
      epochTicks: EPOCH_TICKS,
      dominanceThreshold: DOMINANCE_THRESHOLD,
      minEpochsForDiscovery: MIN_EPOCHS_FOR_DISCOVERY,
      population: {
        current: state.lastPopulation,
        peak: state.populationPeak,
      },
      glyphTransport: {
        regime: state.lastGlyphTransportRegime,
        summary: state.lastGlyphTransportSummary,
        dominantRole: state.lastGlyphTransportDominantRole,
        sourceMode: state.lastGlyphTransportSourceMode,
        lastRecordedTick: state.lastGlyphTransportTick,
        signature: state.lastGlyphTransportSignature,
        metabolicPressure:
          (await AKASHA_CODEX.getNarrative()).metabolicPressure,
      },
      daemonEffect: {
        summary: state.lastDaemonEffectSummary,
        lineage: state.lastDaemonEffectLineage,
        deltaBand: state.lastDaemonEffectDeltaBand,
        lastRecordedTick: state.lastDaemonEffectTick,
      },
      species: speciesIndex.slice(0, take),
      chronicles: chronicleIndex.slice(0, take),
      relics: relicIndex.slice(0, take),
      invariants: invariantIndex.slice(0, take),
    };
  },
  getInvariants: async (limit: number = 16) => {
    await ensureStorage();
    await syncDaemonInvariants();
    const take = Math.max(1, Math.min(128, Math.floor(limit)));
    return invariantIndex.slice(0, take);
  },
  lookupLineageProfile: (genomeHex: string): CodexLineageProfile => {
    const genome = genomeHex.trim().replace(/^0x/iu, "").toUpperCase();
    if (!/^[0-9A-F]{16}$/u.test(genome)) {
      return {
        genome: genome.slice(0, 16),
        label: "unknown-lineage",
        dominantEpochs: 0,
        peakShare: 0,
        known: false,
        generatedAt: nowIso(),
      };
    }
    const hit = speciesIndex.find((entry) => entry.genome === genome);
    if (!hit) {
      return {
        genome,
        label: `Genome ${genome.slice(0, 8)}`,
        dominantEpochs: 0,
        peakShare: 0,
        known: false,
        generatedAt: nowIso(),
      };
    }
    return {
      genome,
      label: hit.latinName,
      dominantEpochs: Math.max(0, Math.floor(hit.dominantEpochs)),
      peakShare: Math.max(0, Math.min(1, Number(hit.peakShare ?? 0))),
      known: true,
      generatedAt: nowIso(),
    };
  },
  getNarrative: async (limit: number = 5): Promise<CodexNarrative> => {
    await ensureStorage();
    await syncDaemonInvariants();
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    const epoch = Math.floor(tick / EPOCH_TICKS);
    const take = Math.max(1, Math.min(12, Math.floor(limit)));
    const mood = inferNarrativeMood();
    const title = narrativeTitleForMood(mood);
    const speciesHighlights = speciesIndex.slice(0, 3).map((entry) => ({
      latinName: entry.latinName,
      genome: entry.genome,
      dominantEpochs: entry.dominantEpochs,
      peakShare: Number(entry.peakShare.toFixed(4)),
    }));
    const recentChronicles = chronicleIndex.slice(0, take).map((entry) => ({
      tick: entry.tick,
      epoch: entry.epoch,
      type: entry.type,
      title: entry.title,
    }));
    const invariantHighlights = invariantIndex.slice(0, 3).map((entry) => ({
      tick: entry.tick,
      epoch: entry.epoch,
      center: entry.center,
      signature: entry.signature,
      dominantVector: entry.dominantVector,
      summary: entry.summary,
    }));
    const sharedCenter = invariantHighlights[0]?.center ?? "tick.exists";
    const leadSpecies = speciesHighlights[0]?.latinName ??
      "Unclassified lineage";
    const relicStatus = relicIndex.length === 0
      ? "No relics cataloged yet."
      : `Relics cataloged: ${relicIndex.length}. Latest relic size: ${
        relicIndex[0].size
      } blocks.`;
    const glyphStatus = state.lastGlyphTransportSummary;
    const daemonEffectStatus = state.lastDaemonEffectSummary;
    const summary =
      `Tick ${tick} (Epoch ${epoch}). Population ${state.lastPopulation}, peak ${state.populationPeak}. ` +
      `Dominant lineage: ${leadSpecies}. Shared center: ${sharedCenter}. ${glyphStatus} ${daemonEffectStatus}`;

    let hippocampusRecall: CodexNarrative["hippocampusRecall"];
    const currentHormones = [
      Atomics.load(STATE_MATRIX.hormones, 0),
      Atomics.load(STATE_MATRIX.hormones, 1),
      Atomics.load(STATE_MATRIX.hormones, 2),
      Atomics.load(STATE_MATRIX.hormones, 3),
      Atomics.load(STATE_MATRIX.hormones, 4),
      Atomics.load(STATE_MATRIX.hormones, 5),
    ];
    let bestDistance = Number.MAX_VALUE;
    let bestEntry: InvariantEntry | null = null;

    for (const entry of invariantIndex) {
      if (entry.epoch === epoch) continue; // Skip current epoch
      if (!entry.hormones || entry.hormones.length < 6) continue;

      let sqDist = 0;
      for (let i = 0; i < 6; i++) {
        const diff = entry.hormones[i] - currentHormones[i];
        sqDist += diff * diff;
      }
      const dist = Math.sqrt(sqDist);

      if (dist < bestDistance) {
        bestDistance = dist;
        bestEntry = entry;
      }
    }

    if (bestEntry) {
      hippocampusRecall = {
        tick: bestEntry.tick,
        epoch: bestEntry.epoch,
        summary: bestEntry.summary,
        distance: bestDistance,
        distanceType: "Euclidean H0-H5",
      };
    }

    let promptBridge =
      `Use plain language. Explain ${title.toLowerCase()}, how ${leadSpecies} shaped recent epochs, how the glyph transport regime affected the field, and what the latest daemon effect contour did to the lattice.`;

    if (hippocampusRecall) {
      promptBridge +=
        ` IMPORTANT: Episodic Memory retrieved epoch ${hippocampusRecall.epoch} with chemical distance ${
          hippocampusRecall.distance.toFixed(1)
        }. Context: ${hippocampusRecall.summary}. Use this past experience to avoid repeating mistakes or to replicate success.`;
    }

    return {
      tick,
      epoch,
      mood,
      title,
      summary,
      sharedCenter,
      speciesHighlights,
      invariantHighlights,
      recentChronicles,
      relicStatus,
      glyphStatus,
      glyphRegime: state.lastGlyphTransportRegime,
      glyphDominantRole: state.lastGlyphTransportDominantRole,
      glyphSourceMode: state.lastGlyphTransportSourceMode,
      metabolicPressure: clamp(
        asFiniteNumber(
          state.lastGlyphTransportSummary.match(/pressure ([\d.]+)/)?.[1],
          0,
        ),
        0,
        1,
      ),
      daemonEffectStatus,
      daemonEffectLineage: state.lastDaemonEffectLineage,
      daemonEffectDeltaBand: state.lastDaemonEffectDeltaBand,
      hormoneRegime: state.lastHormoneRegimeSummary,
      promptBridge,
      hippocampusRecall,
    };
  },
  recordImmunologicalPurge: async (count: number) => {
    await ensureStorage();
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    state.lastImmunePurgeTick = tick;
    state.lastImmunePurgeCount = count;

    await appendChronicle(
      tick,
      "immunological_purge",
      "Systemic Phagocyte Action",
      `The immune system identified and recycled ${count} dead or drifting atoms at tick ${tick}. System coherence maintained.`,
    );

    await persistState();
  },
};
