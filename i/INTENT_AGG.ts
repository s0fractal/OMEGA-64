// @noncanonical

export interface SimState {
  mutations: number;
  [key: string]: unknown;
}

import { TELEMETRY } from "../i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "../i.L02.core.TELEMETRY_SIGNAL.ts";

export const INTENT = {
  judge: (oldState: SimState, newState: SimState): number => {
    if (!oldState || !newState) return 0;

    const coreMassOld = oldState.mutations * 1.0;
    const coreMassNew = newState.mutations * 1.05;
    const massDelta = coreMassNew - coreMassOld;

    const resonanceDelta = (Math.random() > 0.3) ? 0.1 : -0.05;

    const entropyOld = 0.5;
    const entropyNew = Math.random();
    const entropyGradient = entropyOld - entropyNew;

    TELEMETRY_SIGNAL(
      TELEMETRY(
        "INTENT",
        `ΔMass=${massDelta.toFixed(2)}, ΔRes=${resonanceDelta}, ΔEntropy=${entropyGradient.toFixed(2)}`
      ),
      "INFO"
    );

    if (massDelta > 0 && resonanceDelta > 0 && entropyGradient > -0.1) return 1;
    if (massDelta < 0 || resonanceDelta < -0.05) return -1;

    return 0;
  }
};
