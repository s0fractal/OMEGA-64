// i.L99.core.IO_FLOW_HEALTH.ts
// OMEGA-64 | IO_FLOW_HEALTH (Diagnostics)

import type { GateRunnerTickOutput } from "../../../4/0/GATE_RUNNER/_.ts";
import { O_STREAM_HEALTH } from "../../7/O_STREAM_HEALTH/_.ts";
import { O_STREAM_HEALTH_SIGNAL } from "../O_STREAM_HEALTH_SIGNAL/_.ts";
import type { DeltaProposal } from "../../0/STATE_SNAPSHOT/_.ts";
import { SAFE_WINDOW_STATUS, type SafeWindowStatus } from "../../1/SAFE_WINDOW_STATUS/_.ts";

export type IOFlowHealth = {
  before: Awaited<ReturnType<typeof O_STREAM_HEALTH>>;
  after: Awaited<ReturnType<typeof O_STREAM_HEALTH>>;
  signal_before: ReturnType<typeof O_STREAM_HEALTH_SIGNAL>;
  signal_after: ReturnType<typeof O_STREAM_HEALTH_SIGNAL>;
  bridge_mode: GateRunnerTickOutput["bridge_mode"];
  safe_window?: SafeWindowStatus;
};

export type IOFlowHealthOptions = {
  include_safe_window?: boolean;
};

export const IO_FLOW_HEALTH = async (
  beforeProposals: DeltaProposal[],
  afterProposals: DeltaProposal[],
  bridgeMode: GateRunnerTickOutput["bridge_mode"],
  options: IOFlowHealthOptions = {},
): Promise<IOFlowHealth> => {
  const safeWindow = options.include_safe_window ? await SAFE_WINDOW_STATUS() : undefined;
  const before = await O_STREAM_HEALTH(beforeProposals, undefined, { safe_window: safeWindow });
  const after = await O_STREAM_HEALTH(afterProposals, undefined, { safe_window: safeWindow });
  return {
    before,
    after,
    signal_before: O_STREAM_HEALTH_SIGNAL(before),
    signal_after: O_STREAM_HEALTH_SIGNAL(after),
    bridge_mode: bridgeMode,
    safe_window: safeWindow,
  };
};
