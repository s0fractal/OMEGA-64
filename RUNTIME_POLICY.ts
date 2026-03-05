import { parseEnvBool, parseEnvBoundedInt } from "./ENV_PARSE.ts";
import { LOGGER } from "./LOGGER.ts";

export type WasmBootPolicy = "fail-fast" | "safe-noop";
const TAU = Math.PI * 2;

const readEnv = (key: string): string | undefined => Deno.env.get(key);
const hasEnvValue = (raw: string | undefined): boolean =>
  raw !== undefined && raw.trim().length > 0;
const normalizeHost = (raw: string | undefined, fallback: string): string => {
  const value = (raw ?? fallback).trim();
  return value.length > 0 ? value : fallback;
};
const normalizeToken = (raw: string | undefined): string => (raw ?? "").trim();
const parsePort = (raw: string | undefined, fallback: number): number =>
  parseEnvBoundedInt(raw, fallback, 1, 65_535);
const parseWasmBootPolicy = (raw: string | undefined): WasmBootPolicy => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "safe-noop" || value === "safe_noop" || value === "noop") {
    return "safe-noop";
  }
  return "fail-fast";
};
const parseEnvBoundedFloat = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!hasEnvValue(raw)) return fallback;
  const n = Number.parseFloat((raw ?? "").trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};
const normalizeTheta = (theta: number): number => {
  if (!Number.isFinite(theta)) return 0;
  const wrapped = theta % TAU;
  return wrapped >= 0 ? wrapped : wrapped + TAU;
};
const pressureComponentFromUnit = (component: number, scale: number): number =>
  Math.max(0, Math.min(2048, Math.round(Math.max(0, component) * scale)));

const rawPort = readEnv("PORT");
const rawSystemHost = readEnv("OMEGA_SYSTEM_HOST");
const rawSystemControlEnable = readEnv("OMEGA_SYSTEM_CONTROL_ENABLE");
const rawSystemControlToken = readEnv("OMEGA_SYSTEM_CONTROL_TOKEN");
const rawSystemAvatarIngressEnable = readEnv("OMEGA_AVATAR_INGRESS_ENABLE");
const rawP2PHost = readEnv("OMEGA_P2P_HOST");
const rawP2PMutateEnable = readEnv("OMEGA_P2P_MUTATE_ENABLE");
const rawP2PMutateToken = readEnv("OMEGA_P2P_MUTATE_TOKEN");
const rawFederationEnable = readEnv("OMEGA_FEDERATION_ENABLE");
const rawFederationTimeoutMs = readEnv("OMEGA_FEDERATION_TIMEOUT_MS");
const rawTelemetryEnabled = readEnv("OMEGA_MUTATION_TELEMETRY");
const rawTelemetryFlushTicks = readEnv("OMEGA_MUTATION_TELEMETRY_FLUSH_TICKS");
const rawTelemetryTopKinds = readEnv("OMEGA_MUTATION_TELEMETRY_TOP_KINDS");
const rawControlIntentMax = readEnv("OMEGA_CONTROL_INTENT_MAX");
const rawControlIntentBudget = readEnv("OMEGA_CONTROL_INTENT_BUDGET");
const rawOraclePendingMax = readEnv("OMEGA_ORACLE_PENDING_MAX");
const rawOracleMutationMode = readEnv("OMEGA_ORACLE_MUTATION_MODE");
const rawPulseWorkers = readEnv("OMEGA_PULSE_WORKERS");
const rawStrictDeterminism = readEnv("OMEGA_STRICT_DETERMINISM");
const rawWorkerResponseTimeoutMs = readEnv("OMEGA_WORKER_RESPONSE_TIMEOUT_MS");
const rawWorkerTimeoutRetryCount = readEnv("OMEGA_WORKER_TIMEOUT_RETRY_COUNT");
const rawWorkerTimeoutRetryMs = readEnv("OMEGA_WORKER_TIMEOUT_RETRY_MS");
const rawWorkerInitFallback = readEnv("OMEGA_WORKER_INIT_FALLBACK");
const rawWasmBootPolicy = readEnv("OMEGA_WASM_BOOT_POLICY");
const rawWasmBootPrecheck = readEnv("OMEGA_WASM_BOOT_PRECHECK");
const rawForceWasmPreflightFail = readEnv("OMEGA_FORCE_WASM_PREFLIGHT_FAIL");
const rawNoveltyPressure = readEnv("OMEGA_NOVELTY_PRESSURE");
const rawSymbiosisPressure = readEnv("OMEGA_SYMBIOSIS_PRESSURE");
const rawMatrixTheta = readEnv("OMEGA_MATRIX_THETA");
const rawPressureRingScale = readEnv("OMEGA_PRESSURE_RING_SCALE");
const rawStartupSelfTest = readEnv("OMEGA_STARTUP_SELFTEST");
const rawStartupSelfTestTicks = readEnv("OMEGA_STARTUP_SELFTEST_TICKS");
const rawStartupSelfTestFallback = readEnv("OMEGA_STARTUP_SELFTEST_FALLBACK");
const rawStartupSelfTestQuiet = readEnv("OMEGA_STARTUP_SELFTEST_QUIET");
const rawStartupSelfTestForceBreach = readEnv(
  "OMEGA_STARTUP_SELFTEST_FORCE_BREACH",
);
const rawAkashaHost = readEnv("OMEGA_AKASHA_HOST");
const rawDaemonPolicyWindowMs = readEnv("OMEGA_DAEMON_POLICY_WINDOW_MS");
const rawDaemonMaxActionsPerWindow = readEnv(
  "OMEGA_DAEMON_MAX_ACTIONS_PER_WINDOW",
);
const rawDaemonMaxPheromoneIntensity = readEnv(
  "OMEGA_DAEMON_MAX_PHEROMONE_INTENSITY",
);
const rawDaemonMaxPlasmidCharge = readEnv("OMEGA_DAEMON_MAX_PLASMID_CHARGE");
const rawDaemonSafeMinPopulation = readEnv("OMEGA_DAEMON_SAFE_MIN_POPULATION");
const rawDaemonSafeMinAvgEnergy = readEnv("OMEGA_DAEMON_SAFE_MIN_AVG_ENERGY");
const rawDaemonAuditEffectTicks = readEnv("OMEGA_DAEMON_AUDIT_EFFECT_TICKS");
const rawDaemonAuditPath = readEnv("OMEGA_DAEMON_AUDIT_PATH");
const rawAutoSnapshotEnable = readEnv("OMEGA_AUTO_SNAPSHOT_ENABLE");
const rawAutoSnapshotIntervalTicks = readEnv("OMEGA_AUTO_SNAPSHOT_INTERVAL_TICKS");
const rawAutoSnapshotRetention = readEnv("OMEGA_AUTO_SNAPSHOT_RETENTION");

const systemPort = parsePort(rawPort, 8000);
const systemHost = normalizeHost(rawSystemHost, "127.0.0.1");
const systemControlEnabled = parseEnvBool(rawSystemControlEnable, false);
const systemControlToken = normalizeToken(rawSystemControlToken);
const systemAvatarIngressEnabled = parseEnvBool(
  rawSystemAvatarIngressEnable,
  true,
);

const p2pHost = normalizeHost(rawP2PHost, "127.0.0.1");
const p2pMutateEnabled = parseEnvBool(
  rawP2PMutateEnable ?? rawSystemControlEnable,
  false,
);
const p2pMutateToken = normalizeToken(
  rawP2PMutateToken ?? rawSystemControlToken,
);

const federationEnabled = parseEnvBool(rawFederationEnable, false);
const federationTimeoutMs = parseEnvBoundedInt(
  rawFederationTimeoutMs,
  2000,
  50,
  120_000,
);

const telemetryEnabled = parseEnvBool(rawTelemetryEnabled, true);
const telemetryFlushIntervalTicks = parseEnvBoundedInt(
  rawTelemetryFlushTicks,
  25,
  1,
  10_000,
);
const telemetryTopKinds = parseEnvBoundedInt(rawTelemetryTopKinds, 6, 1, 32);

const controlIntentMaxPending = parseEnvBoundedInt(
  rawControlIntentMax,
  512,
  8,
  100_000,
);
const controlIntentApplyBudget = parseEnvBoundedInt(
  rawControlIntentBudget,
  8,
  1,
  4096,
);

const oraclePendingMax = parseEnvBoundedInt(rawOraclePendingMax, 256, 32, 8192);
const oracleMutationMode = (() => {
  const value = (rawOracleMutationMode ?? "").trim().toLowerCase();
  if (value === "direct" || value === "head") return "direct" as const;
  return "stigmergic" as const;
})();

const pulseWorkerCount = parseEnvBoundedInt(rawPulseWorkers, 4, 1, 32);
const pulseStrictDeterminism = parseEnvBool(rawStrictDeterminism, false);
const pulseWorkerResponseTimeoutMs = parseEnvBoundedInt(
  rawWorkerResponseTimeoutMs,
  30_000,
  10,
  120_000,
);
const pulseWorkerTimeoutRetryCount = parseEnvBoundedInt(
  rawWorkerTimeoutRetryCount,
  1,
  0,
  4,
);
const pulseWorkerTimeoutRetryMs = parseEnvBoundedInt(
  rawWorkerTimeoutRetryMs,
  5_000,
  10,
  120_000,
);
const pulseWorkerInitFallbackEnabled = parseEnvBool(
  rawWorkerInitFallback,
  true,
);
const pulseWasmBootPolicy = parseWasmBootPolicy(rawWasmBootPolicy);
const pulseWasmBootPrecheckEnabled = parseEnvBool(rawWasmBootPrecheck, true);
const pulseForceWasmPreflightFail = parseEnvBool(
  rawForceWasmPreflightFail,
  false,
);
const pulsePressureRingEnabled = hasEnvValue(rawMatrixTheta) ||
  hasEnvValue(rawPressureRingScale);
const pulsePressureRingScale = pulsePressureRingEnabled
  ? parseEnvBoundedInt(rawPressureRingScale, 256, 0, 2048)
  : 0;
const pulseMatrixThetaRaw = parseEnvBoundedFloat(
  rawMatrixTheta,
  0,
  -10_000_000,
  10_000_000,
);
const pulseMatrixTheta = normalizeTheta(pulseMatrixThetaRaw);
const pulseFearCuriosityBalance = Math.cos(pulseMatrixTheta);
const pulseEgoLoveBalance = Math.sin(pulseMatrixTheta);
const pulseRingNoveltyPressure = pressureComponentFromUnit(
  pulseFearCuriosityBalance,
  pulsePressureRingScale,
);
const pulseRingFearPressure = pressureComponentFromUnit(
  -pulseFearCuriosityBalance,
  pulsePressureRingScale,
);
const pulseRingSymbiosisPressure = pressureComponentFromUnit(
  pulseEgoLoveBalance,
  pulsePressureRingScale,
);
const pulseRingEgoPressure = pressureComponentFromUnit(
  -pulseEgoLoveBalance,
  pulsePressureRingScale,
);
const pulseNoveltyAxisFromRing = pulsePressureRingEnabled &&
  !hasEnvValue(rawNoveltyPressure);
const pulseSymbiosisAxisFromRing = pulsePressureRingEnabled &&
  !hasEnvValue(rawSymbiosisPressure);
const pulseNoveltyPressure = pulseNoveltyAxisFromRing
  ? pulseRingNoveltyPressure
  : parseEnvBoundedInt(rawNoveltyPressure, 0, 0, 2048);
const pulseFearPressure = pulseNoveltyAxisFromRing ? pulseRingFearPressure : 0;
const pulseSymbiosisPressure = pulseSymbiosisAxisFromRing
  ? pulseRingSymbiosisPressure
  : parseEnvBoundedInt(rawSymbiosisPressure, 0, 0, 2048);
const pulseEgoPressure = pulseSymbiosisAxisFromRing ? pulseRingEgoPressure : 0;
const pulseNoveltyPressureSigned = pulseNoveltyPressure - pulseFearPressure;
const pulseSymbiosisPressureSigned = pulseSymbiosisPressure - pulseEgoPressure;
const pulseStartupSelfTestEnabled = parseEnvBool(rawStartupSelfTest, true);
const pulseStartupSelfTestTicks = parseEnvBoundedInt(
  rawStartupSelfTestTicks,
  3,
  1,
  32,
);
const pulseStartupSelfTestFallbackEnabled = parseEnvBool(
  rawStartupSelfTestFallback,
  true,
);
const pulseStartupSelfTestQuiet = parseEnvBool(rawStartupSelfTestQuiet, true);
const pulseStartupSelfTestForceBreach = parseEnvBool(
  rawStartupSelfTestForceBreach,
  false,
);

const akashaHost = normalizeHost(rawAkashaHost, "127.0.0.1");
const akashaPort = 8080;
const p2pPort = 8081;
const daemonPolicyWindowMs = parseEnvBoundedInt(
  rawDaemonPolicyWindowMs,
  60_000,
  5_000,
  3_600_000,
);
const daemonMaxActionsPerWindow = parseEnvBoundedInt(
  rawDaemonMaxActionsPerWindow,
  8,
  1,
  10_000,
);
const daemonMaxPheromoneIntensity = parseEnvBoundedInt(
  rawDaemonMaxPheromoneIntensity,
  300,
  1,
  5_000,
);
const daemonMaxPlasmidCharge = parseEnvBoundedInt(
  rawDaemonMaxPlasmidCharge,
  1200,
  1,
  65_535,
);
const daemonSafeMinPopulation = parseEnvBoundedInt(
  rawDaemonSafeMinPopulation,
  16,
  0,
  100_000,
);
const daemonSafeMinAvgEnergy = parseEnvBoundedInt(
  rawDaemonSafeMinAvgEnergy,
  5,
  0,
  100_000,
);
const daemonAuditEffectTicks = parseEnvBoundedInt(
  rawDaemonAuditEffectTicks,
  32,
  1,
  50_000,
);
const daemonAuditPath = (rawDaemonAuditPath ?? "").trim().length > 0
  ? (rawDaemonAuditPath ?? "").trim()
  : "./DAEMON_AUDIT.jsonl";
const autoSnapshotEnabled = parseEnvBool(rawAutoSnapshotEnable, true);
const autoSnapshotIntervalTicks = parseEnvBoundedInt(
  rawAutoSnapshotIntervalTicks,
  10_000,
  100,
  10_000_000,
);
const autoSnapshotRetention = parseEnvBoundedInt(
  rawAutoSnapshotRetention,
  8,
  1,
  512,
);

const fnv1a32 = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

const policyFingerprintSource = JSON.stringify({
  system: {
    host: systemHost,
    port: systemPort,
    controlEnabled: systemControlEnabled,
    controlTokenSet: systemControlToken.length > 0,
    avatarIngressEnabled: systemAvatarIngressEnabled,
  },
  p2p: {
    host: p2pHost,
    port: p2pPort,
    mutateEnabled: p2pMutateEnabled,
    mutateTokenSet: p2pMutateToken.length > 0,
  },
  federation: {
    enabled: federationEnabled,
    timeoutMs: federationTimeoutMs,
  },
  pulse: {
    workerCount: pulseWorkerCount,
    strictDeterminism: pulseStrictDeterminism,
    workerResponseTimeoutMs: pulseWorkerResponseTimeoutMs,
    workerTimeoutRetryCount: pulseWorkerTimeoutRetryCount,
    workerTimeoutRetryMs: pulseWorkerTimeoutRetryMs,
    workerInitFallbackEnabled: pulseWorkerInitFallbackEnabled,
    wasmBootPolicy: pulseWasmBootPolicy,
    wasmBootPrecheckEnabled: pulseWasmBootPrecheckEnabled,
    pressureRingEnabled: pulsePressureRingEnabled,
    pressureRingScale: pulsePressureRingScale,
    matrixTheta: pulseMatrixTheta,
    noveltyPressure: pulseNoveltyPressure,
    fearPressure: pulseFearPressure,
    noveltyPressureSigned: pulseNoveltyPressureSigned,
    symbiosisPressure: pulseSymbiosisPressure,
    egoPressure: pulseEgoPressure,
    symbiosisPressureSigned: pulseSymbiosisPressureSigned,
    fearCuriosityBalance: pulseFearCuriosityBalance,
    egoLoveBalance: pulseEgoLoveBalance,
    startupSelfTestEnabled: pulseStartupSelfTestEnabled,
    startupSelfTestTicks: pulseStartupSelfTestTicks,
    startupSelfTestFallbackEnabled: pulseStartupSelfTestFallbackEnabled,
    startupSelfTestQuiet: pulseStartupSelfTestQuiet,
    startupSelfTestForceBreach: pulseStartupSelfTestForceBreach,
  },
  telemetry: {
    enabled: telemetryEnabled,
    flushIntervalTicks: telemetryFlushIntervalTicks,
    topKinds: telemetryTopKinds,
  },
  controlIntent: {
    maxPending: controlIntentMaxPending,
    applyBudgetPerTick: controlIntentApplyBudget,
  },
  oracle: {
    pendingMax: oraclePendingMax,
    mutationMode: oracleMutationMode,
  },
  akasha: {
    host: akashaHost,
    port: akashaPort,
  },
  daemon: {
    policyWindowMs: daemonPolicyWindowMs,
    maxActionsPerWindow: daemonMaxActionsPerWindow,
    maxPheromoneIntensity: daemonMaxPheromoneIntensity,
    maxPlasmidCharge: daemonMaxPlasmidCharge,
    safeMinPopulation: daemonSafeMinPopulation,
    safeMinAvgEnergy: daemonSafeMinAvgEnergy,
    auditEffectTicks: daemonAuditEffectTicks,
    auditPath: daemonAuditPath,
  },
  snapshot: {
    enabled: autoSnapshotEnabled,
    intervalTicks: autoSnapshotIntervalTicks,
    retention: autoSnapshotRetention,
  },
});

const POLICY_FINGERPRINT = fnv1a32(policyFingerprintSource);

let policyFingerprintLogged = false;

export const RUNTIME_POLICY = {
  system: {
    host: systemHost,
    port: systemPort,
    controlEnabled: systemControlEnabled,
    controlToken: systemControlToken,
    avatarIngressEnabled: systemAvatarIngressEnabled,
    source: {
      host: hasEnvValue(rawSystemHost),
      port: hasEnvValue(rawPort),
      controlEnabled: rawSystemControlEnable !== undefined,
      controlToken: rawSystemControlToken !== undefined,
      avatarIngressEnabled: rawSystemAvatarIngressEnable !== undefined,
    },
  },
  p2p: {
    host: p2pHost,
    port: p2pPort,
    mutateEnabled: p2pMutateEnabled,
    mutateToken: p2pMutateToken,
    source: {
      host: hasEnvValue(rawP2PHost),
      mutateEnabled: rawP2PMutateEnable !== undefined,
      mutateToken: rawP2PMutateToken !== undefined,
      fallbackControlEnabled: rawP2PMutateEnable === undefined &&
        rawSystemControlEnable !== undefined,
      fallbackControlToken: rawP2PMutateToken === undefined &&
        rawSystemControlToken !== undefined,
    },
  },
  federation: {
    enabled: federationEnabled,
    timeoutMs: federationTimeoutMs,
    controlToken: systemControlToken,
    source: {
      enabled: rawFederationEnable !== undefined,
      timeoutMs: rawFederationTimeoutMs !== undefined,
      controlToken: rawSystemControlToken !== undefined,
    },
  },
  telemetry: {
    enabled: telemetryEnabled,
    flushIntervalTicks: telemetryFlushIntervalTicks,
    topKinds: telemetryTopKinds,
  },
  controlIntent: {
    maxPending: controlIntentMaxPending,
    applyBudgetPerTick: controlIntentApplyBudget,
  },
  oracle: {
    pendingMax: oraclePendingMax,
    mutationMode: oracleMutationMode,
    source: {
      pendingMax: rawOraclePendingMax !== undefined,
      mutationMode: rawOracleMutationMode !== undefined,
    },
  },
  pulse: {
    workerCount: pulseWorkerCount,
    strictDeterminism: pulseStrictDeterminism,
    workerResponseTimeoutMs: pulseWorkerResponseTimeoutMs,
    workerTimeoutRetryCount: pulseWorkerTimeoutRetryCount,
    workerTimeoutRetryMs: pulseWorkerTimeoutRetryMs,
    workerInitFallbackEnabled: pulseWorkerInitFallbackEnabled,
    wasmBootPolicy: pulseWasmBootPolicy,
    wasmBootPrecheckEnabled: pulseWasmBootPrecheckEnabled,
    forceWasmPreflightFail: pulseForceWasmPreflightFail,
    pressureRing: {
      enabled: pulsePressureRingEnabled,
      scale: pulsePressureRingScale,
      theta: pulseMatrixTheta,
      thetaRaw: pulseMatrixThetaRaw,
      fearCuriosityBalance: pulseFearCuriosityBalance,
      egoLoveBalance: pulseEgoLoveBalance,
      noveltyAxisFromRing: pulseNoveltyAxisFromRing,
      symbiosisAxisFromRing: pulseSymbiosisAxisFromRing,
    },
    noveltyPressure: pulseNoveltyPressure,
    fearPressure: pulseFearPressure,
    noveltyPressureSigned: pulseNoveltyPressureSigned,
    symbiosisPressure: pulseSymbiosisPressure,
    egoPressure: pulseEgoPressure,
    symbiosisPressureSigned: pulseSymbiosisPressureSigned,
    startupSelfTestEnabled: pulseStartupSelfTestEnabled,
    startupSelfTestTicks: pulseStartupSelfTestTicks,
    startupSelfTestFallbackEnabled: pulseStartupSelfTestFallbackEnabled,
    startupSelfTestQuiet: pulseStartupSelfTestQuiet,
    startupSelfTestForceBreach: pulseStartupSelfTestForceBreach,
    source: {
      workerCount: hasEnvValue(rawPulseWorkers),
      strictDeterminism: rawStrictDeterminism !== undefined,
      workerResponseTimeoutMs: hasEnvValue(rawWorkerResponseTimeoutMs),
      workerTimeoutRetryCount: rawWorkerTimeoutRetryCount !== undefined,
      workerTimeoutRetryMs: rawWorkerTimeoutRetryMs !== undefined,
      workerInitFallback: rawWorkerInitFallback !== undefined,
      wasmBootPolicy: rawWasmBootPolicy !== undefined,
      wasmBootPrecheck: rawWasmBootPrecheck !== undefined,
      forceWasmPreflightFail: rawForceWasmPreflightFail !== undefined,
      matrixTheta: hasEnvValue(rawMatrixTheta),
      pressureRingScale: hasEnvValue(rawPressureRingScale),
      noveltyPressure: rawNoveltyPressure !== undefined,
      symbiosisPressure: rawSymbiosisPressure !== undefined,
      startupSelfTest: rawStartupSelfTest !== undefined,
      startupSelfTestTicks: rawStartupSelfTestTicks !== undefined,
      startupSelfTestFallback: rawStartupSelfTestFallback !== undefined,
      startupSelfTestQuiet: rawStartupSelfTestQuiet !== undefined,
      startupSelfTestForceBreach: rawStartupSelfTestForceBreach !== undefined,
    },
  },
  akasha: {
    host: akashaHost,
    port: akashaPort,
  },
  daemon: {
    policyWindowMs: daemonPolicyWindowMs,
    maxActionsPerWindow: daemonMaxActionsPerWindow,
    maxPheromoneIntensity: daemonMaxPheromoneIntensity,
    maxPlasmidCharge: daemonMaxPlasmidCharge,
    safeMinPopulation: daemonSafeMinPopulation,
    safeMinAvgEnergy: daemonSafeMinAvgEnergy,
    auditEffectTicks: daemonAuditEffectTicks,
    auditPath: daemonAuditPath,
    source: {
      policyWindowMs: rawDaemonPolicyWindowMs !== undefined,
      maxActionsPerWindow: rawDaemonMaxActionsPerWindow !== undefined,
      maxPheromoneIntensity: rawDaemonMaxPheromoneIntensity !== undefined,
      maxPlasmidCharge: rawDaemonMaxPlasmidCharge !== undefined,
      safeMinPopulation: rawDaemonSafeMinPopulation !== undefined,
      safeMinAvgEnergy: rawDaemonSafeMinAvgEnergy !== undefined,
      auditEffectTicks: rawDaemonAuditEffectTicks !== undefined,
      auditPath: rawDaemonAuditPath !== undefined,
    },
  },
  snapshot: {
    enabled: autoSnapshotEnabled,
    intervalTicks: autoSnapshotIntervalTicks,
    retention: autoSnapshotRetention,
    source: {
      enabled: rawAutoSnapshotEnable !== undefined,
      intervalTicks: rawAutoSnapshotIntervalTicks !== undefined,
      retention: rawAutoSnapshotRetention !== undefined,
    },
  },
  fingerprint: POLICY_FINGERPRINT,
  logFingerprintOnce: (context: string = "runtime"): string => {
    if (!policyFingerprintLogged) {
      policyFingerprintLogged = true;
      LOGGER.info(
        `[POLICY] context=${context} fingerprint=${POLICY_FINGERPRINT} controlEnabled=${systemControlEnabled} workerCount=${pulseWorkerCount} mutateEnabled=${p2pMutateEnabled}`,
      );
    }
    return POLICY_FINGERPRINT;
  },
} as const;
