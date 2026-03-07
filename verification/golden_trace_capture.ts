import {
  GOLDEN_TRACE_CATALOG,
  goldenTraceArtifactPaths,
  goldenTraceById,
  type GoldenTraceScenario,
} from "./golden_trace_catalog.ts";

const SYSTEM_START_PATH = "/Users/s0fractal/OMEGA/SYSTEM_START.ts";
const STRUCTURE_INTENT_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/test_structure_intent_determinism.ts";
const STRUCTURE_LOCK_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/verification/structure_lock_capture.ts";
const STRUCTURE_CHARGE_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/verification/structure_charge_capture.ts";
const STRUCTURE_CHARGE_COMPETITION_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/verification/structure_charge_competition_capture.ts";
const COLLECTIVE_TRANSPORT_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/verification/collective_transport_capture.ts";
const COLLECTIVE_BANKING_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/verification/collective_banking_capture.ts";
const COLLECTIVE_SYNCHRONY_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/verification/collective_synchrony_capture.ts";
const SHARE_TRANSFER_CAPTURE_PATH =
  "/Users/s0fractal/OMEGA/verification/share_transfer_capture.ts";
const TRACE_CONTROL_TOKEN = "omega-golden-trace";
const TRACE_RUNTIME_MODE = "legacy-runtime/api-observer-harness";
const TRACE_STRUCTURE_INTENT_RUNTIME_MODE =
  "standalone-structure-intent-capture";
const TRACE_STRUCTURE_LOCK_RUNTIME_MODE = "standalone-structure-lock-capture";
const TRACE_STRUCTURE_CHARGE_RUNTIME_MODE =
  "standalone-structure-charge-capture";
const TRACE_STRUCTURE_CHARGE_COMPETITION_RUNTIME_MODE =
  "standalone-structure-charge-competition-capture";
const TRACE_COLLECTIVE_TRANSPORT_RUNTIME_MODE =
  "standalone-collective-transport-capture";
const TRACE_COLLECTIVE_BANKING_RUNTIME_MODE =
  "standalone-collective-banking-capture";
const TRACE_COLLECTIVE_SYNCHRONY_RUNTIME_MODE =
  "standalone-collective-synchrony-capture";
const TRACE_SHARE_TRANSFER_RUNTIME_MODE =
  "standalone-share-transfer-capture";
const TRACE_SEED = 424242;
const TRACE_STRUCTURE_INTENT_SEED = 404;
const TRACE_STRUCTURE_INTENT_TICKS = 1;
const TRACE_STRUCTURE_INTENT_ATOMS = 20;
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

type StructureIntentAtomState = {
  idx: number;
  energy: number;
  resonance: number;
  pc: number;
  role: number;
  senseReg: number;
};

type StructureIntentSnapshot = {
  tickCounter: number;
  centerCell: number;
  centerX: number;
  centerY: number;
  conflictCell: number;
  conflictX: number;
  conflictY: number;
  neighborhood: number[];
  atoms: StructureIntentAtomState[];
};

type StructureIntentCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  seed: number;
  ticks: number;
  atomCount: number;
  hash: string;
  snapshot: StructureIntentSnapshot;
};

type StructureLockSenseSnapshot = {
  centerX: number;
  centerY: number;
  neighborCellIdx: number;
  neighborType: number;
  senseReg: number;
  pc: number;
};

type StructureLockIntentClearingSnapshot = {
  cellIdx: number;
  resolvedType: number;
  resolvedCharge: number;
  ownerIntent: number;
  valueIntent: number;
  chargeIntent: number;
};

type StructureLockSnapshot = {
  visibleSense: StructureLockSenseSnapshot;
  typedMissSense: StructureLockSenseSnapshot;
  intentClearing: StructureLockIntentClearingSnapshot;
};

type StructureLockCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: StructureLockSnapshot;
};

type StructureChargeBeforeTickSnapshot = {
  targetCellIdx: number;
  chargeIntent: number;
};

type StructureChargeAfterTickSnapshot = {
  targetCellIdx: number;
  resolvedType: number;
  resolvedCharge: number;
  chargeIntent: number;
};

type StructureChargeSnapshot = {
  beforeTick: StructureChargeBeforeTickSnapshot;
  afterTick: StructureChargeAfterTickSnapshot;
};

type StructureChargeCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: StructureChargeSnapshot;
};

type StructureChargeCompetitionOrderSnapshot = {
  targetCellIdx: number;
  firstRequestedCharge: number;
  secondRequestedCharge: number;
  chargeIntentBeforeTick: number;
  resolvedType: number;
  resolvedCharge: number;
  chargeIntentAfterTick: number;
};

type StructureChargeCompetitionSnapshot = {
  lowThenHigh: StructureChargeCompetitionOrderSnapshot;
  highThenLow: StructureChargeCompetitionOrderSnapshot;
};

type StructureChargeCompetitionCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: StructureChargeCompetitionSnapshot;
};

type CollectiveTransportAtomState = {
  idx: number;
  energy: number;
  pc: number;
  role: number;
  reg0: number;
};

type CollectiveTransportSnapshot = {
  hiveValue: number;
  hiveBalance: number;
  pheromoneWord: number;
  pheromoneCellIdx: number;
  pheromoneX: number;
  pheromoneY: number;
  atoms: CollectiveTransportAtomState[];
};

type CollectiveTransportCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: CollectiveTransportSnapshot;
};

type CollectiveBankingAtomState = {
  idx: number;
  energy: number;
  pc: number;
  role: number;
  reg0: number;
};

type CollectiveBankingSnapshot = {
  initialHiveBalance: number;
  finalHiveBalance: number;
  depositValueRaw: number;
  withdrawCapRaw: number;
  atoms: CollectiveBankingAtomState[];
};

type CollectiveBankingCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: CollectiveBankingSnapshot;
};

type CollectiveSynchronyPhaseLockSnapshot = {
  sourcePc: number;
  peer1Pc: number;
  peer2Pc: number;
  peer1InitialPc: number;
  peer2InitialPc: number;
};

type CollectiveSynchronyQuorumSnapshot = {
  sourcePc: number;
  peer1Pc: number;
  peer2Pc: number;
  outsiderPc: number;
  peer1InitialPc: number;
  peer2InitialPc: number;
  outsiderInitialPc: number;
  cellIdx: number;
  cellCount: number;
};

type CollectiveSynchronySnapshot = {
  phaseLock: CollectiveSynchronyPhaseLockSnapshot;
  quorum: CollectiveSynchronyQuorumSnapshot;
};

type CollectiveSynchronyCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: CollectiveSynchronySnapshot;
};

type ShareTransferAtomState = {
  idx: number;
  energy: number;
  pc: number;
  role: number;
};

type ShareTransferSnapshot = {
  successfulSenderEnergy: number;
  successfulReceiverEnergy: number;
  failedSenderEnergy: number;
  failedReceiverEnergy: number;
  senderBondTarget: number;
  failedBondTarget: number;
  atoms: ShareTransferAtomState[];
};

type ShareTransferCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: ShareTransferSnapshot;
};

export type GoldenTraceCaptureResult = {
  traceId: string;
  trace: JsonRecord;
  codexSnapshot: unknown;
  invariants: unknown;
  notes: string;
};

const decoder = new TextDecoder();
const STRUCTURE_INTENT_CAPTURE_MARKER = "__OMEGA_STRUCTURE_INTENT_CAPTURE__";
const STRUCTURE_LOCK_CAPTURE_MARKER = "__OMEGA_STRUCTURE_LOCK_CAPTURE__";
const STRUCTURE_CHARGE_CAPTURE_MARKER = "__OMEGA_STRUCTURE_CHARGE_CAPTURE__";
const STRUCTURE_CHARGE_COMPETITION_CAPTURE_MARKER =
  "__OMEGA_STRUCTURE_CHARGE_COMPETITION_CAPTURE__";
const COLLECTIVE_TRANSPORT_CAPTURE_MARKER =
  "__OMEGA_COLLECTIVE_TRANSPORT_CAPTURE__";
const COLLECTIVE_BANKING_CAPTURE_MARKER =
  "__OMEGA_COLLECTIVE_BANKING_CAPTURE__";
const COLLECTIVE_SYNCHRONY_CAPTURE_MARKER =
  "__OMEGA_COLLECTIVE_SYNCHRONY_CAPTURE__";
const SHARE_TRANSFER_CAPTURE_MARKER = "__OMEGA_SHARE_TRANSFER_CAPTURE__";

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

const runStructureIntentCaptureSubprocess = async (
  workerCount: number,
): Promise<StructureIntentCapturePayload> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", STRUCTURE_INTENT_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: String(workerCount),
      OMEGA_STRICT_DETERMINISM: "1",
      OMEGA_STRUCTURE_INTENT_SEED: String(TRACE_STRUCTURE_INTENT_SEED),
      OMEGA_STRUCTURE_INTENT_TICKS: String(TRACE_STRUCTURE_INTENT_TICKS),
      OMEGA_STRUCTURE_INTENT_ATOMS: String(TRACE_STRUCTURE_INTENT_ATOMS),
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] structure-intent subprocess failed workers=${workerCount}\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(STRUCTURE_INTENT_CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[golden_trace_capture] structure-intent capture marker missing workers=${workerCount}\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(STRUCTURE_INTENT_CAPTURE_MARKER.length),
  ) as StructureIntentCapturePayload;
};

const notesForStructureIntentCapture = async (
  trace: GoldenTraceScenario,
  oneWorker: StructureIntentCapturePayload,
  fourWorker: StructureIntentCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_STRUCTURE_INTENT_RUNTIME_MODE}`,
    `- seed: ${TRACE_STRUCTURE_INTENT_SEED}`,
    `- ticks: ${TRACE_STRUCTURE_INTENT_TICKS}`,
    `- atom_count: ${TRACE_STRUCTURE_INTENT_ATOMS}`,
    ``,
    `## Subprocess captures`,
    ``,
    `- strict=true workers=1 hash=${oneWorker.hash}`,
    `- strict=true workers=4 hash=${fourWorker.hash}`,
    `- hash_match=${oneWorker.hash === fourWorker.hash}`,
    `- sense_visibility_1w=${
      oneWorker.snapshot.atoms.every((atom) => atom.senseReg === 1)
    }`,
    `- sense_visibility_4w=${
      fourWorker.snapshot.atoms.every((atom) => atom.senseReg === 1)
    }`,
  ].join("\n");
};

const runStructureLockCaptureSubprocess = async (): Promise<
  StructureLockCapturePayload
> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", STRUCTURE_LOCK_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: "1",
      OMEGA_STRICT_DETERMINISM: "1",
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] structure-lock subprocess failed\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(STRUCTURE_LOCK_CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[golden_trace_capture] structure-lock capture marker missing\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(STRUCTURE_LOCK_CAPTURE_MARKER.length),
  ) as StructureLockCapturePayload;
};

const notesForStructureLockCapture = async (
  trace: GoldenTraceScenario,
  payload: StructureLockCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_STRUCTURE_LOCK_RUNTIME_MODE}`,
    `- workers: ${payload.workerCount}`,
    `- strict: ${payload.strictDeterminism}`,
    `- hash: ${payload.hash}`,
    ``,
    `## Structure lock capture`,
    ``,
    `- visible_sense_reg=${payload.snapshot.visibleSense.senseReg}`,
    `- typed_miss_sense_reg=${payload.snapshot.typedMissSense.senseReg}`,
    `- resolved_cell_type=${payload.snapshot.intentClearing.resolvedType}`,
    `- resolved_cell_charge=${payload.snapshot.intentClearing.resolvedCharge}`,
    `- owner_intent_after_tick=${payload.snapshot.intentClearing.ownerIntent}`,
  ].join("\n");
};

const runStructureChargeCaptureSubprocess = async (): Promise<
  StructureChargeCapturePayload
> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", STRUCTURE_CHARGE_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: "1",
      OMEGA_STRICT_DETERMINISM: "1",
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] structure-charge subprocess failed\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(STRUCTURE_CHARGE_CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[golden_trace_capture] structure-charge capture marker missing\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(STRUCTURE_CHARGE_CAPTURE_MARKER.length),
  ) as StructureChargeCapturePayload;
};

const notesForStructureChargeCapture = async (
  trace: GoldenTraceScenario,
  payload: StructureChargeCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_STRUCTURE_CHARGE_RUNTIME_MODE}`,
    `- workers: ${payload.workerCount}`,
    `- strict: ${payload.strictDeterminism}`,
    `- hash: ${payload.hash}`,
    ``,
    `## Structure charge capture`,
    ``,
    `- charge_intent_before_tick=${payload.snapshot.beforeTick.chargeIntent}`,
    `- resolved_cell_type=${payload.snapshot.afterTick.resolvedType}`,
    `- resolved_cell_charge=${payload.snapshot.afterTick.resolvedCharge}`,
    `- charge_intent_after_tick=${payload.snapshot.afterTick.chargeIntent}`,
  ].join("\n");
};

const runStructureChargeCompetitionCaptureSubprocess = async (): Promise<
  StructureChargeCompetitionCapturePayload
> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", STRUCTURE_CHARGE_COMPETITION_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: "1",
      OMEGA_STRICT_DETERMINISM: "1",
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] structure-charge-competition subprocess failed\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) =>
      item.startsWith(STRUCTURE_CHARGE_COMPETITION_CAPTURE_MARKER)
    );
  if (!line) {
    throw new Error(
      `[golden_trace_capture] structure-charge-competition capture marker missing\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(STRUCTURE_CHARGE_COMPETITION_CAPTURE_MARKER.length),
  ) as StructureChargeCompetitionCapturePayload;
};

const notesForStructureChargeCompetitionCapture = async (
  trace: GoldenTraceScenario,
  payload: StructureChargeCompetitionCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_STRUCTURE_CHARGE_COMPETITION_RUNTIME_MODE}`,
    `- workers: ${payload.workerCount}`,
    `- strict: ${payload.strictDeterminism}`,
    `- hash: ${payload.hash}`,
    ``,
    `## Structure charge competition capture`,
    ``,
    `- low_then_high_charge_intent=${payload.snapshot.lowThenHigh.chargeIntentBeforeTick}`,
    `- low_then_high_resolved_charge=${payload.snapshot.lowThenHigh.resolvedCharge}`,
    `- high_then_low_charge_intent=${payload.snapshot.highThenLow.chargeIntentBeforeTick}`,
    `- high_then_low_resolved_charge=${payload.snapshot.highThenLow.resolvedCharge}`,
  ].join("\n");
};

const runCollectiveTransportCaptureSubprocess = async (): Promise<
  CollectiveTransportCapturePayload
> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", COLLECTIVE_TRANSPORT_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: "1",
      OMEGA_STRICT_DETERMINISM: "1",
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] collective-transport subprocess failed\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(COLLECTIVE_TRANSPORT_CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[golden_trace_capture] collective-transport capture marker missing\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(COLLECTIVE_TRANSPORT_CAPTURE_MARKER.length),
  ) as CollectiveTransportCapturePayload;
};

const runCollectiveBankingCaptureSubprocess = async (): Promise<
  CollectiveBankingCapturePayload
> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", COLLECTIVE_BANKING_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: "1",
      OMEGA_STRICT_DETERMINISM: "1",
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] collective-banking subprocess failed\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(COLLECTIVE_BANKING_CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[golden_trace_capture] collective-banking capture marker missing\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(COLLECTIVE_BANKING_CAPTURE_MARKER.length),
  ) as CollectiveBankingCapturePayload;
};

const runCollectiveSynchronyCaptureSubprocess = async (): Promise<
  CollectiveSynchronyCapturePayload
> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", COLLECTIVE_SYNCHRONY_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: "1",
      OMEGA_STRICT_DETERMINISM: "1",
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] collective-synchrony subprocess failed\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(COLLECTIVE_SYNCHRONY_CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[golden_trace_capture] collective-synchrony capture marker missing\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(COLLECTIVE_SYNCHRONY_CAPTURE_MARKER.length),
  ) as CollectiveSynchronyCapturePayload;
};

const notesForCollectiveTransportCapture = async (
  trace: GoldenTraceScenario,
  payload: CollectiveTransportCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_COLLECTIVE_TRANSPORT_RUNTIME_MODE}`,
    `- workers: ${payload.workerCount}`,
    `- strict: ${payload.strictDeterminism}`,
    `- hash: ${payload.hash}`,
    ``,
    `## Collective capture`,
    ``,
    `- hive_value=${payload.snapshot.hiveValue}`,
    `- loaded_reg0=${payload.snapshot.atoms.find((atom) => atom.idx === 1)?.reg0 ?? -1}`,
    `- pheromone_word=0x${payload.snapshot.pheromoneWord.toString(16)}`,
  ].join("\n");
};

const notesForCollectiveBankingCapture = async (
  trace: GoldenTraceScenario,
  payload: CollectiveBankingCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_COLLECTIVE_BANKING_RUNTIME_MODE}`,
    `- workers: ${payload.workerCount}`,
    `- strict: ${payload.strictDeterminism}`,
    `- hash: ${payload.hash}`,
    ``,
    `## Collective banking capture`,
    ``,
    `- initial_hive_balance=${payload.snapshot.initialHiveBalance}`,
    `- final_hive_balance=${payload.snapshot.finalHiveBalance}`,
    `- depositor_energy=${payload.snapshot.atoms.find((atom) => atom.idx === 0)?.energy ?? -1}`,
    `- withdrawer_energy=${payload.snapshot.atoms.find((atom) => atom.idx === 1)?.energy ?? -1}`,
    `- withdraw_reg0=${payload.snapshot.atoms.find((atom) => atom.idx === 1)?.reg0 ?? -1}`,
  ].join("\n");
};

const notesForCollectiveSynchronyCapture = async (
  trace: GoldenTraceScenario,
  payload: CollectiveSynchronyCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_COLLECTIVE_SYNCHRONY_RUNTIME_MODE}`,
    `- workers: ${payload.workerCount}`,
    `- strict: ${payload.strictDeterminism}`,
    `- hash: ${payload.hash}`,
    ``,
    `## Collective synchrony capture`,
    ``,
    `- phase_peer_1_pc=${payload.snapshot.phaseLock.peer1Pc}`,
    `- phase_peer_2_pc=${payload.snapshot.phaseLock.peer2Pc}`,
    `- quorum_peer_1_pc=${payload.snapshot.quorum.peer1Pc}`,
    `- quorum_peer_2_pc=${payload.snapshot.quorum.peer2Pc}`,
    `- quorum_outsider_pc=${payload.snapshot.quorum.outsiderPc}`,
  ].join("\n");
};

const runShareTransferCaptureSubprocess = async (): Promise<
  ShareTransferCapturePayload
> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", SHARE_TRANSFER_CAPTURE_PATH, "--capture"],
    cwd: "/Users/s0fractal/OMEGA",
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: "1",
      OMEGA_STRICT_DETERMINISM: "1",
    },
    stdout: "piped",
    stderr: "piped",
  });
  const result = await cmd.output();
  const stdout = decoder.decode(result.stdout);
  const stderr = decoder.decode(result.stderr);
  const merged = `${stdout}\n${stderr}`;
  if (result.code !== 0) {
    throw new Error(
      `[golden_trace_capture] share-transfer subprocess failed\n${merged}`,
    );
  }
  const line = merged
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(SHARE_TRANSFER_CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[golden_trace_capture] share-transfer capture marker missing\n${merged}`,
    );
  }
  return JSON.parse(
    line.slice(SHARE_TRANSFER_CAPTURE_MARKER.length),
  ) as ShareTransferCapturePayload;
};

const notesForShareTransferCapture = async (
  trace: GoldenTraceScenario,
  payload: ShareTransferCapturePayload,
): Promise<string> => {
  return [
    `# ${trace.id}`,
    ``,
    `- scenario: ${trace.scenario}`,
    `- setup: ${trace.setup}`,
    `- duration: ${trace.duration}`,
    `- daemonEnabled: ${trace.daemonEnabled}`,
    `- runtime_mode: ${TRACE_SHARE_TRANSFER_RUNTIME_MODE}`,
    `- workers: ${payload.workerCount}`,
    `- strict: ${payload.strictDeterminism}`,
    `- hash: ${payload.hash}`,
    ``,
    `## Share transfer capture`,
    ``,
    `- successful_sender_energy=${payload.snapshot.successfulSenderEnergy}`,
    `- successful_receiver_energy=${payload.snapshot.successfulReceiverEnergy}`,
    `- failed_sender_energy=${payload.snapshot.failedSenderEnergy}`,
    `- failed_receiver_energy=${payload.snapshot.failedReceiverEnergy}`,
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

const runStructureIntentTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const [oneWorker, fourWorker] = await Promise.all([
    runStructureIntentCaptureSubprocess(1),
    runStructureIntentCaptureSubprocess(4),
  ]);
  const senseVisibilityOne = oneWorker.snapshot.atoms.every((atom) =>
    atom.senseReg === 1
  );
  const senseVisibilityFour = fourWorker.snapshot.atoms.every((atom) =>
    atom.senseReg === 1
  );
  const hashMatch = oneWorker.hash === fourWorker.hash;
  const codexSnapshot = {
    control_specimen: "structure_intent_visibility",
    runtime_mode: TRACE_STRUCTURE_INTENT_RUNTIME_MODE,
    seed: TRACE_STRUCTURE_INTENT_SEED,
    ticks: TRACE_STRUCTURE_INTENT_TICKS,
    atom_count: TRACE_STRUCTURE_INTENT_ATOMS,
    one_worker: {
      hash: oneWorker.hash,
      sense_visibility: senseVisibilityOne,
      conflict_cell: oneWorker.snapshot.conflictCell,
    },
    four_worker: {
      hash: fourWorker.hash,
      sense_visibility: senseVisibilityFour,
      conflict_cell: fourWorker.snapshot.conflictCell,
    },
    hash_match: hashMatch,
  };
  const invariants = {
    structure_intent_hash_1w: oneWorker.hash,
    structure_intent_hash_4w: fourWorker.hash,
    hash_match: hashMatch,
    conflict_neighborhood_digest_1w: await sha256Hex(oneWorker.snapshot.neighborhood),
    conflict_neighborhood_digest_4w: await sha256Hex(fourWorker.snapshot.neighborhood),
    sense_register_digest_1w: await sha256Hex(
      oneWorker.snapshot.atoms.map((atom) => atom.senseReg),
    ),
    sense_register_digest_4w: await sha256Hex(
      fourWorker.snapshot.atoms.map((atom) => atom.senseReg),
    ),
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    seed: TRACE_STRUCTURE_INTENT_SEED,
    tick_start: 0,
    tick_end: TRACE_STRUCTURE_INTENT_TICKS,
    runtime_mode: TRACE_STRUCTURE_INTENT_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      strictHashMatch: hashMatch,
      senseVisibility: senseVisibilityOne && senseVisibilityFour,
      conflictCellType: oneWorker.snapshot.conflictCell & 0xFF,
      conflictCellCharge: (oneWorker.snapshot.conflictCell >> 16) & 0xFF,
      snapshotDigest: oneWorker.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      one_worker: oneWorker,
      four_worker: fourWorker,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForStructureIntentCapture(trace, oneWorker, fourWorker),
  };
};

const runStructureLockTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const payload = await runStructureLockCaptureSubprocess();
  const codexSnapshot = {
    control_specimen: "structure_lock_progress",
    runtime_mode: TRACE_STRUCTURE_LOCK_RUNTIME_MODE,
    worker_count: payload.workerCount,
    strict_determinism: payload.strictDeterminism,
    hash: payload.hash,
    visible_sense_reg: payload.snapshot.visibleSense.senseReg,
    typed_miss_sense_reg: payload.snapshot.typedMissSense.senseReg,
    resolved_cell_type: payload.snapshot.intentClearing.resolvedType,
    resolved_cell_charge: payload.snapshot.intentClearing.resolvedCharge,
  };
  const invariants = {
    structure_lock_hash: payload.hash,
    visible_neighbor_cell: payload.snapshot.visibleSense.neighborCellIdx,
    visible_neighbor_type: payload.snapshot.visibleSense.neighborType,
    visible_sense_reg: payload.snapshot.visibleSense.senseReg,
    typed_miss_sense_reg: payload.snapshot.typedMissSense.senseReg,
    resolved_cell_type: payload.snapshot.intentClearing.resolvedType,
    resolved_cell_charge: payload.snapshot.intentClearing.resolvedCharge,
    owner_intent_after_tick: payload.snapshot.intentClearing.ownerIntent,
    value_intent_after_tick: payload.snapshot.intentClearing.valueIntent,
    charge_intent_after_tick: payload.snapshot.intentClearing.chargeIntent,
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    tick_start: 0,
    tick_end: 3,
    runtime_mode: TRACE_STRUCTURE_LOCK_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      visibleSenseReg: payload.snapshot.visibleSense.senseReg,
      typedMissSenseReg: payload.snapshot.typedMissSense.senseReg,
      resolvedCellType: payload.snapshot.intentClearing.resolvedType,
      resolvedCellCharge: payload.snapshot.intentClearing.resolvedCharge,
      snapshotDigest: payload.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      structure_lock_capture: payload,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForStructureLockCapture(trace, payload),
  };
};

const runStructureChargeTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const payload = await runStructureChargeCaptureSubprocess();
  const codexSnapshot = {
    control_specimen: "structure_charge_resolution",
    runtime_mode: TRACE_STRUCTURE_CHARGE_RUNTIME_MODE,
    worker_count: payload.workerCount,
    strict_determinism: payload.strictDeterminism,
    hash: payload.hash,
    charge_intent_before_tick: payload.snapshot.beforeTick.chargeIntent,
    resolved_cell_type: payload.snapshot.afterTick.resolvedType,
    resolved_cell_charge: payload.snapshot.afterTick.resolvedCharge,
  };
  const invariants = {
    structure_charge_hash: payload.hash,
    target_cell_before_tick: payload.snapshot.beforeTick.targetCellIdx,
    charge_intent_before_tick: payload.snapshot.beforeTick.chargeIntent,
    resolved_cell_type: payload.snapshot.afterTick.resolvedType,
    resolved_cell_charge: payload.snapshot.afterTick.resolvedCharge,
    charge_intent_after_tick: payload.snapshot.afterTick.chargeIntent,
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    tick_start: 0,
    tick_end: 2,
    runtime_mode: TRACE_STRUCTURE_CHARGE_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      chargeIntentBeforeTick: payload.snapshot.beforeTick.chargeIntent,
      resolvedCellType: payload.snapshot.afterTick.resolvedType,
      resolvedCellCharge: payload.snapshot.afterTick.resolvedCharge,
      snapshotDigest: payload.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      structure_charge_capture: payload,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForStructureChargeCapture(trace, payload),
  };
};

const runStructureChargeCompetitionTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const payload = await runStructureChargeCompetitionCaptureSubprocess();
  const codexSnapshot = {
    control_specimen: "structure_charge_competition",
    runtime_mode: TRACE_STRUCTURE_CHARGE_COMPETITION_RUNTIME_MODE,
    worker_count: payload.workerCount,
    strict_determinism: payload.strictDeterminism,
    hash: payload.hash,
    low_then_high_charge_intent: payload.snapshot.lowThenHigh.chargeIntentBeforeTick,
    low_then_high_resolved_charge: payload.snapshot.lowThenHigh.resolvedCharge,
    high_then_low_charge_intent: payload.snapshot.highThenLow.chargeIntentBeforeTick,
    high_then_low_resolved_charge: payload.snapshot.highThenLow.resolvedCharge,
  };
  const invariants = {
    structure_charge_competition_hash: payload.hash,
    low_then_high_cell: payload.snapshot.lowThenHigh.targetCellIdx,
    low_then_high_charge_intent: payload.snapshot.lowThenHigh.chargeIntentBeforeTick,
    low_then_high_resolved_charge: payload.snapshot.lowThenHigh.resolvedCharge,
    low_then_high_charge_after_tick: payload.snapshot.lowThenHigh.chargeIntentAfterTick,
    high_then_low_cell: payload.snapshot.highThenLow.targetCellIdx,
    high_then_low_charge_intent: payload.snapshot.highThenLow.chargeIntentBeforeTick,
    high_then_low_resolved_charge: payload.snapshot.highThenLow.resolvedCharge,
    high_then_low_charge_after_tick: payload.snapshot.highThenLow.chargeIntentAfterTick,
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    tick_start: 0,
    tick_end: 2,
    runtime_mode: TRACE_STRUCTURE_CHARGE_COMPETITION_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      lowThenHighChargeIntent: payload.snapshot.lowThenHigh.chargeIntentBeforeTick,
      highThenLowChargeIntent: payload.snapshot.highThenLow.chargeIntentBeforeTick,
      lowThenHighResolvedCharge: payload.snapshot.lowThenHigh.resolvedCharge,
      highThenLowResolvedCharge: payload.snapshot.highThenLow.resolvedCharge,
      snapshotDigest: payload.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      structure_charge_competition_capture: payload,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForStructureChargeCompetitionCapture(trace, payload),
  };
};

const runCollectiveTransportTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const payload = await runCollectiveTransportCaptureSubprocess();
  const loadedReg0 = payload.snapshot.atoms.find((atom) => atom.idx === 1)?.reg0 ?? -1;
  const codexSnapshot = {
    control_specimen: "collective_transport",
    runtime_mode: TRACE_COLLECTIVE_TRANSPORT_RUNTIME_MODE,
    worker_count: payload.workerCount,
    strict_determinism: payload.strictDeterminism,
    hash: payload.hash,
    hive_value: payload.snapshot.hiveValue,
    loaded_reg0: loadedReg0,
    pheromone_word: payload.snapshot.pheromoneWord,
  };
  const invariants = {
    collective_transport_hash: payload.hash,
    hive_value: payload.snapshot.hiveValue,
    loaded_reg0: loadedReg0,
    pheromone_word: payload.snapshot.pheromoneWord,
    pheromone_cell_idx: payload.snapshot.pheromoneCellIdx,
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    tick_start: 0,
    tick_end: 3,
    runtime_mode: TRACE_COLLECTIVE_TRANSPORT_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      hiveValue: payload.snapshot.hiveValue,
      loadedReg0: loadedReg0,
      pheromoneWord: payload.snapshot.pheromoneWord,
      snapshotDigest: payload.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      collective_capture: payload,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForCollectiveTransportCapture(trace, payload),
  };
};

const runCollectiveBankingTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const payload = await runCollectiveBankingCaptureSubprocess();
  const depositor = payload.snapshot.atoms.find((atom) => atom.idx === 0) ?? null;
  const withdrawer = payload.snapshot.atoms.find((atom) => atom.idx === 1) ??
    null;
  const codexSnapshot = {
    control_specimen: "collective_banking",
    runtime_mode: TRACE_COLLECTIVE_BANKING_RUNTIME_MODE,
    worker_count: payload.workerCount,
    strict_determinism: payload.strictDeterminism,
    hash: payload.hash,
    initial_hive_balance: payload.snapshot.initialHiveBalance,
    final_hive_balance: payload.snapshot.finalHiveBalance,
    depositor_energy: depositor?.energy ?? 0,
    withdrawer_energy: withdrawer?.energy ?? 0,
    withdraw_reg0: withdrawer?.reg0 ?? 0,
  };
  const invariants = {
    collective_banking_hash: payload.hash,
    initial_hive_balance: payload.snapshot.initialHiveBalance,
    final_hive_balance: payload.snapshot.finalHiveBalance,
    deposit_value_raw: payload.snapshot.depositValueRaw,
    withdraw_cap_raw: payload.snapshot.withdrawCapRaw,
    depositor_energy: depositor?.energy ?? 0,
    withdrawer_energy: withdrawer?.energy ?? 0,
    withdraw_reg0: withdrawer?.reg0 ?? 0,
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    tick_start: 0,
    tick_end: 2,
    runtime_mode: TRACE_COLLECTIVE_BANKING_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      finalHiveBalance: payload.snapshot.finalHiveBalance,
      depositorEnergy: depositor?.energy ?? 0,
      withdrawerEnergy: withdrawer?.energy ?? 0,
      withdrawReg0: withdrawer?.reg0 ?? 0,
      snapshotDigest: payload.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      collective_banking_capture: payload,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForCollectiveBankingCapture(trace, payload),
  };
};

const runCollectiveSynchronyTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const payload = await runCollectiveSynchronyCaptureSubprocess();
  const codexSnapshot = {
    control_specimen: "collective_synchrony",
    runtime_mode: TRACE_COLLECTIVE_SYNCHRONY_RUNTIME_MODE,
    worker_count: payload.workerCount,
    strict_determinism: payload.strictDeterminism,
    hash: payload.hash,
    phase_peer_1_pc: payload.snapshot.phaseLock.peer1Pc,
    phase_peer_2_pc: payload.snapshot.phaseLock.peer2Pc,
    quorum_peer_1_pc: payload.snapshot.quorum.peer1Pc,
    quorum_peer_2_pc: payload.snapshot.quorum.peer2Pc,
    quorum_outsider_pc: payload.snapshot.quorum.outsiderPc,
  };
  const invariants = {
    collective_synchrony_hash: payload.hash,
    phase_source_pc: payload.snapshot.phaseLock.sourcePc,
    phase_peer_1_pc: payload.snapshot.phaseLock.peer1Pc,
    phase_peer_2_pc: payload.snapshot.phaseLock.peer2Pc,
    quorum_source_pc: payload.snapshot.quorum.sourcePc,
    quorum_peer_1_pc: payload.snapshot.quorum.peer1Pc,
    quorum_peer_2_pc: payload.snapshot.quorum.peer2Pc,
    quorum_outsider_pc: payload.snapshot.quorum.outsiderPc,
    quorum_cell_idx: payload.snapshot.quorum.cellIdx,
    quorum_cell_count: payload.snapshot.quorum.cellCount,
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    tick_start: 0,
    tick_end: 2,
    runtime_mode: TRACE_COLLECTIVE_SYNCHRONY_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      phasePeer1Pc: payload.snapshot.phaseLock.peer1Pc,
      phasePeer2Pc: payload.snapshot.phaseLock.peer2Pc,
      quorumPeer1Pc: payload.snapshot.quorum.peer1Pc,
      quorumPeer2Pc: payload.snapshot.quorum.peer2Pc,
      quorumOutsiderPc: payload.snapshot.quorum.outsiderPc,
      snapshotDigest: payload.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      collective_synchrony_capture: payload,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForCollectiveSynchronyCapture(trace, payload),
  };
};

const runShareTransferTrace = async (
  trace: GoldenTraceScenario,
): Promise<GoldenTraceCaptureResult> => {
  const payload = await runShareTransferCaptureSubprocess();
  const codexSnapshot = {
    control_specimen: "share_transfer",
    runtime_mode: TRACE_SHARE_TRANSFER_RUNTIME_MODE,
    worker_count: payload.workerCount,
    strict_determinism: payload.strictDeterminism,
    hash: payload.hash,
    successful_sender_energy: payload.snapshot.successfulSenderEnergy,
    successful_receiver_energy: payload.snapshot.successfulReceiverEnergy,
    failed_sender_energy: payload.snapshot.failedSenderEnergy,
    failed_receiver_energy: payload.snapshot.failedReceiverEnergy,
  };
  const invariants = {
    share_transfer_hash: payload.hash,
    sender_bond_target: payload.snapshot.senderBondTarget,
    failed_bond_target: payload.snapshot.failedBondTarget,
    successful_sender_energy: payload.snapshot.successfulSenderEnergy,
    successful_receiver_energy: payload.snapshot.successfulReceiverEnergy,
    failed_sender_energy: payload.snapshot.failedSenderEnergy,
    failed_receiver_energy: payload.snapshot.failedReceiverEnergy,
  };
  const tracePayload: JsonRecord = {
    trace_id: trace.id,
    scenario: trace.scenario,
    tick_start: 0,
    tick_end: 2,
    runtime_mode: TRACE_SHARE_TRANSFER_RUNTIME_MODE,
    daemon_enabled: trace.daemonEnabled,
    metrics: {
      successfulSenderEnergy: payload.snapshot.successfulSenderEnergy,
      successfulReceiverEnergy: payload.snapshot.successfulReceiverEnergy,
      failedSenderEnergy: payload.snapshot.failedSenderEnergy,
      failedReceiverEnergy: payload.snapshot.failedReceiverEnergy,
      snapshotDigest: payload.hash,
    },
    event_log: [],
    event_log_digest: await sha256Hex([]),
    mutation_telemetry_before: {},
    mutation_telemetry_after: {},
    mutation_telemetry_digest: await sha256Hex({}),
    codex_snapshot_digest: await sha256Hex(codexSnapshot),
    invariant_digest: await sha256Hex(invariants),
    extra_artifacts: {
      share_capture: payload,
    },
  };
  return {
    traceId: trace.id,
    trace: tracePayload,
    codexSnapshot,
    invariants,
    notes: await notesForShareTransferCapture(trace, payload),
  };
};

export const captureGoldenTrace = async (
  traceId: string,
  options: { writeArtifacts?: boolean } = {},
): Promise<GoldenTraceCaptureResult> => {
  const trace = goldenTraceById(traceId);
  if (!trace) {
    throw new Error(`[golden_trace_capture] unknown trace id: ${traceId}`);
  }
  const result = trace.id === "gt08_structure_intent_visibility"
    ? await runStructureIntentTrace(trace)
    : trace.id === "gt13_structure_lock_progress"
    ? await runStructureLockTrace(trace)
    : trace.id === "gt14_structure_charge_resolution"
    ? await runStructureChargeTrace(trace)
    : trace.id === "gt15_structure_charge_competition"
    ? await runStructureChargeCompetitionTrace(trace)
    : trace.id === "gt09_collective_transport"
    ? await runCollectiveTransportTrace(trace)
    : trace.id === "gt11_collective_banking"
    ? await runCollectiveBankingTrace(trace)
    : trace.id === "gt12_collective_synchrony"
    ? await runCollectiveSynchronyTrace(trace)
    : trace.id === "gt10_share_transfer"
    ? await runShareTransferTrace(trace)
    : await runTraceServer(trace);
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
