// i.L99.core.CRYSTALLIZATION.ts
// OMEGA-64 | Canon Protocol | Crystallization Threshold
// Evaluates measurable gates before emitting CANONIZATION_EVENT.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import {
  CanonizationEvent,
  DecrystallizationEvent,
  LedgerEvent,
  TopologyEvent,
  ViolationEvent,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import {
  REPLAY_AUDIT,
  ReplayAuditResult,
  ReplayGenesis,
} from "./i.L99.core.REPLAY_AUDIT.ts";
import {
  PROJECTION_REPLAY_REPORT,
  ProjectionReplayReport,
} from "./i.L99.core.PROJECTION_REPLAY_REPORT.ts";
import {
  PROJECTION_DRIFT_ANALYTICS,
  ProjectionDriftAnalyticsReport,
} from "./i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts";
import {
  GATE_ADMISSION_REPORT,
  GateAdmissionReport,
} from "./i.L99.core.GATE_ADMISSION_REPORT.ts";
import { CHECKPOINT } from "./i.L99.core.CHECKPOINT.ts";
import {
  CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_POLICY,
} from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import {
  CRYSTALLIZATION_REPORT,
  CrystallizationReport,
} from "./i.L99.core.CRYSTALLIZATION_REPORT.ts";

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort((
      [a],
      [b],
    ) => a.localeCompare(b));
    return `{${
      entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
        .join(",")
    }}`;
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

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return Infinity;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(p * sorted.length) - 1),
  );
  return sorted[idx];
};

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const absDeltaSum = (evt: LedgerEvent): number =>
  evt.accepted_delta.reduce((sum, d) => sum + Math.abs(d.value), 0);

const isViolationEvent = (entry: TopologyEvent): entry is ViolationEvent =>
  "event_type" in entry && entry.event_type === "VIOLATION_EVENT";

const isLedgerEvent = (entry: TopologyEvent): entry is LedgerEvent =>
  !("event_type" in entry) && Array.isArray(entry.accepted_delta);

const isCanonizationEvent = (
  entry: TopologyEvent,
): entry is CanonizationEvent =>
  "event_type" in entry && entry.event_type === "CANONIZATION_EVENT";

const hasTick = (
  entry: TopologyEvent,
): entry is TopologyEvent & { tick: number } =>
  "tick" in entry && typeof entry.tick === "number";

interface WindowResult {
  hardPass: boolean;
  softPasses: number;
  proposalDigests: string[];
}

interface EvaluateOptions {
  replayGreen?: boolean;
  requiredWindows?: number;
  witness?: string;
  windowSize?: number;
  crystallizationReportVersion?: string;
  crystallizationReportHash?: string;
  crystallizationReportUri?: string;
  gateAdmissionReportVersion?: string;
  gateAdmissionReportHash?: string;
  gateAdmissionReportUri?: string;
}

interface EvaluateWithAuditOptions extends EvaluateOptions {
  replayRuns?: number;
  replayStartTick?: number;
  projectionDriftMaxP95?: number;
  projectionDriftSlopeMaxP95?: number;
  projectionDriftTopLevels?: number;
  gateAdmissionOutOfPhasePressureMaxMean?: number;
  gateAdmissionMinCoherenceCoverage?: number;
  gateAdmissionTopAgents?: number;
}

interface EnforceOptions {
  windowSize?: number;
  witness?: string;
}

export const CRYSTALLIZATION = {
  WINDOW: CRYSTALLIZATION_CONFIG.window,
  MIN_SOFT_PASSES: CRYSTALLIZATION_CONFIG.minSoftPasses,
  DEFAULT_REQUIRED_WINDOWS: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,

  evaluate: async (
    currentTick: number,
    artifactHash: string,
    stateHash: string,
    options: EvaluateOptions = {},
  ): Promise<boolean> => {
    const replayGreen = options.replayGreen ?? false;
    const requiredWindows = options.requiredWindows ??
      CRYSTALLIZATION.DEFAULT_REQUIRED_WINDOWS;
    const windowSize = options.windowSize ?? CRYSTALLIZATION.WINDOW;

    const entries: TopologyEvent[] = [];
    for await (const entry of LEDGER.readAllRaw()) {
      entries.push(entry);
    }

    const passedDigests: string[] = [];
    for (let w = 0; w < requiredWindows; w++) {
      const endTick = currentTick - (w * windowSize);
      const startTick = endTick - windowSize + 1;
      const result = CRYSTALLIZATION.evaluateWindow(
        entries,
        startTick,
        endTick,
      );

      if (!result.hardPass) {
        return false;
      }
      if (result.softPasses < CRYSTALLIZATION.MIN_SOFT_PASSES) {
        return false;
      }
      passedDigests.push(...result.proposalDigests);
    }

    if (!replayGreen) {
      return false;
    }

    const proposalDigest = await sha256Hex(
      stableStringify([...passedDigests].sort()),
    );
    const policyHash = await CRYSTALLIZATION_POLICY.hash();
    const canonEvent: CanonizationEvent = {
      event_type: "CANONIZATION_EVENT",
      artifact_hash: artifactHash,
      state_hash: stateHash,
      proposal_digest: proposalDigest,
      checkpoint_tick: currentTick,
      window: windowSize,
      hard_gates: "PASS",
      soft_gates_passed: 6,
      policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
      policy_hash: policyHash,
      crystallization_report_version: options.crystallizationReportVersion,
      crystallization_report_hash: options.crystallizationReportHash,
      crystallization_report_uri: options.crystallizationReportUri,
      gate_admission_report_version: options.gateAdmissionReportVersion,
      gate_admission_report_hash: options.gateAdmissionReportHash,
      gate_admission_report_uri: options.gateAdmissionReportUri,
      witness: options.witness,
    };

    await LEDGER.append(canonEvent);
    return true;
  },

  evaluateWithAudit: async (
    currentTick: number,
    artifactHash: string,
    stateHash: string,
    replayGenesis: ReplayGenesis,
    options: EvaluateWithAuditOptions = {},
  ): Promise<{
    crystallized: boolean;
    audit: ReplayAuditResult;
    projectionReport: ProjectionReplayReport;
    driftReport: ProjectionDriftAnalyticsReport;
    projectionDriftGatePass: boolean;
    gateAdmissionReport: GateAdmissionReport;
    gateAdmissionGatePass: boolean;
    gateAdmissionReportHash: string;
    gateAdmissionReportUri: string;
    crystallizationReport: CrystallizationReport;
    crystallizationReportHash: string;
    crystallizationReportUri: string;
  }> => {
    const requiredWindows = options.requiredWindows ??
      CRYSTALLIZATION.DEFAULT_REQUIRED_WINDOWS;
    const windowSize = options.windowSize ?? CRYSTALLIZATION.WINDOW;
    const replayStartTick = options.replayStartTick ?? Math.max(
      replayGenesis.tick,
      currentTick - (requiredWindows * windowSize) + 1,
    );

    const audit = await REPLAY_AUDIT.audit(replayGenesis, {
      runs: options.replayRuns ?? 3,
      startTick: replayStartTick,
      endTick: currentTick,
      verifyLedgerChain: CRYSTALLIZATION_CONFIG.verifyLedgerChain,
    });
    const projectionReport = await PROJECTION_REPLAY_REPORT.generate(
      replayGenesis,
      {
        startTick: replayStartTick,
        endTick: currentTick,
        verifyTopologicalSignatures: true,
      },
    );
    const driftReport = await PROJECTION_DRIFT_ANALYTICS.analyze(
      replayGenesis,
      {
        startTick: replayStartTick,
        endTick: currentTick,
        requireReplayGreen: true,
        verifyTopologicalSignatures: true,
        topLevels: options.projectionDriftTopLevels ??
          CRYSTALLIZATION_CONFIG.projectionDriftTopLevels,
      },
    );
    const projectionDriftMaxP95 = options.projectionDriftMaxP95 ??
      CRYSTALLIZATION_CONFIG.projectionDriftMaxP95;
    const projectionDriftSlopeMaxP95 = options.projectionDriftSlopeMaxP95 ??
      CRYSTALLIZATION_CONFIG.projectionDriftSlopeMaxP95;
    const projectionDriftP95 = driftReport.driftByLevelP95.length > 0
      ? Math.max(...driftReport.driftByLevelP95)
      : 0;
    const projectionDriftSlopeP95 = driftReport.driftSlopeByLevelP95.length > 0
      ? Math.max(...driftReport.driftSlopeByLevelP95)
      : 0;
    const projectionDriftGatePass = driftReport.ok &&
      projectionDriftP95 <= projectionDriftMaxP95 &&
      projectionDriftSlopeP95 <= projectionDriftSlopeMaxP95;
    const gateAdmissionOutOfPhasePressureMaxMean =
      options.gateAdmissionOutOfPhasePressureMaxMean ??
        CRYSTALLIZATION_CONFIG.gateAdmissionOutOfPhasePressureMaxMean;
    const gateAdmissionMinCoherenceCoverage =
      options.gateAdmissionMinCoherenceCoverage ??
        CRYSTALLIZATION_CONFIG.gateAdmissionMinCoherenceCoverage;
    const { report: gateAdmissionReport, reportHash: gateAdmissionReportHash } =
      await GATE_ADMISSION_REPORT.generateWithHash({
        startTick: replayStartTick,
        endTick: currentTick,
        topAgents: options.gateAdmissionTopAgents ??
          CRYSTALLIZATION_CONFIG.gateAdmissionTopAgents,
      });
    const gateAdmissionMaterialized = await GATE_ADMISSION_REPORT.materialize(
      gateAdmissionReport,
      gateAdmissionReportHash,
      { tick_anchor: currentTick, witness: options.witness },
    );
    const gateAdmissionReportUri = gateAdmissionMaterialized.path;
    const gateAdmissionGatePass = gateAdmissionReport.ok &&
      gateAdmissionReport.coherenceCoverage >=
        gateAdmissionMinCoherenceCoverage &&
      (
        gateAdmissionReport.outOfPhasePressureMean === undefined ||
        gateAdmissionReport.outOfPhasePressureMean <=
          gateAdmissionOutOfPhasePressureMaxMean
      );
    const projectionHardGatePass = projectionReport.failCount === 0;
    const {
      report: crystallizationReport,
      reportHash: crystallizationReportHash,
    } = await CRYSTALLIZATION_REPORT.buildWithHash({
      artifact_hash: artifactHash,
      state_hash: stateHash,
      current_tick: currentTick,
      replay_start_tick: replayStartTick,
      replay_end_tick: currentTick,
      replay_audit: audit,
      projection_report: projectionReport,
      drift_report: driftReport,
      projection_drift_gate_pass: projectionDriftGatePass,
      projection_drift_max_p95: projectionDriftMaxP95,
      projection_drift_slope_max_p95: projectionDriftSlopeMaxP95,
      gate_admission_report: gateAdmissionReport,
      gate_admission_gate_pass: gateAdmissionGatePass,
      gate_admission_report_hash: gateAdmissionReportHash,
      gate_admission_report_uri: gateAdmissionReportUri,
      gate_admission_out_of_phase_pressure_max_mean:
        gateAdmissionOutOfPhasePressureMaxMean,
      gate_admission_min_coherence_coverage: gateAdmissionMinCoherenceCoverage,
    });
    const materialized = await CRYSTALLIZATION_REPORT.materialize(
      crystallizationReport,
      crystallizationReportHash,
      {
        tick: currentTick,
        artifact_hash: artifactHash,
        state_hash: stateHash,
        witness: options.witness,
      },
    );
    const crystallizationReportUri = materialized.path;

    const crystallized = await CRYSTALLIZATION.evaluate(
      currentTick,
      artifactHash,
      stateHash,
      {
        // Hard gate: projection replay must be clean.
        replayGreen: audit.replayGreen &&
          projectionHardGatePass &&
          projectionDriftGatePass &&
          gateAdmissionGatePass,
        requiredWindows,
        windowSize,
        crystallizationReportVersion: CRYSTALLIZATION_REPORT.VERSION,
        crystallizationReportHash,
        crystallizationReportUri,
        gateAdmissionReportVersion: GATE_ADMISSION_REPORT.VERSION,
        gateAdmissionReportHash,
        gateAdmissionReportUri,
        witness: options.witness,
      },
    );

    return {
      crystallized,
      audit,
      projectionReport,
      driftReport,
      projectionDriftGatePass,
      gateAdmissionReport,
      gateAdmissionGatePass,
      gateAdmissionReportHash,
      gateAdmissionReportUri,
      crystallizationReport,
      crystallizationReportHash,
      crystallizationReportUri,
    };
  },

  enforcePostCrystal: async (
    currentTick: number,
    artifactHash: string,
    options: EnforceOptions = {},
  ): Promise<
    { decrystallized: boolean; rollbackTick?: number; reason?: string }
  > => {
    const windowSize = options.windowSize ?? CRYSTALLIZATION.WINDOW;
    const entries: TopologyEvent[] = [];
    for await (const entry of LEDGER.readAllRaw()) {
      entries.push(entry);
    }

    const startTick = currentTick - windowSize + 1;
    const result = CRYSTALLIZATION.evaluateWindow(
      entries,
      startTick,
      currentTick,
    );
    if (result.hardPass) {
      return { decrystallized: false };
    }

    let rollbackTick = currentTick;
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (isCanonizationEvent(entry) && entry.artifact_hash === artifactHash) {
        rollbackTick = entry.checkpoint_tick;
        break;
      }
    }

    const reason = CRYSTALLIZATION.describeHardFailure(
      entries,
      startTick,
      currentTick,
    );
    const rollbackCheckpoint = (await CHECKPOINT.loadExact(rollbackTick)) ??
      (await CHECKPOINT.loadNearestAtOrBefore(rollbackTick));
    const decrystalEvent: DecrystallizationEvent = {
      event_type: "DECRYSTALLIZATION_EVENT",
      tick: currentTick,
      artifact_hash: artifactHash,
      reason,
      rollback_to_checkpoint: rollbackTick,
      rollback_state_hash: rollbackCheckpoint?.state_hash,
      hard_gate_failure: reason,
      witness: options.witness,
    };

    await LEDGER.append(decrystalEvent);
    return { decrystallized: true, rollbackTick, reason };
  },

  evaluateWindow: (
    entries: TopologyEvent[],
    startTick: number,
    endTick: number,
  ): WindowResult => {
    const inWindow = entries
      .filter(hasTick)
      .filter((e) => e.tick >= startTick && e.tick <= endTick);
    const violations = inWindow.filter(isViolationEvent)
      .filter((v) => v.severity === "CRITICAL");
    const events = inWindow.filter(isLedgerEvent)
      .sort((a, b) => a.tick - b.tick);

    const continuity = CRYSTALLIZATION.checkTickContinuity(
      events,
      startTick,
      endTick,
    );
    const hardPass = violations.length === 0 && continuity;

    const budgetPressure = events.map((e) => {
      const limit = e.budget_limit && e.budget_limit > 0
        ? e.budget_limit
        : Math.max(1, e.budget_used);
      return e.budget_used / limit;
    });
    const budgetP95 = percentile(budgetPressure, 0.95);
    const softBudget = budgetP95 <= 0.70;

    const driftSamples = events.flatMap((e) =>
      e.accepted_delta.map((d) => Math.abs(d.value))
    );
    const driftP95 = percentile(driftSamples, 0.95);
    const softDrift = driftP95 <= 8;

    const signFlipRate = CRYSTALLIZATION.computeSignFlipRate(events);
    const softFlip = signFlipRate <= 0.25;

    const rejected = events.reduce(
      (sum, e) => sum + e.rejected_proposals.length,
      0,
    );
    const accepted = events.reduce(
      (sum, e) => sum + e.accepted_proposals.length,
      0,
    );
    const proposalsTotal = accepted + rejected;
    const rejectionRatio = proposalsTotal > 0 ? rejected / proposalsTotal : 1;
    const softReject = rejectionRatio <= 0.30;

    const energyDensity = events.map((e) =>
      e.cost_total / Math.max(1, absDeltaSum(e))
    );
    const medEnergy = median(energyDensity);
    const p99Energy = percentile(energyDensity, 0.99);
    const softEnergy = medEnergy > 0
      ? p99Energy <= 3 * medEnergy
      : p99Energy <= 0;

    const softContinuity = continuity;

    const softPasses = [
      softBudget,
      softDrift,
      softFlip,
      softReject,
      softEnergy,
      softContinuity,
    ].filter(Boolean).length;

    return {
      hardPass,
      softPasses,
      proposalDigests: events.map((e) => e.proposal_digest),
    };
  },

  describeHardFailure: (
    entries: TopologyEvent[],
    startTick: number,
    endTick: number,
  ): string => {
    const inWindow = entries
      .filter(hasTick)
      .filter((e) => e.tick >= startTick && e.tick <= endTick);

    const violations = inWindow
      .filter(isViolationEvent)
      .filter((v) => v.severity === "CRITICAL");
    if (violations.length > 0) {
      return `CRITICAL_VIOLATION:${violations[0].rule_id}`;
    }

    const events = inWindow.filter(isLedgerEvent).sort((a, b) =>
      a.tick - b.tick
    );
    if (!CRYSTALLIZATION.checkTickContinuity(events, startTick, endTick)) {
      return "TICK_CONTINUITY_BROKEN";
    }

    return "HARD_GATE_FAILED";
  },

  checkTickContinuity: (
    events: LedgerEvent[],
    startTick: number,
    endTick: number,
  ): boolean => {
    if (events.length !== (endTick - startTick + 1)) {
      return false;
    }
    for (let i = 0; i < events.length; i++) {
      const expected = startTick + i;
      if (events[i].tick !== expected) {
        return false;
      }
    }
    return true;
  },

  computeSignFlipRate: (events: LedgerEvent[]): number => {
    const lastSign = new Map<number, number>();
    let transitions = 0;
    let flips = 0;

    for (const evt of events) {
      const byLevel = new Map<number, number>();
      for (const d of evt.accepted_delta) {
        if (d.value === 0) continue;
        byLevel.set(d.level, Math.sign(d.value));
      }
      for (const [level, sign] of byLevel.entries()) {
        const prev = lastSign.get(level);
        if (prev !== undefined) {
          transitions++;
          if (prev !== sign) {
            flips++;
          }
        }
        lastSign.set(level, sign);
      }
    }

    return transitions > 0 ? flips / transitions : 0;
  },
};
