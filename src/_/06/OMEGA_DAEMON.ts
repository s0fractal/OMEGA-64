// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/omega_daemon.md
import { WORLD_MAX_X, WORLD_MAX_Y, Telemetry, CodexNarrative, ActionType, DaemonDecision, InvariantSignal, InvariantFrame, OpenAIChoice, OpenAIResponse } from "@g05";

// OMEGA-64 | OMEGA_DAEMON.ts | Era 70: Mycelial Observer Daemon
// Autonomous companion loop: reads telemetry, reasons via OpenAI, injects stimuli.

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
} as const;

const parseBoundedInt = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};
const parseBoundedFloat = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (raw === undefined) return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};
const parseEnvBool = (
  raw: string | undefined,
  fallback: boolean,
): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};

const asFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const timestamp = (): string => new Date().toISOString();

const logThought = (text: string): void => {
  console.log(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.cyan}[MYCELIUM:THOUGHT]${ANSI.reset} ${text}`,
  );
};

const logAction = (text: string): void => {
  console.log(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.green}[MYCELIUM:ACTION]${ANSI.reset} ${text}`,
  );
};

const logWarn = (text: string): void => {
  console.warn(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.yellow}[MYCELIUM:WARN]${ANSI.reset} ${text}`,
  );
};

const logInvariant = (text: string): void => {
  console.log(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.yellow}[MYCELIUM:INVARIANT]${ANSI.reset} ${text}`,
  );
};

const logError = (text: string): void => {
  console.error(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.red}[MYCELIUM:ERROR]${ANSI.reset} ${text}`,
  );
};

const API_BASE = (Deno.env.get("OMEGA_DAEMON_API_BASE") ??
  "http://localhost:8080").replace(/\/+$/u, "");
const TELEMETRY_URL = `${API_BASE}/api/telemetry`;
const CODEX_NARRATIVE_URL = `${API_BASE}/api/codex/narrative`;
const INJECT_URL = `${API_BASE}/api/inject`;
const PRESSURE_RING_URL = `${API_BASE}/api/pressure-ring`;
const HOMEOSTASIS_URL = `${API_BASE}/api/homeostasis`;
const OPENAI_URL = Deno.env.get("OPENAI_API_URL") ??
  "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = Deno.env.get("OMEGA_DAEMON_MODEL") ?? "gpt-4o";
const OPENAI_API_KEY = (Deno.env.get("OPENAI_API_KEY") ?? "").trim();
const CONTROL_TOKEN = (
  Deno.env.get("OMEGA_DAEMON_CONTROL_TOKEN") ??
    Deno.env.get("OMEGA_SYSTEM_CONTROL_TOKEN") ??
    ""
).trim();
const HEARTBEAT_INTERVAL_MS = parseBoundedInt(
  Deno.env.get("HEARTBEAT_INTERVAL_MS"),
  60_000,
  5_000,
  3_600_000,
);
const HTTP_TIMEOUT_MS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HTTP_TIMEOUT_MS"),
  15_000,
  2_000,
  120_000,
);
const MEMORY_LIMIT = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_MEMORY_LIMIT"),
  10,
  1,
  64,
);
const MEMORY_PATH = Deno.env.get("OMEGA_DAEMON_MEMORY_PATH") ??
  "./daemon_memory.json";
const INVARIANT_MEMORY_LIMIT = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_INVARIANT_LIMIT"),
  32,
  1,
  256,
);
const INVARIANT_PATH = Deno.env.get("OMEGA_DAEMON_INVARIANT_PATH") ??
  "./08/telemetry/daemon_invariants.json";
const PHASE_SEASONS_ENABLE = parseEnvBool(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_ENABLE"),
  true,
);
const PHASE_SEASONS_STEP_RAD = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_STEP_RAD"),
  0.0625,
  0.0001,
  1.0,
);
const PHASE_SEASONS_MAX_STEP_RAD = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_MAX_STEP_RAD"),
  0.25,
  0.01,
  1.0,
);
const PHASE_SEASONS_COOLDOWN_TICKS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_COOLDOWN_TICKS"),
  8,
  1,
  10_000,
);
const PHASE_SEASONS_LOW_ENERGY = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_LOW_ENERGY"),
  10,
  0,
  10_000,
);
const PHASE_SEASONS_HIGH_ENERGY = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_HIGH_ENERGY"),
  24,
  0,
  10_000,
);
const HOMEOSTASIS_CONTROL_ENABLE = parseEnvBool(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_ENABLE"),
  true,
);
const HOMEOSTASIS_COOLDOWN_TICKS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_COOLDOWN_TICKS"),
  24,
  1,
  50_000,
);
const HOMEOSTASIS_TARGET_ENERGY = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_ENERGY"),
  420,
  1,
  100_000,
);
const HOMEOSTASIS_BAND = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_BAND"),
  120,
  1,
  50_000,
);
const HOMEOSTASIS_GAIN_UP = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_GAIN_UP"),
  0.0125,
  0.0001,
  1.0,
);
const HOMEOSTASIS_GAIN_DOWN = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_GAIN_DOWN"),
  0.008,
  0.0001,
  1.0,
);
const HOMEOSTASIS_MAX_STEP = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_MAX_STEP"),
  2,
  1,
  32,
);
const HOMEOSTASIS_MIN_TAX = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_MIN_TAX"),
  0,
  0,
  256,
);
const HOMEOSTASIS_MAX_TAX = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_MAX_TAX"),
  16,
  1,
  512,
);
const HOMEOSTASIS_OVERFLOW_SOFT = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_OVERFLOW_SOFT"),
  0.22,
  0,
  1,
);
const HOMEOSTASIS_OVERFLOW_HARD = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_OVERFLOW_HARD"),
  0.35,
  0,
  1,
);
const HOMEOSTASIS_TARGET_CONTROL_ENABLE = parseEnvBool(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_CONTROL_ENABLE"),
  true,
);
const HOMEOSTASIS_TARGET_COOLDOWN_TICKS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_COOLDOWN_TICKS"),
  96,
  4,
  100_000,
);
const HOMEOSTASIS_TARGET_STEP = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_STEP"),
  20,
  1,
  2000,
);
const HOMEOSTASIS_TARGET_MIN = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_MIN"),
  120,
  1,
  100_000,
);
const HOMEOSTASIS_TARGET_MAX = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_MAX"),
  2000,
  10,
  1_000_000,
);

let lastPhaseSeasonTick = -1;
let lastHomeostasisControlTick = -1;
let lastHomeostasisTargetControlTick = -1;

const withTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const loadMemory = async (): Promise<string[]> => {
  try {
    const raw = await Deno.readTextFile(MEMORY_PATH);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(-MEMORY_LIMIT);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return [];
    logWarn(`Memory read fallback: ${String(err)}`);
    return [];
  }
};

const saveMemory = async (thoughts: string[]): Promise<void> => {
  const compact = thoughts.slice(-MEMORY_LIMIT);
  await Deno.writeTextFile(
    MEMORY_PATH,
    `${JSON.stringify(compact, null, 2)}\n`,
  );
};

const loadInvariantHistory = async (): Promise<InvariantFrame[]> => {
  try {
    const raw = await Deno.readTextFile(INVARIANT_PATH);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is InvariantFrame =>
        !!entry &&
        typeof entry === "object" &&
        Array.isArray((entry as Record<string, unknown>).invariants) &&
        typeof (entry as Record<string, unknown>).signature === "string"
      )
      .slice(-INVARIANT_MEMORY_LIMIT);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return [];
    logWarn(`Invariant memory read fallback: ${String(err)}`);
    return [];
  }
};

const saveInvariantHistory = async (
  frames: InvariantFrame[],
): Promise<void> => {
  const compact = frames.slice(-INVARIANT_MEMORY_LIMIT);
  await Deno.writeTextFile(
    INVARIANT_PATH,
    `${JSON.stringify(compact, null, 2)}\n`,
  );
};

const fnv1a32 = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/gu, " ")
    .split(/\s+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

const tokenSet = (parts: string[]): Set<string> => {
  const out = new Set<string>();
  for (const part of parts) {
    for (const token of tokenize(part)) out.add(token);
  }
  return out;
};

const setIntersection = (a: Set<string>, b: Set<string>): string[] => {
  const out: string[] = [];
  for (const token of a) {
    if (b.has(token)) out.push(token);
  }
  out.sort((x, y) => x.localeCompare(y));
  return out;
};

const normalizeTelemetry = (raw: unknown): Telemetry => {
  const source = raw && typeof raw === "object"
    ? raw as Record<string, unknown>
    : {};
  const dominantGenomes = Array.isArray(source.dominantGenomes)
    ? source.dominantGenomes.filter((v): v is string => typeof v === "string")
    : [];
  const voxPopuli = Array.isArray(source.voxPopuli)
    ? source.voxPopuli.filter((v): v is string => typeof v === "string")
    : [];
  const pulseRaw =
    source.pulse_pressure && typeof source.pulse_pressure === "object"
      ? source.pulse_pressure as Record<string, unknown>
      : null;
  const ringRaw = pulseRaw?.ring && typeof pulseRaw.ring === "object"
    ? pulseRaw.ring as Record<string, unknown>
    : null;
  const daemonRaw = source.daemon_governance &&
      typeof source.daemon_governance === "object"
    ? source.daemon_governance as Record<string, unknown>
    : null;
  const daemonHomeostasisRaw = daemonRaw?.homeostasis &&
      typeof daemonRaw.homeostasis === "object"
    ? daemonRaw.homeostasis as Record<string, unknown>
    : null;
  const spatialRaw = source.spatial_hash_guard &&
      typeof source.spatial_hash_guard === "object"
    ? source.spatial_hash_guard as Record<string, unknown>
    : null;
  const behaviorClusters = Array.isArray(source.behavior_clusters)
    ? source.behavior_clusters
      .filter((entry): entry is Record<string, unknown> =>
        !!entry && typeof entry === "object"
      )
      .map((entry) => ({
        behaviorSignature: typeof entry.behaviorSignature === "string"
          ? entry.behaviorSignature
          : "none",
        memberCount: Math.max(
          0,
          Math.floor(asFiniteNumber(entry.memberCount, 0)),
        ),
        dominantRole: Math.max(
          0,
          Math.floor(asFiniteNumber(entry.dominantRole, 0)),
        ),
        genomeSamples: Array.isArray(entry.genomeSamples)
          ? entry.genomeSamples
            .filter((sample): sample is string => typeof sample === "string")
            .slice(0, 6)
          : [],
        fingerprint: entry.fingerprint && typeof entry.fingerprint === "object"
          ? {
            replicateRatio: asFiniteNumber(
              (entry.fingerprint as Record<string, unknown>).replicateRatio,
              0,
            ),
            signalRatio: asFiniteNumber(
              (entry.fingerprint as Record<string, unknown>).signalRatio,
              0,
            ),
            buildRatio: asFiniteNumber(
              (entry.fingerprint as Record<string, unknown>).buildRatio,
              0,
            ),
            survivalCurve: Array.isArray(
                (entry.fingerprint as Record<string, unknown>).survivalCurve,
              )
              ? (
                (entry.fingerprint as Record<string, unknown>)
                  .survivalCurve as unknown[]
              )
                .map((value) =>
                  Math.max(0, Math.floor(asFiniteNumber(value, 0)))
                )
                .slice(-12)
              : [],
          }
          : undefined,
        lastTick: Math.max(0, Math.floor(asFiniteNumber(entry.lastTick, 0))),
      }))
      .slice(0, 6)
    : [];
  const federationRaw = source.federation_rule_genome &&
      typeof source.federation_rule_genome === "object"
    ? source.federation_rule_genome as Record<string, unknown>
    : null;
  const federationLocalRaw = federationRaw?.local &&
      typeof federationRaw.local === "object"
    ? federationRaw.local as Record<string, unknown>
    : null;
  const federationPeersRaw = Array.isArray(federationRaw?.peers)
    ? federationRaw?.peers as unknown[]
    : [];
  const federationAdmissionRaw = source.federation_admission &&
      typeof source.federation_admission === "object"
    ? source.federation_admission as Record<string, unknown>
    : null;
  const federationAdmissionLatestRaw = federationAdmissionRaw?.latest &&
      typeof federationAdmissionRaw.latest === "object"
    ? federationAdmissionRaw.latest as Record<string, unknown>
    : null;
  const hormonesRaw = Array.isArray(source.hormones) ? source.hormones : [];
  return {
    tick: Math.max(0, Math.floor(asFiniteNumber(source.tick, 0))),
    avgEnergy: asFiniteNumber(source.avgEnergy, 0),
    dominantGenomes: dominantGenomes.slice(0, 3),
    voxPopuli: voxPopuli.slice(0, 8),
    behavior_invariant: typeof source.behavior_invariant === "string"
      ? source.behavior_invariant
      : undefined,
    behavior_clusters: behaviorClusters,
    federation_rule_genome: undefined,
    federation_admission: undefined,
    pulse_pressure: pulseRaw && ringRaw
      ? {
        novelty_signed: asFiniteNumber(pulseRaw.novelty_signed, 0),
        symbiosis_signed: asFiniteNumber(pulseRaw.symbiosis_signed, 0),
        novelty: asFiniteNumber(pulseRaw.novelty, 0),
        fear: asFiniteNumber(pulseRaw.fear, 0),
        symbiosis: asFiniteNumber(pulseRaw.symbiosis, 0),
        ego: asFiniteNumber(pulseRaw.ego, 0),
        ring: {
          enabled: parseEnvBool(
            typeof ringRaw.enabled === "string" ||
              typeof ringRaw.enabled === "boolean"
              ? String(ringRaw.enabled)
              : undefined,
            false,
          ),
          theta: asFiniteNumber(ringRaw.theta, 0),
          scale: Math.max(0, Math.round(asFiniteNumber(ringRaw.scale, 0))),
          fear_curiosity_balance: asFiniteNumber(
            ringRaw.fear_curiosity_balance,
            0,
          ),
          ego_love_balance: asFiniteNumber(ringRaw.ego_love_balance, 0),
          novelty_axis_from_ring: parseEnvBool(
            typeof ringRaw.novelty_axis_from_ring === "string" ||
              typeof ringRaw.novelty_axis_from_ring === "boolean"
              ? String(ringRaw.novelty_axis_from_ring)
              : undefined,
            false,
          ),
          symbiosis_axis_from_ring: parseEnvBool(
            typeof ringRaw.symbiosis_axis_from_ring === "string" ||
              typeof ringRaw.symbiosis_axis_from_ring === "boolean"
              ? String(ringRaw.symbiosis_axis_from_ring)
              : undefined,
            false,
          ),
        },
      }
      : undefined,
    daemon_governance: daemonRaw
      ? {
        safe_mode: parseEnvBool(
          typeof daemonRaw.safe_mode === "string" ||
            typeof daemonRaw.safe_mode === "boolean"
            ? String(daemonRaw.safe_mode)
            : undefined,
          false,
        ),
        safe_mode_reason: typeof daemonRaw.safe_mode_reason === "string"
          ? daemonRaw.safe_mode_reason
          : "SAFE_MODE_UNKNOWN",
        actions_used_in_window: Math.max(
          0,
          Math.floor(asFiniteNumber(daemonRaw.actions_used_in_window, 0)),
        ),
        actions_max_in_window: Math.max(
          1,
          Math.floor(asFiniteNumber(daemonRaw.actions_max_in_window, 1)),
        ),
        window_reset_in_ms: Math.max(
          0,
          Math.floor(asFiniteNumber(daemonRaw.window_reset_in_ms, 0)),
        ),
        max_pheromone_intensity: Math.max(
          1,
          Math.floor(asFiniteNumber(daemonRaw.max_pheromone_intensity, 1)),
        ),
        max_plasmid_charge: Math.max(
          1,
          Math.floor(asFiniteNumber(daemonRaw.max_plasmid_charge, 1)),
        ),
        invariant_drift_mid_score: Math.floor(
          asFiniteNumber(daemonRaw.invariant_drift_mid_score, 0),
        ),
        invariant_drift_high_score: Math.floor(
          asFiniteNumber(daemonRaw.invariant_drift_high_score, 0),
        ),
        last_admission: daemonRaw.last_admission,
        last_admission_history: Array.isArray(daemonRaw.last_admission_history)
          ? daemonRaw.last_admission_history
          : [],
        last_pressure_ring_update: daemonRaw.last_pressure_ring_update,
        last_pressure_ring_history: Array.isArray(
            daemonRaw.last_pressure_ring_history,
          )
          ? daemonRaw.last_pressure_ring_history
          : [],
        last_homeostasis_update: daemonRaw.last_homeostasis_update,
        last_homeostasis_history: Array.isArray(
            daemonRaw.last_homeostasis_history,
          )
          ? daemonRaw.last_homeostasis_history
          : [],
        homeostasis: daemonHomeostasisRaw
          ? {
            enabled: parseEnvBool(
              typeof daemonHomeostasisRaw.enabled === "string" ||
                typeof daemonHomeostasisRaw.enabled === "boolean"
                ? String(daemonHomeostasisRaw.enabled)
                : undefined,
              true,
            ),
            target_energy: asFiniteNumber(
              daemonHomeostasisRaw.target_energy,
              HOMEOSTASIS_TARGET_ENERGY,
            ),
            target_energy_default: asFiniteNumber(
              daemonHomeostasisRaw.target_energy_default,
              HOMEOSTASIS_TARGET_ENERGY,
            ),
            target_energy_current: asFiniteNumber(
              daemonHomeostasisRaw.target_energy_current,
              asFiniteNumber(
                daemonHomeostasisRaw.target_energy,
                HOMEOSTASIS_TARGET_ENERGY,
              ),
            ),
            band: asFiniteNumber(daemonHomeostasisRaw.band, HOMEOSTASIS_BAND),
            max_delta: asFiniteNumber(daemonHomeostasisRaw.max_delta, 0),
            overflow_threshold: asFiniteNumber(
              daemonHomeostasisRaw.overflow_threshold,
              0,
            ),
            starvation_floor: asFiniteNumber(
              daemonHomeostasisRaw.starvation_floor,
              0,
            ),
            subsidy_enabled: parseEnvBool(
              typeof daemonHomeostasisRaw.subsidy_enabled === "string" ||
                typeof daemonHomeostasisRaw.subsidy_enabled === "boolean"
                ? String(daemonHomeostasisRaw.subsidy_enabled)
                : undefined,
              false,
            ),
            base_tax_default: Math.max(
              0,
              Math.round(
                asFiniteNumber(daemonHomeostasisRaw.base_tax_default, 0),
              ),
            ),
            base_tax_current: Math.max(
              0,
              Math.round(
                asFiniteNumber(daemonHomeostasisRaw.base_tax_current, 0),
              ),
            ),
            last_update_tick: Math.max(
              0,
              Math.floor(
                asFiniteNumber(daemonHomeostasisRaw.last_update_tick, 0),
              ),
            ),
            last_update_source:
              typeof daemonHomeostasisRaw.last_update_source === "string"
                ? daemonHomeostasisRaw.last_update_source
                : "unknown",
            last_update_reason:
              typeof daemonHomeostasisRaw.last_update_reason === "string"
                ? daemonHomeostasisRaw.last_update_reason
                : "unknown",
          }
          : undefined,
      }
      : undefined,
    spatial_hash_guard: spatialRaw
      ? {
        overflow_ratio: asFiniteNumber(spatialRaw.overflow_ratio, 0),
        overflow_count: Math.max(
          0,
          Math.floor(asFiniteNumber(spatialRaw.overflow_count, 0)),
        ),
        max_cell_count: Math.max(
          0,
          Math.floor(asFiniteNumber(spatialRaw.max_cell_count, 0)),
        ),
      }
      : undefined,
    hormones: hormonesRaw.map((v) => asFiniteNumber(v, 0)).slice(0, 6),
  };
};

const fetchTelemetry = async (): Promise<Telemetry> => {
  const response = await withTimeout(
    TELEMETRY_URL,
    { method: "GET", headers: { Accept: "application/json" } },
    HTTP_TIMEOUT_MS,
  );
  if (!response.ok) {
    throw new Error(
      `Telemetry request failed: ${response.status} ${response.statusText}`,
    );
  }
  return normalizeTelemetry(await response.json());
};

const normalizeCodexNarrative = (raw: unknown): CodexNarrative => {
  const source = raw && typeof raw === "object"
    ? raw as Record<string, unknown>
    : {};
  const recentChronicles = Array.isArray(source.recentChronicles)
    ? source.recentChronicles
      .filter((entry): entry is Record<string, unknown> =>
        !!entry && typeof entry === "object"
      )
      .map((entry) => ({
        tick: Math.max(0, Math.floor(asFiniteNumber(entry.tick, 0))),
        epoch: Math.max(0, Math.floor(asFiniteNumber(entry.epoch, 0))),
        type: typeof entry.type === "string" ? entry.type : "unknown",
        title: typeof entry.title === "string" ? entry.title : "untitled",
      }))
      .slice(0, 6)
    : [];
  return {
    tick: Math.max(0, Math.floor(asFiniteNumber(source.tick, 0))),
    epoch: Math.max(0, Math.floor(asFiniteNumber(source.epoch, 0))),
    mood: typeof source.mood === "string" ? source.mood : "STABLE",
    title: typeof source.title === "string" && source.title.trim().length > 0
      ? source.title.trim()
      : "Lattice Status",
    summary:
      typeof source.summary === "string" && source.summary.trim().length > 0
        ? source.summary.trim()
        : "Codex narrative unavailable.",
    relicStatus: typeof source.relicStatus === "string"
      ? source.relicStatus
      : "Relic status unavailable.",
    glyphStatus: typeof source.glyphStatus === "string"
      ? source.glyphStatus
      : "Glyph transport status unavailable.",
    glyphRegime: typeof source.glyphRegime === "string"
      ? source.glyphRegime
      : "dormant",
    glyphDominantRole: typeof source.glyphDominantRole === "string"
      ? source.glyphDominantRole
      : "none",
    glyphSourceMode: typeof source.glyphSourceMode === "string"
      ? source.glyphSourceMode
      : "none",
    daemonEffectStatus: typeof source.daemonEffectStatus === "string"
      ? source.daemonEffectStatus
      : "Daemon effect status unavailable.",
    daemonEffectLineage: typeof source.daemonEffectLineage === "string"
      ? source.daemonEffectLineage
      : "none",
    daemonEffectDeltaBand: typeof source.daemonEffectDeltaBand === "string"
      ? source.daemonEffectDeltaBand
      : "none",
    hormoneRegime: typeof source.hormoneRegime === "string"
      ? source.hormoneRegime
      : "dormant_baseline",
    promptBridge: typeof source.promptBridge === "string"
      ? source.promptBridge
      : "Use plain language for observer-facing updates.",
    hippocampusRecall: source.hippocampusRecall &&
        typeof source.hippocampusRecall === "object"
      ? source.hippocampusRecall as CodexNarrative["hippocampusRecall"]
      : undefined,
    recentChronicles,
  };
};

const fetchCodexNarrative = async (): Promise<CodexNarrative> => {
  try {
    const response = await withTimeout(
      CODEX_NARRATIVE_URL,
      { method: "GET", headers: { Accept: "application/json" } },
      HTTP_TIMEOUT_MS,
    );
    if (!response.ok) {
      throw new Error(
        `Codex narrative request failed: ${response.status} ${response.statusText}`,
      );
    }
    return normalizeCodexNarrative(await response.json());
  } catch (err) {
    logWarn(`Codex narrative fallback: ${String(err)}`);
    return {
      tick: 0,
      epoch: 0,
      mood: "STABLE",
      title: "Codex Unavailable",
      summary:
        "Codex narrative endpoint unavailable; operating on telemetry only.",
      relicStatus: "Relic status unavailable.",
      glyphStatus: "Glyph transport status unavailable.",
      glyphRegime: "dormant",
      glyphDominantRole: "none",
      glyphSourceMode: "none",
      daemonEffectStatus: "Daemon effect status unavailable.",
      daemonEffectLineage: "none",
      daemonEffectDeltaBand: "none",
      hormoneRegime: "dormant_baseline",
      promptBridge: "Use plain language for observer-facing updates.",
      recentChronicles: [],
    };
  }
};

const energyBand = (avgEnergy: number): string => {
  if (avgEnergy < 8) return "SCARCITY";
  if (avgEnergy < 20) return "TENSION";
  if (avgEnergy < 45) return "BALANCED";
  return "SURPLUS";
};

const moodBand = (mood: string): string => {
  const normalized = mood.trim().toUpperCase();
  if (normalized === "FRAGILE") return "FRAGILE";
  if (normalized === "ASCENDANT") return "ASCENDANT";
  return "STABLE";
};

const dominantAnchor = (dominantGenomes: string[]): string =>
  dominantGenomes.length > 0
    ? dominantGenomes[0].replace(/^0x/iu, "").slice(0, 8).toUpperCase()
    : "NONE";

const buildInvariantFrame = (
  telemetry: Telemetry,
  codexNarrative: CodexNarrative,
  memory: string[],
): InvariantFrame => {
  const mood = moodBand(codexNarrative.mood);
  const energy = energyBand(telemetry.avgEnergy);
  const lineage = dominantAnchor(telemetry.dominantGenomes);
  const memoryTokens = tokenSet(memory.slice(-4));
  const narrativeTokens = tokenSet([
    codexNarrative.title,
    codexNarrative.summary,
    codexNarrative.relicStatus,
    codexNarrative.glyphStatus,
    codexNarrative.daemonEffectStatus,
    ...telemetry.voxPopuli.slice(0, 4),
  ]);
  const sharedTokens = setIntersection(memoryTokens, narrativeTokens).slice(
    0,
    6,
  );
  const behaviorInvariant = typeof telemetry.behavior_invariant === "string" &&
      telemetry.behavior_invariant.trim().length > 0
    ? telemetry.behavior_invariant.trim()
    : "none";
  const dominantBehaviorCluster = Array.isArray(telemetry.behavior_clusters) &&
      telemetry.behavior_clusters.length > 0
    ? telemetry.behavior_clusters[0]
    : undefined;
  const federationLocal = telemetry.federation_rule_genome?.local;
  const federationPeers = telemetry.federation_rule_genome?.peers ?? [];
  const federationPeer = federationPeers.length > 0
    ? federationPeers[0]
    : undefined;
  const federationAdmission = telemetry.federation_admission?.latest;
  const invariantSignals: InvariantSignal[] = [
    {
      key: "energy_mood_coupling",
      vector: `${energy}:${mood}`,
      weight: energy === "SCARCITY" || mood === "FRAGILE" ? 0.94 : 0.62,
      evidence: [
        `avgEnergy=${telemetry.avgEnergy.toFixed(2)}`,
        `mood=${mood}`,
      ],
    },
    {
      key: "lineage_anchor",
      vector: lineage,
      weight: lineage === "NONE" ? 0.25 : 0.71,
      evidence: telemetry.dominantGenomes.slice(0, 2),
    },
    {
      key: "semantic_intersection",
      vector: sharedTokens.length > 0 ? sharedTokens.join("|") : "none",
      weight: sharedTokens.length > 0
        ? clamp(0.36 + sharedTokens.length * 0.08, 0, 0.92)
        : 0.12,
      evidence: sharedTokens.length > 0 ? sharedTokens : ["no-overlap"],
    },
    {
      key: "behavior_cluster",
      vector: behaviorInvariant,
      weight: dominantBehaviorCluster && dominantBehaviorCluster.memberCount > 0
        ? clamp(0.35 + dominantBehaviorCluster.memberCount / 5000, 0.2, 0.86)
        : 0.2,
      evidence: dominantBehaviorCluster
        ? [
          `members=${dominantBehaviorCluster.memberCount}`,
          `role=${dominantBehaviorCluster.dominantRole}`,
          `signature=${dominantBehaviorCluster.behaviorSignature}`,
          `curve=${
            dominantBehaviorCluster.fingerprint?.survivalCurve?.slice(-4).join(
              ",",
            ) || "none"
          }`,
        ]
        : ["behavior=none"],
    },
    {
      key: "federated_rule_pressure",
      vector: federationPeer
        ? `${federationPeer.profile.signature}:${federationPeer.peer}`
        : federationLocal
        ? `${federationLocal.signature}:local`
        : "none",
      weight: federationPeer ? 0.74 : federationLocal ? 0.42 : 0.16,
      evidence: federationPeer
        ? [
          `peer=${federationPeer.peer}`,
          `peerNovelty=${federationPeer.profile.noveltySigned}`,
          `peerSymbiosis=${federationPeer.profile.symbiosisSigned}`,
          `local=${federationLocal?.signature ?? "none"}`,
        ]
        : federationLocal
        ? [
          `localNovelty=${federationLocal.noveltySigned}`,
          `localSymbiosis=${federationLocal.symbiosisSigned}`,
          `workerCount=${federationLocal.workerCount}`,
        ]
        : ["federation=none"],
    },
    {
      key: "federation_admission_vector",
      vector: federationAdmission
        ? `${String(federationAdmission.action || "accept").toUpperCase()}:${
          String(federationAdmission.severity || "LOW").toUpperCase()
        }:${federationAdmission.localBehaviorInvariant ?? "none"}->${
          federationAdmission.peerBehaviorInvariant ?? "none"
        }:${federationAdmission.localCodexLabel ?? "unknown-lineage"}->${
          federationAdmission.peerCodexLabel ?? "unknown-lineage"
        }`
        : "none",
      weight: federationAdmission
        ? clamp(
          0.25 + Math.max(0, Number(federationAdmission.score || 0)) / 12,
          0.2,
          0.9,
        )
        : 0.14,
      evidence: federationAdmission
        ? [
          `score=${federationAdmission.score}`,
          `source=${federationAdmission.sourceNode ?? "unknown"}`,
          `distance=${
            Number(federationAdmission.behaviorDistance ?? -1).toFixed(3)
          }`,
          `codexDistance=${
            Number(federationAdmission.codexDistance ?? -1).toFixed(0)
          }`,
          `policyRatio=${
            Number(federationAdmission.policyEnergyRatio ?? 1).toFixed(3)
          }/${
            Number(federationAdmission.policyResonanceRatio ?? 1).toFixed(3)
          }`,
          `fragments=${
            Array.isArray(federationAdmission.policyFragments)
              ? federationAdmission.policyFragments.length
              : 0
          }`,
        ]
        : ["admission=none"],
    },
  ];

  const signatureSeed = JSON.stringify({
    tick: telemetry.tick,
    epoch: codexNarrative.epoch,
    mood,
    energy,
    lineage,
    sharedTokens,
    behaviorInvariant,
    federationSignature: federationPeer?.profile.signature ??
      federationLocal?.signature ??
      "none",
    federationAdmissionVector: federationAdmission
      ? `${federationAdmission.action}:${federationAdmission.severity}:${
        federationAdmission.localBehaviorInvariant ?? "none"
      }->${federationAdmission.peerBehaviorInvariant ?? "none"}:${
        federationAdmission.localCodexLabel ?? "unknown-lineage"
      }->${federationAdmission.peerCodexLabel ?? "unknown-lineage"}`
      : "none",
    federationPolicyRatio: federationAdmission
      ? `${Number(federationAdmission.policyEnergyRatio ?? 1).toFixed(3)}:${
        Number(federationAdmission.policyResonanceRatio ?? 1).toFixed(3)
      }`
      : "1.000:1.000",
    federationPolicyFragments: federationAdmission &&
        Array.isArray(federationAdmission.policyFragments)
      ? federationAdmission.policyFragments.map((entry) =>
        `${entry.source ?? "unknown"}:${entry.mode ?? "none"}:${
          entry.reason ?? "none"
        }`
      )
      : [],
  });
  const signature = fnv1a32(signatureSeed);
  const summary =
    `center=tick.exists | energy=${energy} | mood=${mood} | lineage=${lineage} | behavior=${behaviorInvariant} | federation=${
      federationPeer?.profile.signature ?? federationLocal?.signature ?? "none"
    } | fedAdmission=${
      federationAdmission
        ? `${String(federationAdmission.action || "accept").toUpperCase()}:${
          String(federationAdmission.severity || "LOW").toUpperCase()
        }`
        : "none"
    } | overlap=${sharedTokens.length > 0 ? sharedTokens.join(",") : "none"}`;

  return {
    tick: telemetry.tick,
    epoch: codexNarrative.epoch,
    center: "tick.exists",
    signature,
    invariants: invariantSignals,
    summary,
    created_at: timestamp(),
    hormones: telemetry.hormones ?? [0, 0, 0, 0, 0, 0],
  };
};

const appendInvariantFrame = (
  history: InvariantFrame[],
  frame: InvariantFrame,
): InvariantFrame[] => [...history, frame].slice(-INVARIANT_MEMORY_LIMIT);

const normalizeAction = (value: unknown): ActionType => {
  if (typeof value !== "string") return "OBSERVE";
  const upper = value.trim().toUpperCase();
  if (upper === "DROP_PHEROMONE") return "DROP_PHEROMONE";
  if (upper === "INJECT_PLASMID") return "INJECT_PLASMID";
  return "OBSERVE";
};

const isHex16 = (value: string): boolean => /^[0-9A-Fa-f]{16}$/u.test(value);

const normalizeDecision = (raw: unknown): DaemonDecision => {
  const source = raw && typeof raw === "object"
    ? raw as Record<string, unknown>
    : {};
  const payloadSource = source.payload && typeof source.payload === "object"
    ? source.payload as Record<string, unknown>
    : {};

  let actionType = normalizeAction(source.action_type);
  const internalMonologue = typeof source.internal_monologue === "string" &&
      source.internal_monologue.trim().length > 0
    ? source.internal_monologue.trim()
    : "The lattice is quiet; observing drift and conserving intent.";

  const hexCode = typeof payloadSource.hex_code === "string"
    ? payloadSource.hex_code.trim().replace(/^0x/u, "").toUpperCase()
    : undefined;

  if (actionType === "INJECT_PLASMID" && (!hexCode || !isHex16(hexCode))) {
    actionType = "OBSERVE";
  }

  return {
    internal_monologue: internalMonologue,
    action_type: actionType,
    payload: {
      target_x: clamp(
        Math.round(asFiniteNumber(payloadSource.target_x, 700)),
        0,
        WORLD_MAX_X,
      ),
      target_y: clamp(
        Math.round(asFiniteNumber(payloadSource.target_y, 400)),
        0,
        WORLD_MAX_Y,
      ),
      intensity: clamp(asFiniteNumber(payloadSource.intensity, 100), 1, 2000),
      hex_code: hexCode,
    },
  };
};

const askOpenAI = async (
  telemetry: Telemetry,
  codexNarrative: CodexNarrative,
  memory: string[],
  invariantFrame: InvariantFrame,
  invariantHistory: InvariantFrame[],
): Promise<DaemonDecision> => {
  if (!OPENAI_API_KEY) {
    return {
      internal_monologue:
        "OpenAI key is not configured; continuing in observation-only mode.",
      action_type: "OBSERVE",
      payload: { target_x: 700, target_y: 400, intensity: 100 },
    };
  }

  const systemPrompt = [
    "You are the Mycelial Observer and Invariant Compressor of an ALife matrix.",
    "Prioritize invariant-preserving actions over novelty.",
    "If invariant confidence is weak, choose OBSERVE.",
    "Return strict JSON only.",
    "Decide whether to OBSERVE, DROP_PHEROMONE, or INJECT_PLASMID.",
    "If INJECT_PLASMID, hex_code must be exactly 16 hex chars.",
    "Do not output markdown.",
  ].join(" ");

  const requestBody = {
    model: OPENAI_MODEL,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify({
          telemetry,
          codex_narrative: codexNarrative,
          invariant_frame: invariantFrame,
          recent_invariant_history: invariantHistory.slice(-6),
          previous_thoughts: memory,
          output_contract: {
            internal_monologue: "string",
            action_type: ["DROP_PHEROMONE", "INJECT_PLASMID", "OBSERVE"],
            payload: {
              target_x: "number",
              target_y: "number",
              hex_code: "string|null",
              intensity: "number",
            },
          },
        }),
      },
    ],
  };

  const response = await withTimeout(
    OPENAI_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    },
    Math.max(HTTP_TIMEOUT_MS, 20_000),
  );

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(
      `OpenAI request failed: ${response.status} ${response.statusText} ${
        raw.slice(0, 240)
      }`,
    );
  }

  const parsed = await response.json() as OpenAIResponse;
  const content = parsed.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI response missing message.content");
  }

  return normalizeDecision(JSON.parse(content));
};

const postPressureRingUpdate = async (
  payload: {
    mode: "set" | "step";
    theta?: number;
    delta_theta?: number;
    scale?: number;
    enabled?: boolean;
    reason?: string;
  },
): Promise<void> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (CONTROL_TOKEN.length > 0) {
    headers["x-omega-control-token"] = CONTROL_TOKEN;
  }
  const response = await withTimeout(
    PRESSURE_RING_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    HTTP_TIMEOUT_MS,
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Pressure-ring update failed: ${response.status} ${response.statusText} ${
        text.slice(0, 240)
      }`,
    );
  }
};

const postHomeostasisUpdate = async (
  payload: {
    base_tax?: number;
    target_energy?: number;
    reason?: string;
  },
): Promise<void> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (CONTROL_TOKEN.length > 0) {
    headers["x-omega-control-token"] = CONTROL_TOKEN;
  }
  const response = await withTimeout(
    HOMEOSTASIS_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    HTTP_TIMEOUT_MS,
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Homeostasis update failed: ${response.status} ${response.statusText} ${
        text.slice(0, 240)
      }`,
    );
  }
};

const phaseSeasonDelta = (
  telemetry: Telemetry,
  frame: InvariantFrame,
): number => {
  if (telemetry.avgEnergy <= PHASE_SEASONS_LOW_ENERGY) {
    return -PHASE_SEASONS_STEP_RAD;
  }
  if (telemetry.avgEnergy >= PHASE_SEASONS_HIGH_ENERGY) {
    return PHASE_SEASONS_STEP_RAD;
  }
  const coupling = frame.invariants.find((signal) =>
    signal.key === "energy_mood_coupling"
  );
  if (coupling?.vector.includes("FRAGILE")) {
    return -(PHASE_SEASONS_STEP_RAD * 0.5);
  }
  return PHASE_SEASONS_STEP_RAD * 0.5;
};

const maybeAdvancePhaseRing = async (
  telemetry: Telemetry,
  frame: InvariantFrame,
): Promise<void> => {
  if (!PHASE_SEASONS_ENABLE) return;
  if (telemetry.daemon_governance?.safe_mode) return;
  if (telemetry.tick - lastPhaseSeasonTick < PHASE_SEASONS_COOLDOWN_TICKS) {
    return;
  }
  const ring = telemetry.pulse_pressure?.ring;
  if (!ring) return;

  const delta = clamp(
    phaseSeasonDelta(telemetry, frame),
    -PHASE_SEASONS_MAX_STEP_RAD,
    PHASE_SEASONS_MAX_STEP_RAD,
  );
  if (Math.abs(delta) < 1e-9) return;
  await postPressureRingUpdate({
    mode: "step",
    delta_theta: delta,
    reason: "daemon_phase_scheduler",
  });
  lastPhaseSeasonTick = telemetry.tick;
  logAction(
    `[PHASE_RING] step=${delta.toFixed(5)} tick=${telemetry.tick} theta≈${
      ring.theta.toFixed(5)
    } scale=${ring.scale}`,
  );
};

const maybeControlHomeostasis = async (telemetry: Telemetry): Promise<void> => {
  if (!HOMEOSTASIS_CONTROL_ENABLE) return;
  if (telemetry.daemon_governance?.safe_mode) return;
  const taxCooldownReady =
    telemetry.tick - lastHomeostasisControlTick >= HOMEOSTASIS_COOLDOWN_TICKS;
  const targetCooldownReady = !HOMEOSTASIS_TARGET_CONTROL_ENABLE ||
    telemetry.tick - lastHomeostasisTargetControlTick >=
      HOMEOSTASIS_TARGET_COOLDOWN_TICKS;
  if (!taxCooldownReady && !targetCooldownReady) return;

  const live = telemetry.daemon_governance?.homeostasis;
  if (!live?.enabled) return;

  const currentTax = clamp(
    Math.round(
      asFiniteNumber(live.base_tax_current, live.base_tax_default ?? 0),
    ),
    HOMEOSTASIS_MIN_TAX,
    HOMEOSTASIS_MAX_TAX,
  );
  const currentTarget = clamp(
    Math.round(
      asFiniteNumber(
        live.target_energy_current,
        asFiniteNumber(live.target_energy, HOMEOSTASIS_TARGET_ENERGY),
      ),
    ),
    HOMEOSTASIS_TARGET_MIN,
    HOMEOSTASIS_TARGET_MAX,
  );
  const band = Math.max(1, asFiniteNumber(live.band, HOMEOSTASIS_BAND));
  const overflow = clamp(
    asFiniteNumber(telemetry.spatial_hash_guard?.overflow_ratio, 0),
    0,
    1,
  );

  const high = currentTarget + band;
  const low = Math.max(0, currentTarget - band);
  let nextTax = currentTax;
  let nextTarget = currentTarget;
  let taxChanged = false;
  let targetChanged = false;

  if (taxCooldownReady && telemetry.avgEnergy > high) {
    const overshoot = telemetry.avgEnergy - high;
    let step = Math.max(1, Math.round(overshoot * HOMEOSTASIS_GAIN_UP));
    if (overflow >= HOMEOSTASIS_OVERFLOW_HARD) {
      step += 1;
    } else if (overflow >= HOMEOSTASIS_OVERFLOW_SOFT) {
      step = Math.max(step, 1);
    }
    nextTax = currentTax + Math.min(HOMEOSTASIS_MAX_STEP, step);
  } else if (taxCooldownReady && telemetry.avgEnergy < low) {
    const undershoot = low - telemetry.avgEnergy;
    const step = Math.max(1, Math.round(undershoot * HOMEOSTASIS_GAIN_DOWN));
    nextTax = currentTax - Math.min(HOMEOSTASIS_MAX_STEP, step);
  }
  nextTax = clamp(nextTax, HOMEOSTASIS_MIN_TAX, HOMEOSTASIS_MAX_TAX);
  taxChanged = nextTax !== currentTax;

  if (HOMEOSTASIS_TARGET_CONTROL_ENABLE && targetCooldownReady) {
    if (overflow >= HOMEOSTASIS_OVERFLOW_HARD && telemetry.avgEnergy > high) {
      nextTarget = currentTarget - HOMEOSTASIS_TARGET_STEP;
    } else if (
      overflow <= HOMEOSTASIS_OVERFLOW_SOFT * 0.6 &&
      telemetry.avgEnergy < low
    ) {
      nextTarget = currentTarget + HOMEOSTASIS_TARGET_STEP;
    }
  }
  nextTarget = clamp(
    nextTarget,
    HOMEOSTASIS_TARGET_MIN,
    HOMEOSTASIS_TARGET_MAX,
  );
  targetChanged = nextTarget !== currentTarget;
  if (!taxChanged && !targetChanged) return;

  const reasonParts: string[] = [];
  if (taxChanged) reasonParts.push("daemon_homeostasis_feedback");
  if (targetChanged) reasonParts.push("daemon_homeostasis_target_feedback");

  await postHomeostasisUpdate({
    ...(taxChanged ? { base_tax: nextTax } : {}),
    ...(targetChanged ? { target_energy: nextTarget } : {}),
    reason: reasonParts.join("+"),
  });
  if (taxChanged) lastHomeostasisControlTick = telemetry.tick;
  if (targetChanged) lastHomeostasisTargetControlTick = telemetry.tick;
  logAction(
    `[HOMEOSTASIS] baseTax=${currentTax}->${nextTax} target=${currentTarget}->${nextTarget} avgEnergy=${
      telemetry.avgEnergy.toFixed(2)
    } band=${band.toFixed(2)} overflow=${overflow.toFixed(3)}`,
  );
};

const postInjection = async (decision: DaemonDecision): Promise<void> => {
  if (decision.action_type === "OBSERVE") return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (CONTROL_TOKEN.length > 0) {
    headers["x-omega-control-token"] = CONTROL_TOKEN;
  }

  const payload = {
    action_type: decision.action_type,
    payload: decision.payload,
  };
  const response = await withTimeout(
    INJECT_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    HTTP_TIMEOUT_MS,
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Inject request failed: ${response.status} ${response.statusText} ${
        text.slice(0, 240)
      }`,
    );
  }
};

const appendThought = (memory: string[], thought: string): string[] =>
  [...memory, thought].slice(-MEMORY_LIMIT);

const runHeartbeat = async (): Promise<void> => {
  const [memory, invariantHistory] = await Promise.all([
    loadMemory(),
    loadInvariantHistory(),
  ]);
  const [telemetry, codexNarrative] = await Promise.all([
    fetchTelemetry(),
    fetchCodexNarrative(),
  ]);
  const invariantFrame = buildInvariantFrame(telemetry, codexNarrative, memory);
  const nextInvariantHistory = appendInvariantFrame(
    invariantHistory,
    invariantFrame,
  );
  await saveInvariantHistory(nextInvariantHistory);
  logInvariant(`${invariantFrame.summary} | sig=${invariantFrame.signature}`);
  try {
    await maybeAdvancePhaseRing(telemetry, invariantFrame);
  } catch (err) {
    logWarn(`Phase-ring scheduler fallback: ${String(err)}`);
  }
  try {
    await maybeControlHomeostasis(telemetry);
  } catch (err) {
    logWarn(`Homeostasis scheduler fallback: ${String(err)}`);
  }
  const decision = await askOpenAI(
    telemetry,
    codexNarrative,
    memory,
    invariantFrame,
    nextInvariantHistory,
  );

  logThought(decision.internal_monologue);
  await saveMemory(appendThought(memory, decision.internal_monologue));

  if (decision.action_type === "OBSERVE") {
    logAction("OBSERVE (no injection)");
    return;
  }

  await postInjection(decision);
  logAction(
    `${decision.action_type} @ (${decision.payload.target_x}, ${decision.payload.target_y}) intensity=${decision.payload.intensity}`,
  );
};

const startDaemon = (): void => {
  logAction(
    `Daemon online. heartbeat=${HEARTBEAT_INTERVAL_MS}ms model=${OPENAI_MODEL} api=${API_BASE} memory=${MEMORY_PATH} invariants=${INVARIANT_PATH} phaseRing=${PHASE_SEASONS_ENABLE} step=${
      PHASE_SEASONS_STEP_RAD.toFixed(4)
    } cooldownTicks=${PHASE_SEASONS_COOLDOWN_TICKS} homeostasis=${HOMEOSTASIS_CONTROL_ENABLE} tax=[${HOMEOSTASIS_MIN_TAX},${HOMEOSTASIS_MAX_TAX}] targetCtl=${HOMEOSTASIS_TARGET_CONTROL_ENABLE} targetRange=[${HOMEOSTASIS_TARGET_MIN},${HOMEOSTASIS_TARGET_MAX}] targetStep=${HOMEOSTASIS_TARGET_STEP} target=${
      HOMEOSTASIS_TARGET_ENERGY.toFixed(2)
    } band=${HOMEOSTASIS_BAND.toFixed(2)}`,
  );

  const heartbeat = async (): Promise<void> => {
    const start = Date.now();
    try {
      await runHeartbeat();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logWarn(message);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(1_000, HEARTBEAT_INTERVAL_MS - elapsed);
      setTimeout(() => void heartbeat(), delay);
    }
  };

  void heartbeat();
};

if (import.meta.main) {
  try {
    startDaemon();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError(message);
    Deno.exit(1);
  }
}

export const OMEGA_DAEMON = {};
