/**
 * [i.L43.core.REFLEX.ts]
 * Модуль автоматичних рефлексів на основі Болю.
 * Забезпечує проактивність системи через NERVE.
 */

import { NERVE } from "./i.L48.core.NERVE.ts";
import { ENERGY_ENGINE, QWaveState } from "./i.L05.core.ENERGY.ts";

export const REFLEX = {
  /**
   * Рефлекторна дуга: перетворює Біль у Дію.
   */
  arc: (state: QWaveState) => {
    const pain = ENERGY_ENGINE.getPainLevel(state);

    if (pain > 0.8) {
      // "Крик" (DISTRESS) — коли біль нестерпний
      NERVE.pulse("DISTRESS", {
        intensity: pain,
        r: state.r,
        tension: state.tension,
        source: "REFLEX_ARC",
      });
      return "DISTRESS_BROADCAST";
    }

    if (pain > 0.5) {
      // "Свербіж" (LOCAL_MUTATION) — спроба внутрішньої стабілізації
      return "LOCAL_ADAPTATION";
    }

    return "HOMEOSTASIS_OK";
  },
};
