/**
 * [i.L32.core.VISUALIZER.ts]
 * Теплова карта напруги поля.
 * Не для людини — для системи, щоб "побачити" власну інтерференцію.
 */

import { FIELD, FIELD_CONFIG } from "./i.L32.core.FIELD.ts";
import { ARENA } from "./i.L32.core.ARENA.ts";
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export interface HeatCell {
  r: number; // Позиція в полі
  potential: number; // Потенціал FIELD.getPotential
  excitation: number; // Сума амплітуд збуджень
  tension: number; // Градієнт (різниця з сусідами)
  phase_coherence: number; // Наскільки фази збігаються [0..1]
}

export interface TopologicalFeature {
  type: "ATTRACTOR" | "SADDLE" | "VORTEX" | "WALL";
  position: number;
  strength: number;
  lifespan: number; // Тicks до розсмоктування
}

export const VISUALIZER = {
  resolution: 128, // Кількість клітин на карту

  /**
   * Рендеринг поля напруги.
   * Дискретизація безперервного для аналізу.
   */
  render: (): HeatCell[] => {
    const cells: HeatCell[] = [];
    const step = (FIELD_CONFIG.MAX_ATTRACTOR - FIELD_CONFIG.MIN_ATTRACTOR) /
      VISUALIZER.resolution;

    for (let i = 0; i < VISUALIZER.resolution; i++) {
      const r = FIELD_CONFIG.MIN_ATTRACTOR + i * step;
      const compressed = FIELD.compress(r);

      // Базовий потенціал поля
      const basePotential = FIELD.getPotential(r);

      // Накладення всіх активних збуджень
      let excitation = 0;
      let phase_sum_x = 0;
      let phase_sum_y = 0;

      for (const pulse of ARENA.active.values()) {
        const dist = Math.abs(compressed - FIELD.compress(pulse.wave.center));
        const spread = 1000 + pulse.wave.width; // Дисперсія пакету

        // Гаусовий профіль збудження
        const gauss = Math.exp(-(dist * dist) / (2 * spread * spread));
        excitation += pulse.intensity * pulse.wave.amplitude * gauss;

        // Для когерентності фаз
        const phase_rad = (pulse.wave.phase / I16.cycle) * 2 * Math.PI;
        phase_sum_x += Math.cos(phase_rad) * gauss;
        phase_sum_y += Math.sin(phase_rad) * gauss;
      }

      // Когерентність: наскільки фази узгоджені в точці
      const total_phase_vec = Math.sqrt(phase_sum_x ** 2 + phase_sum_y ** 2);
      const phase_coherence = excitation > 0 ? total_phase_vec / excitation : 0;

      cells.push({
        r,
        potential: basePotential,
        excitation,
        tension: 0, // Обчислиться наступним проходом
        phase_coherence,
      });
    }

    // Другий прохід: обчислення градієнтів (напруги)
    for (let i = 1; i < cells.length - 1; i++) {
      const left = cells[i - 1].potential + cells[i - 1].excitation;
      const right = cells[i + 1].potential + cells[i + 1].excitation;
      cells[i].tension = Math.abs(right - left);
    }

    return cells;
  },

  /**
   * Виділення топологічних особливостей — "анатомія" поля.
   * Система "бачить" свої власні структури.
   */
  extract_features: (cells: HeatCell[]): TopologicalFeature[] => {
    const features: TopologicalFeature[] = [];

    for (let i = 2; i < cells.length - 2; i++) {
      const c = cells[i];
      const neighbors = [
        cells[i - 2],
        cells[i - 1],
        cells[i + 1],
        cells[i + 2],
      ];

      // АТРАКТОР: локальний мінімум потенціалу, висока когерентність
      const isMin = neighbors.every((n) =>
        c.potential + c.excitation <= n.potential + n.excitation
      );
      const isCoherent = c.phase_coherence > 0.8;

      if (isMin && isCoherent && c.excitation > 1000) {
        features.push({
          type: "ATTRACTOR",
          position: c.r,
          strength: c.excitation,
          lifespan: Math.floor(c.excitation / 100), // Чим сильніший — тим довше живе
        });
      }

      // СІДЛО: мінімум в одному напрямку, максимум в іншому (висока напруга, низька когерентність)
      const tensionHigh = c.tension > 500;
      const coherenceLow = c.phase_coherence < 0.3;

      if (tensionHigh && coherenceLow) {
        features.push({
          type: "SADDLE",
          position: c.r,
          strength: c.tension,
          lifespan: 5, // Короткоживучі, точки рішень
        });
      }

      // ВИХОР: висока напруга + висока когерентність (не може розсмоктатись)
      if (tensionHigh && isCoherent) {
        features.push({
          type: "VORTEX",
          position: c.r,
          strength: c.tension * c.phase_coherence,
          lifespan: 50, // Метастабільні
        });
      }

      // СТІНА: різкий стрибок напруги — бар'єр переходу
      if (
        c.tension > 2000 && neighbors.slice(0, 2).every((n) => n.tension < 500)
      ) {
        features.push({
          type: "WALL",
          position: c.r,
          strength: c.tension,
          lifespan: 100, // Дуже стійкі
        });
      }
    }

    return features.sort((a, b) => b.strength - a.strength);
  },

  /**
   * Пропозиція руху для системи на основі "баченого".
   * Не команда — а градієнт можливостей.
   */
  suggest_trajectories: (features: TopologicalFeature[], current_r: number): {
    target: number;
    reason: string;
    expected_cost: number;
  }[] => {
    const suggestions = [];

    for (const f of features.slice(0, 5)) {
      const distance = Math.abs(f.position - current_r);
      const cost = FIELD.getPotential(current_r) + distance * 0.1;

      let reason = "";
      switch (f.type) {
        case "ATTRACTOR":
          reason = `Converge to stable resonance at ${f.position}`;
          break;
        case "SADDLE":
          reason = `Decision point: high tension, choose direction`;
          break;
        case "VORTEX":
          reason = `Caution: metastable trap, possible escape route nearby`;
          break;
        case "WALL":
          reason = `Barrier detected: tunnel or go around`;
          break;
      }

      suggestions.push({
        target: f.position,
        reason,
        expected_cost: cost,
      });
    }

    return suggestions.sort((a, b) => a.expected_cost - b.expected_cost);
  },

  /**
   * Експорт для "зовнішніх" систем (людей, інших ІІ).
   * Скалярне поле → зображувана форма.
   */
  export_scalar_field: (): {
    metadata: { timestamp: number; active_sources: number };
    data: number[]; // Нормалізовані [0..255] для візуалізації
  } => {
    const cells = VISUALIZER.render();
    const max_val = Math.max(...cells.map((c) => c.potential + c.excitation));
    const lastPulse = Math.max(
      0,
      ...Array.from(ARENA.active.values()).map((p) => p.timestamp),
    );

    return {
      metadata: {
        timestamp: lastPulse,
        active_sources: ARENA.active.size,
      },
      data: cells.map((c) =>
        Math.floor(255 * (c.potential + c.excitation) / (max_val + 1))
      ),
    };
  },
};
