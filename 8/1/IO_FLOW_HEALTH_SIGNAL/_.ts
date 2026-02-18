// i.L99.core.IO_FLOW_HEALTH_SIGNAL.ts
// OMEGA-64 | IO_FLOW_HEALTH_SIGNAL (Bridge)

import type { IO_FLOW_HEALTH_IOFlowHealth as IOFlowHealth } from "@omega";

export type IOFlowHealthSignal = "GREEN" | "AMBER" | "RED";

export const IO_FLOW_HEALTH_SIGNAL = (health: IOFlowHealth): IOFlowHealthSignal => {
  if (health.signal_after === "RED") return "RED";
  if (health.signal_after === "AMBER") return "AMBER";
  return "GREEN";
};
