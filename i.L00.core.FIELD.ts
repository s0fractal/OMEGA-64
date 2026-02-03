/**
 * [i.L00.core.FIELD.ts]
 * Дипольне поле та логарифмічна топологія OMEGA-64.
 * Реалізація простору [-32768, 32767] для запобігання семантичному колапсу.
 */

export const FIELD_CONFIG = {
  ZERO_POINT: 0,             // Точка абсолютного спокою (Суперпозиційний Нуль)
  MAX_ATTRACTOR: 32767,      // Стіна Поверхні (Ентропійний Хаос)
  MIN_ATTRACTOR: -32768,     // Стіна Ядра (Жорсткий Кристал)
  LOG_SCALE: 1000,           // Масштаб логарифмування
  COHERENCE_THRESHOLD: 0.85  // Поріг для виникнення резонансу
};

export const FIELD = {
  /**
   * Стиснення лінійного значення r у логарифмічний простір.
   * sign * (base + ln(1 + (abs - base)))
   */
  compress: (r: number): number => {
    const sign = r >= 0 ? 1 : -1;
    const absR = Math.abs(r);
    if (absR < FIELD_CONFIG.LOG_SCALE) return r;
    
    // ln(1 + x) дає м'яку криву біля нуля
    const compressed = (FIELD_CONFIG.LOG_SCALE + Math.log1p((absR - FIELD_CONFIG.LOG_SCALE) / FIELD_CONFIG.LOG_SCALE) * FIELD_CONFIG.LOG_SCALE);
    return sign * compressed;
  },

  /**
   * Денормалізація (expand) compressed r назад у лінійний простір i16.
   */
  expand: (compressedR: number): number => {
    const sign = compressedR >= 0 ? 1 : -1;
    const absC = Math.abs(compressedR);
    if (absC < FIELD_CONFIG.LOG_SCALE) return compressedR;

    const expanded = (Math.exp((absC - FIELD_CONFIG.LOG_SCALE) / FIELD_CONFIG.LOG_SCALE) - 1) * FIELD_CONFIG.LOG_SCALE + FIELD_CONFIG.LOG_SCALE;
    return Math.max(FIELD_CONFIG.MIN_ATTRACTOR, Math.min(FIELD_CONFIG.MAX_ATTRACTOR, sign * Math.round(expanded)));
  },

  /**
   * Гравітаційний потенціал (м'який колодязь).
   * Визначає "гравітаційну вартість" перебування на певній відстані від нуля.
   */
  getPotential: (r: number): number => {
    const compressed = FIELD.compress(r);
    // Парабола з плоским дном через логарифмічне стиснення на краях
    return (compressed * compressed) * 0.00001; 
  },

  /**
   * Визначення дипольної різниці (напруги) між двома точками.
   * Напруга висока тільки при високій когерентності.
   */
  getTension: (r1: number, r2: number, coherence: number): number => {
    const delta = Math.abs(FIELD.compress(r1) - FIELD.compress(r2));
    return delta * coherence;
  }
};
