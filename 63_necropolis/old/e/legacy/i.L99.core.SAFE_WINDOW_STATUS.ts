// i.L99.core.SAFE_WINDOW_STATUS.ts
// OMEGA-64 | SAFE_WINDOW_STATUS (Sovereignty Signal)

import { MUTATE } from "./i.L43.core.MUTATE.ts";

export type SafeWindowStatus = {
  ok: boolean;
  reason: string;
  bridge_mode?: string;
  replay_green?: boolean;
  index_ok?: boolean;
  mean_drift?: number;
  mean_slope?: number;
};

export const SAFE_WINDOW_STATUS = async (): Promise<SafeWindowStatus> => {
  const window = await MUTATE.checkSovereignty();
  return {
    ok: window.ok === true,
    reason: window.ok ? "OPEN" : (window.reason ?? "WINDOW_CLOSED"),
    bridge_mode: window.bridge_mode,
    replay_green: window.replay_green,
    index_ok: window.index_ok,
    mean_drift: window.meanDrift,
    mean_slope: window.meanSlope,
  };
};
