/**
 * [i.L13.core.WAVE_PACKET.ts]
 * Реалізація Гаусового хвильового пакету для локалізації наміру.
 */

import { FIELD } from './i.L32.core.FIELD.ts';
import { U16_LIMITS } from "./i.L32.core.U16_LIMITS.ts";

const U16 = U16_LIMITS();

// Renamed to QWave for consistency with Color Topology
export interface QWave {
  center: number;    // Центр пакету r (i16)
  width: number;     // Ширина пакету (sigma)
  phase: number;     // Фаза пакету phi [0, U16.span]
  amplitude: number; // Максимальна амплітуда
}

export const WAVE_PACKET = {
  /**
   * Обчислює амплітуду пакету в точці r.
   * A(r) = amplitude * exp(-(r - center)^2 / (2 * width^2))
   */
  getAmplitudeAt: (packet: QWave, r: number): number => {
    const dr = FIELD.compress(r) - FIELD.compress(packet.center);
    const exponent = -(dr * dr) / (2 * packet.width * packet.width);
    return packet.amplitude * Math.exp(exponent);
  },

  /**
   * Створення нового пакету наміру.
   */
  create: (center: number, width: number = 1000, phase: number = 0, amplitude: number = 1): QWave => ({
    center,
    width,
    phase: Math.round(phase * U16.span / (2 * Math.PI)) % U16.span, // Convert rad to u16 phase
    amplitude
  })
};
