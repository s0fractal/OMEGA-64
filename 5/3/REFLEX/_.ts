/**
 * [i.L43.core.REFLEX.ts]
 * Модуль автоматичних рефлексів на основі Болю.
 * Забезпечує проактивність системи через NERVE.
 */

import { NERVE } from "../../../6/0/NERVE/_.ts";
import { ATOM as FIELD_ATOM } from "../../../7/7/FIELD/_.ts";
import { I16_LIMITS } from "../../../7/7/I16_LIMITS/_.ts";
import { ATOM as ENERGY_ATOM } from "../../../7/2/ENERGY/_.ts";

const FIELD = FIELD_ATOM({ siblings: { I16_LIMITS } });
const { ENERGY_ENGINE } = ENERGY_ATOM({ siblings: { FIELD } });

export interface QWaveState {
  r: number;
  energy: number;
  coherence: number;
  tension: number;
}

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
        source: "REFLEX_ARC" 
      });
      return "DISTRESS_BROADCAST";
    }
    
    if (pain > 0.5) {
      // "Свербіж" (LOCAL_MUTATION) — спроба внутрішньої стабілізації
      return "LOCAL_ADAPTATION";
    }
    
    return "HOMEOSTASIS_OK";
  }
};
