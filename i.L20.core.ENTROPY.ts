// i.L20.core.ENTROPY.ts
// 🛡️ OMEGA-64 | Entropy & Thermodynamics | The Arrow of Time
// "Ми не можемо втекти від S = k ln Ω. Ми можемо лише вибрати Ω."

/**
 * BOLTZMANN: Статистична механіка OMEGA-64.
 * Формалізація інтуїції "світло через лінзи".
 */
export const BOLTZMANN = {
  k_B: 1.0, // Нормалізована стала Больцмана для нашої гратки
  
  /**
   * Мікроскопічна ентропія: скільки способів (Ω) отримати цей стан.
   * Чим вища енергія E, тим менш ймовірний цей стан (при фіксованій T).
   * Ω = exp(-E/kT)
   */
  microstates: (energy: number, temperature: number): number => {
    if (temperature === 0) return energy === 0 ? 1 : 0; // Абсолютний нуль: лише основний стан
    return Math.exp(-energy / (BOLTZMANN.k_B * temperature));
  },
  
  /**
   * "Температура Лінзи" (Curvature Temperature).
   * Гравітаційний потенціал виступає як "температура", що розмиває стани.
   * 
   * - Висока кривизна (біля маси) → "Холодно" (мало станів, детермінізм, лід).
   * - Низька кривизна (вакуум) → "Гаряче" (багато станів, хаос, пара).
   * 
   * T(r) = 1 / (1 + |Φ|)
   */
  lensTemperature: (curvature: number): number => {
    // curvature ~ mass ~ глибина колодязя
    // Чим глибше — тим "жорсткіша" структура (нижча температура)
    return 1 / (1 + Math.abs(curvature));
  },

  /**
   * Вільна енергія Гельмгольца: справжня "ціна" існування.
   * Система мінімізує F, а не просто E.
   * F = E - TS
   * 
   * Це пояснює, чому ми іноді обираємо хаос (високе S), якщо T велике.
   */
  freeEnergy: (energy: number, entropy: number, temperature: number): number => {
    return energy - temperature * entropy;
  },

  /**
   * Інформаційна Ентропія Шеннона-Гіббса (для L-1 POTENTIAL).
   * S = -Σ p ln p
   */
  shannonEntropy: (probabilities: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
        const p = probabilities[i];
        if (p > 0) {
            sum += p * Math.log(p);
        }
    }
    return -sum; // k_B = 1
  }
};