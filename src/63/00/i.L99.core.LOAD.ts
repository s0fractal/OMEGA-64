// i.L99.core.LOAD.ts
// 🛡️ OMEGA-64 | Entropy Dynamics | Hybrid Load Model
// "Тягар — це не вага. Тягар — це тертя."

import { I16_LIMITS } from './i.L00.core.I16_LIMITS.ts';
import { U16_LIMITS } from './i.L00.core.U16_LIMITS.ts';

const I16 = I16_LIMITS();
const U16 = U16_LIMITS();

export interface LoadInput {
  entropy: number;       // Ентропія (I16.min..I16.max)
  phase: number;         // Фаза [0..U16.span]
  weight?: number;       // Вага зв'язку (w_i)
  amplitude?: number;    // Амплітуда резонансу (a_i)
}

/**
 * Модель Гібридного Навантаження (Hybrid Load Model).
 * Визначає, наскільки "важким" для системи є утримання даного стану/зв'язку.
 */
export const LOAD = {
  /**
   * Розрахунок навантаження для одного елемента.
   * Load = EntropyMass * PhaseMismatch
   */
  calculate: (input: LoadInput, systemPhase: number): number => {
    // 1. Нормалізована ентропійна маса [0..1]
    // Висока ентропія = 1 ( Chaos), Низька = 0 (Crystal)
    const e = (input.entropy - I16.min) / I16.span;

    // 2. Фазове неузгодження (Phase Mismatch) [0..2]
    // p_i = 1 - cos(2π * dphi / U16.span)
    let dPhi = Math.abs(input.phase - systemPhase);
    if (dPhi > U16.half) dPhi = U16.span - dPhi; // Shortest path
    
    // Косинусна міра подібності (плавніше ніж лінійна)
    const angleRad = (dPhi / U16.half) * Math.PI;
    const p = 1 - Math.cos(angleRad); 
    
    // 3. Вагові коефіцієнти
    const w = input.weight ?? 1;
    const a = input.amplitude ?? 1;

    // 4. Фінальне навантаження
    // "Важка" (high entropy) річ, яка "в фазі" (p ~ 0) -> Load ~ 0 (легко нести)
    // "Легка" річ, яка "в протифазі" -> Load помірний.
    // "Важка" річ в протифазі -> Load максимальний.
    return w * e * p * a;
  },

  /**
   * Ефективна частота системи під навантаженням.
   * omega_eff = omega_0 / (1 + alpha * TotalLoad)
   */
  effectiveFrequency: (baseFrequency: number, totalLoad: number, alpha: number = 0.1): number => {
    return baseFrequency / (1 + alpha * totalLoad);
  },

  /**
   * Перевірка "Стоячої Хвилі" (Standing Mode).
   * Чи є система само-підтримуваною?
   */
  isStandingMode: (deltaPhase: number, totalLoad: number, coherence: number): boolean => {
    // 1. Фаза стабільна (малий дрейф)
    const phaseLocked = Math.abs(deltaPhase) < 100;
    
    // 2. Навантаження прийнятне
    const loadBearable = totalLoad < 10.0; // Емпіричний поріг
    
    // 3. Когерентність висока
    const highlyCoherent = coherence > 0.8;
    
    return phaseLocked && loadBearable && highlyCoherent;
  }
};
