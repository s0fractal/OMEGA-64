/**
 * [i.L13.core.INTERFERENCE.ts]
 * Модуль семантичної інтерференції та суперпозиції хвиль.
 */

import { WavePacket, WAVE_PACKET } from './i.L13.core.WAVE_PACKET.ts';

export const INTERFERENCE = {
  /**
   * Обчислює суперпозицію двох пакетів у точці r.
   * Враховує різницю фаз для конструктивної/деструктивної інтерференції.
   */
  superpose: (p1: WavePacket, p2: WavePacket, r: number): number => {
    const a1 = WAVE_PACKET.getAmplitudeAt(p1, r);
    const a2 = WAVE_PACKET.getAmplitudeAt(p2, r);
    
    // Різниця фаз
    const deltaPhi = p1.phase - p2.phase;
    
    // Формула інтерференції: I = a1^2 + a2^2 + 2*a1*a2*cos(deltaPhi)
    // Ми повертаємо результуючу амплітуду: sqrt(I)
    const intensity = a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(deltaPhi);
    return Math.sqrt(Math.max(0, intensity));
  },

  /**
   * Обчислює загальну "напругу інтерференції" (Semantic Tension).
   * Висока при деструктивній інтерференції (протилежні фази).
   */
  getTension: (p1: WavePacket, p2: WavePacket): number => {
    const overlap = Math.exp(-Math.pow(p1.center - p2.center, 2) / (Math.pow(p1.width, 2) + Math.pow(p2.width, 2)));
    const phaseConflict = (1 - Math.cos(p1.phase - p2.phase)) / 2; // 0 при 0, 1 при PI
    
    return overlap * phaseConflict;
  }
};