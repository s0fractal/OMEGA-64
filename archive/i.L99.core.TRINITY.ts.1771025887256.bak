// i.L99.core.TRINITY.ts — інтегратор всіх трьох рівнів
import { POTENTIAL, PotentialField } from './i.L-1.core.POTENTIAL.ts';
import { QWave, WAVE_PACKET } from './i.L13.core.WAVE_PACKET.ts';
import { CHRONOFLUX, ChronoState } from './i.L22.core.CHRONOFLUX.ts';
import { HOLOGRAM, HolographicProjection } from './i.L+1.core.HOLOGRAM.ts';

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
