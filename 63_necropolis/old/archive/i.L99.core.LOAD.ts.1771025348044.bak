// i.L99.core.LOAD.ts
// 🛡️ OMEGA-64 | Entropy Dynamics | Hybrid Load Model
// "Тягар — це не вага. Тягар — це тертя."

import { AccessLevel } from './i.L00.core.ACCESS_BY_RESONANCE.ts';

export interface LoadInput {
  entropy: number;       // Ентропія (-32768..32767)
  phase: number;         // Фаза [0..65535]
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
    const e = (input.entropy + 32768) / 65535;

    // 2. Фазове неузгодження (Phase Mismatch) [0..2]
    // p_i = 1 - cos(2π * dphi / 65535)
    let dPhi = Math.abs(input.phase - systemPhase);
    if (dPhi > 32767) dPhi = 65535 - dPhi; // Shortest path
    
    // Косинусна міра подібності (плавніше ніж лінійна)
    const angleRad = (dPhi / 32767) * Math.PI;
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
