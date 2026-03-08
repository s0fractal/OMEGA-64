/**
 * [i.L64.core.MEMBRANE.ts]
 * Інтерфейс як Мембрана.
 * Перехід від статичних UI (Вікон) до динамічних полів (Потенціалів).
 * L64: Kairos / Interface.
 */

import { QWave } from "./i.L13.core.WAVE_PACKET.ts";
import { FIELD } from "./i.L00.core.FIELD.ts";

/**
 * Дія, яку експонує сервіс.
 * Це не кнопка, а "можливість" з ціною.
 */
export interface ServiceAction {
  id: string; // Унікальний ID дії
  label: string; // Людська назва (для рендеру)
  potential: number; // Енергетична вартість (ціна кроку)
  prerequisites: string[]; // Необхідні стани (tags/history)
  consequences: string[]; // Що зміниться в стані
  resonance_tags: string[]; // Семантичні теги для матчингу
}

/**
 * Сервіс як Поле.
 * Сервіс не знає, як він виглядає. Він знає тільки свою фізику.
 */
export interface ServiceField {
  service_id: string;
  base_potential: number; // Загальний рівень входу (бар'єр)
  actions: Map<string, ServiceAction>;
}

/**
 * Рендеринг дії для конкретного користувача.
 * Це проекція багатовимірного потенціалу на площину сприйняття.
 */
export interface RenderedTrajectory {
  action: ServiceAction;
  match_score: number; // 0..1 (Резонанс)
  is_affordable: boolean; // Чи вистачає енергії
  suggested_ui: "BUTTON" | "GESTURE" | "THOUGHT"; // Метафора взаємодії
}

export class PersonalInterface {
  user_topology: QWave; // Поточний стан (форма) користувача
  history: Set<string>; // Накопичені теги/досягнення

  constructor(topology: QWave, history: string[] = []) {
    this.user_topology = topology;
    this.history = new Set(history);
  }

  /**
   * Головна функція мембрани: Render.
   * Перетворює поле сервісу на траєкторії користувача.
   */
  render(service: ServiceField): RenderedTrajectory[] {
    const trajectories: RenderedTrajectory[] = [];

    for (const action of service.actions.values()) {
      // 1. Check Prerequisites (Can I conceptually do this?)
      const hasPrereqs = action.prerequisites.every((p) => this.history.has(p));
      if (!hasPrereqs) continue;

      // 2. Check Affordability (Can I pay for this?)
      // Енергія користувача (amplitude) проти потенціалу дії
      const cost = Math.abs(action.potential);
      const is_affordable = this.user_topology.amplitude >= cost;

      // 3. Calculate Resonance (Do I want to do this?)
      // Порівняння фаз та амплітуд (спрощено)
      // Чим ближче ціна дії до поточного рівня користувача, тим вищий резонанс (Zone of Proximal Development)
      const potential_diff = Math.abs(
        FIELD.compress(action.potential) - FIELD.compress(this.user_topology.r),
      );
      const match_score = Math.exp(-potential_diff / 500);

      trajectories.push({
        action,
        match_score,
        is_affordable,
        suggested_ui: this.determineMetaphor(cost, match_score),
      });
    }

    // Сортуємо: доступні та резонансні — зверху.
    return trajectories.sort((a, b) => {
      if (a.is_affordable !== b.is_affordable) return a.is_affordable ? -1 : 1;
      return b.match_score - a.match_score;
    });
  }

  /**
   * Вибір метафори взаємодії залежно від ціни та резонансу.
   */
  private determineMetaphor(
    cost: number,
    resonance: number,
  ): "BUTTON" | "GESTURE" | "THOUGHT" {
    if (resonance > 0.9 && cost < 100) return "THOUGHT"; // Майже без зусиль, "прочитати думку"
    if (cost < 1000) return "GESTURE"; // Легкий рух
    return "BUTTON"; // Свідоме, важке рішення (треба натиснути)
  }
}
