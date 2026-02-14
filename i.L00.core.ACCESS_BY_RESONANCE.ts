// i.L00.core.ACCESS_BY_RESONANCE.ts
// 🛡️ OMEGA-64 | Social Physics | Access by Resonance
// "Право голосу визначається не статусом, а здатністю співати в унісон."

import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";
import { U16_LIMITS } from "./i.L00.core.U16_LIMITS.ts";

const I16 = I16_LIMITS();
const U16 = U16_LIMITS();

export interface ResonanceProfile {
  phase: number;      // Фаза агента [0, U16.span]
  stability: number;  // Стабільність агента [0, 1]
}

export type AccessLevel = "READ" | "INTERACT" | "WRITE" | "MERGE" | "NULL";

/**
 * Фізика доступу.
 * Замість ACL списків — перевірка резонансу.
 */
export const ACCESS_BY_RESONANCE = {
  /**
   * Обчислює рівень доступу на основі різниці фаз та стабільності.
   * 
   * @param object - Сутність, до якої звертаються (Target)
   * @param agent - Агент, що звертається (Source)
   */
  check: (object: Partial<ResonanceProfile>, agent: Partial<ResonanceProfile>): AccessLevel => {
    // 1. Різниця фаз (Phase Mismatch)
    const phi1 = object.phase ?? 0;
    const phi2 = agent.phase ?? 0;
    
    let dPhi = Math.abs(phi1 - phi2);
    if (dPhi > I16.max) {
      dPhi = U16.span - dPhi; // Найкоротший шлях по колу
    }
    
    // Нормалізований дисонанс [0, 1] (0 = резонанс, 1 = протифаза)
    const dissonance = dPhi / I16.max;
    const resonance = 1 - dissonance;

    // 2. Врахування стабільності (якщо хтось нестабільний — зв'язок слабшає)
    const stabilityFactor = (object.stability ?? 1) * (agent.stability ?? 1);
    
    // 3. Ефективний коефіцієнт зв'язку (Coupling Coefficient)
    const coupling = resonance * stabilityFactor;

    // 4. Квантування доступу (Thresholds)
    if (coupling > 0.9) return "MERGE";    // Повне злиття / Канонізація
    if (coupling > 0.7) return "WRITE";    // Вплив / Мутація
    if (coupling > 0.4) return "INTERACT"; // Взаємодія / Сигнал
    if (coupling > 0.1) return "READ";     // Спостереження
    
    return "NULL"; // Шум, немає зв'язку
  },

  /**
   * Обчислює енергетичну вартість дії для даного рівня резонансу.
   * Чим менший резонанс, тим дорожче діяти.
   */
  cost: (level: AccessLevel, coupling: number): number => {
    const baseCost = 10;
    // Опір середовища обернено пропорційний резонансу
    // Cost ~ 1 / coupling^2
    const resistance = coupling > 0.01 ? 1 / (coupling * coupling) : 1000;
    
    switch (level) {
      case "MERGE": return baseCost * resistance * 10; // Найдорожче, бо змінює структуру
      case "WRITE": return baseCost * resistance * 5;
      case "INTERACT": return baseCost * resistance * 2;
      case "READ": return baseCost * resistance;
      default: return Infinity;
    }
  }
};
