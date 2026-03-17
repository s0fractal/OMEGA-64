// SSoT: file:///Users/s0fractal/OMEGA/I/core/runtime_policy.md
import { WasmBootPolicy, KernelMode, ReplicationExecutionMode, GuardianSignalExecutionMode, parse_env_bool, parse_env_bounded_int } from "@g01";

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
  parse_env_bounded_int(raw, fallback, 1, 65_535);
const parseWasmBootPolicy = (raw: string | undefined): WasmBootPolicy => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "safe-noop" || value === "safe_noop" || value === "noop") {
    return "safe-noop";
  }
  return "fail-fast";
};
const parseExecutionMode = (
  raw: string | undefined,
  defaultMode: GuardianSignalExecutionMode = "shadow-reduce",
): GuardianSignalExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  if (value === "shadow-reduce" || value === "shadow_reduce") {
    return "shadow-reduce";
  }
  return defaultMode;
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
const rawOmegaMainnet = readEnv("OMEGA_MAINNET");
const rawBootstrapHubUrl = readEnv("OMEGA_BOOTSTRAP_HUB_URL");
const rawP2PMutateEnable = readEnv("OMEGA_P2P_MUTATE_ENABLE");
const rawP2PMutateToken = readEnv("OMEGA_P2P_MUTATE_TOKEN");
const rawFederationEnable = readEnv("OMEGA_FEDERATION_ENABLE");
const rawFederationTimeoutMs = readEnv("OMEGA_FEDERATION_TIMEOUT_MS");
const rawFederationAdmissionEnable = readEnv(
  "OMEGA_FEDERATION_ADMISSION_ENABLE",
);
const rawFederationAdmissionMidScore = readEnv(
  "OMEGA_FEDERATION_ADMISSION_MID_SCORE",
);
const rawFederationAdmissionHighScore = readEnv(
  "OMEGA_FEDERATION_ADMISSION_HIGH_SCORE",
);
const rawFederationAdmissionRejectOnStrictMismatch = readEnv(
  "OMEGA_FEDERATION_ADMISSION_REJECT_STRICT_MISMATCH",
);
const rawFederationHybridizeEnable = readEnv(
  "OMEGA_FEDERATION_HYBRIDIZE_ENABLE",
);
const rawFederationDegradeEnergyRatio = readEnv(
  "OMEGA_FEDERATION_DEGRADE_ENERGY_RATIO",
);
const rawFederationDegradeResonanceRatio = readEnv(
  "OMEGA_FEDERATION_DEGRADE_RESONANCE_RATIO",
);
const rawFederationOpenWorld = readEnv("OMEGA_FEDERATION_OPEN_WORLD");
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
const rawWorkerRecoveryVerbose = readEnv("OMEGA_WORKER_RECOVERY_VERBOSE");
const rawWasmBootPolicy = readEnv("OMEGA_WASM_BOOT_POLICY");
const rawWasmBootPrecheck = readEnv("OMEGA_WASM_BOOT_PRECHECK");
const rawForceWasmPreflightFail = readEnv("OMEGA_FORCE_WASM_PREFLIGHT_FAIL");
const rawNoveltyPressure = readEnv("OMEGA_NOVELTY_PRESSURE");
const rawSymbiosisPressure = readEnv("OMEGA_SYMBIOSIS_PRESSURE");
const rawMatrixTheta = readEnv("OMEGA_MATRIX_THETA");
const rawPressureRingScale = readEnv("OMEGA_PRESSURE_RING_SCALE");
const rawHomeostasisEnable = readEnv("OMEGA_HOMEOSTASIS_ENABLE");
const rawHomeostasisTargetEnergy = readEnv("OMEGA_HOMEOSTASIS_TARGET_ENERGY");
const rawHomeostasisBand = readEnv("OMEGA_HOMEOSTASIS_BAND");
const rawHomeostasisMaxDelta = readEnv("OMEGA_HOMEOSTASIS_MAX_DELTA");
const rawHomeostasisOverflowThreshold = readEnv(
  "OMEGA_HOMEOSTASIS_OVERFLOW_THRESHOLD",
);
const rawHomeostasisStarvationFloor = readEnv(
  "OMEGA_HOMEOSTASIS_STARVATION_FLOOR",
);
const rawHomeostasisBaseTax = readEnv("OMEGA_HOMEOSTASIS_BASE_TAX");
const rawHomeostasisSubsidyEnable = readEnv(
  "OMEGA_HOMEOSTASIS_SUBSIDY_ENABLE",
);
const rawStartupSelfTest = readEnv("OMEGA_STARTUP_SELFTEST");
const rawStartupSelfTestTicks = readEnv("OMEGA_STARTUP_SELFTEST_TICKS");
const rawStartupSelfTestFallback = readEnv("OMEGA_STARTUP_SELFTEST_FALLBACK");
const rawStartupSelfTestQuiet = readEnv("OMEGA_STARTUP_SELFTEST_QUIET");
const rawStartupSelfTestForceBreach = readEnv(
  "OMEGA_STARTUP_SELFTEST_FORCE_BREACH",
);
const rawGuardianSignalExecutionMode = readEnv(
  "OMEGA_GUARDIAN_SIGNAL_EXECUTION_MODE",
);
const rawArchitectPlasmidExecutionMode = readEnv(
  "OMEGA_ARCHITECT_PLASMID_EXECUTION_MODE",
);
const rawReplicationExecutionMode = readEnv(
  "OMEGA_REPLICATION_EXECUTION_MODE",
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
const rawColdstartEnable = readEnv("OMEGA_COLDSTART_ENABLE");
const rawColdstartCount = readEnv("OMEGA_COLDSTART_COUNT");
const rawColdstartReplicatorRatio = readEnv("OMEGA_COLDSTART_REPLICATOR_RATIO");
const rawColdstartGuardianRatio = readEnv("OMEGA_COLDSTART_GUARDIAN_RATIO");
const rawColdstartSeed = readEnv("OMEGA_COLDSTART_SEED");
const rawColdstartEnergy = readEnv("OMEGA_COLDSTART_ENERGY");
const rawColdstartResonance = readEnv("OMEGA_COLDSTART_RESONANCE");
const rawAutoSnapshotEnable = readEnv("OMEGA_AUTO_SNAPSHOT_ENABLE");
const rawAutoSnapshotIntervalTicks = readEnv(
  "OMEGA_AUTO_SNAPSHOT_INTERVAL_TICKS",
);
const rawAutoSnapshotRetention = readEnv("OMEGA_AUTO_SNAPSHOT_RETENTION");
const rawKernelMode = readEnv("OMEGA_KERNEL_MODE");

const systemPort = parsePort(rawPort, 8000);
const systemHost = normalizeHost(rawSystemHost, "127.0.0.1");
const systemControlEnabled = parse_env_bool(rawSystemControlEnable, false);
const systemControlToken = normalizeToken(rawSystemControlToken);
const systemAvatarIngressEnabled = parse_env_bool(
  rawSystemAvatarIngressEnable,
  true,
);

const p2pHost = normalizeHost(rawP2PHost, "127.0.0.1");
const hasMainnetArg = typeof Deno !== "undefined" &&
  Deno.args.includes("--mainnet");
const mainnetEnabled = parse_env_bool(rawOmegaMainnet, hasMainnetArg);
const bootstrapHubUrl = normalizeToken(rawBootstrapHubUrl) ||
  "ws://127.0.0.1:9999";
const p2pMutateEnabled = parse_env_bool(
  rawP2PMutateEnable ?? rawSystemControlEnable,
  false,
);
const p2pMutateToken = normalizeToken(
  rawP2PMutateToken ?? rawSystemControlToken,
);

const federationEnabled = parse_env_bool(rawFederationEnable, false);
const federationTimeoutMs = parse_env_bounded_int(
  rawFederationTimeoutMs,
  2000,
  50,
  120_000,
);
const federationAdmissionEnabled = parse_env_bool(
  rawFederationAdmissionEnable,
  true,
);
const federationAdmissionMidScore = parse_env_bounded_int(
  rawFederationAdmissionMidScore,
  4,
  1,
  64,
);
const federationAdmissionHighScore = Math.max(
  federationAdmissionMidScore + 1,
  parse_env_bounded_int(rawFederationAdmissionHighScore, 7, 2, 128),
);
const federationAdmissionRejectOnStrictMismatch = parse_env_bool(
  rawFederationAdmissionRejectOnStrictMismatch,
  true,
);
const federationHybridizeEnabled = parse_env_bool(
  rawFederationHybridizeEnable,
  true,
);
const federationDegradeEnergyRatio = parseEnvBoundedFloat(
  rawFederationDegradeEnergyRatio,
  0.72,
  0.1,
  1,
);
const federationDegradeResonanceRatio = parseEnvBoundedFloat(
  rawFederationDegradeResonanceRatio,
  0.68,
  0.1,
  1,
);
const federationOpenWorld = parse_env_bool(rawFederationOpenWorld, false);

const telemetryEnabled = parse_env_bool(rawTelemetryEnabled, true);
const telemetryFlushIntervalTicks = parse_env_bounded_int(
  rawTelemetryFlushTicks,
  25,
  1,
  10_000,
);
const telemetryTopKinds = parse_env_bounded_int(rawTelemetryTopKinds, 6, 1, 32);

const controlIntentMaxPending = parse_env_bounded_int(
  rawControlIntentMax,
  512,
  8,
  100_000,
);
const controlIntentApplyBudget = parse_env_bounded_int(
  rawControlIntentBudget,
  8,
  1,
  4096,
);

const oraclePendingMax = parse_env_bounded_int(rawOraclePendingMax, 256, 32, 8192);
const oracleMutationMode = (() => {
  const value = (rawOracleMutationMode ?? "").trim().toLowerCase();
  if (value === "direct" || value === "head") return "direct" as const;
  if (value === "shadow") return "shadow" as const;
  return "stigmergic" as const;
})();

const pulseWorkerCount = parse_env_bounded_int(rawPulseWorkers, 4, 1, 32);
const pulseStrictDeterminism = parse_env_bool(rawStrictDeterminism, false);
const pulseWorkerResponseTimeoutMs = parse_env_bounded_int(
  rawWorkerResponseTimeoutMs,
  30_000,
  10,
  120_000,
);
const pulseWorkerTimeoutRetryCount = parse_env_bounded_int(
  rawWorkerTimeoutRetryCount,
  1,
  0,
  4,
);
const pulseWorkerTimeoutRetryMs = parse_env_bounded_int(
  rawWorkerTimeoutRetryMs,
  5_000,
  10,
  120_000,
);
const pulseWorkerInitFallbackEnabled = parse_env_bool(
  rawWorkerInitFallback,
  true,
);
const pulseWorkerRecoveryVerbose = parse_env_bool(
  rawWorkerRecoveryVerbose,
  false,
);
const pulseWasmBootPolicy = parseWasmBootPolicy(rawWasmBootPolicy);
const pulseWasmBootPrecheckEnabled = parse_env_bool(rawWasmBootPrecheck, true);
const pulseForceWasmPreflightFail = parse_env_bool(
  rawForceWasmPreflightFail,
  false,
);
const pulsePressureRingEnabled = hasEnvValue(rawMatrixTheta) ||
  hasEnvValue(rawPressureRingScale);
const pulsePressureRingScale = pulsePressureRingEnabled
  ? parse_env_bounded_int(rawPressureRingScale, 256, 0, 2048)
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
  : parse_env_bounded_int(rawNoveltyPressure, 0, 0, 2048);
const pulseFearPressure = pulseNoveltyAxisFromRing ? pulseRingFearPressure : 0;
const pulseSymbiosisPressure = pulseSymbiosisAxisFromRing
  ? pulseRingSymbiosisPressure
  : parse_env_bounded_int(rawSymbiosisPressure, 0, 0, 2048);
const pulseEgoPressure = pulseSymbiosisAxisFromRing ? pulseRingEgoPressure : 0;
const pulseNoveltyPressureSigned = pulseNoveltyPressure - pulseFearPressure;
const pulseSymbiosisPressureSigned = pulseSymbiosisPressure - pulseEgoPressure;
const pulseHomeostasisEnabled = parse_env_bool(rawHomeostasisEnable, true);
const pulseHomeostasisTargetEnergy = parse_env_bounded_int(
  rawHomeostasisTargetEnergy,
  1200,
  1,
  1_000_000,
);
const pulseHomeostasisBand = parse_env_bounded_int(
  rawHomeostasisBand,
  240,
  1,
  1_000_000,
);
const pulseHomeostasisMaxDelta = parse_env_bounded_int(
  rawHomeostasisMaxDelta,
  12,
  1,
  1024,
);
const pulseHomeostasisOverflowThreshold = parseEnvBoundedFloat(
  rawHomeostasisOverflowThreshold,
  0.2,
  0,
  1,
);
const pulseHomeostasisStarvationFloor = parse_env_bounded_int(
  rawHomeostasisStarvationFloor,
  200,
  0,
  1_000_000,
);
const pulseHomeostasisBaseTax = parse_env_bounded_int(
  rawHomeostasisBaseTax,
  2,
  0,
  1024,
);
const pulseHomeostasisSubsidyEnabled = parse_env_bool(
  rawHomeostasisSubsidyEnable,
  false,
);
const pulseStartupSelfTestEnabled = parse_env_bool(rawStartupSelfTest, true);
const pulseStartupSelfTestTicks = parse_env_bounded_int(
  rawStartupSelfTestTicks,
  3,
  1,
  32,
);
const pulseStartupSelfTestFallbackEnabled = parse_env_bool(
  rawStartupSelfTestFallback,
  true,
);
const pulseStartupSelfTestQuiet = parse_env_bool(rawStartupSelfTestQuiet, true);
const pulseStartupSelfTestForceBreach = parse_env_bool(
  rawStartupSelfTestForceBreach,
  false,
);
const pulseGuardianSignalExecutionMode = parseExecutionMode(
  rawGuardianSignalExecutionMode,
  "hybrid-reduce",
);
const pulseArchitectPlasmidExecutionMode = parseExecutionMode(
  rawArchitectPlasmidExecutionMode,
  "hybrid-reduce",
);
const pulseReplicationExecutionMode = parseExecutionMode(
  rawReplicationExecutionMode,
  "hybrid-reduce",
);

const akashaHost = normalizeHost(rawAkashaHost, "127.0.0.1");
const akashaPort = 8080;
const p2pPort = 8081;
const daemonPolicyWindowMs = parse_env_bounded_int(
  rawDaemonPolicyWindowMs,
  60_000,
  5_000,
  3_600_000,
);
const daemonMaxActionsPerWindow = parse_env_bounded_int(
  rawDaemonMaxActionsPerWindow,
  8,
  1,
  10_000,
);
const daemonMaxPheromoneIntensity = parse_env_bounded_int(
  rawDaemonMaxPheromoneIntensity,
  300,
  1,
  5_000,
);
const daemonMaxPlasmidCharge = parse_env_bounded_int(
  rawDaemonMaxPlasmidCharge,
  1200,
  1,
  65_535,
);
const daemonSafeMinPopulation = parse_env_bounded_int(
  rawDaemonSafeMinPopulation,
  16,
  0,
  100_000,
);
const daemonSafeMinAvgEnergy = parse_env_bounded_int(
  rawDaemonSafeMinAvgEnergy,
  5,
  0,
  100_000,
);
const daemonAuditEffectTicks = parse_env_bounded_int(
  rawDaemonAuditEffectTicks,
  32,
  1,
  50_000,
);
const daemonAuditPath = (rawDaemonAuditPath ?? "").trim().length > 0
  ? (rawDaemonAuditPath ?? "").trim()
  : "./DAEMON_AUDIT.jsonl";
const coldstartEnabled = parse_env_bool(rawColdstartEnable, false);
const coldstartCount = parse_env_bounded_int(rawColdstartCount, 48, 0, 100_000);
const coldstartReplicatorRatio = parseEnvBoundedFloat(
  rawColdstartReplicatorRatio,
  0.15,
  0,
  1,
);
const coldstartGuardianRatio = parseEnvBoundedFloat(
  rawColdstartGuardianRatio,
  0.08,
  0,
  1,
);
const coldstartSeed = parse_env_bounded_int(
  rawColdstartSeed,
  424242,
  1,
  2_147_483_647,
);
const coldstartEnergy = parse_env_bounded_int(
  rawColdstartEnergy,
  3200,
  1,
  1_000_000,
);
const coldstartResonance = parse_env_bounded_int(
  rawColdstartResonance,
  220,
  0,
  100_000,
);
const autoSnapshotEnabled = parse_env_bool(rawAutoSnapshotEnable, true);
const autoSnapshotIntervalTicks = parse_env_bounded_int(
  rawAutoSnapshotIntervalTicks,
  10_000,
  100,
  10_000_000,
);
const autoSnapshotRetention = parse_env_bounded_int(
  rawAutoSnapshotRetention,
  8,
  1,
  512,
);

const kernelMode: KernelMode = (rawKernelMode?.trim().toLowerCase() === "as") ? "as" : "rust";

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
    mainnetEnabled,
    bootstrapHubUrl,
    mutateEnabled: p2pMutateEnabled,
    mutateTokenSet: p2pMutateToken.length > 0,
  },
  federation: {
    enabled: federationEnabled,
    timeoutMs: federationTimeoutMs,
    admissionEnabled: federationAdmissionEnabled,
    admissionMidScore: federationAdmissionMidScore,
    admissionHighScore: federationAdmissionHighScore,
    admissionRejectOnStrictMismatch: federationAdmissionRejectOnStrictMismatch,
    hybridizeEnabled: federationHybridizeEnabled,
    degradeEnergyRatio: federationDegradeEnergyRatio,
    degradeResonanceRatio: federationDegradeResonanceRatio,
    openWorld: federationOpenWorld,
  },
  pulse: {
    engine: kernelMode === "rust" ? "ffi" : "wasm",
    workerCount: pulseWorkerCount,
    strictDeterminism: pulseStrictDeterminism,
    workerResponseTimeoutMs: pulseWorkerResponseTimeoutMs,
    workerTimeoutRetryCount: pulseWorkerTimeoutRetryCount,
    workerTimeoutRetryMs: pulseWorkerTimeoutRetryMs,
    workerInitFallbackEnabled: pulseWorkerInitFallbackEnabled,
    workerRecoveryVerbose: pulseWorkerRecoveryVerbose,
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
    guardianSignalExecutionMode: pulseGuardianSignalExecutionMode,
    architectPlasmidExecutionMode: pulseArchitectPlasmidExecutionMode,
    replicationExecutionMode: pulseReplicationExecutionMode,
    homeostasis: {
      enabled: pulseHomeostasisEnabled,
      targetEnergy: pulseHomeostasisTargetEnergy,
      band: pulseHomeostasisBand,
      maxDelta: pulseHomeostasisMaxDelta,
      overflowThreshold: pulseHomeostasisOverflowThreshold,
      starvationFloor: pulseHomeostasisStarvationFloor,
      baseTax: pulseHomeostasisBaseTax,
      subsidyEnabled: pulseHomeostasisSubsidyEnabled,
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
  coldstart: {
    enabled: coldstartEnabled,
    count: coldstartCount,
    replicatorRatio: coldstartReplicatorRatio,
    guardianRatio: coldstartGuardianRatio,
    seed: coldstartSeed,
    energy: coldstartEnergy,
    resonance: coldstartResonance,
  },
  snapshot: {
    enabled: autoSnapshotEnabled,
    intervalTicks: autoSnapshotIntervalTicks,
    retention: autoSnapshotRetention,
  },
  kernelMode,
});

const POLICY_FINGERPRINT = fnv1a32(policyFingerprintSource);

let policyFingerprintLogged = false;

export const mutateUniversalConstants = (): void => {
  const variance = () => 0.8 + Math.random() * 0.4;
  const rp = RUNTIME_POLICY as any;

  rp.pulse.homeostasis.baseTax = Math.max(
    0,
    Math.round(rp.pulse.homeostasis.baseTax * variance()),
  );
  rp.pulse.pressureRing.theta = rp.pulse.pressureRing.theta * variance();
  rp.pulse.noveltyPressure = Math.max(
    0,
    Math.round(rp.pulse.noveltyPressure * variance()),
  );
  rp.pulse.homeostasis.targetEnergy = Math.max(
    1,
    Math.round(rp.pulse.homeostasis.targetEnergy * variance()),
  );
  rp.coldstart.resonance = Math.max(
    0,
    Math.round(rp.coldstart.resonance * variance()),
  );

  // Li(`🌌 [ESCHATON] Universal Constants Mutated for the next Kalpa!`);
};

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
    mainnetEnabled,
    bootstrapHubUrl,
    mutateEnabled: p2pMutateEnabled,
    mutateToken: p2pMutateToken,
    source: {
      host: hasEnvValue(rawP2PHost),
      mainnetEnabled: rawOmegaMainnet !== undefined || hasMainnetArg,
      bootstrapHubUrl: hasEnvValue(rawBootstrapHubUrl),
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
    admission: {
      enabled: federationAdmissionEnabled,
      midScore: federationAdmissionMidScore,
      highScore: federationAdmissionHighScore,
      rejectOnStrictMismatch: federationAdmissionRejectOnStrictMismatch,
      hybridizeEnabled: federationHybridizeEnabled,
      degradeEnergyRatio: federationDegradeEnergyRatio,
      degradeResonanceRatio: federationDegradeResonanceRatio,
      openWorld: federationOpenWorld,
    },
    source: {
      enabled: rawFederationEnable !== undefined,
      timeoutMs: rawFederationTimeoutMs !== undefined,
      controlToken: rawSystemControlToken !== undefined,
      admissionEnabled: rawFederationAdmissionEnable !== undefined,
      admissionMidScore: rawFederationAdmissionMidScore !== undefined,
      admissionHighScore: rawFederationAdmissionHighScore !== undefined,
      admissionRejectOnStrictMismatch:
        rawFederationAdmissionRejectOnStrictMismatch !== undefined,
      hybridizeEnabled: rawFederationHybridizeEnable !== undefined,
      degradeEnergyRatio: rawFederationDegradeEnergyRatio !== undefined,
      degradeResonanceRatio: rawFederationDegradeResonanceRatio !== undefined,
      openWorld: rawFederationOpenWorld !== undefined,
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
    engine: kernelMode === "rust" ? "ffi" : "wasm",
    workerCount: pulseWorkerCount,
    strictDeterminism: pulseStrictDeterminism,
    workerResponseTimeoutMs: pulseWorkerResponseTimeoutMs,
    workerTimeoutRetryCount: pulseWorkerTimeoutRetryCount,
    workerTimeoutRetryMs: pulseWorkerTimeoutRetryMs,
    workerInitFallbackEnabled: pulseWorkerInitFallbackEnabled,
    workerRecoveryVerbose: pulseWorkerRecoveryVerbose,
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
    guardianSignalExecutionMode: pulseGuardianSignalExecutionMode,
    architectPlasmidExecutionMode: pulseArchitectPlasmidExecutionMode,
    replicationExecutionMode: pulseReplicationExecutionMode,
    homeostasis: {
      enabled: pulseHomeostasisEnabled,
      targetEnergy: pulseHomeostasisTargetEnergy,
      band: pulseHomeostasisBand,
      maxDelta: pulseHomeostasisMaxDelta,
      overflowThreshold: pulseHomeostasisOverflowThreshold,
      starvationFloor: pulseHomeostasisStarvationFloor,
      baseTax: pulseHomeostasisBaseTax,
      subsidyEnabled: pulseHomeostasisSubsidyEnabled,
    },
    source: {
      workerCount: hasEnvValue(rawPulseWorkers),
      strictDeterminism: rawStrictDeterminism !== undefined,
      workerResponseTimeoutMs: hasEnvValue(rawWorkerResponseTimeoutMs),
      workerTimeoutRetryCount: rawWorkerTimeoutRetryCount !== undefined,
      workerTimeoutRetryMs: rawWorkerTimeoutRetryMs !== undefined,
      workerInitFallback: rawWorkerInitFallback !== undefined,
      workerRecoveryVerbose: rawWorkerRecoveryVerbose !== undefined,
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
      guardianSignalExecutionMode: rawGuardianSignalExecutionMode !== undefined,
      architectPlasmidExecutionMode:
        rawArchitectPlasmidExecutionMode !== undefined,
      homeostasisEnable: rawHomeostasisEnable !== undefined,
      homeostasisTargetEnergy: rawHomeostasisTargetEnergy !== undefined,
      homeostasisBand: rawHomeostasisBand !== undefined,
      homeostasisMaxDelta: rawHomeostasisMaxDelta !== undefined,
      homeostasisOverflowThreshold:
        rawHomeostasisOverflowThreshold !== undefined,
      homeostasisStarvationFloor: rawHomeostasisStarvationFloor !== undefined,
      homeostasisBaseTax: rawHomeostasisBaseTax !== undefined,
      homeostasisSubsidyEnable: rawHomeostasisSubsidyEnable !== undefined,
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
  coldstart: {
    enabled: coldstartEnabled,
    count: coldstartCount,
    replicatorRatio: coldstartReplicatorRatio,
    guardianRatio: coldstartGuardianRatio,
    seed: coldstartSeed,
    energy: coldstartEnergy,
    resonance: coldstartResonance,
    source: {
      enabled: rawColdstartEnable !== undefined,
      count: rawColdstartCount !== undefined,
      replicatorRatio: rawColdstartReplicatorRatio !== undefined,
      guardianRatio: rawColdstartGuardianRatio !== undefined,
      seed: rawColdstartSeed !== undefined,
      energy: rawColdstartEnergy !== undefined,
      resonance: rawColdstartResonance !== undefined,
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
  kernelMode,
  fingerprint: POLICY_FINGERPRINT,
  logFingerprintOnce: (context: string = "runtime"): string => {
    if (!policyFingerprintLogged) {
      policyFingerprintLogged = true;
      // Li(
      //   `[POLICY] context=${context} fingerprint=${POLICY_FINGERPRINT} controlEnabled=${systemControlEnabled} workerCount=${pulseWorkerCount} mutateEnabled=${p2pMutateEnabled}`,
      // );
    }
    return POLICY_FINGERPRINT;
  },
} as const;
