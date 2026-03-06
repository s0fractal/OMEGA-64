import { geneticLedgerEntryByKey } from "./GENETIC_LEDGER.ts";

const TARGET_ENERGY_ENTRY = geneticLedgerEntryByKey(
  "pulse.homeostasis.targetEnergy",
);
if (!TARGET_ENERGY_ENTRY) {
  throw new Error(
    "[HOMEOSTASIS_TARGET_LEDGER_RUNTIME] missing pulse.homeostasis.targetEnergy entry",
  );
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export type TargetEnergyLedgerRuntimeEvent = {
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

export type TargetEnergyLedgerRuntimeState = {
  key: "pulse.homeostasis.targetEnergy";
  currentValue: number;
  defaultValue: number;
  min: number;
  max: number;
  rollbackClass: "immediate";
  seq: number;
  historyLimit: number;
  history: readonly TargetEnergyLedgerRuntimeEvent[];
  lastAppliedTick: number;
  lastAppliedSource: string;
  lastAppliedReason: string;
  lastAppliedRollbackToken: string | null;
  lastRollbackTick: number;
  lastRollbackSource: string;
  lastRollbackReason: string;
  lastRollbackToken: string | null;
};

export type TargetEnergyLedgerRuntimeSnapshot = {
  key: "pulse.homeostasis.targetEnergy";
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

export type TargetEnergyLedgerApplyResult = {
  status: "applied" | "noop";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: TargetEnergyLedgerRuntimeEvent | null;
  state: TargetEnergyLedgerRuntimeState;
};

export type TargetEnergyLedgerRollbackResult = {
  status: "rolled_back" | "missing" | "consumed" | "stale";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: TargetEnergyLedgerRuntimeEvent | null;
  state: TargetEnergyLedgerRuntimeState;
};

const cloneHistory = (
  history: readonly TargetEnergyLedgerRuntimeEvent[],
): TargetEnergyLedgerRuntimeEvent[] => history.map((event) => ({ ...event }));

export const createTargetEnergyLedgerRuntime = (
  initialValue = TARGET_ENERGY_ENTRY.defaultValue,
  historyLimit = 32,
): TargetEnergyLedgerRuntimeState => ({
  key: "pulse.homeostasis.targetEnergy",
  currentValue: clamp(
    initialValue,
    TARGET_ENERGY_ENTRY.min,
    TARGET_ENERGY_ENTRY.max,
  ),
  defaultValue: TARGET_ENERGY_ENTRY.defaultValue,
  min: TARGET_ENERGY_ENTRY.min,
  max: TARGET_ENERGY_ENTRY.max,
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

export const snapshotTargetEnergyLedgerRuntime = (
  state: TargetEnergyLedgerRuntimeState,
): TargetEnergyLedgerRuntimeSnapshot => ({
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

export const applyTargetEnergyLedgerRuntimeUpdate = (
  state: TargetEnergyLedgerRuntimeState,
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): TargetEnergyLedgerApplyResult => {
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
  const mutation: TargetEnergyLedgerRuntimeEvent = {
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

export const rollbackTargetEnergyLedgerRuntimeUpdate = (
  state: TargetEnergyLedgerRuntimeState,
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): TargetEnergyLedgerRollbackResult => {
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
  const updatedMutation: TargetEnergyLedgerRuntimeEvent = {
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

export const resetTargetEnergyLedgerRuntime = (
  state: TargetEnergyLedgerRuntimeState,
  reason = "reset",
): TargetEnergyLedgerRuntimeState => ({
  ...createTargetEnergyLedgerRuntime(state.defaultValue, state.historyLimit),
  lastAppliedReason: reason,
  lastRollbackReason: reason,
});
