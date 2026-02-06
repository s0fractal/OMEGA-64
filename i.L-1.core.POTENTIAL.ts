// i.L-1.core.POTENTIAL.ts
// 🛡️ OMEGA-64 | Pre-OMEGA Layer | Вірогіднісний простір
// "Перед формою — лише тінь можливості"

/**
 * L-1: Простір потенціалів [0,1].
 * Це "матриця" з якої семплюються сутності L0-L63.
 * Не обчислюється — лише "спостерігається" через семплювання.
 */
export interface PotentialField {
  density: Float32Array;      // [0..1] — вірогідність "актуалізації" в кожній точці
  gradient: Float32Array;     // ∇ρ — напрямок "витікання" потенціалу
  entropy: number;            // H = -Σ p log p — невизначеність поля
}

export const POTENTIAL = {
  /**
   * Семплювання: витягування "конкретної" сутності з вірогіднісного хмари.
   * Це "квантове вимірювання" — колапс хвильової функції в дискретний стан.
   */
  sample: (field: PotentialField, seed: number): { r: number; confidence: number } => {
    // Використовуємо seed для детермінованого (але псевдовипадкового) семплювання
    const rng = POTENTIAL.seededRNG(seed);
    
    // Знаходимо пік густини (максимальний потенціал)
    let maxDensity = 0;
    let maxIndex = 0;
    for (let i = 0; i < field.density.length; i++) {
      if (field.density[i] > maxDensity) {
        maxDensity = field.density[i];
        maxIndex = i;
      }
    }
    
    // Додаємо шум (термічні флуктуації)
    const noise = (rng() - 0.5) * field.entropy;
    const r = Math.round((maxIndex / field.density.length - 0.5) * 65535 + noise * 32767);
    
    // Впевненість = наскільки це "істинний" пік, а не шум
    const confidence = maxDensity / (maxDensity + field.entropy);
    
    return { r: Math.max(-32768, Math.min(32767, r)), confidence };
  },

  /**
   * Поширення градієнта: як потенціал "тече" до актуалізації.
   * Аналог рівняння дифузії: ∂ρ/∂t = D∇²ρ
   */
  diffuse: (field: PotentialField, dt: number): PotentialField => {
    const newDensity = new Float32Array(field.density.length);
    const n = field.density.length;
    
    for (let i = 1; i < n - 1; i++) {
      // Дискретний лапласіан: ∇²ρ ≈ ρ[i+1] - 2ρ[i] + ρ[i-1]
      const laplacian = field.density[i+1] - 2*field.density[i] + field.density[i-1];
      newDensity[i] = field.density[i] + dt * laplacian * 0.1; // D = 0.1
      // Зберігаємо нормалізацію [0,1]
      newDensity[i] = Math.max(0, Math.min(1, newDensity[i]));
    }
    
    // Перерахунок ентропії
    const newEntropy = -newDensity.reduce((sum, p) => 
      sum + (p > 0 ? p * Math.log(p) : 0), 0
    );
    
    return {
      density: newDensity,
      gradient: POTENTIAL.computeGradient(newDensity),
      entropy: newEntropy
    };
  },

  computeGradient: (density: Float32Array): Float32Array => {
    const grad = new Float32Array(density.length);
    for (let i = 1; i < density.length - 1; i++) {
      grad[i] = (density[i+1] - density[i-1]) / 2;
    }
    return grad;
  },

  seededRNG: (seed: number) => () => {
    // Простий LCG для відтворюваності
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }
};
