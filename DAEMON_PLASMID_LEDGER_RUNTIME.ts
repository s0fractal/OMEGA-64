import { geneticLedgerEntryByKey } from "./GENETIC_LEDGER.ts";

const DAEMON_PLASMID_ENTRY = geneticLedgerEntryByKey(
  "daemon.maxPlasmidCharge",
);
if (!DAEMON_PLASMID_ENTRY) {
  throw new Error(
    "[DAEMON_PLASMID_LEDGER_RUNTIME] missing daemon.maxPlasmidCharge entry",
  );
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export type DaemonPlasmidLedgerRuntimeEvent = {
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

export type DaemonPlasmidLedgerRuntimeState = {
  key: "daemon.maxPlasmidCharge";
  currentValue: number;
  defaultValue: number;
  min: number;
  max: number;
  rollbackClass: "immediate";
  seq: number;
  historyLimit: number;
  history: readonly DaemonPlasmidLedgerRuntimeEvent[];
  lastAppliedTick: number;
  lastAppliedSource: string;
  lastAppliedReason: string;
  lastAppliedRollbackToken: string | null;
  lastRollbackTick: number;
  lastRollbackSource: string;
  lastRollbackReason: string;
  lastRollbackToken: string | null;
};

export type DaemonPlasmidLedgerRuntimeSnapshot = {
  key: "daemon.maxPlasmidCharge";
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

export type DaemonPlasmidLedgerApplyResult = {
  status: "applied" | "noop";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: DaemonPlasmidLedgerRuntimeEvent | null;
  state: DaemonPlasmidLedgerRuntimeState;
};

export type DaemonPlasmidLedgerRollbackResult = {
  status: "rolled_back" | "missing" | "consumed" | "stale";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: DaemonPlasmidLedgerRuntimeEvent | null;
  state: DaemonPlasmidLedgerRuntimeState;
};

const cloneHistory = (
  history: readonly DaemonPlasmidLedgerRuntimeEvent[],
): DaemonPlasmidLedgerRuntimeEvent[] => history.map((event) => ({ ...event }));

export const createDaemonPlasmidLedgerRuntime = (
  initialValue = DAEMON_PLASMID_ENTRY.defaultValue,
  historyLimit = 32,
): DaemonPlasmidLedgerRuntimeState => ({
  key: "daemon.maxPlasmidCharge",
  currentValue: clamp(
    initialValue,
    DAEMON_PLASMID_ENTRY.min,
    DAEMON_PLASMID_ENTRY.max,
  ),
  defaultValue: DAEMON_PLASMID_ENTRY.defaultValue,
  min: DAEMON_PLASMID_ENTRY.min,
  max: DAEMON_PLASMID_ENTRY.max,
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

export const snapshotDaemonPlasmidLedgerRuntime = (
  state: DaemonPlasmidLedgerRuntimeState,
): DaemonPlasmidLedgerRuntimeSnapshot => ({
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

export const applyDaemonPlasmidLedgerRuntimeUpdate = (
  state: DaemonPlasmidLedgerRuntimeState,
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): DaemonPlasmidLedgerApplyResult => {
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
  const mutation: DaemonPlasmidLedgerRuntimeEvent = {
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

export const rollbackDaemonPlasmidLedgerRuntimeUpdate = (
  state: DaemonPlasmidLedgerRuntimeState,
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): DaemonPlasmidLedgerRollbackResult => {
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
    ? 0
    : Math.max(0, Math.floor(rollback.tick));
  const source = (rollback.source ?? "runtime").trim() || "runtime";
  const reason = (rollback.reason ?? "ledger_rollback").trim() ||
    "ledger_rollback";
  const nextValue = clamp(target.previousValue, state.min, state.max);
  const updatedMutation: DaemonPlasmidLedgerRuntimeEvent = {
    ...target,
    rolledBackAtTick: tick,
    rolledBackSource: source,
    rolledBackReason: reason,
  };
  history[idx] = updatedMutation;

  return {
    status: "rolled_back",
    changed: nextValue !== previousValue,
    previousValue,
    nextValue,
    mutation: { ...updatedMutation },
    state: {
      ...state,
      currentValue: nextValue,
      history,
      lastRollbackTick: tick,
      lastRollbackSource: source,
      lastRollbackReason: reason,
      lastRollbackToken: rollbackToken,
    },
  };
};

export const resetDaemonPlasmidLedgerRuntime = (
  state: DaemonPlasmidLedgerRuntimeState,
  reason = "reset",
): DaemonPlasmidLedgerRuntimeState => ({
  ...createDaemonPlasmidLedgerRuntime(state.defaultValue, state.historyLimit),
  lastAppliedReason: reason,
  lastRollbackReason: reason,
});
