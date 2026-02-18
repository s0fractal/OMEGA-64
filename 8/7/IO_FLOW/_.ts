// i.L99.core.IO_FLOW.ts
// OMEGA-64 | IO_FLOW (I → O → I)

import { GLIDER_LITE_GLIDER_LITE as GLIDER_LITE } from "@omega";
import type { GATE_RUNNER_GateRunnerTickOutput as GateRunnerTickOutput } from "@omega";
import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal, STATE_SNAPSHOT_GateConfig as GateConfig, STATE_SNAPSHOT_StateSnapshot as StateSnapshot } from "@omega";
import type { REPLAY_AUDIT__08_00_ReplayAuditOptions as ReplayAuditOptions, REPLAY_AUDIT__08_00_ReplayGenesis as ReplayGenesis, REPLAY_AUDIT__08_00_ReplayInvariantReport as ReplayInvariantReport } from "@omega";

export type IOFlowInput = {
  state: StateSnapshot;
  output_stream: DeltaProposal[];
  config: GateConfig;
  mode?: "REPLAY_CONTEXT" | "INVARIANT_CONTEXT";
  replayGenesis?: ReplayGenesis;
  replayAuditOptions?: ReplayAuditOptions;
  invariantReport?: ReplayInvariantReport;
  witness?: string;
};

export const IO_FLOW = (input: IOFlowInput): Promise<GateRunnerTickOutput> =>
  GLIDER_LITE({
    state: input.state,
    proposals: input.output_stream,
    config: input.config,
    mode: input.mode,
    replayGenesis: input.replayGenesis,
    replayAuditOptions: input.replayAuditOptions,
    invariantReport: input.invariantReport,
    witness: input.witness,
  });
