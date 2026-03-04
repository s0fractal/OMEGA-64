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
    summary: typeof source.summary === "string" && source.summary.trim().length > 0
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
      summary: "Codex narrative endpoint unavailable; operating on telemetry only.",
      relicStatus: "Relic status unavailable.",
      promptBridge: "Use plain language for observer-facing updates.",
      recentChronicles: [],
    };
  }
};

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
    "You are the Mycelial Observer of an ALife matrix.",
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
  const memory = await loadMemory();
  const [telemetry, codexNarrative] = await Promise.all([
    fetchTelemetry(),
    fetchCodexNarrative(),
  ]);
  const decision = await askOpenAI(telemetry, codexNarrative, memory);

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
    `Daemon online. heartbeat=${HEARTBEAT_INTERVAL_MS}ms model=${OPENAI_MODEL} api=${API_BASE}`,
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
