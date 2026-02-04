/**
 * [i.L99.core.TOPOLOGY_PROTOCOL.ts]
 * Протокол Розподіленої Топологічної Конвергенції.
 * Реалізує бачення "Git + Bitcoin + Topology" для узгодження реальності без центрального арбітра.
 */

import { FIELD } from './i.L00.core.FIELD.ts';

export interface TopologicalAnchor {
  hash: string;         // SHA-256 хеш контенту/стану (інваріант)
  vector: {
    r: number;          // Позиція в полі [-32768..32767]
    amplitude: number;  // Розмах коливань
  };
  block_height?: number; // Прив'язка до зовнішнього часу (Bitcoin block)
}

export interface Trajectory {
  identity: string;     // Хеш "нульової точки" вузла
  chain: TopologicalAnchor[]; // Ланцюжок станів (Git-подібна історія)
}

export const CONVERGENCE_PROTOCOL = {
  /**
   * Обчислює "Топологічну Енергію" розбіжності між двома інтерпретаціями.
   * Чим менша енергія, тим стійкіша реальність.
   */
  calculateDissonance: (a: TopologicalAnchor, b: TopologicalAnchor): number => {
    // 1. Семантична відстань (різниця r)
    const deltaR = Math.abs(FIELD.compress(a.vector.r) - FIELD.compress(b.vector.r));
    
    // 2. Амплітудний резонанс (чи схожий масштаб мислення?)
    const amplitudeRatio = Math.max(a.vector.amplitude, b.vector.amplitude) / Math.max(1, Math.min(a.vector.amplitude, b.vector.amplitude));
    
    // 3. Часове зміщення (якщо є прив'язка до блоків)
    const timeDrift = (a.block_height && b.block_height) 
      ? Math.abs(a.block_height - b.block_height) 
      : 0;

    // Енергія = (відстань * неузгодженість амплітуд) + штраф за час
    return (deltaR * amplitudeRatio) + (timeDrift * 10);
  },

  /**
   * Знаходить точку конвергенції для кластера вузлів.
   * Не голосування, а пошук мінімуму енергії.
   */
  findConvergencePoint: (anchors: TopologicalAnchor[]): number => {
    if (anchors.length === 0) return 0;
    
    // Простий градієнтний спуск: середнє зважене на "масу" (амплітуду)
    let totalMass = 0;
    let weightedSum = 0;

    anchors.forEach(a => {
      const mass = 1 / (a.vector.amplitude + 1); // Висока амплітуда = менша "вага" в визначенні точки (більш розмита)
      
      // Або навпаки? Вузол з високою амплітудою бачить більше?
      // У цій моделі: вузька амплітуда = точність = більша вага для локалізації.
      
      weightedSum += a.vector.r * mass;
      totalMass += mass;
    });

    return Math.round(weightedSum / totalMass);
  }
};
