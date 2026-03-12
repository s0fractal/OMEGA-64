import { evaluateGuardianSignalPromotionAction } from "@03";
import { evaluateGuardianSignalPromotion } from "@03";
import { evaluateGuardianSignalPromotionDecision } from "@03";
import { evaluateArchitectPlasmidPromotionAction } from "@03";
import { evaluateArchitectPlasmidPromotion } from "@03";
import { evaluateArchitectPlasmidPromotionDecision } from "@03";
import { evaluateReplicationPromotionAction } from "@03";
import { evaluateReplicationPromotion } from "@03";
import { evaluateReplicationPromotionDecision } from "@03";

type CanaryConfig = {
  hostUrl: string;
  durationSec: number;
  sampleMs: number;
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
  includeFullSamples: boolean;
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
  architect_plasmid_hybrid?: {
    mode?: string;
    hybridRuns?: number;
    shadowRuns?: number;
    fallbackRuns?: number;
    emitBranchCount?: number;
    suppressBranchCount?: number;
    allowedArchitectPlasmids?: number;
    suppressedArchitectPlasmids?: number;
    shadowSuppressedArchitectPlasmids?: number;
    lastTick?: number;
    lastStatus?: string;
    lastBranch?: string;
    lastFallbackReason?: string;
  };
  architect_plasmid_promotion?: {
    status?: string;
    ready?: boolean;
    recommendedMode?: string;
    fallbackRatio?: number;
  };
  replication_hybrid?: {
    mode?: string;
    hybridRuns?: number;
    shadowRuns?: number;
    fallbackRuns?: number;
    emitBranchCount?: number;
    suppressBranchCount?: number;
    allowedReplications?: number;
    suppressedReplications?: number;
    shadowSuppressedReplications?: number;
    lastTick?: number;
    lastStatus?: string;
    lastBranch?: string;
    lastFallbackReason?: string;
  };
  replication_promotion?: {
    status?: string;
    ready?: boolean;
    recommendedMode?: string;
    fallbackRatio?: number;
  };
  daemon_governance?: {
    safe_mode?: boolean;
    safe_mode_reason?: string;
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
  snapshot_guard?: {
    enabled?: boolean;
    interval_ticks?: number;
    retention?: number;
    in_flight?: boolean;
    last_tick?: number;
    last_result?: {
      success?: boolean;
      tick?: number;
      reason?: string;
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
  guardian_signal_promotion_fallback_ratio: number;
  guardian_signal_promotion_current_mode: GuardianPromotionMode;
  guardian_signal_promotion_ready: boolean;
  guardian_signal_promotion_status: string;
  guardian_signal_promotion_recommended_mode: GuardianPromotionMode;
  architect_plasmid_promotion_current_mode: ArchitectPromotionMode;
  architect_plasmid_promotion_ready: boolean;
  architect_plasmid_promotion_status: string;
  architect_plasmid_promotion_recommended_mode: ArchitectPromotionMode;
  architect_plasmid_promotion_fallback_ratio: number;
  replication_promotion_current_mode: ReplicationPromotionMode;
  replication_promotion_ready: boolean;
  replication_promotion_status: string;
  replication_promotion_recommended_mode: ReplicationPromotionMode;
  replication_promotion_fallback_ratio: number;
  population_current: number;
  population_peak: number;
  replication_hybrid?: any;
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

type GuardianPromotionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

type ArchitectPromotionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

type ReplicationPromotionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

const REPORT_JSON_PATH = "LONGRUN_AUDIT.json";
const REPORT_MD_PATH = "LONGRUN_AUDIT.md";
const CORE_TASK = ["task", "core:start"];
const LOG_RING_CAPACITY = 200;

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

const normalizeGuardianPromotionMode = (
  value: unknown,
): GuardianPromotionMode => {
  const normalized = toStringSafe(value, "shadow-reduce").toLowerCase();
  if (normalized === "legacy-execute" || normalized === "legacy_execute") {
    return "legacy-execute";
  }
  if (normalized === "hybrid-reduce" || normalized === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const deriveGuardianPromotion = (
  telemetry: TelemetryEnvelope,
): {
  currentMode: GuardianPromotionMode;
  ready: boolean;
  status: string;
  recommendedMode: GuardianPromotionMode;
  fallbackRatio: number;
} => {
  if (telemetry.guardian_signal_hybrid) {
    const currentMode = normalizeGuardianPromotionMode(
      telemetry.guardian_signal_hybrid.mode,
    );
    const evaluated = evaluateGuardianSignalPromotion({
      mode: currentMode,
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
      ) as any,
      lastBranch: toStringSafe(
        telemetry.guardian_signal_hybrid.lastBranch,
        "unknown",
      ) as any,
      lastFallbackReason: toStringSafe(
        telemetry.guardian_signal_hybrid.lastFallbackReason,
        "",
      ),
    });
    return {
      currentMode,
      ready: evaluated.ready,
      status: evaluated.status,
      recommendedMode: evaluated.recommendedMode,
      fallbackRatio: evaluated.fallbackRatio,
    };
  }
  return {
    currentMode: "shadow-reduce",
    ready: telemetry.guardian_signal_promotion?.ready === true,
    status: toStringSafe(
      telemetry.guardian_signal_promotion?.status,
      "unknown",
    ),
    recommendedMode: normalizeGuardianPromotionMode(
      telemetry.guardian_signal_promotion?.recommendedMode,
    ),
    fallbackRatio: toFiniteNumber(
      telemetry.guardian_signal_promotion?.fallbackRatio,
      0,
    ),
  };
};

const deriveArchitectPromotion = (
  telemetry: TelemetryEnvelope,
): {
  currentMode: ArchitectPromotionMode;
  ready: boolean;
  status: string;
  recommendedMode: ArchitectPromotionMode;
  fallbackRatio: number;
} => {
  if (telemetry.architect_plasmid_hybrid) {
    const currentMode = normalizeGuardianPromotionMode(
      telemetry.architect_plasmid_hybrid.mode,
    ) as ArchitectPromotionMode;
    const evaluated = evaluateArchitectPlasmidPromotion({
      mode: currentMode,
      hybridRuns: Math.floor(
        toFiniteNumber(telemetry.architect_plasmid_hybrid.hybridRuns, 0),
      ),
      shadowRuns: Math.floor(
        toFiniteNumber(telemetry.architect_plasmid_hybrid.shadowRuns, 0),
      ),
      fallbackRuns: Math.floor(
        toFiniteNumber(telemetry.architect_plasmid_hybrid.fallbackRuns, 0),
      ),
      emitBranchCount: Math.floor(
        toFiniteNumber(telemetry.architect_plasmid_hybrid.emitBranchCount, 0),
      ),
      suppressBranchCount: Math.floor(
        toFiniteNumber(
          telemetry.architect_plasmid_hybrid.suppressBranchCount,
          0,
        ),
      ),
      allowedArchitectPlasmids: Math.floor(
        toFiniteNumber(
          telemetry.architect_plasmid_hybrid.allowedArchitectPlasmids,
          0,
        ),
      ),
      suppressedArchitectPlasmids: Math.floor(
        toFiniteNumber(
          telemetry.architect_plasmid_hybrid.suppressedArchitectPlasmids,
          0,
        ),
      ),
      shadowSuppressedArchitectPlasmids: Math.floor(
        toFiniteNumber(
          telemetry.architect_plasmid_hybrid.shadowSuppressedArchitectPlasmids,
          0,
        ),
      ),
      lastTick: Math.floor(
        toFiniteNumber(telemetry.architect_plasmid_hybrid.lastTick, 0),
      ),
      lastStatus: toStringSafe(
        telemetry.architect_plasmid_hybrid.lastStatus,
        "legacy",
      ) as any,
      lastBranch: toStringSafe(
        telemetry.architect_plasmid_hybrid.lastBranch,
        "unknown",
      ) as any,
      lastFallbackReason: toStringSafe(
        telemetry.architect_plasmid_hybrid.lastFallbackReason,
        "",
      ),
    });
    return {
      currentMode,
      ready: evaluated.ready,
      status: evaluated.status,
      recommendedMode: evaluated.recommendedMode as any,
      fallbackRatio: evaluated.fallbackRatio,
    };
  }
  return {
    currentMode: "shadow-reduce",
    ready: telemetry.architect_plasmid_promotion?.ready === true,
    status: toStringSafe(
      telemetry.architect_plasmid_promotion?.status,
      "unknown",
    ),
    recommendedMode: normalizeGuardianPromotionMode(
      telemetry.architect_plasmid_promotion?.recommendedMode,
    ) as any,
    fallbackRatio: toFiniteNumber(
      telemetry.architect_plasmid_promotion?.fallbackRatio,
      0,
    ),
  };
};

const deriveReplicationPromotion = (
  telemetry: TelemetryEnvelope,
): {
  currentMode: ReplicationPromotionMode;
  ready: boolean;
  status: string;
  recommendedMode: ReplicationPromotionMode;
  fallbackRatio: number;
} => {
  if (telemetry.replication_hybrid) {
    const currentMode = normalizeGuardianPromotionMode(
      telemetry.replication_hybrid.mode,
    ) as ReplicationPromotionMode;
    const evaluated = evaluateReplicationPromotion({
      mode: currentMode,
      hybridRuns: Math.floor(
        toFiniteNumber(telemetry.replication_hybrid.hybridRuns, 0),
      ),
      shadowRuns: Math.floor(
        toFiniteNumber(telemetry.replication_hybrid.shadowRuns, 0),
      ),
      fallbackRuns: Math.floor(
        toFiniteNumber(telemetry.replication_hybrid.fallbackRuns, 0),
      ),
      emitBranchCount: Math.floor(
        toFiniteNumber(telemetry.replication_hybrid.emitBranchCount, 0),
      ),
      suppressBranchCount: Math.floor(
        toFiniteNumber(telemetry.replication_hybrid.suppressBranchCount, 0),
      ),
      allowedReplications: Math.floor(
        toFiniteNumber(
          telemetry.replication_hybrid.allowedReplications,
          0,
        ),
      ),
      suppressedReplications: Math.floor(
        toFiniteNumber(
          telemetry.replication_hybrid.suppressedReplications,
          0,
        ),
      ),
      shadowSuppressedReplications: Math.floor(
        toFiniteNumber(
          telemetry.replication_hybrid.shadowSuppressedReplications,
          0,
        ),
      ),
      lastTick: Math.floor(
        toFiniteNumber(telemetry.replication_hybrid.lastTick, 0),
      ),
      lastStatus: toStringSafe(
        telemetry.replication_hybrid.lastStatus,
        "legacy",
      ) as any,
      lastBranch: toStringSafe(
        telemetry.replication_hybrid.lastBranch,
        "unknown",
      ) as any,
      lastFallbackReason: toStringSafe(
        telemetry.replication_hybrid.lastFallbackReason,
        "",
      ),
    });
    return {
      currentMode,
      ready: evaluated.ready,
      status: evaluated.status,
      recommendedMode: evaluated.recommendedMode as any,
      fallbackRatio: evaluated.fallbackRatio,
    };
  }
  return {
    currentMode: "shadow-reduce",
    ready: telemetry.replication_promotion?.ready === true,
    status: toStringSafe(
      telemetry.replication_promotion?.status,
      "unknown",
    ),
    recommendedMode: normalizeGuardianPromotionMode(
      telemetry.replication_promotion?.recommendedMode,
    ) as any,
    fallbackRatio: toFiniteNumber(
      telemetry.replication_promotion?.fallbackRatio,
      0,
    ),
  };
};

const createConfig = (): CanaryConfig => {
  const hostUrl = (Deno.env.get("OMEGA_LONGRUN_URL") ?? "http://127.0.0.1:8000")
    .trim()
    .replace(/\/+$/u, "");
  return {
    hostUrl,
    durationSec: parseIntEnv("OMEGA_LONGRUN_DURATION_SEC", 300, 30, 172800),
    sampleMs: parseIntEnv("OMEGA_LONGRUN_SAMPLE_MS", 5000, 500, 120000),
    bootTimeoutMs: parseIntEnv(
      "OMEGA_LONGRUN_BOOT_TIMEOUT_MS",
      45000,
      1000,
      300000,
    ),
    requestTimeoutMs: parseIntEnv(
      "OMEGA_LONGRUN_REQUEST_TIMEOUT_MS",
      3000,
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
      700,
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
      0.95,
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
      0.05,
      0,
      1,
    ),
    maxFederationRejectRatio: parseFloatEnv(
      "OMEGA_LONGRUN_MAX_FED_REJECT_RATIO",
      0.95,
      0,
      1,
    ),
    includeFullSamples: parseBoolEnv("OMEGA_LONGRUN_FULL_SAMPLES", false),
  };
};

const readProcessStream = async (
  stream: ReadableStream<Uint8Array> | null,
  channel: "stdout" | "stderr",
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
          sink.push(`[${channel}] ${line}`);
          if (sink.length > LOG_RING_CAPACITY) {
            sink.splice(0, sink.length - LOG_RING_CAPACITY);
          }
        }
        newlineIndex = pending.indexOf("\n");
      }
    }
    const tail = (pending + decoder.decode()).trim();
    if (tail.length > 0) {
      sink.push(`[${channel}] ${tail}`);
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

const renderMarkdown = (
  generatedAt: string,
  summary: Record<string, unknown>,
  checks: Check[],
): string => {
  const rows = checks.map((check) =>
    `| ${
      check.ok ? "PASS" : "FAIL"
    } | ${check.name} | ${check.observed} | ${check.limit} |`
  ).join("\n");
  return `# Longrun Canary Audit

- generatedAt: ${generatedAt}
- durationSec: ${summary.durationSec}
- elapsedMs: ${summary.elapsedMs}
- bootReady: ${summary.bootReady}
- bootMs: ${summary.bootMs}
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
- guardianSignalPromotionVerdict: ${summary.guardianSignalPromotionVerdict}
- architectPlasmidPromotionVerdict: ${summary.architectPlasmidPromotionVerdict}
- replicationPromotionVerdict: ${summary.replicationPromotionVerdict}

| status | check | observed | limit |
|---|---|---:|---:|
${rows}
`;
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

const main = async () => {
  const config = createConfig();
  console.log(
    `🧪 [LONGRUN] start duration=${config.durationSec}s sample=${config.sampleMs}ms host=${config.hostUrl}`,
  );

  const command = new Deno.Command("deno", {
    args: CORE_TASK,
    stdout: "piped",
    stderr: "piped",
  });
  const child = command.spawn();

  const logTail: string[] = [];
  const stdoutPump = readProcessStream(child.stdout, "stdout", logTail);
  const stderrPump = readProcessStream(child.stderr, "stderr", logTail);

  let childExited = false;
  let childExitCode = -1;
  let shuttingDown = false;
  let unexpectedExitDuringRun = false;
  child.status.then((status) => {
    childExited = true;
    childExitCode = status.code;
    if (!shuttingDown) {
      unexpectedExitDuringRun = true;
    }
  });

  const bootStarted = performance.now();
  let bootReady = false;
  let bootMs = -1;
  while (performance.now() - bootStarted < config.bootTimeoutMs) {
    if (childExited) break;
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
      reason: childExited
        ? `SYSTEM_EXITED_DURING_BOOT(code=${childExitCode})`
        : "SYSTEM_BOOT_TIMEOUT",
      config,
      boot: {
        ready: false,
        timeoutMs: config.bootTimeoutMs,
        childExited,
        childExitCode,
      },
      logsTail: logTail,
    };
    await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
    await Deno.writeTextFile(
      REPORT_MD_PATH,
      `# Longrun Canary Audit\n\n- generatedAt: ${report.generatedAt}\n- ok: false\n- reason: ${report.reason}\n- childExited: ${childExited}\n- childExitCode: ${childExitCode}\n`,
    );
    await terminateChild(child);
    await Promise.allSettled([stdoutPump, stderrPump]);
    throw new Error(`[AUDIT] Longrun boot failed: ${report.reason}`);
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
  const architectPromotionReadySamples: number[] = [];
  const architectPromotionFallbackRatios: number[] = [];
  const replicationPromotionReadySamples: number[] = [];
  const replicationPromotionFallbackRatios: number[] = [];
  let successCount = 0;
  let failureCount = 0;
  let maxConsecutiveFailures = 0;
  let consecutiveFailures = 0;
  let federationActionSamples = 0;
  let federationRejectSamples = 0;
  let previousTick = -1;

  while (performance.now() - startedAt < config.durationSec * 1000) {
    if (childExited) break;

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

    const codexResult = await fetchJson<CodexEnvelope>(
      `${config.hostUrl}/api/codex?limit=4`,
      config.requestTimeoutMs,
    );
    successCount++;
    consecutiveFailures = 0;
    telemetryLatencies.push(telemetryResult.latencyMs);

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
    const federationAction = toStringSafe(
      telemetry.federation_admission?.latest?.action,
      "",
    ).toLowerCase();
    const federationSeverity = toStringSafe(
      telemetry.federation_admission?.latest?.severity,
      "",
    ).toUpperCase();
    const guardianPromotion = deriveGuardianPromotion(telemetry);
    const architectPromotion = deriveArchitectPromotion(telemetry);
    const replicationPromotion = deriveReplicationPromotion(telemetry);

    if (federationAction.length > 0) {
      federationActionSamples++;
      if (federationAction === "reject") federationRejectSamples++;
    }

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

    const tickDelta = previousTick >= 0 ? tick - previousTick : 0;
    if (previousTick >= 0) tickDeltas.push(tickDelta);
    previousTick = tick;

    avgEnergySamples.push(avgEnergy);
    spatialOverflowRatios.push(overflowRatio);
    safeModeSamples.push(safeMode ? 1 : 0);
    guardianPromotionReadySamples.push(guardianPromotion.ready ? 1 : 0);
    guardianPromotionFallbackRatios.push(guardianPromotion.fallbackRatio);
    architectPromotionReadySamples.push(architectPromotion.ready ? 1 : 0);
    architectPromotionFallbackRatios.push(architectPromotion.fallbackRatio);
    replicationPromotionReadySamples.push(replicationPromotion.ready ? 1 : 0);
    replicationPromotionFallbackRatios.push(replicationPromotion.fallbackRatio);

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
      guardian_signal_promotion_current_mode: guardianPromotion.currentMode,
      guardian_signal_promotion_ready: guardianPromotion.ready,
      guardian_signal_promotion_status: guardianPromotion.status,
      guardian_signal_promotion_recommended_mode:
        guardianPromotion.recommendedMode,
      guardian_signal_promotion_fallback_ratio: Number(
        guardianPromotion.fallbackRatio.toFixed(6),
      ),
      architect_plasmid_promotion_current_mode: architectPromotion.currentMode,
      architect_plasmid_promotion_ready: architectPromotion.ready,
      architect_plasmid_promotion_status: architectPromotion.status,
      architect_plasmid_promotion_recommended_mode:
        architectPromotion.recommendedMode,
      architect_plasmid_promotion_fallback_ratio: Number(
        architectPromotion.fallbackRatio.toFixed(6),
      ),
      replication_promotion_current_mode: replicationPromotion.currentMode,
      replication_promotion_ready: replicationPromotion.ready,
      replication_promotion_status: replicationPromotion.status,
      replication_promotion_recommended_mode:
        replicationPromotion.recommendedMode,
      replication_promotion_fallback_ratio: Number(
        replicationPromotion.fallbackRatio.toFixed(6),
      ),
      population_current: populationCurrent,
      population_peak: populationPeak,
      replication_hybrid: telemetryResult.ok
        ? telemetryResult.data.replication_hybrid
        : undefined,
    });

    if (samples.length % 5 === 0) {
      const last = samples[samples.length - 1];
      console.log(
        `   [SAMPLE ${last.sampleIndex}] tick=${last.tick} Δtick=${last.tickDelta} avgEnergy=${
          last.avgEnergy.toFixed(2)
        } latency=${
          last.telemetryLatencyMs.toFixed(1)
        }ms overflow=${last.spatialOverflowRatio}`,
      );
    }

    await sleep(config.sampleMs);
  }

  shuttingDown = true;
  await terminateChild(child);
  await Promise.allSettled([stdoutPump, stderrPump]);

  const elapsedMs = Math.round(performance.now() - startedAt);
  const sampleCount = samples.length;
  const successRate = sampleCount > 0 ? successCount / sampleCount : 0;
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

  const architectSignalPromotionReadyRatio = mean(
    architectPromotionReadySamples,
  );
  const architectSignalFallbackRatioP95 = percentile(
    architectPromotionFallbackRatios,
    95,
  );
  const architectSignalPromotionLatest = sampleCount > 0
    ? samples[sampleCount - 1]
    : null;

  const replicationSignalPromotionReadyRatio = mean(
    replicationPromotionReadySamples,
  );
  const replicationSignalFallbackRatioP95 = percentile(
    replicationPromotionFallbackRatios,
    95,
  );
  const replicationSignalPromotionLatest = sampleCount > 0
    ? samples[sampleCount - 1]
    : null;

  const federationRejectRatio = federationActionSamples > 0
    ? federationRejectSamples / federationActionSamples
    : 0;
  const processExitedUnexpectedly = unexpectedExitDuringRun;
  const enforceSafeModeGate = federationActionSamples > 0;

  const guardianSignalPromotionDecision =
    evaluateGuardianSignalPromotionDecision(
      {
        promotion: {
          latestReady:
            guardianSignalPromotionLatest?.guardian_signal_promotion_ready ??
              false,
          readyRatio: guardianSignalPromotionReadyRatio,
          recommendedMode: guardianSignalPromotionLatest
            ?.guardian_signal_promotion_recommended_mode ??
            "shadow-reduce",
          fallbackRatioP95: guardianSignalFallbackRatioP95,
          status:
            guardianSignalPromotionLatest?.guardian_signal_promotion_status ??
              "unknown",
        },
        health: {
          bootReady,
          processExitedUnexpectedly,
          successRate,
          minSuccessRate: config.minSuccessRate,
          p95TelemetryLatencyMs,
          maxP95TelemetryLatencyMs: config.maxP95TelemetryLatencyMs,
          p95SpatialOverflowRatio,
          maxSpatialOverflowRatioP95: config.maxSpatialOverflowRatioP95,
          safeModeRatio,
          maxSafeModeRatio: config.maxSafeModeRatio,
          enforceActionQualityGate: enforceSafeModeGate,
        },
      },
    );
  const guardianSignalPromotionAction = evaluateGuardianSignalPromotionAction({
    currentMode:
      guardianSignalPromotionLatest?.guardian_signal_promotion_current_mode ??
        "shadow-reduce",
    decision: guardianSignalPromotionDecision,
  });

  const architectPlasmidPromotionDecision =
    evaluateArchitectPlasmidPromotionDecision(
      {
        promotion: {
          latestReady:
            architectSignalPromotionLatest?.architect_plasmid_promotion_ready ??
              false,
          readyRatio: architectSignalPromotionReadyRatio,
          recommendedMode: architectSignalPromotionLatest
            ?.architect_plasmid_promotion_recommended_mode ??
            "shadow-reduce",
          fallbackRatioP95: architectSignalFallbackRatioP95,
          status: architectSignalPromotionLatest
            ?.architect_plasmid_promotion_status ??
            "unknown",
        },
        health: {
          bootReady,
          processExitedUnexpectedly,
          successRate,
          minSuccessRate: config.minSuccessRate,
          p95TelemetryLatencyMs,
          maxP95TelemetryLatencyMs: config.maxP95TelemetryLatencyMs,
          p95SpatialOverflowRatio,
          maxSpatialOverflowRatioP95: config.maxSpatialOverflowRatioP95,
          safeModeRatio,
          maxSafeModeRatio: config.maxSafeModeRatio,
          enforceActionQualityGate: enforceSafeModeGate,
        },
      },
    );
  const architectPlasmidPromotionAction =
    evaluateArchitectPlasmidPromotionAction({
      currentMode: architectSignalPromotionLatest
        ?.architect_plasmid_promotion_current_mode ??
        "shadow-reduce",
      decision: architectPlasmidPromotionDecision,
    });
  const replicationPromotionDecision = evaluateReplicationPromotionDecision(
    {
      promotion: {
        latestReady:
          replicationSignalPromotionLatest?.replication_promotion_ready ??
            false,
        readyRatio: replicationSignalPromotionReadyRatio,
        recommendedMode: replicationSignalPromotionLatest
          ?.replication_promotion_recommended_mode ??
          "shadow-reduce",
        fallbackRatioP95: replicationSignalFallbackRatioP95,
        status:
          replicationSignalPromotionLatest?.replication_promotion_status ??
            "unknown",
      },
      health: {
        bootReady,
        processExitedUnexpectedly,
        successRate,
        minSuccessRate: config.minSuccessRate,
        p95TelemetryLatencyMs,
        maxP95TelemetryLatencyMs: config.maxP95TelemetryLatencyMs,
        p95SpatialOverflowRatio,
        maxSpatialOverflowRatioP95: config.maxSpatialOverflowRatioP95,
        safeModeRatio,
        maxSafeModeRatio: config.maxSafeModeRatio,
        enforceActionQualityGate: enforceSafeModeGate,
      },
    },
  );
  const replicationPromotionAction = evaluateReplicationPromotionAction({
    currentMode:
      replicationSignalPromotionLatest?.replication_promotion_current_mode ??
        "shadow-reduce",
    decision: replicationPromotionDecision,
  });

  const checks: Check[] = [
    {
      name: "bootReady",
      observed: bootReady,
      limit: true,
      ok: bootReady,
    },
    {
      name: "processExitedUnexpectedly == false",
      observed: processExitedUnexpectedly,
      limit: false,
      ok: !processExitedUnexpectedly,
    },
    {
      name: "successRate",
      observed: Number(successRate.toFixed(3)),
      limit: config.minSuccessRate,
      ok: successRate >= config.minSuccessRate,
    },
    {
      name: "p95TelemetryLatencyMs",
      observed: Number(p95TelemetryLatencyMs.toFixed(1)),
      limit: config.maxP95TelemetryLatencyMs,
      ok: p95TelemetryLatencyMs <= config.maxP95TelemetryLatencyMs,
    },
    {
      name: "p95SpatialOverflowRatio",
      observed: Number(p95SpatialOverflowRatio.toFixed(6)),
      limit: config.maxSpatialOverflowRatioP95,
      ok: p95SpatialOverflowRatio <= config.maxSpatialOverflowRatioP95,
    },
    {
      name: "safeModeRatio",
      observed: Number(safeModeRatio.toFixed(3)),
      limit: config.maxSafeModeRatio,
      ok: !enforceSafeModeGate || safeModeRatio <= config.maxSafeModeRatio,
    },
    {
      name: "guardianSignalPromotionVerdict == promote",
      observed: guardianSignalPromotionDecision.verdict,
      limit: "promote",
      ok: guardianSignalPromotionDecision.verdict === "promote",
    },
    {
      name: "architectPlasmidPromotionVerdict == promote",
      observed: architectPlasmidPromotionDecision.verdict,
      limit: "promote",
      ok: architectPlasmidPromotionDecision.verdict === "promote",
    },
    {
      name: "replicationPromotionVerdict == promote",
      observed: replicationPromotionDecision.verdict,
      limit: "promote",
      ok: replicationPromotionDecision.verdict === "promote",
    },
  ];

  const failedChecks = checks.filter((check) => !check.ok);
  const generatedAt = new Date().toISOString();
  const summary = {
    durationSec: config.durationSec,
    elapsedMs,
    bootReady,
    bootMs,
    sampleCount,
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

    guardianSignalPromotionCurrentMode:
      guardianSignalPromotionLatest?.guardian_signal_promotion_current_mode ??
        "shadow-reduce",
    guardianSignalPromotionReadyLatest:
      guardianSignalPromotionLatest?.guardian_signal_promotion_ready ?? false,
    guardianSignalPromotionReadyRatio: Number(
      guardianSignalPromotionReadyRatio.toFixed(3),
    ),
    guardianSignalPromotionRecommendedMode: guardianSignalPromotionLatest
      ?.guardian_signal_promotion_recommended_mode ??
      "shadow-reduce",
    guardianSignalFallbackRatioP95: Number(
      guardianSignalFallbackRatioP95.toFixed(6),
    ),
    guardianSignalPromotionVerdict: guardianSignalPromotionDecision.verdict,
    guardianSignalPromotionBlockers:
      guardianSignalPromotionDecision.blockers.join("|") || "none",
    guardianSignalPromotionAction: guardianSignalPromotionAction.verdict,
    guardianSignalPromotionTargetMode: guardianSignalPromotionAction.targetMode,
    guardianSignalPromotionActionReasons:
      guardianSignalPromotionAction.reasons.join("|") || "none",

    architectPlasmidPromotionCurrentMode: architectSignalPromotionLatest
      ?.architect_plasmid_promotion_current_mode ??
      "shadow-reduce",
    architectPlasmidPromotionReadyLatest:
      architectSignalPromotionLatest?.architect_plasmid_promotion_ready ??
        false,
    architectPlasmidPromotionReadyRatio: Number(
      architectSignalPromotionReadyRatio.toFixed(3),
    ),
    architectPlasmidPromotionRecommendedMode: architectSignalPromotionLatest
      ?.architect_plasmid_promotion_recommended_mode ??
      "shadow-reduce",
    architectPlasmidPromotionFallbackRatioP95: Number(
      architectSignalFallbackRatioP95.toFixed(6),
    ),
    architectPlasmidPromotionVerdict: architectPlasmidPromotionDecision.verdict,
    architectPlasmidPromotionBlockers:
      architectPlasmidPromotionDecision.blockers.join("|") || "none",
    architectPlasmidPromotionAction: architectPlasmidPromotionAction.verdict,
    architectPlasmidPromotionTargetMode:
      architectPlasmidPromotionAction.targetMode,
    architectPlasmidPromotionActionReasons:
      architectPlasmidPromotionAction.reasons.join("|") || "none",

    replicationPromotionCurrentMode:
      replicationSignalPromotionLatest?.replication_promotion_current_mode ??
        "shadow-reduce",
    replicationPromotionReadyLatest:
      replicationSignalPromotionLatest?.replication_promotion_ready ?? false,
    replicationPromotionReadyRatio: Number(
      replicationSignalPromotionReadyRatio.toFixed(3),
    ),
    replicationPromotionRecommendedMode: replicationSignalPromotionLatest
      ?.replication_promotion_recommended_mode ??
      "shadow-reduce",
    replicationSignalFallbackRatioP95: Number(
      replicationSignalFallbackRatioP95.toFixed(6),
    ),
    replicationPromotionVerdict: replicationPromotionDecision.verdict,
    replicationPromotionBlockers:
      replicationPromotionDecision.blockers.join("|") || "none",
    replicationPromotionAction: replicationPromotionAction.verdict,
    replicationPromotionTargetMode: replicationPromotionAction.targetMode,
    replicationPromotionActionReasons:
      replicationPromotionAction.reasons.join("|") || "none",

    replicationShadowRuns:
      replicationSignalPromotionLatest?.replication_hybrid?.shadowRuns ?? 0,
    replicationEmitBranchCount:
      replicationSignalPromotionLatest?.replication_hybrid?.emitBranchCount ??
        0,
    replicationSuppressBranchCount:
      replicationSignalPromotionLatest?.replication_hybrid
        ?.suppressBranchCount ?? 0,
    replicationShadowSuppressed:
      replicationSignalPromotionLatest?.replication_hybrid
        ?.shadowSuppressedReplications ?? 0,

    maxConsecutiveFailures,
    processExitedUnexpectedly,
    childExitCode,
    logsTailSize: logTail.length,
  };

  const report: Record<string, unknown> = {
    generatedAt,
    ok: failedChecks.length === 0,
    config,
    summary,
    guardianSignalPromotionDecision,
    guardianSignalPromotionAction,
    architectPlasmidPromotionDecision,
    architectPlasmidPromotionAction,
    replicationPromotionDecision,
    replicationPromotionAction,
    checks,
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
    renderMarkdown(generatedAt, summary, checks),
  );

  console.log(
    `\n📊 [AUDIT] Done. verdict_g=${summary.guardianSignalPromotionVerdict} verdict_a=${summary.architectPlasmidPromotionVerdict} verdict_r=${summary.replicationPromotionVerdict}`,
  );
  if (failedChecks.length > 0) {
    console.warn("      ⚠️ [AUDIT] Some health or promotion checks failed.");
  }

  if (failedChecks.length > 0) {
    throw new Error("[AUDIT] Longrun canary gate failed.");
  }

  console.log("✅ [AUDIT] Longrun canary gate passed.");
};

if (import.meta.main) {
  await main();
}
