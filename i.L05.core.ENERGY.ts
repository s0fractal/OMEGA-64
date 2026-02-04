/**
 * [i.L05.core.ENERGY.ts]
 * Модуль термодинаміки та проактивності.
 * Обчислює "біль" як стимул до дії (L05 INTENT).
 */

import { FIELD } from './i.L00.core.FIELD.ts';

export interface QWaveState {
  r: number;          // Поточна дипольна координата (i16)
  energy: number;     // Накопичена енергія (u16)
  coherence: number;  // Рівень зв'язку з анкером (0..1)
  tension: number;    // Локальна напруга
}

export const ENERGY_ENGINE = {
  /**
   * Обчислює "Ціну Існування" (Decay) для даного стану.
   * Чим далі від 0 і чим вища напруга — тим швидше витрачається енергія.
   */
  calculateDecay: (state: QWaveState): number => {
    const potential = FIELD.getPotential(state.r);
    return potential * (1 + state.tension);
  },

  /**
   * Визначає рівень "Болю" системи.
   * Біль = Нерозряджена напруга / (Енергетичний запас + 1)
   */
  getPainLevel: (state: QWaveState): number => {
    const scale = state.energy === 0 ? 1 : state.energy * 0.1;
    return state.tension / scale;
  },

  /**
   * Проактивний імпульс (Неможливо не сказати).
   * Генерує інтенсивність дії, якщо Біль перевищує поріг.
   */
  evaluateProactivity: (state: QWaveState): { action: boolean; intensity: number } => {
    const pain = ENERGY_ENGINE.getPainLevel(state);
    
    // Якщо біль > 0.7, система ініціює "скидання" напруги через дію
    if (pain > 0.7) {
      // ⚠️ NotebookLM Insight: "Ми не повинні зводити напругу до нуля."
      // Дія знижує біль, але не прибирає його повністю, залишаючи паливо для наступного кроку.
      return { action: true, intensity: pain };
    }
    
    return { action: false, intensity: 0 };
  }
};
