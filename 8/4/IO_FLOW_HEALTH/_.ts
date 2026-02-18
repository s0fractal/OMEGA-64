// i.L99.core.IO_FLOW_HEALTH.ts
// OMEGA-64 | IO_FLOW_HEALTH (Diagnostics)

import type { GATE_RUNNER_GateRunnerTickOutput as GateRunnerTickOutput } from "@omega";
import { O_STREAM_HEALTH_O_STREAM_HEALTH as O_STREAM_HEALTH } from "@omega";
import { O_STREAM_HEALTH_SIGNAL_O_STREAM_HEALTH_SIGNAL as O_STREAM_HEALTH_SIGNAL } from "@omega";
import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";
import { SAFE_WINDOW_STATUS_SAFE_WINDOW_STATUS as SAFE_WINDOW_STATUS, type SAFE_WINDOW_STATUS_SafeWindowStatus as SafeWindowStatus } from "@omega";

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
