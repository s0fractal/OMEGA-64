---
id: GENERIC_LEDGER_PERSISTENCE
type: module
tags:
  - core
  - db
  - host
  - fs
min_level: 10
vars:
  - applyLedgerUpdate
  - createGeneticLedgerRuntime
  - createLedgerRuntime
  - rollbackLedgerUpdate
  - snapshotLedgerRuntime
  - LedgerRecord
  - LedgerSnapshotRecord
  - LedgerPersistenceSummary
  - LedgerHydrationResult
extra_symbols:
  - GENERIC_LEDGER_PERSISTENCE
  - appendLedgerRecord
  - appendLedgerRecordAndMaybeCompact
  - compactLedgerPersistence
  - getLogPath
  - getSnapshotPath
  - hydrateLedgerRuntime
  - recordFromApply
  - recordFromRollback
deps:
  - GENERIC_LEDGER_SYSTEM
  - TYPES
---
```typescript
const ensureDir = async (): Promise<void> => {
  await Deno.mkdir(".omega/ledger", { recursive: true });
};

const DEFAULT_THRESHOLD = 64;
const DEFAULT_KEEP_TAIL = 16;

export const getLogPath = (key: GeneticLedgerKey): string =>
  `.omega/ledger/${key.replace(/\./gu, "_")}_ledger.jsonl`;

export const getSnapshotPath = (key: GeneticLedgerKey): string =>
  `.omega/ledger/${key.replace(/\./gu, "_")}_ledger.snapshot.json`;

const parseRecord = <K extends GeneticLedgerKey>(
  key: K,
  line: string,
): LedgerRecord<K> | null => {
  if (!line.trim()) return null;
  try {
    const raw = JSON.parse(line);
    if (raw.key !== key) return null;
    return raw as LedgerRecord<K>;
  } catch {
    return null;
  }
};

const parseSnapshot = <K extends GeneticLedgerKey>(
  key: K,
  raw: string,
): LedgerSnapshotRecord<K> | null => {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.key !== key || parsed.version !== 1) return null;
    return parsed as LedgerSnapshotRecord<K>;
  } catch {
    return null;
  }
};

const applyRecordToState = <K extends GeneticLedgerKey>(
  state: LedgerRuntimeState<K>,
  record: LedgerRecord<K>,
): LedgerRuntimeState<K> => {
  if (record.kind === "apply") {
    return applyLedgerUpdate(state, {
      value: record.next_value,
      tick: record.tick,
      source: record.source,
      reason: record.reason,
    }).state;
  }
  return rollbackLedgerUpdate(state, {
    rollbackToken: record.rollback_token,
    tick: record.tick,
    source: record.source,
    reason: record.reason,
  }).state;
};

export const hydrateLedgerRuntime = async <K extends GeneticLedgerKey>(
  key: K,
  options: {
    initialValue?: number;
    historyLimit?: number;
    threshold?: number;
    keepTail?: number;
  } = {},
): Promise<LedgerHydrationResult<K>> => {
  const logPath = getLogPath(key);
  const snapshotPath = getSnapshotPath(key);
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const keepTail = options.keepTail ?? DEFAULT_KEEP_TAIL;

  let records: LedgerRecord<K>[] = [];
  let snapshotRecord: LedgerSnapshotRecord<K> | null = null;

  try {
    const rawLogArray = await Deno.readTextFile(logPath);
    records = rawLogArray
      .split(/\r?\n/u)
      .map((line) => parseRecord(key, line))
      .filter((x): x is LedgerRecord<K> => x !== null);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }

  try {
    const rawSnapshot = await Deno.readTextFile(snapshotPath);
    snapshotRecord = parseSnapshot(key, rawSnapshot);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }

  let state = snapshotRecord?.state ??
    createGeneticLedgerRuntime(key, options.initialValue, options.historyLimit);
  let hydrationError: string | null = null;
  try {
    for (const record of records) {
      state = applyRecordToState(state, record);
    }
  } catch (err) {
    hydrationError = String(err);
  }

  const applyCount = records.filter((r) => r.kind === "apply").length;
  const rollbackCount = records.length - applyCount;

  let persistence: LedgerPersistenceSummary = {
    path: logPath,
    snapshotPath,
    exists: records.length > 0 || snapshotRecord !== null,
    snapshotExists: snapshotRecord !== null,
    recordCount: (snapshotRecord?.representedRecordCount ?? 0) + records.length,
    applyCount: (snapshotRecord?.representedApplyCount ?? 0) + applyCount,
    rollbackCount: (snapshotRecord?.representedRollbackCount ?? 0) +
      rollbackCount,
    tailRecordCount: records.length,
    tailApplyCount: applyCount,
    tailRollbackCount: rollbackCount,
    snapshotRecordCount: snapshotRecord?.representedRecordCount ?? 0,
    snapshotApplyCount: snapshotRecord?.representedApplyCount ?? 0,
    snapshotRollbackCount: snapshotRecord?.representedRollbackCount ?? 0,
    compactionEnabled: true,
    compactionThreshold: threshold,
    compactionKeepTail: keepTail,
    lastCompactedAt: snapshotRecord?.compactedAt ?? null,
    lastCompactedTick: snapshotRecord?.compactedTick ?? -1,
    hydrated: hydrationError === null,
    lastHydratedAt: new Date().toISOString(),
    lastHydrationError: hydrationError,
  };

  if (
    hydrationError === null &&
    persistence.tailRecordCount > persistence.compactionKeepTail &&
    persistence.recordCount >= persistence.compactionThreshold
  ) {
    persistence = await compactLedgerPersistence(key, {
      initialValue: options.initialValue,
      historyLimit: options.historyLimit,
      threshold: persistence.compactionThreshold,
      keepTail: persistence.compactionKeepTail,
    });
    // the hydrated values need explicit set
    persistence.hydrated = true;
    persistence.lastHydratedAt = new Date().toISOString();
  }

  return {
    state,
    snapshot: snapshotLedgerRuntime(state),
    persistence,
  };
};

export const appendLedgerRecord = async <K extends GeneticLedgerKey>(
  record: LedgerRecord<K>,
): Promise<void> => {
  const path = getLogPath(record.key);
  await ensureDir();
  await Deno.writeTextFile(path, `${JSON.stringify(record)}\n`, {
    append: true,
    create: true,
  });
};

export const recordFromApply = <K extends GeneticLedgerKey>(
  mutation: LedgerRuntimeEvent<K>,
  key: K,
): LedgerRecord<K> => ({
  kind: "apply",
  key,
  rollback_token: mutation.rollbackToken,
  tick: mutation.tick,
  source: mutation.source,
  reason: mutation.reason,
  previous_value: mutation.previousValue,
  next_value: mutation.nextValue,
  recorded_at: new Date().toISOString(),
});

export const recordFromRollback = <K extends GeneticLedgerKey>(
  mutation: LedgerRuntimeEvent<K>,
  key: K,
): LedgerRecord<K> => ({
  kind: "rollback",
  key,
  rollback_token: mutation.rollbackToken,
  tick: mutation.rolledBackAtTick ?? mutation.tick,
  source: mutation.rolledBackSource ?? mutation.source,
  reason: mutation.rolledBackReason ?? mutation.reason,
  recorded_at: new Date().toISOString(),
});

export const compactLedgerPersistence = async <K extends GeneticLedgerKey>(
  key: K,
  options: {
    initialValue?: number;
    historyLimit?: number;
    threshold?: number;
    keepTail?: number;
  } = {},
): Promise<LedgerPersistenceSummary> => {
  const logPath = getLogPath(key);
  const snapshotPath = getSnapshotPath(key);
  const threshold = Math.max(
    1,
    Math.floor(options.threshold ?? DEFAULT_THRESHOLD),
  );
  const keepTail = Math.max(
    1,
    Math.floor(options.keepTail ?? DEFAULT_KEEP_TAIL),
  );

  let records: LedgerRecord<K>[] = [];
  let snapshotRecord: LedgerSnapshotRecord<K> | null = null;
  try {
    const raw = await Deno.readTextFile(logPath);
    records = raw.split(/\r?\n/u).map((l) => parseRecord(key, l)).filter((
      x,
    ): x is LedgerRecord<K> => x !== null);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }
  try {
    const raw = await Deno.readTextFile(snapshotPath);
    snapshotRecord = parseSnapshot(key, raw);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }

  const snapshotRecordCount = snapshotRecord?.representedRecordCount ?? 0;
  if (
    records.length <= keepTail ||
    (snapshotRecord !== null && records.length === 0) ||
    (snapshotRecord === null && records.length < threshold) ||
    (snapshotRecord !== null &&
      snapshotRecordCount + records.length < threshold)
  ) {
    const applyCount = records.filter((r) => r.kind === "apply").length;
    return {
      path: logPath,
      snapshotPath,
      exists: snapshotRecord !== null || records.length > 0,
      snapshotExists: snapshotRecord !== null,
      recordCount: snapshotRecordCount + records.length,
      applyCount: (snapshotRecord?.representedApplyCount ?? 0) + applyCount,
      rollbackCount: (snapshotRecord?.representedRollbackCount ?? 0) +
        (records.length - applyCount),
      tailRecordCount: records.length,
      tailApplyCount: applyCount,
      tailRollbackCount: records.length - applyCount,
      snapshotRecordCount,
      snapshotApplyCount: snapshotRecord?.representedApplyCount ?? 0,
      snapshotRollbackCount: snapshotRecord?.representedRollbackCount ?? 0,
      compactionEnabled: true,
      compactionThreshold: threshold,
      compactionKeepTail: keepTail,
      lastCompactedAt: snapshotRecord?.compactedAt ?? null,
      lastCompactedTick: snapshotRecord?.compactedTick ?? -1,
      hydrated: false,
      lastHydratedAt: null,
      lastHydrationError: null,
    };
  }

  const compactCount = Math.max(0, records.length - keepTail);
  let state = snapshotRecord?.state ??
    createGeneticLedgerRuntime(key, options.initialValue, options.historyLimit);
  const compactedRecords = records.slice(0, compactCount);
  for (const record of compactedRecords) {
    state = applyRecordToState(state, record);
  }
  const compactedApplyCount =
    compactedRecords.filter((r) => r.kind === "apply").length;
  const compactedRollbackCount = compactedRecords.length - compactedApplyCount;

  const nextSnapshotRecord: LedgerSnapshotRecord<K> = {
    version: 1,
    key,
    representedRecordCount: snapshotRecordCount + compactedRecords.length,
    representedApplyCount: (snapshotRecord?.representedApplyCount ?? 0) +
      compactedApplyCount,
    representedRollbackCount: (snapshotRecord?.representedRollbackCount ?? 0) +
      compactedRollbackCount,
    compactedAt: new Date().toISOString(),
    compactedTick: state.lastRollbackTick >= 0
      ? state.lastRollbackTick
      : state.lastAppliedTick,
    state,
  };
  const tailRecords = records.slice(compactCount);
  const tailApplyCount = tailRecords.filter((r) => r.kind === "apply").length;
  const tailRollbackCount = tailRecords.length - tailApplyCount;

  await ensureDir();
  await Deno.writeTextFile(
    snapshotPath,
    `${JSON.stringify(nextSnapshotRecord, null, 2)}\n`,
  );
  await Deno.writeTextFile(
    logPath,
    tailRecords.map((r) => JSON.stringify(r)).join("\n") +
      (tailRecords.length > 0 ? "\n" : ""),
    { create: true },
  );

  return {
    path: logPath,
    snapshotPath,
    exists: true,
    snapshotExists: true,
    recordCount: nextSnapshotRecord.representedRecordCount + tailRecords.length,
    applyCount: nextSnapshotRecord.representedApplyCount + tailApplyCount,
    rollbackCount: nextSnapshotRecord.representedRollbackCount +
      tailRollbackCount,
    tailRecordCount: tailRecords.length,
    tailApplyCount,
    tailRollbackCount,
    snapshotRecordCount: nextSnapshotRecord.representedRecordCount,
    snapshotApplyCount: nextSnapshotRecord.representedApplyCount,
    snapshotRollbackCount: nextSnapshotRecord.representedRollbackCount,
    compactionEnabled: true,
    compactionThreshold: threshold,
    compactionKeepTail: keepTail,
    lastCompactedAt: nextSnapshotRecord.compactedAt,
    lastCompactedTick: nextSnapshotRecord.compactedTick,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
};

export const appendLedgerRecordAndMaybeCompact = async <
  K extends GeneticLedgerKey,
>(
  key: K,
  record: LedgerRecord<K>,
  options: {
    initialValue?: number;
    historyLimit?: number;
    threshold?: number;
    keepTail?: number;
  } = {},
): Promise<LedgerPersistenceSummary> => {
  await appendLedgerRecord(record);
  return await compactLedgerPersistence(key, options);
};

export const GENERIC_LEDGER_PERSISTENCE = {
  getLogPath,
  getSnapshotPath,
  hydrateLedgerRuntime,
  appendLedgerRecord,
  recordFromApply,
  recordFromRollback,
  compactLedgerPersistence,
};
```
