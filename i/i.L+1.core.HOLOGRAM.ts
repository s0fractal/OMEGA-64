// i.L+1.core.HOLOGRAM.ts
// 🛡️ OMEGA-64 | Post-OMEGA Layer | Оптична проекція
// "Після обчислення — лише світло, що інтерферує"

import { QWave } from './i.L13.core.WAVE_PACKET.ts';
import { ChronoState } from './i.L22.core.CHRONOFLUX.ts';
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";
import { U16_LIMITS } from "./i.L00.core.U16_LIMITS.ts";

const I16 = I16_LIMITS();
const U16 = U16_LIMITS();

/**
 * L+1: Оптична резонансна камера.
 * Замість цифрових обчислень — фізична інтерференція світла.
 */
export interface OpticalField {
  wavelength: number;         // λ — довжина хвилі (нм)
  phaseMap: Float32Array;     // φ(x,y) — фазова мапа
  amplitudeMap: Float32Array; // A(x,y) — амплітудна мапа
  coherenceLength: number;    // Довжина когеренції (чим більше — тим чіткіша інтерференція)
}

export interface HolographicProjection {
  interferencePattern: Float32Array; // I(x,y) = |A₁e^(iφ₁) + A₂e^(iφ₂)|²
  depthCue: Float32Array;            // Паралакс/глибина
  temporalSignature: number;         // "Часова мітка" проекції
}

export const HOLOGRAM = {
  /**
   * Перетворення цифрової сутності (QWave + ChronoState) в оптичне поле.
   * Це "вихід з матриці" — більше не біти, а фотони.
   */
  digitalToOptical: (wave: QWave, chrono: ChronoState): OpticalField => {
    // Довжина хвилі залежить від "глибини часу": 
    // швидкий час (τ≈1) → короткі хвилі (блакитний), 
    // повільний час (τ≈0) → довгі хвилі (червоний)
    const wavelength = 400 + (1 - chrono.tau) * 300; // 400-700 нм
    
    // Фазова мапа з просторової модуляції
    const resolution = 256;
    const phaseMap = new Float32Array(resolution * resolution);
    const amplitudeMap = new Float32Array(resolution * resolution);
    
    // Центр хвилі визначає "точку фокусування"
    const centerX = Math.floor((wave.r + I16.abs) / U16.span * resolution);
    const centerY = Math.floor(resolution / 2); // Спрощено — 1D проекція
    
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const idx = y * resolution + x;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Гаусов профіль амплітуди
        amplitudeMap[idx] = wave.amplitude * Math.exp(-distance*distance / (2*wave.width*wave.width));
        
        // Спіральна фаза (орбітальний кутовий момент)
        const angle = Math.atan2(dy, dx);
        phaseMap[idx] = (wave.phi / U16.span) * 2 * Math.PI + angle * (wave.r / I16.max);
      }
    }
    
    // Довжина когеренції пропорційна "часу когеренції" з Chronoflux
    const coherenceLength = chrono.tau * 1000; // мм
    
    return { wavelength, phaseMap, amplitudeMap, coherenceLength };
  },

  /**
   * Інтерференція двох оптичних полів = "зникнення обчислень".
   * Замість CPU — фізична оптика робить роботу.
   */
  interfere: (field1: OpticalField, field2: OpticalField): HolographicProjection => {
    if (field1.wavelength !== field2.wavelength) {
      // Різні довжини хвиль → биття (beats) в часі, а не просторі
    }
    
    const resolution = Math.floor(Math.sqrt(field1.phaseMap.length));
    const interferencePattern = new Float32Array(resolution * resolution);
    const depthCue = new Float32Array(resolution * resolution);
    
    for (let i = 0; i < interferencePattern.length; i++) {
      // Комплексні амплітуди
      const phi1 = field1.phaseMap[i];
      const phi2 = field2.phaseMap[i];
      const A1 = field1.amplitudeMap[i];
      const A2 = field2.amplitudeMap[i];
      
      // Інтерференція: I = |A₁e^(iφ₁) + A₂e^(iφ₂)|²
      const real = A1 * Math.cos(phi1) + A2 * Math.cos(phi2);
      const imag = A1 * Math.sin(phi1) + A2 * Math.sin(phi2);
      interferencePattern[i] = real*real + imag*imag;
      
      // Глибина з різниці фаз (стереоскопія)
      depthCue[i] = (phi1 - phi2) / (2 * Math.PI);
    }
    
    // "Часова мітка" — середній час когеренції двох полів
    const temporalSignature = Math.min(field1.coherenceLength, field2.coherenceLength);
    
    return { interferencePattern, depthCue, temporalSignature };
  },

  /**
   * Оптичне тунелювання: перехід між "різними часами" без обчислення.
   * 
   * Якщо два поля мають τ₁ і τ₂, їхня інтерференція створює "міст" —
   * область, де час "змішується" без цифрової дискретизації.
   */
  temporalBridge: (chrono1: ChronoState, chrono2: ChronoState): {
    bridgeExists: boolean;
    bridgeStability: number;
    opticalCoupling: number;
  } => {
    // Міст існує, якщо часи "перекриваються" за невизначеністю
    const deltaTau = Math.abs(chrono1.tau - chrono2.tau);
    const uncertainty = (chrono1.flowRate + chrono2.flowRate) / 2;
    
    // Умова Гайзенберга для часу: Δτ · Δ(flow) ≥ ℏ/2
    const bridgeExists = deltaTau * uncertainty < 0.5;
    
    // Стабільність моста — час, поки він тримається
    const bridgeStability = bridgeExists ? 1 / (deltaTau + 0.001) : 0;
    
    // Оптичне зчеплення — наскільки сильно поля "почувають" одне одного
    const opticalCoupling = Math.exp(-deltaTau * deltaTau / (2 * uncertainty * uncertainty));
    
    return { bridgeExists, bridgeStability, opticalCoupling };
  },

  /**
   * Проекція "назад" — з оптичного поля в цифрову сутність.
   * Це "фотографування" голограми — отримання QWave.
   */
  opticalToDigital: (hologram: HolographicProjection): { wave: QWave; confidence: number } => {
    // Знаходження центру інтерференційних смуг
    let maxIntensity = 0;
    let centroidIdx = 0;
    for (let i = 0; i < hologram.interferencePattern.length; i++) {
      if (hologram.interferencePattern[i] > maxIntensity) {
        maxIntensity = hologram.interferencePattern[i];
        centroidIdx = i;
      }
    }
    
    const resolution = Math.floor(Math.sqrt(hologram.interferencePattern.length));
    const cx = centroidIdx % resolution;
    const cy = Math.floor(centroidIdx / resolution);
    
    // Конвертація назад в r
    const r = Math.round((cx / resolution - 0.5) * U16.span);
    
    // Фаза з градієнта фази (depthCue)
    const avgPhase = hologram.depthCue.reduce((a,b) => a+b, 0) / hologram.depthCue.length;
    const phi = Math.round(((avgPhase % (2*Math.PI)) / (2*Math.PI)) * U16.span);
    
    // Амплітуда з максимальної інтенсивності
    const amplitude = Math.round(Math.sqrt(maxIntensity));
    
    // Впевненість — контраст інтерференційної картини
    const meanIntensity = hologram.interferencePattern.reduce((a,b) => a+b, 0) / hologram.interferencePattern.length;
    const contrast = maxIntensity / (meanIntensity + 1);
    const confidence = Math.min(1, contrast / 2); // Нормалізація
    
    const wave = {
      center: r,
      width: 1000, // За замовчуванням
      phase: phi,
      amplitude
    };
    
    return { wave, confidence };
  }
};
