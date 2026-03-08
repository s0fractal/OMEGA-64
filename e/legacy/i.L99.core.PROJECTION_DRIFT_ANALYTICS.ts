// i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts
// OMEGA-64 | Projection Drift Analytics
// Computes per-tick and per-level drift in deterministic projection space.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";
import {
  REPLAY_AUDIT,
  ReplayAuditResult,
  ReplayGenesis,
} from "./i.L99.core.REPLAY_AUDIT.ts";
import { TOPOLOGICAL_SIGNATURE } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";
import { I16_CLAMP } from "./i.L00.core.I16_CLAMP.ts";

export interface ProjectionDriftAnalyticsOptions {
  startTick?: number;
  endTick?: number;
  requireReplayGreen?: boolean;
  verifyTopologicalSignatures?: boolean;
  topLevels?: number;
}

export interface ProjectionDriftTimelinePoint {
  tick: number;
  l1_total: number;
  l1_mean: number;
  dominant_level: number;
  dominant_value: number;
  level_abs_drift: number[];
}

export interface ProjectionDriftLevelStats {
  level: number;
  mean_abs_drift: number;
  p95_abs_drift: number;
}

export interface ProjectionDriftAnalyticsReport {
  ok: boolean;
  startTick?: number;
  endTick?: number;
  eventsAnalyzed: number;
  levelCount: number;
  driftByLevelMean: number[];
  driftByLevelP95: number[];
  driftSlopeByLevelMean: number[];
  driftSlopeByLevelP95: number[];
  topHotLevels: ProjectionDriftLevelStats[];
  timeline: ProjectionDriftTimelinePoint[];
  replayAudit: {
    replayGreen: boolean;
    checkedEvents: number;
    checkedProjectionEvents: number;
  };
  failures: string[];
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const expectedStateHash = async (
  nextState: Int16Array,
  nextTick: number,
  gateConfigVersion: string,
  proposalDigest: string,
): Promise<string> =>
  await sha256Hex(stableStringify({
    state_i16: Array.from(nextState),
    tick: nextTick,
    gate_config_version: gateConfigVersion,
    proposal_digest: proposalDigest,
  }));

const saturatingAdd = (
  base: Int16Array,
  delta: Array<{ level: number; value: number }>,
): Int16Array => {
  const next = new Int16Array(base.length);
  next.set(base);
  for (const d of delta) {
    if (!Number.isInteger(d.level) || d.level < 0 || d.level >= next.length) {
      continue;
    }
    const value = next[d.level] + d.value;
    next[d.level] = I16_CLAMP(value);
  }
  return next;
};

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(p * sorted.length) - 1),
  );
  return sorted[idx];
};

const collectLedgerEvents = async (
  startTick?: number,
  endTick?: number,
): Promise<LedgerEvent[]> => {
  const byTick = new Map<number, LedgerEvent>();
  for await (const entry of LEDGER.readAll()) {
    const inStart = startTick === undefined || entry.tick >= startTick;
    const inEnd = endTick === undefined || entry.tick <= endTick;
    if (!inStart || !inEnd) continue;
    if (entry.state_after_hash === entry.state_before_hash) continue;
    byTick.set(entry.tick, entry);
  }
  return Array.from(byTick.values()).sort((a, b) => a.tick - b.tick);
};

const toThread = (stateHash: string, state_i16: Int16Array): Int16Array => {
  const organism = TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
    state_hash: stateHash,
    state_i16,
  });
  const rgba = TOPOLOGICAL_SIGNATURE.project2D(
    organism,
    TOPOLOGICAL_SIGNATURE.CANONICAL_2D_OPTIONS,
  );
  return TOPOLOGICAL_SIGNATURE.projectThread1D(
    rgba,
    TOPOLOGICAL_SIGNATURE.CANONICAL_2D_OPTIONS.resolution,
    TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG,
  );
};

export const PROJECTION_DRIFT_ANALYTICS = {
  analyze: async (
    genesis: ReplayGenesis,
    options: ProjectionDriftAnalyticsOptions = {},
  ): Promise<ProjectionDriftAnalyticsReport> => {
    const failures: string[] = [];
    const replayAudit: ReplayAuditResult = await REPLAY_AUDIT.audit(genesis, {
      runs: 1,
      startTick: options.startTick,
      endTick: options.endTick,
      verifyTopologicalSignatures: options.verifyTopologicalSignatures ?? true,
    });

    if ((options.requireReplayGreen ?? true) && !replayAudit.replayGreen) {
      failures.push("REPLAY_AUDIT_NOT_GREEN");
      failures.push(...replayAudit.failures);
      return {
        ok: false,
        startTick: options.startTick,
        endTick: options.endTick,
        eventsAnalyzed: 0,
        levelCount: TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG.radial_bins,
        driftByLevelMean: [],
        driftByLevelP95: [],
        driftSlopeByLevelMean: [],
        driftSlopeByLevelP95: [],
        topHotLevels: [],
        timeline: [],
        replayAudit: {
          replayGreen: replayAudit.replayGreen,
          checkedEvents: replayAudit.checkedEvents,
          checkedProjectionEvents: replayAudit.checkedProjectionEvents,
        },
        failures,
      };
    }

    const events = await collectLedgerEvents(
      options.startTick,
      options.endTick,
    );
    const R = TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG.radial_bins;
    const A = TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG.angular_bins;

    const levelSeries: number[][] = Array.from({ length: R }, () => []);
    const timeline: ProjectionDriftTimelinePoint[] = [];

    let state: Int16Array = new Int16Array(genesis.state_i16.length);
    state.set(genesis.state_i16);
    let stateHash = genesis.state_hash;
    let tick = genesis.tick;
    let currentThread: Int16Array = toThread(stateHash, state);

    for (const evt of events) {
      if (evt.tick !== tick) {
        failures.push(
          `TICK_CONTINUITY_MISMATCH: expected ${tick}, got ${evt.tick}`,
        );
        break;
      }
      if (evt.state_before_hash !== stateHash) {
        failures.push(`STATE_HASH_MISMATCH_AT_TICK_${evt.tick}`);
        break;
      }

      const nextState = saturatingAdd(state, evt.accepted_delta);
      const nextTick = tick + 1;
      const expectedHash = await expectedStateHash(
        nextState,
        nextTick,
        evt.gate_config_version,
        evt.proposal_digest,
      );
      if (evt.state_after_hash !== expectedHash) {
        failures.push(`STATE_AFTER_HASH_MISMATCH_AT_TICK_${evt.tick}`);
        break;
      }

      const nextThread = toThread(expectedHash, nextState);
      const levelAbs: number[] = new Array(R).fill(0);

      let l1Total = 0;
      for (let r = 0; r < R; r++) {
        let sumAbs = 0;
        for (let a = 0; a < A; a++) {
          const idx = r * A + a;
          const d = nextThread[idx] - currentThread[idx];
          sumAbs += Math.abs(d);
        }
        const meanAbs = sumAbs / A;
        levelAbs[r] = meanAbs;
        levelSeries[r].push(meanAbs);
        l1Total += sumAbs;
      }

      let dominantLevel = 0;
      let dominantValue = levelAbs[0] ?? 0;
      for (let r = 1; r < R; r++) {
        if (levelAbs[r] > dominantValue) {
          dominantValue = levelAbs[r];
          dominantLevel = r;
        }
      }

      timeline.push({
        tick: evt.tick,
        l1_total: l1Total,
        l1_mean: l1Total / (R * A),
        dominant_level: dominantLevel,
        dominant_value: dominantValue,
        level_abs_drift: levelAbs,
      });

      state = nextState;
      stateHash = expectedHash;
      tick = nextTick;
      currentThread = nextThread;
    }

    const driftByLevelMean = levelSeries.map((s) =>
      s.length > 0 ? s.reduce((acc, v) => acc + v, 0) / s.length : 0
    );
    const driftByLevelP95 = levelSeries.map((s) => percentile(s, 0.95));
    const driftSlopeSeries = levelSeries.map((series) => {
      const slopes: number[] = [];
      for (let i = 1; i < series.length; i++) {
        slopes.push(Math.abs(series[i] - series[i - 1]));
      }
      return slopes;
    });
    const driftSlopeByLevelMean = driftSlopeSeries.map((s) =>
      s.length > 0 ? s.reduce((acc, v) => acc + v, 0) / s.length : 0
    );
    const driftSlopeByLevelP95 = driftSlopeSeries.map((s) =>
      percentile(s, 0.95)
    );

    const topN = Math.max(1, options.topLevels ?? 8);
    const topHotLevels: ProjectionDriftLevelStats[] = driftByLevelMean
      .map((mean, level) => ({
        level,
        mean_abs_drift: mean,
        p95_abs_drift: driftByLevelP95[level],
      }))
      .sort((a, b) => b.mean_abs_drift - a.mean_abs_drift)
      .slice(0, topN);

    return {
      ok: failures.length === 0,
      startTick: options.startTick,
      endTick: options.endTick,
      eventsAnalyzed: timeline.length,
      levelCount: R,
      driftByLevelMean,
      driftByLevelP95,
      driftSlopeByLevelMean,
      driftSlopeByLevelP95,
      topHotLevels,
      timeline,
      replayAudit: {
        replayGreen: replayAudit.replayGreen,
        checkedEvents: replayAudit.checkedEvents,
        checkedProjectionEvents: replayAudit.checkedProjectionEvents,
      },
      failures,
    };
  },
};
