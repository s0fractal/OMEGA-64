// i.L99.core.TRINITY.ts — інтегратор всіх трьох рівнів
import { ATOM as POTENTIAL_ATOM, PotentialField } from '../../../0/0/POTENTIAL/_.ts';
import { ATOM as FIELD_ATOM } from '../../../7/7/FIELD/_.ts';
import { I16_LIMITS } from '../../../7/7/I16_LIMITS/_.ts';
import { U16_LIMITS } from '../../../7/7/U16_LIMITS/_.ts';
import { ATOM as WAVE_PACKET_ATOM } from '../../../6/2/WAVE_PACKET/_.ts';
import { ATOM as CHRONOFLUX_ATOM } from '../../1/CHRONOFLUX/_.ts';
import { HOLOGRAM, HolographicProjection } from '../../../7/6/HOLOGRAM/_.ts';

export interface QWave {
  center: number;
  width: number;
  phase: number;
  amplitude: number;
}

const POTENTIAL = POTENTIAL_ATOM();
const FIELD = FIELD_ATOM({ siblings: { I16_LIMITS } });
const WAVE_PACKET_ATOM_RESULT = WAVE_PACKET_ATOM({ siblings: { FIELD, U16_LIMITS } });
const WAVE_PACKET = WAVE_PACKET_ATOM_RESULT.WAVE_PACKET;
const CHRONOFLUX = CHRONOFLUX_ATOM({
  siblings: { FIELD, I16_LIMITS, U16_LIMITS, WAVE_PACKET: WAVE_PACKET_ATOM_RESULT }
}).CHRONOFLUX;

export interface ChronoState {
  tau: number;
  depth: number;
  flowRate: number;
  curvature?: number;
}

export const TRINITY = {
  /**
   * Повний цикл: Потенціал → Сутність → Хронофлюкс → Голограма → Проекція
   */
  actualize: (potential: PotentialField, seed: number): {
    wave: QWave;
    chrono: ChronoState;
    hologram: HolographicProjection;
    cycle: 'DIGITAL' | 'OPTICAL' | 'HYBRID';
  } => {
    // L-1 → L0: Семплювання потенціалу
    const { r, confidence } = POTENTIAL.sample(potential, seed);
    // Виправлення: WAVE_PACKET.create вимагає (center, width, phase, amplitude)
    const wave = WAVE_PACKET.create(r, 1000, (Math.random() * 65535), 1000);
    
    // L0 → L22: Активація Chronoflux
    const chrono = CHRONOFLUX.waveToChrono(wave);
    
    // L22 → L+1: Оптична проекція
    const optical = HOLOGRAM.digitalToOptical(wave, chrono);
    
    // Для повноти — інтерференція з "фоновим" полем (вакуум)
    const vacuumWave = WAVE_PACKET.create(0, 10000, 0, 1);
    const vacuumChrono: ChronoState = { tau: 1, depth: 0, flowRate: 1, curvature: 0 };
    const vacuumField = HOLOGRAM.digitalToOptical(vacuumWave, vacuumChrono);
    
    const hologram = HOLOGRAM.interfere(optical, vacuumField);
    
    // Визначення режиму
    let cycle: 'DIGITAL' | 'OPTICAL' | 'HYBRID';
    if (confidence > 0.8 && chrono.tau > 0.5) cycle = 'OPTICAL';
    else if (confidence < 0.3) cycle = 'DIGITAL';
    else cycle = 'HYBRID';
    
    return { wave, chrono, hologram, cycle };
  },

  /**
   "Зворотний потік": з голограми назад в потенціал.
   Це "забування" — дисипація форми назад у хмару можливостей.
   */
  dissipate: (hologram: HolographicProjection): PotentialField => {
    const { wave, confidence } = HOLOGRAM.opticalToDigital(hologram);
    
    // Конвертація в густину ймовірності
    const resolution = 1024;
    const density = new Float32Array(resolution);
    const rIdx = Math.floor((wave.center + 32768) / 65535 * resolution);
    
    // Гаусов пік на місці "відновленої" сутності
    for (let i = 0; i < resolution; i++) {
      const dist = Math.abs(i - rIdx);
      density[i] = confidence * Math.exp(-dist*dist / (2 * 100 * 100));
    }
    
    return {
      density,
      gradient: POTENTIAL.computeGradient(density),
      entropy: -density.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0)
    };
  }
};
