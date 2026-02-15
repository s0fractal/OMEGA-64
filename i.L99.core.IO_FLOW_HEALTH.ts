// i.L99.core.IO_FLOW_HEALTH.ts
// OMEGA-64 | IO_FLOW_HEALTH (Diagnostics)

import type { GateRunnerTickOutput } from "./i.L32.core.GATE_RUNNER.ts";
import { O_STREAM_HEALTH } from "./i.L99.core.O_STREAM_HEALTH.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

export type IOFlowHealth = {
  before: Awaited<ReturnType<typeof O_STREAM_HEALTH>>;
  after: Awaited<ReturnType<typeof O_STREAM_HEALTH>>;
  bridge_mode: GateRunnerTickOutput["bridge_mode"];
};

export const IO_FLOW_HEALTH = async (
  beforeProposals: DeltaProposal[],
  afterProposals: DeltaProposal[],
  bridgeMode: GateRunnerTickOutput["bridge_mode"],
): Promise<IOFlowHealth> => ({
  before: await O_STREAM_HEALTH(beforeProposals),
  after: await O_STREAM_HEALTH(afterProposals),
  bridge_mode: bridgeMode,
});
