// i.L99.core.IO_FLOW.ts
// OMEGA-64 | IO_FLOW (I → O → I)

import { GLIDER_LITE } from "./i.L99.core.GLIDER_LITE.ts";
import type { GateRunnerTickOutput } from "./i.L32.core.GATE_RUNNER.ts";
import type {
  DeltaProposal,
  GateConfig,
  StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import type {
  ReplayAuditOptions,
  ReplayGenesis,
  ReplayInvariantReport,
} from "./i.L99.core.REPLAY_AUDIT.ts";

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
