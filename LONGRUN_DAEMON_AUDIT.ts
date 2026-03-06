import { evaluateGuardianSignalPromotion } from "./GUARDIAN_SIGNAL_PROMOTION.ts";

type AuditConfig = {
  hostUrl: string;
  durationSec: number;
  sampleMs: number;
  perturbMs: number;
  bootTimeoutMs: number;
  requestTimeoutMs: number;
  maxConsecutiveTelemetryFailures: number;
  minSuccessRate: number;
  maxP95TelemetryLatencyMs: number;
  minTickDeltaPerSample: number;
  maxSafeModeRatio: number;
  minAvgEnergyP05: number;
  maxSpatialOverflowRatioP95: number;
  maxFederationRejectRatio: number;
  maxDaemonRejectRatio: number;
  minEffectEvalCoverage: number;
  maxPerturbFailureRatio: number;
  minPerturbAttempts: number;
  minSamples: number;
  requireDaemonAccepts: boolean;
  spawnDaemon: boolean;
  includeFullSamples: boolean;
  enableSyntheticInject: boolean;
  enableSyntheticPhaseRing: boolean;
  syntheticPheromoneIntensity: number;
  syntheticPlasmidIntensity: number;
  phaseRingStepRad: number;
  coldstartEnable: boolean;
  coldstartCount: number;
  coldstartReplicatorRatio: number;
  coldstartEnergy: number;
  coldstartResonance: number;
  daemonHeartbeatMs: number;
  daemonAuditPath: string;
  controlToken: string;
  seed: number;
  worldWidth: number;
  worldHeight: number;
};

type TelemetryEnvelope = {
  tick?: number;
  avgEnergy?: number;
  guardian_signal_hybrid?: {
    mode?: string;
    hybridRuns?: number;
    shadowRuns?: number;
    fallbackRuns?: number;
    stableBranchCount?: number;
    repairBranchCount?: number;
    allowedGuardianSignals?: number;
    suppressedGuardianSignals?: number;
    shadowSuppressedGuardianSignals?: number;
    lastTick?: number;
    lastStatus?: string;
    lastBranch?: string;
    lastFallbackReason?: string;
  };
  guardian_signal_promotion?: {
    status?: string;
    ready?: boolean;
    recommendedMode?: string;
    fallbackRatio?: number;
  };
  daemon_governance?: {
    safe_mode?: boolean;
    safe_mode_reason?: string;
    actions_used_in_window?: number;
    actions_max_in_window?: number;
    actions_dynamic_max_in_window?: number;
    last_admission?: {
      status?: string;
      severity?: string;
      degraded?: boolean;
      requestedAction?: string;
      appliedAction?: string;
      reason?: string;
      score?: number;
    };
  };
  spatial_hash_guard?: {
    overflow_ratio?: number;
    overflow_count?: number;
    max_cell_count?: number;
  };
  federation_admission?: {
    latest?: {
      action?: string;
      severity?: string;
      score?: number;
    };
  };
};

type CodexEnvelope = {
  population?: {
    current?: number;
    peak?: number;
  };
  chronicles?: Array<{
    tick?: number;
    type?: string;
    title?: string;
  }>;
};

type FederationAdmissionEnvelope = {
  latest?: {
    action?: string;
    severity?: string;
    score?: number;
  };
};

type DaemonAuditEvent = {
  event_type: string;
  tick?: number;
  action?: string;
  requested_action?: string;
  degraded?: boolean;
  degrade_reason?: string;
  admission?: {
    severity?: string;
    score?: number;
  };
  queue?: {
    ok?: boolean;
    reason?: string;
    status?: number;
  };
  delta?: {
    population?: number;
    avgEnergy?: number;
    neuralCoherence?: number;
  };
};

type Sample = {
  sampleIndex: number;
  elapsedMs: number;
  tick: number;
  tickDelta: number;
  avgEnergy: number;
  telemetryLatencyMs: number;
  safeMode: boolean;
  safeModeReason: string;
  spatialOverflowRatio: number;
  spatialOverflowCount: number;
  spatialMaxCellCount: number;
  federationAction: string;
  federationSeverity: string;
  daemonAdmissionStatus: string;
  daemonAdmissionSeverity: string;
  daemonAdmissionDegraded: boolean;
  daemonActionsUsedInWindow: number;
  daemonActionsMaxInWindow: number;
  daemonActionsDynamicMaxInWindow: number;
  guardianPromotionReady: boolean;
  guardianPromotionStatus: string;
  guardianPromotionRecommendedMode: string;
  guardianPromotionFallbackRatio: number;
  populationCurrent: number;
  populationPeak: number;
  codexChroniclesCount: number;
};

type PerturbationResult = {
  sequence: number;
  elapsedMs: number;
  kind: "pressure_ring" | "drop_pheromone" | "inject_plasmid";
  ok: boolean;
  httpStatus: number;
  reason: string;
  degraded: boolean;
  admissionSeverity: string;
  admissionScore: number;
  snippet: string;
};

type Check = {
  name: string;
  observed: number | boolean | string;
  limit: number | boolean | string;
  ok: boolean;
};

type FetchResult<T> =
  | { ok: true; data: T; latencyMs: number }
  | { ok: false; latencyMs: number; error: string };

type PerturbationContext = {
  nextU32: () => number;
  sequence: number;
};

const REPORT_JSON_PATH = "LONGRUN_DAEMON_AUDIT.json";
const REPORT_MD_PATH = "LONGRUN_DAEMON_AUDIT.md";
const CORE_TASK = ["task", "core:start"];
const DAEMON_TASK = ["task", "daemon:start"];
const LOG_RING_CAPACITY = 280;
const PERTURB_TAIL_CAPACITY = 64;
const DAEMON_EVENT_TAIL_CAPACITY = 80;

const parseIntEnv = (
  name: string,
  fallback: number,
  min: number,
  max: number,
): number => {
  const raw = Deno.env.get(name);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const parseFloatEnv = (
  name: string,
  fallback: number,
  min: number,
  max: number,
): number => {
  const raw = Deno.env.get(name);
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const parseBoolEnv = (name: string, fallback: boolean): boolean => {
  const raw = Deno.env.get(name);
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const clamped = Math.max(0, Math.min(100, p));
  const rank = (clamped / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sorted[low];
  const weight = rank - low;
  return sorted[low] * (1 - weight) + sorted[high] * weight;
};

const mean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStringSafe = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;

const toBool = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["1", "true", "yes", "on"].includes(normalized);
  }
  if (typeof value === "number") return value !== 0;
  return false;
};

const deriveGuardianPromotion = (
  telemetry: TelemetryEnvelope,
): {
  ready: boolean;
  status: string;
  recommendedMode: string;
  fallbackRatio: number;
} => {
  if (telemetry.guardian_signal_hybrid) {
    const evaluated = evaluateGuardianSignalPromotion({
      mode: toStringSafe(
        telemetry.guardian_signal_hybrid.mode,
        "shadow-reduce",
      ) as "legacy-execute" | "hybrid-reduce" | "shadow-reduce",
      hybridRuns: Math.floor(
        toFiniteNumber(telemetry.guardian_signal_hybrid.hybridRuns, 0),
      ),
      shadowRuns: Math.floor(
        toFiniteNumber(telemetry.guardian_signal_hybrid.shadowRuns, 0),
      ),
      fallbackRuns: Math.floor(
        toFiniteNumber(telemetry.guardian_signal_hybrid.fallbackRuns, 0),
      ),
      stableBranchCount: Math.floor(
        toFiniteNumber(telemetry.guardian_signal_hybrid.stableBranchCount, 0),
      ),
      repairBranchCount: Math.floor(
        toFiniteNumber(telemetry.guardian_signal_hybrid.repairBranchCount, 0),
      ),
      allowedGuardianSignals: Math.floor(
        toFiniteNumber(
          telemetry.guardian_signal_hybrid.allowedGuardianSignals,
          0,
        ),
      ),
      suppressedGuardianSignals: Math.floor(
        toFiniteNumber(
          telemetry.guardian_signal_hybrid.suppressedGuardianSignals,
          0,
        ),
      ),
      shadowSuppressedGuardianSignals: Math.floor(
        toFiniteNumber(
          telemetry.guardian_signal_hybrid.shadowSuppressedGuardianSignals,
          0,
        ),
      ),
      lastTick: Math.floor(
        toFiniteNumber(telemetry.guardian_signal_hybrid.lastTick, 0),
      ),
      lastStatus: toStringSafe(
        telemetry.guardian_signal_hybrid.lastStatus,
        "legacy",
      ) as "legacy" | "stable" | "repair" | "fallback",
      lastBranch: toStringSafe(
        telemetry.guardian_signal_hybrid.lastBranch,
        "unknown",
      ) as "stable" | "repair" | "unknown",
      lastFallbackReason: toStringSafe(
        telemetry.guardian_signal_hybrid.lastFallbackReason,
        "",
      ),
    });
    return {
      ready: evaluated.ready,
      status: evaluated.status,
      recommendedMode: evaluated.recommendedMode,
      fallbackRatio: evaluated.fallbackRatio,
    };
  }
  return {
    ready: telemetry.guardian_signal_promotion?.ready === true,
    status: toStringSafe(
      telemetry.guardian_signal_promotion?.status,
      "unknown",
    ),
    recommendedMode: toStringSafe(
      telemetry.guardian_signal_promotion?.recommendedMode,
      "shadow-reduce",
    ),
    fallbackRatio: toFiniteNumber(
      telemetry.guardian_signal_promotion?.fallbackRatio,
      0,
    ),
  };
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const createConfig = (): AuditConfig => {
  const hostUrl = (Deno.env.get("OMEGA_LONGRUN_URL") ?? "http://127.0.0.1:8000")
    .trim()
    .replace(/\/+$/u, "");
  const controlToken = (
    Deno.env.get("OMEGA_LONGRUN_CONTROL_TOKEN") ??
      Deno.env.get("OMEGA_SYSTEM_CONTROL_TOKEN") ??
      ""
  ).trim();
  return {
    hostUrl,
    durationSec: parseIntEnv("OMEGA_LONGRUN_DURATION_SEC", 600, 60, 172800),
    sampleMs: parseIntEnv("OMEGA_LONGRUN_SAMPLE_MS", 5000, 500, 120000),
    perturbMs: parseIntEnv("OMEGA_LONGRUN_PERTURB_MS", 12000, 1000, 300000),
    bootTimeoutMs: parseIntEnv(
      "OMEGA_LONGRUN_BOOT_TIMEOUT_MS",
      45000,
      1000,
      300000,
    ),
    requestTimeoutMs: parseIntEnv(
      "OMEGA_LONGRUN_REQUEST_TIMEOUT_MS",
      3500,
      200,
      30000,
    ),
    maxConsecutiveTelemetryFailures: parseIntEnv(
      "OMEGA_LONGRUN_MAX_CONSEC_FAILS",
      4,
      1,
      128,
    ),
    minSuccessRate: parseFloatEnv("OMEGA_LONGRUN_MIN_SUCCESS_RATE", 0.9, 0, 1),
    maxP95TelemetryLatencyMs: parseIntEnv(
      "OMEGA_LONGRUN_MAX_P95_TELEMETRY_MS",
      4000,
      50,
      60000,
    ),
    minTickDeltaPerSample: parseIntEnv(
      "OMEGA_LONGRUN_MIN_TICK_DELTA",
      1,
      0,
      1000000,
    ),
    maxSafeModeRatio: parseFloatEnv(
      "OMEGA_LONGRUN_MAX_SAFE_MODE_RATIO",
      0.98,
      0,
      1,
    ),
    minAvgEnergyP05: parseFloatEnv(
      "OMEGA_LONGRUN_MIN_AVG_ENERGY_P05",
      1,
      0,
      1_000_000,
    ),
    maxSpatialOverflowRatioP95: parseFloatEnv(
      "OMEGA_LONGRUN_MAX_OVERFLOW_RATIO_P95",
      0.75,
      0,
      1,
    ),
    maxFederationRejectRatio: parseFloatEnv(
      "OMEGA_LONGRUN_MAX_FED_REJECT_RATIO",
      0.98,
      0,
      1,
    ),
    maxDaemonRejectRatio: parseFloatEnv(
      "OMEGA_LONGRUN_MAX_DAEMON_REJECT_RATIO",
      0.9,
      0,
      1,
    ),
    minEffectEvalCoverage: parseFloatEnv(
      "OMEGA_LONGRUN_MIN_EFFECT_EVAL_COVERAGE",
      0.2,
      0,
      1,
    ),
    maxPerturbFailureRatio: parseFloatEnv(
      "OMEGA_LONGRUN_MAX_PERTURB_FAILURE_RATIO",
      0.5,
      0,
      1,
    ),
    minPerturbAttempts: parseIntEnv(
      "OMEGA_LONGRUN_MIN_PERTURB_ATTEMPTS",
      3,
      0,
      100000,
    ),
    minSamples: parseIntEnv("OMEGA_LONGRUN_MIN_SAMPLES", 8, 1, 100000),
    requireDaemonAccepts: parseBoolEnv(
      "OMEGA_LONGRUN_REQUIRE_DAEMON_ACCEPTS",
      false,
    ),
    spawnDaemon: parseBoolEnv("OMEGA_LONGRUN_SPAWN_DAEMON", true),
    includeFullSamples: parseBoolEnv("OMEGA_LONGRUN_FULL_SAMPLES", false),
    enableSyntheticInject: parseBoolEnv(
      "OMEGA_LONGRUN_SYNTHETIC_INJECT",
      true,
    ),
    enableSyntheticPhaseRing: parseBoolEnv(
      "OMEGA_LONGRUN_SYNTHETIC_PHASE_RING",
      true,
    ),
    syntheticPheromoneIntensity: parseIntEnv(
      "OMEGA_LONGRUN_SYNTHETIC_PHEROMONE_INTENSITY",
      96,
      1,
      5000,
    ),
    syntheticPlasmidIntensity: parseIntEnv(
      "OMEGA_LONGRUN_SYNTHETIC_PLASMID_INTENSITY",
      220,
      1,
      5000,
    ),
    phaseRingStepRad: parseFloatEnv(
      "OMEGA_LONGRUN_PHASE_RING_STEP_RAD",
      0.0625,
      0.0001,
      Math.PI / 2,
    ),
    coldstartEnable: parseBoolEnv("OMEGA_LONGRUN_COLDSTART_ENABLE", true),
    coldstartCount: parseIntEnv("OMEGA_LONGRUN_COLDSTART_COUNT", 24, 0, 100000),
    coldstartReplicatorRatio: parseFloatEnv(
      "OMEGA_LONGRUN_COLDSTART_REPLICATOR_RATIO",
      0.45,
      0,
      1,
    ),
    coldstartEnergy: parseIntEnv(
      "OMEGA_LONGRUN_COLDSTART_ENERGY",
      2200,
      1,
      1000000,
    ),
    coldstartResonance: parseIntEnv(
      "OMEGA_LONGRUN_COLDSTART_RESONANCE",
      220,
      0,
      1000000,
    ),
    daemonHeartbeatMs: parseIntEnv(
      "OMEGA_LONGRUN_DAEMON_HEARTBEAT_MS",
      12000,
      1000,
      300000,
    ),
    daemonAuditPath: (Deno.env.get("OMEGA_LONGRUN_DAEMON_AUDIT_PATH") ??
      Deno.env.get("OMEGA_DAEMON_AUDIT_PATH") ??
      "./DAEMON_AUDIT.jsonl").trim(),
    controlToken,
    seed: parseIntEnv("OMEGA_LONGRUN_SEED", 1337, 1, 2_147_483_647),
    worldWidth: parseIntEnv("OMEGA_LONGRUN_WORLD_WIDTH", 1400, 8, 100000),
    worldHeight: parseIntEnv("OMEGA_LONGRUN_WORLD_HEIGHT", 800, 8, 100000),
  };
};

const readProcessStream = async (
  stream: ReadableStream<Uint8Array> | null,
  channel: "stdout" | "stderr",
  processName: "core" | "daemon",
  sink: string[],
): Promise<void> => {
  if (!stream) return;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      let newlineIndex = pending.indexOf("\n");
      while (newlineIndex >= 0) {
        const line = pending.slice(0, newlineIndex).trimEnd();
        pending = pending.slice(newlineIndex + 1);
        if (line.length > 0) {
          sink.push(`[${processName}:${channel}] ${line}`);
          if (sink.length > LOG_RING_CAPACITY) {
            sink.splice(0, sink.length - LOG_RING_CAPACITY);
          }
        }
        newlineIndex = pending.indexOf("\n");
      }
    }
    const tail = (pending + decoder.decode()).trim();
    if (tail.length > 0) {
      sink.push(`[${processName}:${channel}] ${tail}`);
      if (sink.length > LOG_RING_CAPACITY) {
        sink.splice(0, sink.length - LOG_RING_CAPACITY);
      }
    }
  } catch {
    // Best-effort log capture.
  } finally {
    reader.releaseLock();
  }
};

const fetchJson = async <T>(
  url: string,
  timeoutMs: number,
): Promise<FetchResult<T>> => {
  const started = performance.now();
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    const latencyMs = performance.now() - started;
    if (!response.ok) {
      return {
        ok: false,
        latencyMs,
        error: `http_${response.status}`,
      };
    }
    const payload = await response.json() as T;
    return { ok: true, data: payload, latencyMs };
  } catch (err) {
    return {
      ok: false,
      latencyMs: performance.now() - started,
      error: String(err),
    };
  }
};

const terminateChild = async (
  child: Deno.ChildProcess,
  timeoutMs = 3000,
): Promise<void> => {
  try {
    child.kill("SIGTERM");
  } catch {
    // no-op
  }
  const waitStart = performance.now();
  while (performance.now() - waitStart < timeoutMs) {
    const status = await Promise.race([
      child.status,
      sleep(100).then(() => null),
    ]);
    if (status) return;
  }
  try {
    child.kill("SIGKILL");
  } catch {
    // no-op
  }
  try {
    await child.status;
  } catch {
    // no-op
  }
};

const createLcg = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
};

const randomCoord = (nextU32: () => number, maxExclusive: number): number =>
  Math.floor((nextU32() / 0x1_0000_0000) * maxExclusive);

const toJsonObject = (raw: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
};

const daemonAuthHeaders = (controlToken: string): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (controlToken.length > 0) {
    headers["x-omega-control-token"] = controlToken;
  }
  return headers;
};

const postJson = async (
  url: string,
  body: Record<string, unknown>,
  timeoutMs: number,
  headers: HeadersInit,
): Promise<{ ok: boolean; status: number; payload: Record<string, unknown> | null; text: string }> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      payload: toJsonObject(text),
      text,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      payload: null,
      text: String(err),
    };
  }
};

const nextPerturbationKinds = (
  config: AuditConfig,
): Array<PerturbationResult["kind"]> => {
  const kinds: Array<PerturbationResult["kind"]> = [];
  if (config.enableSyntheticPhaseRing) kinds.push("pressure_ring");
  if (config.enableSyntheticInject) {
    kinds.push("drop_pheromone", "inject_plasmid");
  }
  return kinds;
};

const choosePlasmidHex = (sequence: number): string => {
  const palette = [
    "0102030405101180",
    "001011120381A4A5",
    "0405A6A7A8A9AAAB",
    "0203040510111280",
  ];
  return palette[sequence % palette.length];
};

const performPerturbation = async (
  config: AuditConfig,
  context: PerturbationContext,
): Promise<PerturbationResult | null> => {
  const kinds = nextPerturbationKinds(config);
  if (kinds.length === 0) return null;
  const kind = kinds[context.sequence % kinds.length];
  const elapsedMs = Math.round(performance.now());
  const headers = daemonAuthHeaders(config.controlToken);
  const base = config.hostUrl;

  if (kind === "pressure_ring") {
    const sign = context.sequence % 2 === 0 ? 1 : -1;
    const response = await postJson(
      `${base}/api/pressure-ring`,
      {
        mode: "step",
        delta_theta: Number((sign * config.phaseRingStepRad).toFixed(6)),
        reason: "longrun_daemon_audit",
      },
      config.requestTimeoutMs,
      headers,
    );
    const reason = response.payload
      ? toStringSafe(response.payload.reason, response.ok ? "OK" : "FAILED")
      : (response.ok ? "OK" : "FAILED");
    return {
      sequence: context.sequence,
      elapsedMs,
      kind,
      ok: response.ok,
      httpStatus: response.status,
      reason,
      degraded: false,
      admissionSeverity: "NONE",
      admissionScore: 0,
      snippet: response.text.slice(0, 240),
    };
  }

  const targetX = randomCoord(context.nextU32, config.worldWidth);
  const targetY = randomCoord(context.nextU32, config.worldHeight);
  const body: Record<string, unknown> = kind === "drop_pheromone"
    ? {
      action_type: "DROP_PHEROMONE",
      payload: {
        target_x: targetX,
        target_y: targetY,
        intensity: config.syntheticPheromoneIntensity,
      },
    }
    : {
      action_type: "INJECT_PLASMID",
      payload: {
        target_x: targetX,
        target_y: targetY,
        intensity: config.syntheticPlasmidIntensity,
        hex_code: choosePlasmidHex(context.sequence),
      },
    };
  const response = await postJson(
    `${base}/api/inject`,
    body,
    config.requestTimeoutMs,
    headers,
  );
  const degraded = toBool(response.payload?.degraded);
  const admission = response.payload?.admission &&
      typeof response.payload.admission === "object"
    ? response.payload.admission as Record<string, unknown>
    : null;
  const admissionSeverity = toStringSafe(admission?.severity, "NONE")
    .toUpperCase();
  const admissionScore = Math.floor(toFiniteNumber(admission?.score, 0));
  const reason = toStringSafe(
    response.payload?.reason,
    response.ok ? "OK" : "FAILED",
  );
  return {
    sequence: context.sequence,
    elapsedMs,
    kind,
    ok: response.ok,
    httpStatus: response.status,
    reason,
    degraded,
    admissionSeverity,
    admissionScore,
    snippet: response.text.slice(0, 240),
  };
};

const readDaemonAuditDelta = async (
  path: string,
  processedLines: number,
): Promise<{
  nextProcessedLines: number;
  events: DaemonAuditEvent[];
}> => {
  try {
    const raw = await Deno.readTextFile(path);
    const lines = raw.split(/\r?\n/u).filter((line) => line.trim().length > 0);
    const start = lines.length < processedLines ? 0 : processedLines;
    const events: DaemonAuditEvent[] = [];
    for (const line of lines.slice(start)) {
      const parsed = toJsonObject(line);
      const eventType = toStringSafe(parsed?.event_type, "");
      if (eventType.length === 0) continue;
      events.push({
        event_type: eventType,
        tick: Math.floor(toFiniteNumber(parsed?.tick, -1)),
        action: toStringSafe(parsed?.action, ""),
        requested_action: toStringSafe(parsed?.requested_action, ""),
        degraded: toBool(parsed?.degraded),
        degrade_reason: toStringSafe(parsed?.degrade_reason, ""),
        admission: parsed?.admission && typeof parsed.admission === "object"
          ? {
            severity: toStringSafe(
              (parsed.admission as Record<string, unknown>).severity,
              "",
            ),
            score: toFiniteNumber(
              (parsed.admission as Record<string, unknown>).score,
              0,
            ),
          }
          : undefined,
        queue: parsed?.queue && typeof parsed.queue === "object"
          ? {
            ok: toBool((parsed.queue as Record<string, unknown>).ok),
            reason: toStringSafe(
              (parsed.queue as Record<string, unknown>).reason,
              "",
            ),
            status: Math.floor(
              toFiniteNumber(
                (parsed.queue as Record<string, unknown>).status,
                0,
              ),
            ),
          }
          : undefined,
        delta: parsed?.delta && typeof parsed.delta === "object"
          ? {
            population: Math.floor(
              toFiniteNumber(
                (parsed.delta as Record<string, unknown>).population,
                0,
              ),
            ),
            avgEnergy: toFiniteNumber(
              (parsed.delta as Record<string, unknown>).avgEnergy,
              0,
            ),
            neuralCoherence: toFiniteNumber(
              (parsed.delta as Record<string, unknown>).neuralCoherence,
              0,
            ),
          }
          : undefined,
      });
    }
    return { nextProcessedLines: lines.length, events };
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return { nextProcessedLines: processedLines, events: [] };
    }
    return { nextProcessedLines: processedLines, events: [] };
  }
};

const renderMarkdown = (
  generatedAt: string,
  summary: Record<string, unknown>,
  checks: Check[],
  daemonEventCounts: Record<string, number>,
  perturbationsTail: PerturbationResult[],
): string => {
  const checkRows = checks.map((check) =>
    `| ${
      check.ok ? "PASS" : "FAIL"
    } | ${check.name} | ${check.observed} | ${check.limit} |`
  ).join("\n");
  const daemonRows = Object.entries(daemonEventCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([eventType, count]) => `| ${eventType} | ${count} |`)
    .join("\n");
  const perturbRows = perturbationsTail.slice(-16).map((entry) =>
    `| ${entry.sequence} | ${entry.kind} | ${entry.ok ? "ok" : "fail"} | ${
      entry.httpStatus
    } | ${entry.reason} | ${
      entry.degraded ? "yes" : "no"
    } | ${entry.admissionSeverity} | ${entry.admissionScore} |`
  ).join("\n");
  return `# Longrun Daemon Audit

- generatedAt: ${generatedAt}
- durationSec: ${summary.durationSec}
- elapsedMs: ${summary.elapsedMs}
- bootReady: ${summary.bootReady}
- bootMs: ${summary.bootMs}
- spawnDaemon: ${summary.spawnDaemon}
- sampleCount: ${summary.sampleCount}
- successCount: ${summary.successCount}
- failureCount: ${summary.failureCount}
- successRate: ${summary.successRate}
- tickStart: ${summary.tickStart}
- tickEnd: ${summary.tickEnd}
- tickAdvance: ${summary.tickAdvance}
- p95TelemetryLatencyMs: ${summary.p95TelemetryLatencyMs}
- p05AvgEnergy: ${summary.p05AvgEnergy}
- p95SpatialOverflowRatio: ${summary.p95SpatialOverflowRatio}
- safeModeRatio: ${summary.safeModeRatio}
- federationRejectRatio: ${summary.federationRejectRatio}
- guardianSignalPromotionReadyLatest: ${summary.guardianSignalPromotionReadyLatest}
- guardianSignalPromotionReadyRatio: ${summary.guardianSignalPromotionReadyRatio}
- guardianSignalPromotionRecommendedMode: ${summary.guardianSignalPromotionRecommendedMode}
- guardianSignalFallbackRatioP95: ${summary.guardianSignalFallbackRatioP95}
- perturbAttempts: ${summary.perturbAttempts}
- perturbFailureRatio: ${summary.perturbFailureRatio}
- daemonAdmissionEvents: ${summary.daemonAdmissionEvents}
- daemonRejectRatio: ${summary.daemonRejectRatio}
- effectEvalCoverage: ${summary.effectEvalCoverage}

| status | check | observed | limit |
|---|---|---:|---:|
${checkRows}

## Daemon Events
| event_type | count |
|---|---:|
${daemonRows || "| (none) | 0 |"}

## Perturbation Tail
| seq | kind | ok | status | reason | degraded | severity | score |
|---:|---|---|---:|---|---|---|---:|
${perturbRows || "| - | - | - | - | - | - | - | - |"}
`;
};

const main = async () => {
  const config = createConfig();
  console.log(
    `🧪 [LONGRUN:DAEMON] start duration=${config.durationSec}s sample=${config.sampleMs}ms perturb=${config.perturbMs}ms host=${config.hostUrl}`,
  );

  const coreCommand = new Deno.Command("deno", {
    args: CORE_TASK,
    env: {
      ...Deno.env.toObject(),
      OMEGA_COLDSTART_ENABLE: config.coldstartEnable ? "1" : "0",
      OMEGA_COLDSTART_COUNT: String(config.coldstartCount),
      OMEGA_COLDSTART_REPLICATOR_RATIO: String(config.coldstartReplicatorRatio),
      OMEGA_COLDSTART_SEED: String(config.seed),
      OMEGA_COLDSTART_ENERGY: String(config.coldstartEnergy),
      OMEGA_COLDSTART_RESONANCE: String(config.coldstartResonance),
    },
    stdout: "piped",
    stderr: "piped",
  });
  const coreChild = coreCommand.spawn();
  const logTail: string[] = [];
  const coreStdoutPump = readProcessStream(
    coreChild.stdout,
    "stdout",
    "core",
    logTail,
  );
  const coreStderrPump = readProcessStream(
    coreChild.stderr,
    "stderr",
    "core",
    logTail,
  );

  let daemonChild: Deno.ChildProcess | null = null;
  let daemonStdoutPump: Promise<void> = Promise.resolve();
  let daemonStderrPump: Promise<void> = Promise.resolve();
  if (config.spawnDaemon) {
    const daemonCommand = new Deno.Command("deno", {
      args: DAEMON_TASK,
      env: {
        ...Deno.env.toObject(),
        OMEGA_DAEMON_API_BASE: config.hostUrl,
        HEARTBEAT_INTERVAL_MS: String(config.daemonHeartbeatMs),
        OMEGA_DAEMON_CONTROL_TOKEN: config.controlToken,
      },
      stdout: "piped",
      stderr: "piped",
    });
    daemonChild = daemonCommand.spawn();
    daemonStdoutPump = readProcessStream(
      daemonChild.stdout,
      "stdout",
      "daemon",
      logTail,
    );
    daemonStderrPump = readProcessStream(
      daemonChild.stderr,
      "stderr",
      "daemon",
      logTail,
    );
  }

  let coreExited = false;
  let coreExitCode = -1;
  let daemonExited = false;
  let daemonExitCode = -1;
  let shuttingDown = false;
  let coreUnexpectedExitDuringRun = false;
  let daemonUnexpectedExitDuringRun = false;

  coreChild.status.then((status) => {
    coreExited = true;
    coreExitCode = status.code;
    if (!shuttingDown) coreUnexpectedExitDuringRun = true;
  });
  if (daemonChild) {
    daemonChild.status.then((status) => {
      daemonExited = true;
      daemonExitCode = status.code;
      if (!shuttingDown) daemonUnexpectedExitDuringRun = true;
    });
  }

  const bootStarted = performance.now();
  let bootReady = false;
  let bootMs = -1;
  while (performance.now() - bootStarted < config.bootTimeoutMs) {
    if (coreExited) break;
    const probe = await fetchJson<TelemetryEnvelope>(
      `${config.hostUrl}/api/telemetry`,
      config.requestTimeoutMs,
    );
    if (probe.ok) {
      bootReady = true;
      bootMs = Math.round(performance.now() - bootStarted);
      break;
    }
    await sleep(350);
  }

  if (!bootReady) {
    const report = {
      generatedAt: new Date().toISOString(),
      ok: false,
      reason: coreExited
        ? `SYSTEM_EXITED_DURING_BOOT(code=${coreExitCode})`
        : "SYSTEM_BOOT_TIMEOUT",
      config,
      boot: {
        ready: false,
        timeoutMs: config.bootTimeoutMs,
        coreExited,
        coreExitCode,
        daemonExited,
        daemonExitCode,
      },
      logsTail: logTail,
    };
    await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
    await Deno.writeTextFile(
      REPORT_MD_PATH,
      `# Longrun Daemon Audit\n\n- generatedAt: ${report.generatedAt}\n- ok: false\n- reason: ${report.reason}\n- coreExited: ${coreExited}\n- coreExitCode: ${coreExitCode}\n`,
    );
    shuttingDown = true;
    await terminateChild(coreChild);
    if (daemonChild) {
      await terminateChild(daemonChild);
    }
    await Promise.allSettled([
      coreStdoutPump,
      coreStderrPump,
      daemonStdoutPump,
      daemonStderrPump,
    ]);
    throw new Error(`[AUDIT] Longrun daemon boot failed: ${report.reason}`);
  }

  const startedAt = performance.now();
  const samples: Sample[] = [];
  const telemetryLatencies: number[] = [];
  const tickDeltas: number[] = [];
  const avgEnergySamples: number[] = [];
  const spatialOverflowRatios: number[] = [];
  const safeModeSamples: number[] = [];
  const guardianPromotionReadySamples: number[] = [];
  const guardianPromotionFallbackRatios: number[] = [];

  const daemonEventCounts: Record<string, number> = {};
  const daemonEventsTail: DaemonAuditEvent[] = [];
  const perturbationsTail: PerturbationResult[] = [];

  const nextU32 = createLcg(config.seed);
  let perturbSequence = 0;
  let nextPerturbAtMs = config.perturbMs;
  let telemetryAttempts = 0;
  let successCount = 0;
  let failureCount = 0;
  let consecutiveFailures = 0;
  let maxConsecutiveFailures = 0;
  let federationActionSamples = 0;
  let federationRejectSamples = 0;
  let previousTick = -1;
  let daemonAuditProcessedLines = 0;
  let daemonAuditEventsSeen = 0;
  let perturbAttempts = 0;
  let perturbFailures = 0;
  let daemonAcceptCount = 0;
  let daemonRejectCount = 0;
  let daemonDegradedCount = 0;
  let daemonEffectEvalCount = 0;

  while (performance.now() - startedAt < config.durationSec * 1000) {
    if (coreExited) break;
    telemetryAttempts++;
    const telemetryResult = await fetchJson<TelemetryEnvelope>(
      `${config.hostUrl}/api/telemetry`,
      config.requestTimeoutMs,
    );
    if (!telemetryResult.ok) {
      failureCount++;
      consecutiveFailures++;
      if (consecutiveFailures > maxConsecutiveFailures) {
        maxConsecutiveFailures = consecutiveFailures;
      }
      await sleep(config.sampleMs);
      continue;
    }

    successCount++;
    consecutiveFailures = 0;
    telemetryLatencies.push(telemetryResult.latencyMs);

    const [codexResult, admissionResult, daemonAuditDelta] = await Promise.all([
      fetchJson<CodexEnvelope>(
        `${config.hostUrl}/api/codex?limit=4`,
        config.requestTimeoutMs,
      ),
      fetchJson<FederationAdmissionEnvelope>(
        `${config.hostUrl}/federate/admission`,
        config.requestTimeoutMs,
      ),
      readDaemonAuditDelta(config.daemonAuditPath, daemonAuditProcessedLines),
    ]);
    daemonAuditProcessedLines = daemonAuditDelta.nextProcessedLines;
    for (const event of daemonAuditDelta.events) {
      daemonAuditEventsSeen++;
      const eventType = toStringSafe(event.event_type, "UNKNOWN");
      daemonEventCounts[eventType] = (daemonEventCounts[eventType] ?? 0) + 1;
      if (eventType === "DAEMON_ACCEPT") daemonAcceptCount++;
      if (eventType === "DAEMON_REJECT") daemonRejectCount++;
      if (eventType === "DAEMON_DEGRADED") daemonDegradedCount++;
      if (eventType === "DAEMON_EFFECT_EVAL") daemonEffectEvalCount++;
      daemonEventsTail.push(event);
      if (daemonEventsTail.length > DAEMON_EVENT_TAIL_CAPACITY) {
        daemonEventsTail.splice(
          0,
          daemonEventsTail.length - DAEMON_EVENT_TAIL_CAPACITY,
        );
      }
    }

    const telemetry = telemetryResult.data;
    const tick = Math.max(0, Math.floor(toFiniteNumber(telemetry.tick, 0)));
    const avgEnergy = toFiniteNumber(telemetry.avgEnergy, 0);
    const safeMode = telemetry.daemon_governance?.safe_mode === true;
    const safeModeReason = toStringSafe(
      telemetry.daemon_governance?.safe_mode_reason,
      "",
    );
    const overflowRatio = Math.max(
      0,
      toFiniteNumber(telemetry.spatial_hash_guard?.overflow_ratio, 0),
    );
    const overflowCount = Math.max(
      0,
      Math.floor(
        toFiniteNumber(telemetry.spatial_hash_guard?.overflow_count, 0),
      ),
    );
    const maxCellCount = Math.max(
      0,
      Math.floor(
        toFiniteNumber(telemetry.spatial_hash_guard?.max_cell_count, 0),
      ),
    );
    const admissionLatest = admissionResult.ok
      ? admissionResult.data.latest
      : telemetry.federation_admission?.latest;
    const federationAction = toStringSafe(admissionLatest?.action, "")
      .toLowerCase();
    const federationSeverity = toStringSafe(admissionLatest?.severity, "")
      .toUpperCase();
    if (federationAction.length > 0) {
      federationActionSamples++;
      if (federationAction === "reject") federationRejectSamples++;
    }

    const lastAdmission = telemetry.daemon_governance?.last_admission;
    const daemonAdmissionStatus = toStringSafe(lastAdmission?.status, "none")
      .toLowerCase();
    const daemonAdmissionSeverity = toStringSafe(
      lastAdmission?.severity,
      "NONE",
    ).toUpperCase();
    const daemonAdmissionDegraded = toBool(lastAdmission?.degraded);
    const daemonActionsUsedInWindow = Math.max(
      0,
      Math.floor(
        toFiniteNumber(telemetry.daemon_governance?.actions_used_in_window, 0),
      ),
    );
    const daemonActionsMaxInWindow = Math.max(
      1,
      Math.floor(
        toFiniteNumber(telemetry.daemon_governance?.actions_max_in_window, 1),
      ),
    );
    const daemonActionsDynamicMaxInWindow = Math.max(
      1,
      Math.floor(
        toFiniteNumber(
          telemetry.daemon_governance?.actions_dynamic_max_in_window,
          daemonActionsMaxInWindow,
        ),
      ),
    );
    const guardianPromotion = deriveGuardianPromotion(telemetry);

    const populationCurrent = codexResult.ok
      ? Math.max(
        0,
        Math.floor(toFiniteNumber(codexResult.data.population?.current, 0)),
      )
      : 0;
    const populationPeak = codexResult.ok
      ? Math.max(
        0,
        Math.floor(toFiniteNumber(codexResult.data.population?.peak, 0)),
      )
      : 0;
    const codexChroniclesCount = codexResult.ok &&
        Array.isArray(codexResult.data.chronicles)
      ? codexResult.data.chronicles.length
      : 0;

    const tickDelta = previousTick >= 0 ? tick - previousTick : 0;
    if (previousTick >= 0) tickDeltas.push(tickDelta);
    previousTick = tick;

    avgEnergySamples.push(avgEnergy);
    spatialOverflowRatios.push(overflowRatio);
    safeModeSamples.push(safeMode ? 1 : 0);
    guardianPromotionReadySamples.push(guardianPromotion.ready ? 1 : 0);
    guardianPromotionFallbackRatios.push(guardianPromotion.fallbackRatio);

    samples.push({
      sampleIndex: samples.length,
      elapsedMs: Math.round(performance.now() - startedAt),
      tick,
      tickDelta,
      avgEnergy: Number(avgEnergy.toFixed(3)),
      telemetryLatencyMs: Number(telemetryResult.latencyMs.toFixed(3)),
      safeMode,
      safeModeReason,
      spatialOverflowRatio: Number(overflowRatio.toFixed(6)),
      spatialOverflowCount: overflowCount,
      spatialMaxCellCount: maxCellCount,
      federationAction: federationAction || "none",
      federationSeverity: federationSeverity || "NONE",
      daemonAdmissionStatus: daemonAdmissionStatus || "none",
      daemonAdmissionSeverity: daemonAdmissionSeverity || "NONE",
      daemonAdmissionDegraded,
      daemonActionsUsedInWindow,
      daemonActionsMaxInWindow,
      daemonActionsDynamicMaxInWindow,
      guardianPromotionReady: guardianPromotion.ready,
      guardianPromotionStatus: guardianPromotion.status,
      guardianPromotionRecommendedMode: guardianPromotion.recommendedMode,
      guardianPromotionFallbackRatio: Number(
        guardianPromotion.fallbackRatio.toFixed(6),
      ),
      populationCurrent,
      populationPeak,
      codexChroniclesCount,
    });

    const elapsedMs = performance.now() - startedAt;
    if (elapsedMs >= nextPerturbAtMs) {
      nextPerturbAtMs += config.perturbMs;
      const budgetHeadroom = daemonActionsDynamicMaxInWindow -
        daemonActionsUsedInWindow;
      if (budgetHeadroom > 0) {
        const perturbation = await performPerturbation(config, {
          nextU32,
          sequence: perturbSequence,
        });
        perturbSequence++;
        if (perturbation) {
          perturbAttempts++;
          if (!perturbation.ok) perturbFailures++;
          perturbationsTail.push(perturbation);
          if (perturbationsTail.length > PERTURB_TAIL_CAPACITY) {
            perturbationsTail.splice(
              0,
              perturbationsTail.length - PERTURB_TAIL_CAPACITY,
            );
          }
        }
      }
    }

    if (samples.length % 5 === 0) {
      const last = samples[samples.length - 1];
      console.log(
        `   [SAMPLE ${last.sampleIndex}] tick=${last.tick} Δtick=${last.tickDelta} avgEnergy=${
          last.avgEnergy.toFixed(2)
        } latency=${
          last.telemetryLatencyMs.toFixed(1)
        }ms perturb=${perturbAttempts} daemonReject=${daemonRejectCount} budget=${
          last.daemonActionsUsedInWindow
        }/${last.daemonActionsDynamicMaxInWindow}`,
      );
    }

    await sleep(config.sampleMs);
  }

  const finalAuditDelta = await readDaemonAuditDelta(
    config.daemonAuditPath,
    daemonAuditProcessedLines,
  );
  daemonAuditProcessedLines = finalAuditDelta.nextProcessedLines;
  for (const event of finalAuditDelta.events) {
    daemonAuditEventsSeen++;
    const eventType = toStringSafe(event.event_type, "UNKNOWN");
    daemonEventCounts[eventType] = (daemonEventCounts[eventType] ?? 0) + 1;
    if (eventType === "DAEMON_ACCEPT") daemonAcceptCount++;
    if (eventType === "DAEMON_REJECT") daemonRejectCount++;
    if (eventType === "DAEMON_DEGRADED") daemonDegradedCount++;
    if (eventType === "DAEMON_EFFECT_EVAL") daemonEffectEvalCount++;
    daemonEventsTail.push(event);
    if (daemonEventsTail.length > DAEMON_EVENT_TAIL_CAPACITY) {
      daemonEventsTail.splice(
        0,
        daemonEventsTail.length - DAEMON_EVENT_TAIL_CAPACITY,
      );
    }
  }

  shuttingDown = true;
  await terminateChild(coreChild);
  if (daemonChild) {
    await terminateChild(daemonChild);
  }
  await Promise.allSettled([
    coreStdoutPump,
    coreStderrPump,
    daemonStdoutPump,
    daemonStderrPump,
  ]);

  const elapsedMs = Math.round(performance.now() - startedAt);
  const sampleCount = samples.length;
  const successRate = telemetryAttempts > 0 ? successCount / telemetryAttempts : 0;
  const tickStart = sampleCount > 0 ? samples[0].tick : 0;
  const tickEnd = sampleCount > 0 ? samples[sampleCount - 1].tick : 0;
  const tickAdvance = tickEnd - tickStart;
  const minTickDelta = tickDeltas.length > 0 ? Math.min(...tickDeltas) : 0;
  const p95TelemetryLatencyMs = percentile(telemetryLatencies, 95);
  const p05AvgEnergy = percentile(avgEnergySamples, 5);
  const p95SpatialOverflowRatio = percentile(spatialOverflowRatios, 95);
  const safeModeRatio = mean(safeModeSamples);
  const guardianSignalPromotionReadyRatio = mean(guardianPromotionReadySamples);
  const guardianSignalFallbackRatioP95 = percentile(
    guardianPromotionFallbackRatios,
    95,
  );
  const guardianSignalPromotionLatest = sampleCount > 0
    ? samples[sampleCount - 1]
    : null;
  const federationRejectRatio = federationActionSamples > 0
    ? federationRejectSamples / federationActionSamples
    : 0;
  const daemonAdmissionEvents =
    daemonAcceptCount + daemonRejectCount + daemonDegradedCount;
  const daemonRejectRatio = daemonAdmissionEvents > 0
    ? daemonRejectCount / daemonAdmissionEvents
    : 0;
  const effectEvalCoverage = daemonAcceptCount > 0
    ? daemonEffectEvalCount / daemonAcceptCount
    : 0;
  const perturbFailureRatio = perturbAttempts > 0
    ? perturbFailures / perturbAttempts
    : 0;
  const enforceActionQualityGate = config.requireDaemonAccepts ||
    daemonAcceptCount > 0;

  const checks: Check[] = [
    {
      name: "bootReady",
      observed: bootReady,
      limit: true,
      ok: bootReady,
    },
    {
      name: "coreExitedUnexpectedly == false",
      observed: coreUnexpectedExitDuringRun,
      limit: false,
      ok: !coreUnexpectedExitDuringRun,
    },
    {
      name: "daemonExitedUnexpectedly == false",
      observed: config.spawnDaemon ? daemonUnexpectedExitDuringRun : "n/a",
      limit: config.spawnDaemon ? false : "n/a",
      ok: !config.spawnDaemon || !daemonUnexpectedExitDuringRun,
    },
    {
      name: "sampleCount >= minSamples",
      observed: sampleCount,
      limit: config.minSamples,
      ok: sampleCount >= config.minSamples,
    },
    {
      name: "successRate >= minSuccessRate",
      observed: Number(successRate.toFixed(3)),
      limit: config.minSuccessRate,
      ok: successRate >= config.minSuccessRate,
    },
    {
      name:
        "maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures",
      observed: maxConsecutiveFailures,
      limit: config.maxConsecutiveTelemetryFailures,
      ok: maxConsecutiveFailures <= config.maxConsecutiveTelemetryFailures,
    },
    {
      name: "p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs",
      observed: Number(p95TelemetryLatencyMs.toFixed(3)),
      limit: config.maxP95TelemetryLatencyMs,
      ok: p95TelemetryLatencyMs <= config.maxP95TelemetryLatencyMs,
    },
    {
      name: "minTickDelta >= minTickDeltaPerSample",
      observed: minTickDelta,
      limit: config.minTickDeltaPerSample,
      ok: minTickDelta >= config.minTickDeltaPerSample,
    },
    {
      name: "p05AvgEnergy >= minAvgEnergyP05",
      observed: Number(p05AvgEnergy.toFixed(3)),
      limit: config.minAvgEnergyP05,
      ok: p05AvgEnergy >= config.minAvgEnergyP05,
    },
    {
      name: "p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95",
      observed: Number(p95SpatialOverflowRatio.toFixed(6)),
      limit: config.maxSpatialOverflowRatioP95,
      ok: p95SpatialOverflowRatio <= config.maxSpatialOverflowRatioP95,
    },
    {
      name: "safeModeRatio <= maxSafeModeRatio",
      observed: enforceActionQualityGate
        ? Number(safeModeRatio.toFixed(3))
        : "n/a(no-daemon-accept)",
      limit: enforceActionQualityGate ? config.maxSafeModeRatio : "n/a",
      ok: !enforceActionQualityGate || safeModeRatio <= config.maxSafeModeRatio,
    },
    {
      name: "federationRejectRatio <= maxFederationRejectRatio",
      observed: Number(federationRejectRatio.toFixed(3)),
      limit: config.maxFederationRejectRatio,
      ok: federationRejectRatio <= config.maxFederationRejectRatio,
    },
    {
      name: "perturbAttempts >= minPerturbAttempts",
      observed: perturbAttempts,
      limit: config.minPerturbAttempts,
      ok: perturbAttempts >= config.minPerturbAttempts,
    },
    {
      name: "perturbFailureRatio <= maxPerturbFailureRatio",
      observed: enforceActionQualityGate
        ? Number(perturbFailureRatio.toFixed(3))
        : "n/a(no-daemon-accept)",
      limit: enforceActionQualityGate ? config.maxPerturbFailureRatio : "n/a",
      ok: !enforceActionQualityGate ||
        perturbFailureRatio <= config.maxPerturbFailureRatio,
    },
    {
      name: "daemonRejectRatio <= maxDaemonRejectRatio",
      observed: enforceActionQualityGate
        ? Number(daemonRejectRatio.toFixed(3))
        : "n/a(no-daemon-accept)",
      limit: enforceActionQualityGate ? config.maxDaemonRejectRatio : "n/a",
      ok: !enforceActionQualityGate ||
        daemonRejectRatio <= config.maxDaemonRejectRatio,
    },
    {
      name: "daemonAcceptCount > 0 (optional)",
      observed: daemonAcceptCount,
      limit: config.requireDaemonAccepts ? 0 : "optional",
      ok: !config.requireDaemonAccepts || daemonAcceptCount > 0,
    },
    {
      name: "effectEvalCoverage >= minEffectEvalCoverage",
      observed: daemonAcceptCount > 0
        ? Number(effectEvalCoverage.toFixed(3))
        : "n/a(no-daemon-accept)",
      limit: daemonAcceptCount > 0 ? config.minEffectEvalCoverage : "n/a",
      ok: daemonAcceptCount === 0 ||
        effectEvalCoverage >= config.minEffectEvalCoverage,
    },
    {
      name: "daemonAuditEventsSeen > 0",
      observed: daemonAuditEventsSeen,
      limit: 0,
      ok: daemonAuditEventsSeen > 0,
    },
  ];

  const failedChecks = checks.filter((check) => !check.ok);
  const generatedAt = new Date().toISOString();
  const summary = {
    durationSec: config.durationSec,
    elapsedMs,
    bootReady,
    bootMs,
    spawnDaemon: config.spawnDaemon,
    coldstartEnable: config.coldstartEnable,
    coldstartCount: config.coldstartCount,
    coldstartReplicatorRatio: Number(config.coldstartReplicatorRatio.toFixed(3)),
    daemonHeartbeatMs: config.daemonHeartbeatMs,
    sampleCount,
    telemetryAttempts,
    successCount,
    failureCount,
    successRate: Number(successRate.toFixed(3)),
    tickStart,
    tickEnd,
    tickAdvance,
    minTickDelta,
    p95TelemetryLatencyMs: Number(p95TelemetryLatencyMs.toFixed(3)),
    p05AvgEnergy: Number(p05AvgEnergy.toFixed(3)),
    p95SpatialOverflowRatio: Number(p95SpatialOverflowRatio.toFixed(6)),
    safeModeRatio: Number(safeModeRatio.toFixed(3)),
    federationRejectRatio: Number(federationRejectRatio.toFixed(3)),
    guardianSignalPromotionReadyLatest:
      guardianSignalPromotionLatest?.guardianPromotionReady ?? false,
    guardianSignalPromotionReadyRatio: Number(
      guardianSignalPromotionReadyRatio.toFixed(3),
    ),
    guardianSignalPromotionRecommendedMode:
      guardianSignalPromotionLatest?.guardianPromotionRecommendedMode ??
        "shadow-reduce",
    guardianSignalFallbackRatioP95: Number(
      guardianSignalFallbackRatioP95.toFixed(6),
    ),
    maxConsecutiveTelemetryFailures: maxConsecutiveFailures,
    perturbAttempts,
    perturbFailures,
    perturbFailureRatio: Number(perturbFailureRatio.toFixed(3)),
    daemonAdmissionEvents,
    daemonAcceptCount,
    daemonRejectCount,
    daemonDegradedCount,
    daemonEffectEvalCount,
    daemonRejectRatio: Number(daemonRejectRatio.toFixed(3)),
    effectEvalCoverage: Number(effectEvalCoverage.toFixed(3)),
    daemonAuditEventsSeen,
    coreUnexpectedExitDuringRun,
    coreExitCode,
    daemonUnexpectedExitDuringRun,
    daemonExitCode,
    logsTailSize: logTail.length,
  };

  const report: Record<string, unknown> = {
    generatedAt,
    ok: failedChecks.length === 0,
    config,
    summary,
    checks,
    daemonEventCounts,
    perturbationsTail,
    daemonEventsTail,
    logsTail: logTail,
    samplesHead: samples.slice(0, 12),
    samplesTail: samples.slice(Math.max(0, samples.length - 24)),
  };
  if (config.includeFullSamples) {
    report.samples = samples;
  }

  await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
  await Deno.writeTextFile(
    REPORT_MD_PATH,
    renderMarkdown(
      generatedAt,
      summary,
      checks,
      daemonEventCounts,
      perturbationsTail,
    ),
  );

  console.log(`AUDIT [longrun-daemon] report: ${REPORT_JSON_PATH}`);
  console.log(`AUDIT [longrun-daemon] reportMd: ${REPORT_MD_PATH}`);
  console.log(`   checks=${checks.length} failed=${failedChecks.length}`);

  for (const check of failedChecks) {
    console.error(
      `   FAIL ${check.name} observed=${check.observed} limit=${check.limit}`,
    );
  }

  if (failedChecks.length > 0) {
    throw new Error("[AUDIT] Longrun daemon gate failed.");
  }

  console.log("✅ [AUDIT] Longrun daemon gate passed.");
};

if (import.meta.main) {
  await main();
}
