import {
  GOLDEN_TRACE_CATALOG,
  goldenTraceArtifactPaths,
  goldenTraceById,
  type GoldenTraceScenario,
} from "./golden_trace_catalog.ts";

const SYSTEM_START_PATH = "/Users/s0fractal/OMEGA/SYSTEM_START.ts";
const TRACE_CONTROL_TOKEN = "omega-golden-trace";
const TRACE_RUNTIME_MODE = "legacy-runtime/api-observer-harness";
const TRACE_SEED = 424242;
const TRACE_WARM_COLDSTART_COUNT = 64;
const TRACE_WARM_COLDSTART_REPLICATOR_RATIO = 0.5;
const TRACE_WARM_COLDSTART_ENERGY = 240;
const TRACE_WARM_COLDSTART_RESONANCE = 220;
const TRACE_REQUEST_TIMEOUT_MS = 5_000;
const TRACE_READY_TIMEOUT_MS = 20_000;
const TRACE_TICK_TIMEOUT_MS = 60_000;
const TRACE_POLL_MS = 50;
const TRACE_CODEX_LIMIT = 12;
const VOLATILE_KEYS = new Set([
  "ts",
  "generatedAt",
  "writtenAt",
  "createdAt",
  "updatedAt",
]);

type JsonRecord = Record<string, unknown>;

type TraceTelemetry = {
  tick: number;
  avgEnergy: number;
  dominantGenomes?: string[];
  spatial_hash_guard?: {
    overflow_ratio?: number;
  };
  daemon_governance?: {
    last_admission?: unknown;
    last_admission_history?: unknown[];
    last_pressure_ring_history?: unknown[];
    homeostasis?: unknown;
  };
  behavior_invariant?: string;
};

type TelemetryStreamSample = {
  tick?: number;
  population?: number;
  avgEnergy?: number;
  spatialOverflowRatio?: number;
};

type MutationTelemetrySnapshot = {
  enabled?: boolean;
  total?: number;
  lanes?: Record<string, number>;
  topKinds?: Array<[string, number]>;
};

type GoldenTraceActionLog = {
  kind: string;
  tick: number;
  response: unknown;
};

export type GoldenTraceCaptureResult = {
  traceId: string;
  trace: JsonRecord;
  codexSnapshot: unknown;
  invariants: unknown;
  notes: string;
};

const decoder = new TextDecoder();

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !VOLATILE_KEYS.has(key))
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, item]) =>
    `${JSON.stringify(key)}:${stableStringify(item)}`
  ).join(",")}}`;
};

const sha256Hex = async (value: unknown): Promise<string> => {
  const source = typeof value === "string" ? value : stableStringify(value);
  const bytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
};

const sanitizeForDigest = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((item) => sanitizeForDigest(item));
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (
    const [key, item] of Object.entries(value as Record<string, unknown>).sort((
      [a],
      [b],
    ) => a.localeCompare(b))
  ) {
    if (VOLATILE_KEYS.has(key)) continue;
    out[key] = sanitizeForDigest(item);
  }
  return out;
};

const asFiniteNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === "number"
    ? value
    : typeof value === "string"
    ? Number(value)
    : NaN;
  return Number.isFinite(n) ? n : fallback;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const readStreamText = async (
  stream: ReadableStream<Uint8Array> | null,
): Promise<string> => {
  if (!stream) return "";
  const reader = stream.getReader();
  let out = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      out += decoder.decode(value, { stream: true });
    }
    out += decoder.decode();
    return out;
  } finally {
    reader.releaseLock();
  }
};

const findOpenPort = async (): Promise<number> => {
  const listener = Deno.listen({ hostname: "127.0.0.1", port: 0 });
  try {
    return (listener.addr as Deno.NetAddr).port;
  } finally {
    listener.close();
  }
};

const traceRuntimeEnv = (
  port: number,
  cwd: string,
): Record<string, string> => ({
  ...Deno.env.toObject(),
  PORT: String(port),
  OMEGA_SYSTEM_CONTROL_ENABLE: "1",
  OMEGA_SYSTEM_CONTROL_TOKEN: TRACE_CONTROL_TOKEN,
  OMEGA_MUTATION_TELEMETRY: "1",
  OMEGA_AUTO_SNAPSHOT_ENABLE: "0",
  OMEGA_PULSE_WORKERS: "1",
  OMEGA_STRICT_DETERMINISM: "1",
  OMEGA_COLDSTART_ENABLE: "1",
  OMEGA_COLDSTART_COUNT: String(TRACE_WARM_COLDSTART_COUNT),
  OMEGA_COLDSTART_REPLICATOR_RATIO: String(
    TRACE_WARM_COLDSTART_REPLICATOR_RATIO,
  ),
  OMEGA_COLDSTART_SEED: String(TRACE_SEED),
  OMEGA_COLDSTART_ENERGY: String(TRACE_WARM_COLDSTART_ENERGY),
  OMEGA_COLDSTART_RESONANCE: String(TRACE_WARM_COLDSTART_RESONANCE),
  OMEGA_DAEMON_AUDIT_PATH: `${cwd}/daemon_audit.jsonl`,
});

const traceHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  "x-omega-control-token": TRACE_CONTROL_TOKEN,
});

const fetchJson = async <T>(
  url: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TRACE_REQUEST_TIMEOUT_MS),
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`[golden_trace_capture] ${url} failed ${response.status}: ${raw}`);
  }
  return JSON.parse(raw) as T;
};

const postJson = async <T>(
  url: string,
  body: unknown,
): Promise<T> =>
  await fetchJson<T>(url, {
    method: "POST",
    headers: traceHeaders(),
    body: JSON.stringify(body),
  });

const postJsonWithStatus = async (
  url: string,
  body: unknown,
): Promise<Record<string, unknown>> => {
  const response = await fetch(url, {
    method: "POST",
    headers: traceHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TRACE_REQUEST_TIMEOUT_MS),
  });
  const raw = await response.text();
  let parsed: unknown = {};
  try {
    parsed = raw.length > 0 ? JSON.parse(raw) : {};
  } catch {
    parsed = { raw_body: raw };
  }
  const root: Record<string, unknown> = parsed && typeof parsed === "object"
    ? { ...(parsed as Record<string, unknown>) }
    : { body: parsed };
  root.http_status = response.status;
  root.http_ok = response.ok;
  return root;
};

const waitForTelemetryReady = async (baseUrl: string): Promise<TraceTelemetry> => {
  const started = Date.now();
  let lastError = "not_started";
  while (Date.now() - started < TRACE_READY_TIMEOUT_MS) {
    try {
      const telemetry = await fetchJson<TraceTelemetry>(`${baseUrl}/api/telemetry`);
      if (typeof telemetry.tick === "number" && telemetry.tick >= 0) {
        return telemetry;
      }
    } catch (err) {
      lastError = String(err);
    }
    await sleep(TRACE_POLL_MS);
  }
  throw new Error(
    `[golden_trace_capture] telemetry readiness timeout for ${baseUrl}: ${lastError}`,
  );
};

const waitForTick = async (
  baseUrl: string,
  minTick: number,
): Promise<TraceTelemetry> => {
  const started = Date.now();
  let latest: TraceTelemetry | null = null;
  while (Date.now() - started < TRACE_TICK_TIMEOUT_MS) {
    const telemetry = await fetchJson<TraceTelemetry>(`${baseUrl}/api/telemetry`);
    latest = telemetry;
    if (telemetry.tick >= minTick) return telemetry;
    await sleep(TRACE_POLL_MS);
  }
  throw new Error(
    `[golden_trace_capture] tick wait timeout target=${minTick} latest=${latest?.tick ?? -1}`,
  );
};

const fetchMutationTelemetry = async (
  baseUrl: string,
): Promise<MutationTelemetrySnapshot> => {
  const payload = await fetchJson<{
    mutation_telemetry?: MutationTelemetrySnapshot;
  }>(`${baseUrl}/api/mutation-telemetry`);
  return payload.mutation_telemetry ?? {};
};

const fetchCodexSnapshot = async (baseUrl: string): Promise<unknown> =>
  await fetchJson(`${baseUrl}/api/codex?limit=${TRACE_CODEX_LIMIT}`);

const fetchInvariants = async (baseUrl: string): Promise<unknown> =>
  await fetchJson(`${baseUrl}/api/codex/invariants?limit=${TRACE_CODEX_LIMIT}`);

const fetchHomeostasis = async (baseUrl: string): Promise<unknown> =>
  await fetchJson(`${baseUrl}/api/homeostasis`);

const fetchTelemetryWindow = async (baseUrl: string, limit: number): Promise<unknown> =>
  await fetchJson(`${baseUrl}/api/telemetry/stream?limit=${limit}`);

const fetchLatestTelemetrySample = async (
  baseUrl: string,
): Promise<TelemetryStreamSample | null> => {
  const payload = await fetchJson<{ history?: unknown[] }>(
    `${baseUrl}/api/telemetry/stream?limit=1`,
  );
  const sample = Array.isArray(payload.history) ? payload.history.at(0) : null;
  if (!sample || typeof sample !== "object") return null;
  return sample as TelemetryStreamSample;
};

const notesForCapture = async (
  trace: GoldenTraceScenario,
  baseUrl: string,
  port: number,
  actions: GoldenTraceActionLog[],
): Promise<string> => {
  const actionLines = actions.length === 0
    ? "- none"
    : (await Promise.all(actions.map(async (entry) =>
      `- tick=${entry.tick} kind=${entry.kind} responseDigest=${
        await sha256Hex(sanitizeForDigest(entry.response))
      }`
    ))).join("\n");
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_RUNTIME_MODE}`,
    `- base_url: ${baseUrl}`,
    `- port: ${port}`,
    `- seed: ${TRACE_SEED}`,
    ``,
    `## Environment`,
    ``,
    `- OMEGA_PULSE_WORKERS=1`,
    `- OMEGA_STRICT_DETERMINISM=1`,
    `- OMEGA_AUTO_SNAPSHOT_ENABLE=0`,
    `- OMEGA_COLDSTART_ENABLE=1`,
    `- OMEGA_COLDSTART_COUNT=${TRACE_WARM_COLDSTART_COUNT}`,
    `- OMEGA_COLDSTART_REPLICATOR_RATIO=${TRACE_WARM_COLDSTART_REPLICATOR_RATIO}`,
    `- OMEGA_COLDSTART_SEED=${TRACE_SEED}`,
    `- OMEGA_COLDSTART_ENERGY=${TRACE_WARM_COLDSTART_ENERGY}`,
    `- OMEGA_COLDSTART_RESONANCE=${TRACE_WARM_COLDSTART_RESONANCE}`,
    ``,
    `## Actions`,
    ``,
    actionLines,
  ].join("\n");
};

const persistCapture = async (
  traceId: string,
  result: GoldenTraceCaptureResult,
): Promise<void> => {
  const paths = goldenTraceArtifactPaths(traceId);
  await Deno.mkdir(paths.dir, { recursive: true });
  await Deno.writeTextFile(
    paths.traceJson,
    JSON.stringify(result.trace, null, 2),
  );
  await Deno.writeTextFile(
    paths.codexSnapshotJson,
    JSON.stringify(result.codexSnapshot, null, 2),
  );
  await Deno.writeTextFile(
    paths.invariantsJson,
    JSON.stringify(result.invariants, null, 2),
  );
  await Deno.writeTextFile(paths.notesMd, result.notes);
};

const extractAppliedAction = (response: unknown): string => {
  if (!response || typeof response !== "object") return "UNKNOWN";
  const root = response as Record<string, unknown>;
  if (typeof root.applied_action === "string") return root.applied_action;
  if (typeof root.action === "string") return root.action;
  return "UNKNOWN";
};

const extractAdmissionSeverity = (response: unknown): string => {
  if (!response || typeof response !== "object") return "NONE";
  const admission = (response as Record<string, unknown>).admission;
  if (!admission || typeof admission !== "object") return "NONE";
  return typeof (admission as Record<string, unknown>).severity === "string"
    ? String((admission as Record<string, unknown>).severity)
    : "NONE";
};

const captureScenario = async (
  trace: GoldenTraceScenario,
  baseUrl: string,
): Promise<GoldenTraceCaptureResult> => {
  const start = await waitForTelemetryReady(baseUrl);
  const tickStart = start.tick;
  const actions: GoldenTraceActionLog[] = [];
  const mutationBefore = await fetchMutationTelemetry(baseUrl);

  let endTelemetry = start;
  let traceMetrics: Record<string, unknown> = {};
  let extraArtifacts: Record<string, unknown> = {};
  const startSample = await fetchLatestTelemetrySample(baseUrl);

  if (trace.id === "gt01_coldstart_seeded_swarm") {
    endTelemetry = await waitForTick(baseUrl, tickStart + 256);
    const endSample = await fetchLatestTelemetrySample(baseUrl);
    traceMetrics = {
      population: endSample?.population ?? 0,
      avgEnergy: endTelemetry.avgEnergy,
      spatialOverflowRatio:
        endTelemetry.spatial_hash_guard?.overflow_ratio ?? 0,
      mutationCounts: await fetchMutationTelemetry(baseUrl),
      invariantDigestSource: endTelemetry.behavior_invariant ?? "none",
    };
  } else if (trace.id === "gt02_free_run_no_ingress") {
    endTelemetry = await waitForTick(baseUrl, tickStart + 2048);
    const endSample = await fetchLatestTelemetrySample(baseUrl);
    traceMetrics = {
      population: endSample?.population ?? 0,
      avgEnergy: endTelemetry.avgEnergy,
      spatialOverflowRatio:
        endTelemetry.spatial_hash_guard?.overflow_ratio ?? 0,
      decreeShifts:
        endTelemetry.daemon_governance?.last_pressure_ring_history ?? [],
      mutationCounts: await fetchMutationTelemetry(baseUrl),
    };
  } else if (trace.id === "gt03_pheromone_inject") {
    const warm = await waitForTick(baseUrl, tickStart + 128);
    const response = await postJson<unknown>(`${baseUrl}/api/inject`, {
      action_type: "DROP_PHEROMONE",
      payload: {
        target_x: 640,
        target_y: 360,
        intensity: 96,
      },
    });
    actions.push({
      kind: "DROP_PHEROMONE",
      tick: warm.tick,
      response,
    });
    endTelemetry = await waitForTick(baseUrl, tickStart + 512);
    const endSample = await fetchLatestTelemetrySample(baseUrl);
    traceMetrics = {
      localResponseWindow: await fetchTelemetryWindow(baseUrl, 8),
      population: endSample?.population ?? 0,
      avgEnergy: endTelemetry.avgEnergy,
      spatialOverflowRatio:
        endTelemetry.spatial_hash_guard?.overflow_ratio ?? 0,
      injectResponse: response,
    };
  } else if (trace.id === "gt04_plasmid_inject") {
    const warm = await waitForTick(baseUrl, tickStart + 128);
    const response = await postJson<unknown>(`${baseUrl}/api/inject`, {
      action_type: "INJECT_PLASMID",
      payload: {
        target_x: 640,
        target_y: 360,
        intensity: 420,
        hex_code: "0102030405101180",
      },
    });
    actions.push({
      kind: "INJECT_PLASMID",
      tick: warm.tick,
      response,
    });
    endTelemetry = await waitForTick(baseUrl, tickStart + 512);
    const endSample = await fetchLatestTelemetrySample(baseUrl);
    traceMetrics = {
      acceptedMutationCounts: response && typeof response === "object" &&
          (response as Record<string, unknown>).ok === true
        ? 1
        : 0,
      rejectedMutationCounts: response && typeof response === "object" &&
          (response as Record<string, unknown>).ok === true
        ? 0
        : 1,
      population: endSample?.population ?? 0,
      avgEnergy: endTelemetry.avgEnergy,
      appliedAction: extractAppliedAction(response),
      admissionSeverity: extractAdmissionSeverity(response),
    };
  } else if (trace.id === "gt05_homeostasis_correction") {
    const warm = await waitForTick(baseUrl, tickStart + 256);
    const beforeHomeostasis = await fetchHomeostasis(baseUrl);
    const response = await postJson<unknown>(`${baseUrl}/api/homeostasis`, {
      base_tax: 4,
      target_energy: 300,
      reason: "golden_trace_gt05",
    });
    actions.push({
      kind: "HOMEOSTASIS_UPDATE",
      tick: warm.tick,
      response,
    });
    endTelemetry = await waitForTick(baseUrl, tickStart + 768);
    const afterHomeostasis = await fetchHomeostasis(baseUrl);
    const tickDelta = Math.max(1, endTelemetry.tick - warm.tick);
    traceMetrics = {
      avgEnergySlope: Number(
        ((endTelemetry.avgEnergy - warm.avgEnergy) / tickDelta).toFixed(6),
      ),
      spatialOverflowRatio:
        endTelemetry.spatial_hash_guard?.overflow_ratio ?? 0,
      mutationCounts: await fetchMutationTelemetry(baseUrl),
      updateResponse: response,
    };
    extraArtifacts = {
      beforeHomeostasis,
      afterHomeostasis,
    };
  } else if (trace.id === "gt06_daemon_admission_case") {
    const warm = await waitForTick(baseUrl, tickStart + 128);
    const accepted = await postJson<unknown>(`${baseUrl}/api/inject`, {
      action_type: "DROP_PHEROMONE",
      payload: {
        target_x: 512,
        target_y: 320,
        intensity: 80,
      },
    });
    actions.push({
      kind: "DROP_PHEROMONE_ACCEPT",
      tick: warm.tick,
      response: accepted,
    });
    await waitForTick(baseUrl, warm.tick + 64);
    const degraded = await postJson<unknown>(`${baseUrl}/api/inject`, {
      action_type: "INJECT_PLASMID",
      payload: {
        target_x: 512,
        target_y: 320,
        intensity: 1100,
        hex_code: "001011120381A4A5",
      },
    });
    actions.push({
      kind: "INJECT_PLASMID_DEGRADED",
      tick: warm.tick + 64,
      response: degraded,
    });
    endTelemetry = await waitForTick(baseUrl, warm.tick + 256);
    traceMetrics = {
      admissionSeverity: extractAdmissionSeverity(degraded),
      appliedAction: extractAppliedAction(degraded),
      admissionHistory:
        endTelemetry.daemon_governance?.last_admission_history ?? [],
      acceptedResponse: accepted,
      degradedResponse: degraded,
    };
  } else if (trace.id === "gt07_daemon_policy_block") {
    const warm = await waitForTick(baseUrl, tickStart + 128);
    const blocked = await postJsonWithStatus(`${baseUrl}/api/inject`, {
      action_type: "INJECT_PLASMID",
      payload: {
        target_x: 512,
        target_y: 320,
        intensity: 420,
        hex_code: "FF02030405101180",
      },
    });
    const afterBlock = await waitForTick(baseUrl, warm.tick + 1);
    const latestAdmission = afterBlock.daemon_governance?.last_admission ?? null;
    const blockedAnnotated = {
      ...blocked,
      latest_admission: latestAdmission,
      applied_action: latestAdmission && typeof latestAdmission === "object"
          ? (latestAdmission as Record<string, unknown>).appliedAction ?? "BLOCKED"
          : "BLOCKED",
    };
    actions.push({
      kind: "INJECT_PLASMID_BLOCKED",
      tick: warm.tick,
      response: blockedAnnotated,
    });
    endTelemetry = await waitForTick(baseUrl, warm.tick + 128);
    traceMetrics = {
      httpStatus: blocked.http_status ?? 0,
      responseReason: typeof blocked.reason === "string" ? blocked.reason : "UNKNOWN",
      latestAdmissionStatus: latestAdmission && typeof latestAdmission === "object"
        ? (latestAdmission as Record<string, unknown>).status ?? "unknown"
        : "missing",
      latestAdmissionReason: latestAdmission && typeof latestAdmission === "object"
        ? (latestAdmission as Record<string, unknown>).reason ?? "unknown"
        : "missing",
      blockedResponse: blockedAnnotated,
      mutationCounts: await fetchMutationTelemetry(baseUrl),
    };
  } else {
    throw new Error(`[golden_trace_capture] unsupported trace id: ${trace.id}`);
  }

  const mutationAfter = await fetchMutationTelemetry(baseUrl);
  const codexSnapshot = await fetchCodexSnapshot(baseUrl);
  const invariants = await fetchInvariants(baseUrl);
  const notes = await notesForCapture(
    trace,
    baseUrl,
    Number(new URL(baseUrl).port),
    actions,
  );

  const codexSnapshotSanitized = sanitizeForDigest(codexSnapshot);
  const invariantsSanitized = sanitizeForDigest(invariants);
  const eventLogSanitized = sanitizeForDigest(actions);
  const mutationAfterSanitized = sanitizeForDigest(mutationAfter);

  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    seed: TRACE_SEED,
    tick_start: tickStart,
    tick_end: endTelemetry.tick,
    runtime_mode: TRACE_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: traceMetrics,
    telemetry_start: start,
    telemetry_stream_start: startSample,
    telemetry_end: endTelemetry,
    mutation_telemetry_before: mutationBefore,
    mutation_telemetry_after: mutationAfter,
    event_log: actions,
    event_log_digest: await sha256Hex(eventLogSanitized),
    mutation_telemetry_digest: await sha256Hex(mutationAfterSanitized),
    codex_snapshot_digest: await sha256Hex(codexSnapshotSanitized),
    invariant_digest: await sha256Hex(invariantsSanitized),
    extra_artifacts: extraArtifacts,
  };

  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes,
  };
};

const runTraceServer = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const tempDir = await Deno.makeTempDir({ prefix: "omega-golden-trace-" });
  const port = await findOpenPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", SYSTEM_START_PATH],
    cwd: tempDir,
    env: traceRuntimeEnv(port, tempDir),
    stdout: "piped",
    stderr: "piped",
  }).spawn();
  const stdoutPromise = readStreamText(child.stdout);
  const stderrPromise = readStreamText(child.stderr);

  try {
    return await captureScenario(trace, baseUrl);
  } catch (err) {
    const [stdout, stderr] = await Promise.all([stdoutPromise, stderrPromise]);
    throw new Error(
      `[golden_trace_capture] ${trace.id} failed: ${String(err)}\n--- stdout ---\n${stdout}\n--- stderr ---\n${stderr}`,
    );
  } finally {
    try {
      child.kill("SIGTERM");
    } catch {
      // Process may have already exited.
    }
    await child.status.catch(() => undefined);
    await Promise.all([stdoutPromise, stderrPromise]).catch(() => undefined);
    await Deno.remove(tempDir, { recursive: true }).catch(() => undefined);
  }
};

export const captureGoldenTrace = async (
  traceId: string,
  options: { writeArtifacts?: boolean } = {},
): Promise<GoldenTraceCaptureResult> => {
  const trace = goldenTraceById(traceId);
  if (!trace) {
    throw new Error(`[golden_trace_capture] unknown trace id: ${traceId}`);
  }
  const result = await runTraceServer(trace);
  if (options.writeArtifacts ?? true) {
    await persistCapture(traceId, result);
  }
  return result;
};

export const captureGoldenTraces = async (
  traceIds: string[],
  options: { writeArtifacts?: boolean } = {},
): Promise<GoldenTraceCaptureResult[]> => {
  const results: GoldenTraceCaptureResult[] = [];
  for (const traceId of traceIds) {
    results.push(await captureGoldenTrace(traceId, options));
  }
  return results;
};

export const SUPPORTED_GOLDEN_TRACE_IDS = GOLDEN_TRACE_CATALOG.map((trace) =>
  trace.id
);

if (import.meta.main) {
  const traceIds = Deno.args.length > 0 ? Deno.args : SUPPORTED_GOLDEN_TRACE_IDS;
  await captureGoldenTraces(traceIds, { writeArtifacts: true });
  console.log(
    `[golden_trace_capture] captured ${traceIds.length} trace(s): ${traceIds.join(", ")}`,
  );
}
