import {
  applyBaseTaxLedgerRuntimeUpdate,
  createBaseTaxLedgerRuntime,
  rollbackBaseTaxLedgerRuntimeUpdate,
  snapshotBaseTaxLedgerRuntime,
  type BaseTaxLedgerRuntimeEvent,
  type BaseTaxLedgerRuntimeSnapshot,
  type BaseTaxLedgerRuntimeState,
} from "./GENETIC_LEDGER_RUNTIME.ts";

export const BASE_TAX_LEDGER_LOG_PATH = ".omega/ledger/base_tax_ledger.jsonl";

export type BaseTaxLedgerRecord =
  | {
    kind: "apply";
    key: "pulse.homeostasis.baseTax";
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
    key: "pulse.homeostasis.baseTax";
    rollback_token: string;
    tick: number;
    source: string;
    reason: string;
    recorded_at: string;
  };

export type BaseTaxLedgerPersistenceSummary = {
  path: string;
  exists: boolean;
  recordCount: number;
  applyCount: number;
  rollbackCount: number;
  hydrated: boolean;
  lastHydratedAt: string | null;
  lastHydrationError: string | null;
};

export type BaseTaxLedgerHydrationResult = {
  state: BaseTaxLedgerRuntimeState;
  snapshot: BaseTaxLedgerRuntimeSnapshot;
  persistence: BaseTaxLedgerPersistenceSummary;
};

const ensureDir = async (): Promise<void> => {
  await Deno.mkdir(".omega/ledger", { recursive: true });
};

const parseRecord = (line: string): BaseTaxLedgerRecord | null => {
  if (line.trim().length === 0) return null;
  try {
    const raw = JSON.parse(line) as Record<string, unknown>;
    if (raw.key !== "pulse.homeostasis.baseTax") return null;
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
      return raw as BaseTaxLedgerRecord;
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
      return raw as BaseTaxLedgerRecord;
    }
    return null;
  } catch {
    return null;
  }
};

export const readBaseTaxLedgerRecords = async (
  path = BASE_TAX_LEDGER_LOG_PATH,
): Promise<BaseTaxLedgerRecord[]> => {
  try {
    const raw = await Deno.readTextFile(path);
    return raw.split(/\r?\n/u).map(parseRecord).filter((x): x is BaseTaxLedgerRecord => x !== null);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return [];
    throw err;
  }
};

export const readBaseTaxLedgerPersistenceSummary = async (
  path = BASE_TAX_LEDGER_LOG_PATH,
): Promise<BaseTaxLedgerPersistenceSummary> => {
  const records = await readBaseTaxLedgerRecords(path);
  return {
    path,
    exists: records.length > 0,
    recordCount: records.length,
    applyCount: records.filter((record) => record.kind === "apply").length,
    rollbackCount: records.filter((record) => record.kind === "rollback").length,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
};

export const appendBaseTaxLedgerRecord = async (
  record: BaseTaxLedgerRecord,
  path = BASE_TAX_LEDGER_LOG_PATH,
): Promise<void> => {
  await ensureDir();
  await Deno.writeTextFile(path, `${JSON.stringify(record)}\n`, {
    append: true,
    create: true,
  });
};

export const recordFromApplyMutation = (
  mutation: BaseTaxLedgerRuntimeEvent,
): BaseTaxLedgerRecord => ({
  kind: "apply",
  key: "pulse.homeostasis.baseTax",
  rollback_token: mutation.rollbackToken,
  tick: mutation.tick,
  source: mutation.source,
  reason: mutation.reason,
  previous_value: mutation.previousValue,
  next_value: mutation.nextValue,
  recorded_at: new Date().toISOString(),
});

export const recordFromRollbackMutation = (
  mutation: BaseTaxLedgerRuntimeEvent,
): BaseTaxLedgerRecord => ({
  kind: "rollback",
  key: "pulse.homeostasis.baseTax",
  rollback_token: mutation.rollbackToken,
  tick: mutation.rolledBackAtTick ?? mutation.tick,
  source: mutation.rolledBackSource ?? mutation.source,
  reason: mutation.rolledBackReason ?? mutation.reason,
  recorded_at: new Date().toISOString(),
});

export const hydrateBaseTaxLedgerRuntime = async (
  initialValue: number,
  historyLimit = 32,
  path = BASE_TAX_LEDGER_LOG_PATH,
): Promise<BaseTaxLedgerHydrationResult> => {
  const records = await readBaseTaxLedgerRecords(path);
  let state = createBaseTaxLedgerRuntime(initialValue, historyLimit);
  let hydrationError: string | null = null;

  try {
    for (const record of records) {
      if (record.kind === "apply") {
        state = applyBaseTaxLedgerRuntimeUpdate(state, {
          value: record.next_value,
          tick: record.tick,
          source: record.source,
          reason: record.reason,
        }).state;
        continue;
      }
      state = rollbackBaseTaxLedgerRuntimeUpdate(state, {
        rollbackToken: record.rollback_token,
        tick: record.tick,
        source: record.source,
        reason: record.reason,
      }).state;
    }
  } catch (err) {
    hydrationError = String(err);
  }

  return {
    state,
    snapshot: snapshotBaseTaxLedgerRuntime(state),
    persistence: {
      path,
      exists: records.length > 0,
      recordCount: records.length,
      applyCount: records.filter((record) => record.kind === "apply").length,
      rollbackCount: records.filter((record) => record.kind === "rollback").length,
      hydrated: hydrationError === null,
      lastHydratedAt: new Date().toISOString(),
      lastHydrationError: hydrationError,
    },
  };
};
