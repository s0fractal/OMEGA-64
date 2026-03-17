---
type: module
id: GENERIC_LEDGER_SYSTEM
description: >
  Core definitions and state transitions for the Generic Ledger System. Provides
  types and functions for managing `LedgerRuntimeEvent`, `LedgerRuntimeState`,
  and applying/rolling back ledger updates.
tags:
  - substrate
  - ledger
deps:
  - GENETIC_LEDGER
  - TYPES
vars:
  - geneticLedgerEntryByKey
  - LedgerRuntimeEvent
  - LedgerRuntimeState
  - LedgerRuntimeSnapshot
  - LedgerApplyResult
  - LedgerRollbackResult
  - LedgerRuntimeConfig
extra_symbols:
  - GENERIC_LEDGER_SYSTEM
  - applyLedgerUpdate
  - createGeneticLedgerRuntime
  - createLedgerRuntime
  - rollbackLedgerUpdate
  - snapshotLedgerRuntime
---

# `GENERIC_LEDGER_SYSTEM`

This module provides the core types and functions for the Generic Ledger System.

```typescript





const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const createLedgerRuntime = <K extends string>(
  config: LedgerRuntimeConfig<K>,
  initialValue?: number,
  historyLimit = 32,
): LedgerRuntimeState<K> => {
  const val = initialValue === undefined ? config.defaultValue : initialValue;
  return {
    key: config.key,
    currentValue: clamp(val, config.min, config.max),
    defaultValue: config.defaultValue,
    min: config.min,
    max: config.max,
    rollbackClass: config.rollbackClass,
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
  };
};

export const applyLedgerUpdate = <K extends string>(
  state: LedgerRuntimeState<K>,
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): LedgerApplyResult<K> => {
  const previousValue = state.currentValue;
  const nextValue = clamp(update.value, state.min, state.max);
  if (nextValue === previousValue) {
    return {
      status: "noop",
      changed: false,
      previousValue,
      nextValue,
      mutation: null,
      state,
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
  const mutation: LedgerRuntimeEvent<K> = {
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
  const history = [mutation, ...state.history].slice(
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

export const rollbackLedgerUpdate = <K extends string>(
  state: LedgerRuntimeState<K>,
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): LedgerRollbackResult<K> => {
  const rollbackToken = rollback.rollbackToken.trim();
  const previousValue = state.currentValue;
  if (!rollbackToken) {
    return {
      status: "missing",
      changed: false,
      previousValue,
      nextValue: previousValue,
      mutation: null,
      state,
    };
  }

  const history = [...state.history];
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
      state,
    };
  }

  const target = history[idx];
  if (target.rolledBackAtTick !== null) {
    return {
      status: "consumed",
      changed: false,
      previousValue,
      nextValue: previousValue,
      mutation: target,
      state,
    };
  }

  const latestActive = history.find((event) => event.rolledBackAtTick === null);
  if (!latestActive || latestActive.rollbackToken !== rollbackToken) {
    return {
      status: "stale",
      changed: false,
      previousValue,
      nextValue: previousValue,
      mutation: target,
      state,
    };
  }

  const tick = rollback.tick === undefined
    ? 0
    : Math.max(0, Math.floor(rollback.tick));
  const source = (rollback.source ?? "runtime").trim() || "runtime";
  const reason = (rollback.reason ?? "ledger_rollback").trim() ||
    "ledger_rollback";
  const nextValue = clamp(target.previousValue, state.min, state.max);
  const updatedMutation: LedgerRuntimeEvent<K> = {
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
    mutation: updatedMutation,
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

export const snapshotLedgerRuntime = <K extends string>(
  state: LedgerRuntimeState<K>,
): LedgerRuntimeSnapshot<K> => ({
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

export const createGeneticLedgerRuntime = <K extends GeneticLedgerKey>(
  key: K,
  initialValue?: number,
  historyLimit = 32,
): LedgerRuntimeState<K> => {
  const entry = geneticLedgerEntryByKey(key);
  if (!entry) {
    throw new Error(`[GENERIC_LEDGER_SYSTEM] missing ${key} entry`);
  }
  return createLedgerRuntime(
    entry as unknown as LedgerRuntimeConfig<K>,
    initialValue,
    historyLimit,
  );
};

export const GENERIC_LEDGER_SYSTEM = {
  createLedgerRuntime,
  applyLedgerUpdate,
  rollbackLedgerUpdate,
  snapshotLedgerRuntime,
};
```
