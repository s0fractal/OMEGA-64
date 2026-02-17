// i.L99.core.IO_FLOW.ts
// OMEGA-64 | IO_FLOW (I → O → I)

import { GLIDER_LITE } from "../../4/GLIDER_LITE/_.ts";
import type { GateRunnerTickOutput } from "../../../4/0/GATE_RUNNER/_.ts";
import type {
  DeltaProposal,
  GateConfig,
  StateSnapshot,
} from "../../0/STATE_SNAPSHOT/_.ts";
import type {
  ReplayAuditOptions,
  ReplayGenesis,
  ReplayInvariantReport,
} from "../../0/REPLAY_AUDIT/_.ts";

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
