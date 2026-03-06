import {
  applyTargetEnergyLedgerRuntimeUpdate,
  createTargetEnergyLedgerRuntime,
  rollbackTargetEnergyLedgerRuntimeUpdate,
  snapshotTargetEnergyLedgerRuntime,
  type TargetEnergyLedgerRuntimeEvent,
  type TargetEnergyLedgerRuntimeSnapshot,
  type TargetEnergyLedgerRuntimeState,
} from "./HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts";

export const TARGET_ENERGY_LEDGER_LOG_PATH =
  ".omega/ledger/target_energy_ledger.jsonl";
export const TARGET_ENERGY_LEDGER_SNAPSHOT_PATH =
  ".omega/ledger/target_energy_ledger.snapshot.json";
export const TARGET_ENERGY_LEDGER_COMPACT_THRESHOLD = Math.max(
  8,
  Math.floor(
    Number(
      Deno.env.get("OMEGA_TARGET_ENERGY_LEDGER_COMPACT_THRESHOLD") ?? "64",
    ),
  ),
);
export const TARGET_ENERGY_LEDGER_COMPACT_KEEP_TAIL = Math.max(
  1,
  Math.floor(
    Number(
      Deno.env.get("OMEGA_TARGET_ENERGY_LEDGER_COMPACT_KEEP_TAIL") ?? "16",
    ),
  ),
);

export type TargetEnergyLedgerRecord =
  | {
    kind: "apply";
    key: "pulse.homeostasis.targetEnergy";
    rollback_token: string;
    tick: number;
    source: string;
    reason: string;
    previous_value: number;
    next_value: number;
    recorded_at: string;
  }
  | {
    kind: "rollback";
    key: "pulse.homeostasis.targetEnergy";
    rollback_token: string;
    tick: number;
    source: string;
    reason: string;
    recorded_at: string;
  };

export type TargetEnergyLedgerSnapshotRecord = {
  version: 1;
  key: "pulse.homeostasis.targetEnergy";
  representedRecordCount: number;
  representedApplyCount: number;
  representedRollbackCount: number;
  compactedAt: string;
  compactedTick: number;
  state: TargetEnergyLedgerRuntimeState;
};

export type TargetEnergyLedgerPersistenceSummary = {
  path: string;
  snapshotPath: string;
  exists: boolean;
  snapshotExists: boolean;
  recordCount: number;
  applyCount: number;
  rollbackCount: number;
  tailRecordCount: number;
  tailApplyCount: number;
  tailRollbackCount: number;
  snapshotRecordCount: number;
  snapshotApplyCount: number;
  snapshotRollbackCount: number;
  compactionEnabled: boolean;
  compactionThreshold: number;
  compactionKeepTail: number;
  lastCompactedAt: string | null;
  lastCompactedTick: number;
  hydrated: boolean;
  lastHydratedAt: string | null;
  lastHydrationError: string | null;
};

export type TargetEnergyLedgerHydrationResult = {
  state: TargetEnergyLedgerRuntimeState;
  snapshot: TargetEnergyLedgerRuntimeSnapshot;
  persistence: TargetEnergyLedgerPersistenceSummary;
};

const ensureDir = async (): Promise<void> => {
  await Deno.mkdir(".omega/ledger", { recursive: true });
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isLedgerKey = (
  value: unknown,
): value is "pulse.homeostasis.targetEnergy" =>
  value === "pulse.homeostasis.targetEnergy";
const countKinds = (records: readonly TargetEnergyLedgerRecord[]) => ({
  applyCount: records.filter((record) => record.kind === "apply").length,
  rollbackCount: records.filter((record) => record.kind === "rollback").length,
});
const deriveCompactedTick = (state: TargetEnergyLedgerRuntimeState): number =>
  state.lastRollbackTick >= 0 ? state.lastRollbackTick : state.lastAppliedTick;

const parseRecord = (line: string): TargetEnergyLedgerRecord | null => {
  if (line.trim().length === 0) return null;
  try {
    const raw = JSON.parse(line) as Record<string, unknown>;
    if (raw.key !== "pulse.homeostasis.targetEnergy") return null;
    if (raw.kind === "apply") {
      if (
        typeof raw.rollback_token !== "string" ||
        typeof raw.tick !== "number" ||
        typeof raw.source !== "string" ||
        typeof raw.reason !== "string" ||
        typeof raw.previous_value !== "number" ||
        typeof raw.next_value !== "number" ||
        typeof raw.recorded_at !== "string"
      ) {
        return null;
      }
      return raw as TargetEnergyLedgerRecord;
    }
    if (raw.kind === "rollback") {
      if (
        typeof raw.rollback_token !== "string" ||
        typeof raw.tick !== "number" ||
        typeof raw.source !== "string" ||
        typeof raw.reason !== "string" ||
        typeof raw.recorded_at !== "string"
      ) {
        return null;
      }
      return raw as TargetEnergyLedgerRecord;
    }
    return null;
  } catch {
    return null;
  }
};

const parseRuntimeEvent = (
  raw: unknown,
): TargetEnergyLedgerRuntimeEvent | null => {
  if (!raw || typeof raw !== "object") return null;
  const event = raw as Record<string, unknown>;
  if (
    typeof event.rollbackToken !== "string" ||
    !isFiniteNumber(event.previousValue) ||
    !isFiniteNumber(event.nextValue) ||
    !isFiniteNumber(event.tick) ||
    typeof event.source !== "string" ||
    typeof event.reason !== "string"
  ) {
    return null;
  }
  if (
    event.rolledBackAtTick !== null && !isFiniteNumber(event.rolledBackAtTick)
  ) {
    return null;
  }
  if (
    event.rolledBackSource !== null &&
    typeof event.rolledBackSource !== "string"
  ) {
    return null;
  }
  if (
    event.rolledBackReason !== null &&
    typeof event.rolledBackReason !== "string"
  ) {
    return null;
  }
  return {
    rollbackToken: event.rollbackToken,
    previousValue: event.previousValue,
    nextValue: event.nextValue,
    tick: event.tick,
    source: event.source,
    reason: event.reason,
    rolledBackAtTick: event.rolledBackAtTick,
    rolledBackSource: event.rolledBackSource,
    rolledBackReason: event.rolledBackReason,
  };
};

const parseRuntimeState = (
  raw: unknown,
): TargetEnergyLedgerRuntimeState | null => {
  if (!raw || typeof raw !== "object") return null;
  const state = raw as Record<string, unknown>;
  if (
    !isLedgerKey(state.key) ||
    !isFiniteNumber(state.currentValue) ||
    !isFiniteNumber(state.defaultValue) ||
    !isFiniteNumber(state.min) ||
    !isFiniteNumber(state.max) ||
    state.rollbackClass !== "immediate" ||
    !isFiniteNumber(state.seq) ||
    !isFiniteNumber(state.historyLimit) ||
    !Array.isArray(state.history) ||
    !isFiniteNumber(state.lastAppliedTick) ||
    typeof state.lastAppliedSource !== "string" ||
    typeof state.lastAppliedReason !== "string" ||
    (
      state.lastAppliedRollbackToken !== null &&
      typeof state.lastAppliedRollbackToken !== "string"
    ) ||
    !isFiniteNumber(state.lastRollbackTick) ||
    typeof state.lastRollbackSource !== "string" ||
    typeof state.lastRollbackReason !== "string" ||
    (
      state.lastRollbackToken !== null &&
      typeof state.lastRollbackToken !== "string"
    )
  ) {
    return null;
  }
  const history = state.history
    .map(parseRuntimeEvent)
    .filter((event): event is TargetEnergyLedgerRuntimeEvent => event !== null);
  if (history.length !== state.history.length) return null;
  return {
    key: state.key,
    currentValue: state.currentValue,
    defaultValue: state.defaultValue,
    min: state.min,
    max: state.max,
    rollbackClass: state.rollbackClass,
    seq: state.seq,
    historyLimit: state.historyLimit,
    history,
    lastAppliedTick: state.lastAppliedTick,
    lastAppliedSource: state.lastAppliedSource,
    lastAppliedReason: state.lastAppliedReason,
    lastAppliedRollbackToken: state.lastAppliedRollbackToken,
    lastRollbackTick: state.lastRollbackTick,
    lastRollbackSource: state.lastRollbackSource,
    lastRollbackReason: state.lastRollbackReason,
    lastRollbackToken: state.lastRollbackToken,
  };
};

const parseSnapshotRecord = (
  raw: string,
): TargetEnergyLedgerSnapshotRecord | null => {
  if (raw.trim().length === 0) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      parsed.version !== 1 ||
      !isLedgerKey(parsed.key) ||
      !isFiniteNumber(parsed.representedRecordCount) ||
      !isFiniteNumber(parsed.representedApplyCount) ||
      !isFiniteNumber(parsed.representedRollbackCount) ||
      typeof parsed.compactedAt !== "string" ||
      !isFiniteNumber(parsed.compactedTick)
    ) {
      return null;
    }
    const state = parseRuntimeState(parsed.state);
    if (!state) return null;
    return {
      version: 1,
      key: "pulse.homeostasis.targetEnergy",
      representedRecordCount: parsed.representedRecordCount,
      representedApplyCount: parsed.representedApplyCount,
      representedRollbackCount: parsed.representedRollbackCount,
      compactedAt: parsed.compactedAt,
      compactedTick: parsed.compactedTick,
      state,
    };
  } catch {
    return null;
  }
};

const applyRecordToRuntimeState = (
  state: TargetEnergyLedgerRuntimeState,
  record: TargetEnergyLedgerRecord,
): TargetEnergyLedgerRuntimeState => {
  if (record.kind === "apply") {
    return applyTargetEnergyLedgerRuntimeUpdate(state, {
      value: record.next_value,
      tick: record.tick,
      source: record.source,
      reason: record.reason,
    }).state;
  }
  return rollbackTargetEnergyLedgerRuntimeUpdate(state, {
    rollbackToken: record.rollback_token,
    tick: record.tick,
    source: record.source,
    reason: record.reason,
  }).state;
};

const buildPersistenceSummary = (
  tailRecords: readonly TargetEnergyLedgerRecord[],
  snapshotRecord: TargetEnergyLedgerSnapshotRecord | null,
  path: string,
  snapshotPath: string,
): TargetEnergyLedgerPersistenceSummary => {
  const tailCounts = countKinds(tailRecords);
  const snapshotRecordCount = snapshotRecord?.representedRecordCount ?? 0;
  const snapshotApplyCount = snapshotRecord?.representedApplyCount ?? 0;
  const snapshotRollbackCount = snapshotRecord?.representedRollbackCount ?? 0;
  return {
    path,
    snapshotPath,
    exists: snapshotRecord !== null || tailRecords.length > 0,
    snapshotExists: snapshotRecord !== null,
    recordCount: snapshotRecordCount + tailRecords.length,
    applyCount: snapshotApplyCount + tailCounts.applyCount,
    rollbackCount: snapshotRollbackCount + tailCounts.rollbackCount,
    tailRecordCount: tailRecords.length,
    tailApplyCount: tailCounts.applyCount,
    tailRollbackCount: tailCounts.rollbackCount,
    snapshotRecordCount,
    snapshotApplyCount,
    snapshotRollbackCount,
    compactionEnabled: true,
    compactionThreshold: TARGET_ENERGY_LEDGER_COMPACT_THRESHOLD,
    compactionKeepTail: TARGET_ENERGY_LEDGER_COMPACT_KEEP_TAIL,
    lastCompactedAt: snapshotRecord?.compactedAt ?? null,
    lastCompactedTick: snapshotRecord?.compactedTick ?? -1,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
};

export const readTargetEnergyLedgerRecords = async (
  path = TARGET_ENERGY_LEDGER_LOG_PATH,
): Promise<TargetEnergyLedgerRecord[]> => {
  try {
    const raw = await Deno.readTextFile(path);
    return raw.split(/\r?\n/u).map(parseRecord).filter((
      x,
    ): x is TargetEnergyLedgerRecord => x !== null);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return [];
    throw err;
  }
};

export const readTargetEnergyLedgerSnapshot = async (
  path = TARGET_ENERGY_LEDGER_SNAPSHOT_PATH,
): Promise<TargetEnergyLedgerSnapshotRecord | null> => {
  try {
    const raw = await Deno.readTextFile(path);
    return parseSnapshotRecord(raw);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return null;
    throw err;
  }
};

export const readTargetEnergyLedgerPersistenceSummary = async (
  path = TARGET_ENERGY_LEDGER_LOG_PATH,
  snapshotPath = TARGET_ENERGY_LEDGER_SNAPSHOT_PATH,
): Promise<TargetEnergyLedgerPersistenceSummary> => {
  const [records, snapshotRecord] = await Promise.all([
    readTargetEnergyLedgerRecords(path),
    readTargetEnergyLedgerSnapshot(snapshotPath),
  ]);
  return buildPersistenceSummary(records, snapshotRecord, path, snapshotPath);
};

export const appendTargetEnergyLedgerRecord = async (
  record: TargetEnergyLedgerRecord,
  path = TARGET_ENERGY_LEDGER_LOG_PATH,
): Promise<void> => {
  await ensureDir();
  await Deno.writeTextFile(path, `${JSON.stringify(record)}\n`, {
    append: true,
    create: true,
  });
};

export const recordFromTargetEnergyApplyMutation = (
  mutation: TargetEnergyLedgerRuntimeEvent,
): TargetEnergyLedgerRecord => ({
  kind: "apply",
  key: "pulse.homeostasis.targetEnergy",
  rollback_token: mutation.rollbackToken,
  tick: mutation.tick,
  source: mutation.source,
  reason: mutation.reason,
  previous_value: mutation.previousValue,
  next_value: mutation.nextValue,
  recorded_at: new Date().toISOString(),
});

export const recordFromTargetEnergyRollbackMutation = (
  mutation: TargetEnergyLedgerRuntimeEvent,
): TargetEnergyLedgerRecord => ({
  kind: "rollback",
  key: "pulse.homeostasis.targetEnergy",
  rollback_token: mutation.rollbackToken,
  tick: mutation.rolledBackAtTick ?? mutation.tick,
  source: mutation.rolledBackSource ?? mutation.source,
  reason: mutation.rolledBackReason ?? mutation.reason,
  recorded_at: new Date().toISOString(),
});

export const compactTargetEnergyLedgerPersistence = async (
  options: {
    initialValue?: number;
    historyLimit?: number;
    path?: string;
    snapshotPath?: string;
    threshold?: number;
    keepTailRecords?: number;
  } = {},
): Promise<TargetEnergyLedgerPersistenceSummary> => {
  const path = options.path ?? TARGET_ENERGY_LEDGER_LOG_PATH;
  const snapshotPath = options.snapshotPath ??
    TARGET_ENERGY_LEDGER_SNAPSHOT_PATH;
  const initialValue = options.initialValue ?? 0;
  const historyLimit = options.historyLimit ?? 32;
  const threshold = Math.max(
    1,
    Math.floor(options.threshold ?? TARGET_ENERGY_LEDGER_COMPACT_THRESHOLD),
  );
  const keepTailRecords = Math.max(
    1,
    Math.floor(
      options.keepTailRecords ?? TARGET_ENERGY_LEDGER_COMPACT_KEEP_TAIL,
    ),
  );
  const [records, snapshotRecord] = await Promise.all([
    readTargetEnergyLedgerRecords(path),
    readTargetEnergyLedgerSnapshot(snapshotPath),
  ]);
  if (
    records.length <= keepTailRecords ||
    snapshotRecord !== null && records.length === 0 ||
    snapshotRecord === null && records.length < threshold ||
    snapshotRecord !== null &&
      snapshotRecord.representedRecordCount + records.length < threshold
  ) {
    return {
      ...buildPersistenceSummary(records, snapshotRecord, path, snapshotPath),
      compactionThreshold: threshold,
      compactionKeepTail: keepTailRecords,
    };
  }

  const compactCount = Math.max(0, records.length - keepTailRecords);
  if (compactCount === 0) {
    return {
      ...buildPersistenceSummary(records, snapshotRecord, path, snapshotPath),
      compactionThreshold: threshold,
      compactionKeepTail: keepTailRecords,
    };
  }

  let state = snapshotRecord?.state ??
    createTargetEnergyLedgerRuntime(initialValue, historyLimit);
  const compactedRecords = records.slice(0, compactCount);
  for (const record of compactedRecords) {
    state = applyRecordToRuntimeState(state, record);
  }
  const compactedCounts = countKinds(compactedRecords);
  const nextSnapshotRecord: TargetEnergyLedgerSnapshotRecord = {
    version: 1,
    key: "pulse.homeostasis.targetEnergy",
    representedRecordCount: (snapshotRecord?.representedRecordCount ?? 0) +
      compactedRecords.length,
    representedApplyCount: (snapshotRecord?.representedApplyCount ?? 0) +
      compactedCounts.applyCount,
    representedRollbackCount: (snapshotRecord?.representedRollbackCount ?? 0) +
      compactedCounts.rollbackCount,
    compactedAt: new Date().toISOString(),
    compactedTick: deriveCompactedTick(state),
    state,
  };
  const tailRecords = records.slice(compactCount);

  await ensureDir();
  await Deno.writeTextFile(
    snapshotPath,
    `${JSON.stringify(nextSnapshotRecord, null, 2)}\n`,
  );
  await Deno.writeTextFile(
    path,
    tailRecords.map((record) => JSON.stringify(record)).join("\n") +
      (tailRecords.length > 0 ? "\n" : ""),
    { create: true },
  );

  return {
    ...buildPersistenceSummary(
      tailRecords,
      nextSnapshotRecord,
      path,
      snapshotPath,
    ),
    compactionThreshold: threshold,
    compactionKeepTail: keepTailRecords,
  };
};

export const appendTargetEnergyLedgerRecordAndMaybeCompact = async (
  record: TargetEnergyLedgerRecord,
  options: {
    initialValue?: number;
    historyLimit?: number;
    path?: string;
    snapshotPath?: string;
    threshold?: number;
    keepTailRecords?: number;
  } = {},
): Promise<TargetEnergyLedgerPersistenceSummary> => {
  const path = options.path ?? TARGET_ENERGY_LEDGER_LOG_PATH;
  await appendTargetEnergyLedgerRecord(record, path);
  return await compactTargetEnergyLedgerPersistence({
    ...options,
    path,
  });
};

export const hydrateTargetEnergyLedgerRuntime = async (
  initialValue: number,
  historyLimit = 32,
  path = TARGET_ENERGY_LEDGER_LOG_PATH,
  snapshotPath = TARGET_ENERGY_LEDGER_SNAPSHOT_PATH,
): Promise<TargetEnergyLedgerHydrationResult> => {
  const [records, snapshotRecord] = await Promise.all([
    readTargetEnergyLedgerRecords(path),
    readTargetEnergyLedgerSnapshot(snapshotPath),
  ]);
  let state = snapshotRecord?.state ??
    createTargetEnergyLedgerRuntime(initialValue, historyLimit);
  let hydrationError: string | null = null;

  try {
    for (const record of records) {
      state = applyRecordToRuntimeState(state, record);
    }
  } catch (err) {
    hydrationError = String(err);
  }

  let persistence = buildPersistenceSummary(
    records,
    snapshotRecord,
    path,
    snapshotPath,
  );
  if (
    hydrationError === null &&
    persistence.tailRecordCount > persistence.compactionKeepTail &&
    persistence.recordCount >= persistence.compactionThreshold
  ) {
    persistence = await compactTargetEnergyLedgerPersistence({
      initialValue,
      historyLimit,
      path,
      snapshotPath,
      threshold: persistence.compactionThreshold,
      keepTailRecords: persistence.compactionKeepTail,
    });
  }

  return {
    state,
    snapshot: snapshotTargetEnergyLedgerRuntime(state),
    persistence: {
      ...persistence,
      hydrated: hydrationError === null,
      lastHydratedAt: new Date().toISOString(),
      lastHydrationError: hydrationError,
    },
  };
};
