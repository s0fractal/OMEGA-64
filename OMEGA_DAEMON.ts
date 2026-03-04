// OMEGA-64 | OMEGA_DAEMON.ts | Era 70: Mycelial Observer Daemon
// Autonomous companion loop: reads telemetry, reasons via OpenAI, injects stimuli.

type Telemetry = {
  tick: number;
  avgEnergy: number;
  dominantGenomes: string[];
  voxPopuli: string[];
};

type CodexNarrative = {
  tick: number;
  epoch: number;
  mood: string;
  title: string;
  summary: string;
  relicStatus: string;
  promptBridge: string;
  recentChronicles: Array<{
    tick: number;
    epoch: number;
    type: string;
    title: string;
  }>;
};

type ActionType = "DROP_PHEROMONE" | "INJECT_PLASMID" | "OBSERVE";

type DaemonDecision = {
  internal_monologue: string;
  action_type: ActionType;
  payload: {
    target_x: number;
    target_y: number;
    hex_code?: string;
    intensity: number;
  };
};

type InvariantSignal = {
  key: string;
  vector: string;
  weight: number;
  evidence: string[];
};

type InvariantFrame = {
  tick: number;
  epoch: number;
  center: string;
  signature: string;
  invariants: InvariantSignal[];
  summary: string;
  created_at: string;
};

type OpenAIChoice = {
  message?: {
    content?: string;
  };
};

type OpenAIResponse = {
  choices?: OpenAIChoice[];
};

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
const OPENAI_URL = Deno.env.get("OPENAI_API_URL") ??
  "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = Deno.env.get("OMEGA_DAEMON_MODEL") ?? "gpt-4o";
const OPENAI_API_KEY = (Deno.env.get("OPENAI_API_KEY") ?? "").trim();
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
  "./daemon_invariants.json";

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
  return {
    tick: Math.max(0, Math.floor(asFiniteNumber(source.tick, 0))),
    avgEnergy: asFiniteNumber(source.avgEnergy, 0),
    dominantGenomes: dominantGenomes.slice(0, 3),
    voxPopuli: voxPopuli.slice(0, 8),
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
    promptBridge: typeof source.promptBridge === "string"
      ? source.promptBridge
      : "Use plain language for observer-facing updates.",
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
    ...telemetry.voxPopuli.slice(0, 4),
  ]);
  const sharedTokens = setIntersection(memoryTokens, narrativeTokens).slice(
    0,
    6,
  );
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
  ];

  const signatureSeed = JSON.stringify({
    tick: telemetry.tick,
    epoch: codexNarrative.epoch,
    mood,
    energy,
    lineage,
    sharedTokens,
  });
  const signature = fnv1a32(signatureSeed);
  const summary =
    `center=tick.exists | energy=${energy} | mood=${mood} | lineage=${lineage} | overlap=${
      sharedTokens.length > 0 ? sharedTokens.join(",") : "none"
    }`;

  return {
    tick: telemetry.tick,
    epoch: codexNarrative.epoch,
    center: "tick.exists",
    signature,
    invariants: invariantSignals,
    summary,
    created_at: timestamp(),
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
        1399,
      ),
      target_y: clamp(
        Math.round(asFiniteNumber(payloadSource.target_y, 400)),
        0,
        799,
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

const postInjection = async (decision: DaemonDecision): Promise<void> => {
  if (decision.action_type === "OBSERVE") return;

  const payload = {
    action_type: decision.action_type,
    payload: decision.payload,
  };
  const response = await withTimeout(
    INJECT_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    `Daemon online. heartbeat=${HEARTBEAT_INTERVAL_MS}ms model=${OPENAI_MODEL} api=${API_BASE} memory=${MEMORY_PATH} invariants=${INVARIANT_PATH}`,
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
