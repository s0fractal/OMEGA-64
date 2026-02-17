// i.L99.core.IO_FLOW_HEALTH_SIGNAL.ts
// OMEGA-64 | IO_FLOW_HEALTH_SIGNAL (Bridge)

import type { IOFlowHealth } from "./i.L99.core.IO_FLOW_HEALTH.ts";

export type IOFlowHealthSignal = "GREEN" | "AMBER" | "RED";

export const IO_FLOW_HEALTH_SIGNAL = (health: IOFlowHealth): IOFlowHealthSignal => {
  if (health.signal_after === "RED") return "RED";
  if (health.signal_after === "AMBER") return "AMBER";
  return "GREEN";
};
