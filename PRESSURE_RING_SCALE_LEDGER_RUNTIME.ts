import { geneticLedgerEntryByKey } from "./GENETIC_LEDGER.ts";

const ENTRY = geneticLedgerEntryByKey("pulse.pressureRing.scale");
if (!ENTRY) {
  throw new Error(
    "[PRESSURE_RING_SCALE_LEDGER_RUNTIME] missing pulse.pressureRing.scale entry",
  );
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export type PressureRingScaleLedgerRuntimeEvent = {
  rollbackToken: string;
  previousValue: number;
  nextValue: number;
  tick: number;
  source: string;
  reason: string;
  rolledBackAtTick: number | null;
  rolledBackSource: string | null;
  rolledBackReason: string | null;
};

export type PressureRingScaleLedgerRuntimeState = {
  key: "pulse.pressureRing.scale";
  currentValue: number;
  defaultValue: number;
  min: number;
  max: number;
  rollbackClass: "immediate";
  seq: number;
  historyLimit: number;
  history: readonly PressureRingScaleLedgerRuntimeEvent[];
  lastAppliedTick: number;
  lastAppliedSource: string;
  lastAppliedReason: string;
  lastAppliedRollbackToken: string | null;
  lastRollbackTick: number;
  lastRollbackSource: string;
  lastRollbackReason: string;
  lastRollbackToken: string | null;
};

export type PressureRingScaleLedgerRuntimeSnapshot = {
  key: "pulse.pressureRing.scale";
  currentValue: number;
  defaultValue: number;
  min: number;
  max: number;
  rollbackClass: "immediate";
  historyDepth: number;
  lastAppliedTick: number;
  lastAppliedSource: string;
  lastAppliedReason: string;
  lastAppliedRollbackToken: string | null;
  lastRollbackTick: number;
  lastRollbackSource: string;
  lastRollbackReason: string;
  lastRollbackToken: string | null;
};

export type PressureRingScaleLedgerApplyResult = {
  status: "applied" | "noop";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: PressureRingScaleLedgerRuntimeEvent | null;
  state: PressureRingScaleLedgerRuntimeState;
};

export type PressureRingScaleLedgerRollbackResult = {
  status: "rolled_back" | "missing" | "consumed" | "stale";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: PressureRingScaleLedgerRuntimeEvent | null;
  state: PressureRingScaleLedgerRuntimeState;
};

const cloneHistory = (
  history: readonly PressureRingScaleLedgerRuntimeEvent[],
): PressureRingScaleLedgerRuntimeEvent[] =>
  history.map((event) => ({ ...event }));

export const createPressureRingScaleLedgerRuntime = (
  initialValue = ENTRY.defaultValue,
  historyLimit = 32,
): PressureRingScaleLedgerRuntimeState => ({
  key: "pulse.pressureRing.scale",
  currentValue: clamp(initialValue, ENTRY.min, ENTRY.max),
  defaultValue: ENTRY.defaultValue,
  min: ENTRY.min,
  max: ENTRY.max,
  rollbackClass: "immediate",
  seq: 0,
  historyLimit: Math.max(1, Math.floor(historyLimit)),
  history: [],
  lastAppliedTick: -1,
  lastAppliedSource: "runtime_policy",
  lastAppliedReason: "bootstrap",
  lastAppliedRollbackToken: null,
  lastRollbackTick: -1,
  lastRollbackSource: "runtime_policy",
  lastRollbackReason: "bootstrap",
  lastRollbackToken: null,
});

export const snapshotPressureRingScaleLedgerRuntime = (
  state: PressureRingScaleLedgerRuntimeState,
): PressureRingScaleLedgerRuntimeSnapshot => ({
  key: state.key,
  currentValue: state.currentValue,
  defaultValue: state.defaultValue,
  min: state.min,
  max: state.max,
  rollbackClass: state.rollbackClass,
  historyDepth: state.history.length,
  lastAppliedTick: state.lastAppliedTick,
  lastAppliedSource: state.lastAppliedSource,
  lastAppliedReason: state.lastAppliedReason,
  lastAppliedRollbackToken: state.lastAppliedRollbackToken,
  lastRollbackTick: state.lastRollbackTick,
  lastRollbackSource: state.lastRollbackSource,
  lastRollbackReason: state.lastRollbackReason,
  lastRollbackToken: state.lastRollbackToken,
});

export const applyPressureRingScaleLedgerRuntimeUpdate = (
  state: PressureRingScaleLedgerRuntimeState,
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): PressureRingScaleLedgerApplyResult => {
  const previousValue = state.currentValue;
  const nextValue = clamp(update.value, state.min, state.max);
  if (nextValue === previousValue) {
    return {
      status: "noop",
      changed: false,
      previousValue,
      nextValue,
      mutation: null,
      state: {
        ...state,
        history: cloneHistory(state.history),
      },
    };
  }

  const tick = update.tick === undefined
    ? 0
    : Math.max(0, Math.floor(update.tick));
  const source = (update.source ?? "runtime").trim() || "runtime";
  const reason = (update.reason ?? "ledger_apply").trim() || "ledger_apply";
  const rollbackToken = `${state.key}@${tick}:${
    String(state.seq + 1).padStart(4, "0")
  }`;
  const mutation: PressureRingScaleLedgerRuntimeEvent = {
    rollbackToken,
    previousValue,
    nextValue,
    tick,
    source,
    reason,
    rolledBackAtTick: null,
    rolledBackSource: null,
    rolledBackReason: null,
  };
  const history = [mutation, ...cloneHistory(state.history)].slice(
    0,
    state.historyLimit,
  );
  return {
    status: "applied",
    changed: true,
    previousValue,
    nextValue,
    mutation,
    state: {
      ...state,
      currentValue: nextValue,
      seq: state.seq + 1,
      history,
      lastAppliedTick: tick,
      lastAppliedSource: source,
      lastAppliedReason: reason,
      lastAppliedRollbackToken: rollbackToken,
    },
  };
};

export const rollbackPressureRingScaleLedgerRuntimeUpdate = (
  state: PressureRingScaleLedgerRuntimeState,
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): PressureRingScaleLedgerRollbackResult => {
  const rollbackToken = rollback.rollbackToken.trim();
  const previousValue = state.currentValue;
  if (rollbackToken.length === 0) {
    return {
      status: "missing",
      changed: false,
      previousValue,
      nextValue: previousValue,
      mutation: null,
      state: {
        ...state,
        history: cloneHistory(state.history),
      },
    };
  }

  const history = cloneHistory(state.history);
  const idx = history.findIndex((event) =>
    event.rollbackToken === rollbackToken
  );
  if (idx === -1) {
    return {
      status: "missing",
      changed: false,
      previousValue,
      nextValue: previousValue,
      mutation: null,
      state: {
        ...state,
        history,
      },
    };
  }

  const target = history[idx];
  if (target.rolledBackAtTick !== null) {
    return {
      status: "consumed",
      changed: false,
      previousValue,
      nextValue: previousValue,
      mutation: { ...target },
      state: {
        ...state,
        history,
      },
    };
  }

  const latestActive = history.find((event) => event.rolledBackAtTick === null);
  if (!latestActive || latestActive.rollbackToken !== rollbackToken) {
    return {
      status: "stale",
      changed: false,
      previousValue,
      nextValue: previousValue,
      mutation: { ...target },
      state: {
        ...state,
        history,
      },
    };
  }

  const tick = rollback.tick === undefined
    ? target.tick
    : Math.max(0, Math.floor(rollback.tick));
  const source = (rollback.source ?? "runtime").trim() || "runtime";
  const reason = (rollback.reason ?? "ledger_rollback").trim() ||
    "ledger_rollback";

  history[idx] = {
    ...target,
    rolledBackAtTick: tick,
    rolledBackSource: source,
    rolledBackReason: reason,
  };
  return {
    status: "rolled_back",
    changed: true,
    previousValue,
    nextValue: target.previousValue,
    mutation: { ...history[idx] },
    state: {
      ...state,
      currentValue: target.previousValue,
      history,
      lastRollbackTick: tick,
      lastRollbackSource: source,
      lastRollbackReason: reason,
      lastRollbackToken: rollbackToken,
    },
  };
};

export const resetPressureRingScaleLedgerRuntime = (
  state: PressureRingScaleLedgerRuntimeState,
  reason = "reset",
): PressureRingScaleLedgerRuntimeState => ({
  ...createPressureRingScaleLedgerRuntime(
    state.defaultValue,
    state.historyLimit,
  ),
  lastAppliedSource: "runtime_policy",
  lastAppliedReason: reason,
  lastRollbackSource: "runtime_policy",
  lastRollbackReason: reason,
});
