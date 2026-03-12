// i.L99.core.PROJECTION_REPLAY_REPORT.ts
// OMEGA-64 | Projection Replay Report
// Per-tick projection verification report for crystallization diagnostics.

import {
  ProjectionTickReport,
  REPLAY_AUDIT,
  ReplayGenesis,
} from "./i.L99.core.REPLAY_AUDIT.ts";

export interface ProjectionReplayReport {
  ok: boolean;
  startTick?: number;
  endTick?: number;
  totalTicks: number;
  passCount: number;
  failCount: number;
  skipCount: number;
  ticks: ProjectionTickReport[];
  failures: string[];
}

export interface ProjectionReplayReportOptions {
  startTick?: number;
  endTick?: number;
  verifyTopologicalSignatures?: boolean;
}

export const PROJECTION_REPLAY_REPORT = {
  generate: async (
    genesis: ReplayGenesis,
    options: ProjectionReplayReportOptions = {},
  ): Promise<ProjectionReplayReport> => {
    const audit = await REPLAY_AUDIT.audit(genesis, {
      runs: 1,
      startTick: options.startTick,
      endTick: options.endTick,
      verifyTopologicalSignatures: options.verifyTopologicalSignatures ?? true,
    });

    const passCount =
      audit.projectionTickReport.filter((x) => x.status === "PASS").length;
    const failCount =
      audit.projectionTickReport.filter((x) => x.status === "FAIL").length;
    const skipCount =
      audit.projectionTickReport.filter((x) => x.status === "SKIP").length;

    return {
      ok: failCount === 0,
      startTick: options.startTick,
      endTick: options.endTick,
      totalTicks: audit.projectionTickReport.length,
      passCount,
      failCount,
      skipCount,
      ticks: audit.projectionTickReport,
      failures: audit.failures,
    };
  },
};
