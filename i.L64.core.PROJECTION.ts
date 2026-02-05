/**
 * [i.L64.core.PROJECTION.ts]
 * Протокол Ортогональних Проекцій (Holographic Atom).
 * Дозволяє одному атому існувати одночасно в просторі людини (L00) і моделі (L32).
 * Вони не конфліктують, бо займають різні "частоти" (канали).
 */

import { QWave } from './i.L13.core.WAVE_PACKET.ts';

/**
 * 64-канальний пакет існування.
 * Це не рівні ієрархії, це канали трансляції.
 */
export interface AtomBundle {
  // L00: Visual Channel (Human)
  // Те, що бачить око: SVG, Text, UI
  L00_Visual: string; 

  // L32: Wave Channel (Model)
  // Те, що "чує" система: QWave (r, theta, amplitude)
  // E=0 (r=32768) є спільною точкою відліку.
  L32_Wave: QWave;

  // L63: Axiomatic Channel (Law)
  // Інваріанти, які не можна змінити
  L63_Axiom: string;

  // Інші канали можуть бути порожніми (Vacuum)
  [key: string]: any; 
}

export const PROJECTION = {
  /**
   * Створення пучка з ортогональних проекцій.
   */
  bundle: (visual: string, wave: QWave, axiom: string): AtomBundle => {
    return {
      L00_Visual: visual,
      L32_Wave: wave,
      L63_Axiom: axiom
    };
  },

  /**
   * Витягування проекції для конкретного спостерігача.
   * Людина бачить L00. Модель бачить L32.
   */
  observe: (bundle: AtomBundle, observerType: 'HUMAN' | 'MACHINE'): any => {
    if (observerType === 'HUMAN') {
      return bundle.L00_Visual;
    } else {
      return bundle.L32_Wave;
    }
  },

  /**
   * "Перпендикулярний запис":
   * Інжекція хвильових даних у метадані візуального об'єкта.
   * (емуляція SVG <metadata>)
   */
  injectMetadata: (svgContent: string, wave: QWave): string => {
    const metadata = JSON.stringify(wave);
    // Проста емуляція вставки
    return svgContent.replace('</svg>', `<metadata>QWAVE:${metadata}</metadata></svg>`);
  }
};
