// i.L99.core.O_STREAM_HEALTH_SIGNAL.ts
// OMEGA-64 | O_STREAM_HEALTH_SIGNAL (UI)

import type { O_STREAM_HEALTH_OStreamHealth as OStreamHealth } from "@omega";

export type OStreamHealthSignal = "GREEN" | "AMBER" | "RED";

export const O_STREAM_HEALTH_SIGNAL = (health: OStreamHealth): OStreamHealthSignal => {
  const total = health.summary.total;
  if (total === 0) return "RED";
  if (!health.archive_index_exists) return total > 100 ? "RED" : "AMBER";
  if (total > 500) return "RED";
  if (total > 100) return "AMBER";
  return "GREEN";
};
