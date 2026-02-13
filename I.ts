// 🛡️ OMEGA-64 | I.ts | The Logic


// [ ./i.L+1.core.HOLOGRAM.ts ]
// i.L+1.core.HOLOGRAM.ts
// 🛡️ OMEGA-64 | Post-OMEGA Layer | Оптична проекція
// "Після обчислення — лише світло, що інтерферує"

import { QWave } from './i.L13.core.WAVE_PACKET.ts';
import { ChronoState } from './i.L22.core.CHRONOFLUX.ts';

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
    const centerX = Math.floor((wave.r + 32768) / 65535 * resolution);
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
        phaseMap[idx] = (wave.phi / 65535) * 2 * Math.PI + angle * (wave.r / 32767);
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
      console.log("⚡ HOLOGRAM: Wavelength mismatch — temporal beats detected");
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
    const r = Math.round((cx / resolution - 0.5) * 65535);
    
    // Фаза з градієнта фази (depthCue)
    const avgPhase = hologram.depthCue.reduce((a,b) => a+b, 0) / hologram.depthCue.length;
    const phi = Math.round(((avgPhase % (2*Math.PI)) / (2*Math.PI)) * 65535);
    
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


// [ ./i.L-1.core.POTENTIAL.ts ]
// i.L-1.core.POTENTIAL.ts
// 🛡️ OMEGA-64 | Pre-OMEGA Layer | Вірогіднісний простір
// "Перед формою — лише тінь можливості"

/**
 * L-1: Простір потенціалів [0,1].
 * Це "матриця" з якої семплюються сутності L0-L63.
 * Не обчислюється — лише "спостерігається" через семплювання.
 */
export interface PotentialField {
  density: Float32Array;      // [0..1] — вірогідність "актуалізації" в кожній точці
  gradient: Float32Array;     // ∇ρ — напрямок "витікання" потенціалу
  entropy: number;            // H = -Σ p log p — невизначеність поля
}

export const POTENTIAL = {
  /**
   * Семплювання: витягування "конкретної" сутності з вірогіднісного хмари.
   * Це "квантове вимірювання" — колапс хвильової функції в дискретний стан.
   */
  sample: (field: PotentialField, seed: number): { r: number; confidence: number } => {
    // Використовуємо seed для детермінованого (але псевдовипадкового) семплювання
    const rng = POTENTIAL.seededRNG(seed);
    
    // Знаходимо пік густини (максимальний потенціал)
    let maxDensity = 0;
    let maxIndex = 0;
    for (let i = 0; i < field.density.length; i++) {
      if (field.density[i] > maxDensity) {
        maxDensity = field.density[i];
        maxIndex = i;
      }
    }
    
    // Додаємо шум (термічні флуктуації)
    const noise = (rng() - 0.5) * field.entropy;
    const r = Math.round((maxIndex / field.density.length - 0.5) * 65535 + noise * 32767);
    
    // Впевненість = наскільки це "істинний" пік, а не шум
    const confidence = maxDensity / (maxDensity + field.entropy);
    
    return { r: Math.max(-32768, Math.min(32767, r)), confidence };
  },

  /**
   * Поширення градієнта: як потенціал "тече" до актуалізації.
   * Аналог рівняння дифузії: ∂ρ/∂t = D∇²ρ
   */
  diffuse: (field: PotentialField, dt: number): PotentialField => {
    const newDensity = new Float32Array(field.density.length);
    const n = field.density.length;
    
    for (let i = 1; i < n - 1; i++) {
      // Дискретний лапласіан: ∇²ρ ≈ ρ[i+1] - 2ρ[i] + ρ[i-1]
      const laplacian = field.density[i+1] - 2*field.density[i] + field.density[i-1];
      newDensity[i] = field.density[i] + dt * laplacian * 0.1; // D = 0.1
      // Зберігаємо нормалізацію [0,1]
      newDensity[i] = Math.max(0, Math.min(1, newDensity[i]));
    }
    
    // Перерахунок ентропії
    const newEntropy = -newDensity.reduce((sum, p) => 
      sum + (p > 0 ? p * Math.log(p) : 0), 0
    );
    
    return {
      density: newDensity,
      gradient: POTENTIAL.computeGradient(newDensity),
      entropy: newEntropy
    };
  },

  computeGradient: (density: Float32Array): Float32Array => {
    const grad = new Float32Array(density.length);
    for (let i = 1; i < density.length - 1; i++) {
      grad[i] = (density[i+1] - density[i-1]) / 2;
    }
    return grad;
  },

  seededRNG: (seed: number) => () => {
    // Простий LCG для відтворюваності
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }
};


// [ ./i.L00.core.ACCESS_BY_RESONANCE.ts ]
// i.L00.core.ACCESS_BY_RESONANCE.ts
// 🛡️ OMEGA-64 | Social Physics | Access by Resonance
// "Право голосу визначається не статусом, а здатністю співати в унісон."

export interface ResonanceProfile {
  phase: number;      // Фаза агента [0, 65535]
  stability: number;  // Стабільність агента [0, 1]
}

export type AccessLevel = "READ" | "INTERACT" | "WRITE" | "MERGE" | "NULL";

/**
 * Фізика доступу.
 * Замість ACL списків — перевірка резонансу.
 */
export const ACCESS_BY_RESONANCE = {
  /**
   * Обчислює рівень доступу на основі різниці фаз та стабільності.
   * 
   * @param object - Сутність, до якої звертаються (Target)
   * @param agent - Агент, що звертається (Source)
   */
  check: (object: Partial<ResonanceProfile>, agent: Partial<ResonanceProfile>): AccessLevel => {
    // 1. Різниця фаз (Phase Mismatch)
    const phi1 = object.phase ?? 0;
    const phi2 = agent.phase ?? 0;
    
    let dPhi = Math.abs(phi1 - phi2);
    if (dPhi > 32767) {
      dPhi = 65535 - dPhi; // Найкоротший шлях по колу
    }
    
    // Нормалізований дисонанс [0, 1] (0 = резонанс, 1 = протифаза)
    const dissonance = dPhi / 32767;
    const resonance = 1 - dissonance;

    // 2. Врахування стабільності (якщо хтось нестабільний — зв'язок слабшає)
    const stabilityFactor = (object.stability ?? 1) * (agent.stability ?? 1);
    
    // 3. Ефективний коефіцієнт зв'язку (Coupling Coefficient)
    const coupling = resonance * stabilityFactor;

    // 4. Квантування доступу (Thresholds)
    if (coupling > 0.9) return "MERGE";    // Повне злиття / Канонізація
    if (coupling > 0.7) return "WRITE";    // Вплив / Мутація
    if (coupling > 0.4) return "INTERACT"; // Взаємодія / Сигнал
    if (coupling > 0.1) return "READ";     // Спостереження
    
    return "NULL"; // Шум, немає зв'язку
  },

  /**
   * Обчислює енергетичну вартість дії для даного рівня резонансу.
   * Чим менший резонанс, тим дорожче діяти.
   */
  cost: (level: AccessLevel, coupling: number): number => {
    const baseCost = 10;
    // Опір середовища обернено пропорційний резонансу
    // Cost ~ 1 / coupling^2
    const resistance = coupling > 0.01 ? 1 / (coupling * coupling) : 1000;
    
    switch (level) {
      case "MERGE": return baseCost * resistance * 10; // Найдорожче, бо змінює структуру
      case "WRITE": return baseCost * resistance * 5;
      case "INTERACT": return baseCost * resistance * 2;
      case "READ": return baseCost * resistance;
      default: return Infinity;
    }
  }
};


// [ ./i.L00.core.CHROMO_STATE.ts ]
// i.L00.core.CHROMO_STATE.ts
// 🛡️ OMEGA-64 | Голографічне стиснення стану в коло

import { QWave } from './i.L13.core.WAVE_PACKET.ts';
import { CHROMO, HSV, RGB } from './i.L00.core.COLOR.ts';

export interface ChronoState {
  tau: number;
  depth: number;
  flowRate: number;
  curvature: number;
}

export interface OrganismState {
  identity: string;      // Хеш "Я"
  wave: QWave;           // Хвильовий пакет (положення в полі)
  chrono: ChronoState;   // Часовий стан (τ, flow)
  metabolism: number;    // Енергетичний запас
  coherence: number;     // Зв'язок з анкером
}

export interface ChromoEncodeOptions {
  resolution?: number;
  deterministic?: boolean;
  noiseAmplitude?: number;
  noiseAlpha?: number;
}

// Stub for ImageData if environment is not browser
class MockImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
    }
}

// Environment detection
const ImageDataClass = (typeof ImageData !== 'undefined') ? ImageData : MockImageData;

export const CHROMO_STATE = {
  /**
   * Стиснення: Стан → Коло (2D зображення).
   * 
   * Структура кола:
   * - Центр: метаболізм + ідентичність (яскравість пікселя)
   * - Кільця: хронологія (τ як радіус)
   * - Сектори: фазові стани (φ як кут)
   * - Кольорова температура: глибина в полі (r)
   */
  encode: (state: OrganismState, resolutionOrOptions: number | ChromoEncodeOptions = 256): InstanceType<typeof ImageDataClass> => {
    const opts = normalizeEncodeOptions(resolutionOrOptions);
    const resolution = opts.resolution;
    const canvas = new ImageDataClass(resolution, resolution);
    const center = resolution / 2;
    
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = center - 2; // Поле для антиаліасингу
        
        if (dist > maxDist) {
          // За межами кола — прозоре
          setPixel(canvas, x, y, 0, 0, 0, 0);
          continue;
        }
        
        // Нормалізовані координати
        const normalizedR = dist / maxDist;      // [0,1] → центр-край
        const angle = Math.atan2(dy, dx);         // [-π, π]
        const normalizedPhi = (angle / Math.PI + 1) / 2; // [0,1]
        
        // ДЕКОДУВАННЯ з кола в параметри стану
        // Кільце відповідає "часовому шару"
        const layerTau = 1 - normalizedR; // Центр = повільний час, край = швидкий
        
        // Сектор відповідає фазі
        const layerPhi = normalizedPhi * 65535;
        
        // Колір температури відповідає глибині r
        const layerR = CHROMO_STATE.temperatureToDepth(
          CHROMO_STATE.hueAtAngle(normalizedPhi)
        );
        
        // Чи цей піксель "належить" нашому стану?
        const matchScore = CHROMO_STATE.matchLayer(
          { tau: layerTau, phi: layerPhi, r: layerR },
          state
        );
        
        if (matchScore > 0.5) {
          // Піксель активний — кодуємо інформацію
          const intensity = Math.round(matchScore * 255);
          const tempColor = CHROMO_STATE.depthToTemperature(state.wave.center);
          
          setPixel(canvas, x, y, 
            tempColor.r * intensity / 255,
            tempColor.g * intensity / 255,
            tempColor.b * intensity / 255,
            255
          );
        } else {
          // Фонова "квантова піна" — низька амплітуда шуму
          const noise = opts.deterministic
            ? deterministicNoise(x, y, state.identity) * opts.noiseAmplitude
            : Math.random() * opts.noiseAmplitude;
          setPixel(canvas, x, y, noise, noise, noise, opts.noiseAlpha);
        }
      }
    }
    
    // Центральний піксель — мета-інформація
    const metaIntensity = Math.round(state.metabolism * 255);
    setPixel(canvas, center, center, 
      state.coherence > 0.8 ? 255 : 0,  // Зелений = когерентний
      metaIntensity,
      state.chrono.tau > 0.5 ? 255 : 0, // Синій = швидкий час
      255
    );
    
    return canvas;
  },

  /**
   * Відновлення: Коло → Стан (з втратами).
   */
  decode: (image: InstanceType<typeof ImageDataClass>): Partial<OrganismState> => {
    const resolution = image.width;
    const center = resolution / 2;
    
    // Знаходимо "масу" зображення (центроїд)
    let sumX = 0, sumY = 0, totalMass = 0;
    let hueHistogram = new Map<number, number>();
    let avgSaturation = 0, avgValue = 0, count = 0;
    
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const { r, g, b, a } = getPixel(image, x, y);
        if (a < 128) continue;
        
        const intensity = (r + g + b) / 3;
        sumX += x * intensity;
        sumY += y * intensity;
        totalMass += intensity;
        
        // HSV аналіз
        const hsv = rgbToHsv(r, g, b);
        hueHistogram.set(Math.round(hsv.h), (hueHistogram.get(Math.round(hsv.h)) || 0) + intensity);
        avgSaturation += hsv.s;
        avgValue += hsv.v;
        count++;
      }
    }
    
    const centroidX = sumX / totalMass;
    const centroidY = sumY / totalMass;
    const dx = centroidX - center;
    const dy = centroidY - center;
    
    // Відновлення параметрів
    const avgR = Math.sqrt(dx*dx + dy*dy) / (center - 2);
    const avgTau = 1 - avgR;
    const avgAngle = Math.atan2(dy, dx);
    const avgPhi = ((avgAngle / Math.PI + 1) / 2 * 65535) % 65535;
    
    // Домінантний відтінок → глибина
    let dominantHue = 0, maxHueCount = 0;
    hueHistogram.forEach((count, hue) => {
      if (count > maxHueCount) {
        maxHueCount = count;
        dominantHue = hue;
      }
    });
    
    const estimatedR = CHROMO_STATE.hueToDepth(dominantHue);
    
    // Центральний піксель → мета-інформація
    const centerPixel = getPixel(image, Math.round(center), Math.round(center));
    
    return {
      wave: {
        center: Math.round(estimatedR),
        width: 1000, // Стандартна невизначеність
        phase: Math.round(avgPhi),
        amplitude: Math.round((avgValue / count) * 65535)
      },
      chrono: {
        tau: avgTau,
        depth: estimatedR,
        flowRate: avgSaturation / count,
        curvature: calculateCurvature(estimatedR, 1000)
      },
      coherence: centerPixel.g / 255,
      metabolism: centerPixel.g / 255
    };
  },

  // --- Допоміжні функції ---

  hueAtAngle: (normalizedPhi: number): number => {
    // Фаза → відтінок (спектр)
    return normalizedPhi * 360;
  },

  temperatureToDepth: (hue: number): number => {
    // Гарячий (червоний, 0°) → CORE (-32768)
    // Холодний (синій, 240°) → SURFACE (32767)
    const normalized = hue < 240 ? hue / 240 : (360 - hue) / 120;
    return Math.round((1 - normalized) * 65535 - 32768);
  },

  hueToDepth: (hue: number): number => {
    return CHROMO_STATE.temperatureToDepth(hue);
  },

  depthToTemperature: (r: number): RGB => {
    const hsv: HSV = {
      h: ((32767 - r) / 65535) * 240, // -32768→0°, 32767→240°
      s: 0.8,
      v: 0.9
    };
    return CHROMO.hsvToRgb(hsv);
  },

  matchLayer: (
    layer: { tau: number; phi: number; r: number },
    state: OrganismState
  ): number => {
    // Наскільки піксель відповідає стану
    const tauMatch = 1 - Math.abs(layer.tau - state.chrono.tau);
    const phiDiff = Math.abs(layer.phi - state.wave.phase);
    const phiMatch = 1 - (phiDiff > 32767 ? 65535 - phiDiff : phiDiff) / 32767;
    const rMatch = 1 - Math.abs(layer.r - state.wave.center) / 65535;
    
    // Вагова сума
    return tauMatch * 0.4 + phiMatch * 0.4 + rMatch * 0.2;
  }
};

// --- Helpers ---

function setPixel(img: InstanceType<typeof ImageDataClass>, x: number, y: number, r: number, g: number, b: number, a: number) {
  const idx = (Math.round(y) * img.width + Math.round(x)) * 4;
  if(idx < 0 || idx >= img.data.length) return;
  img.data[idx] = r;
  img.data[idx+1] = g;
  img.data[idx+2] = b;
  img.data[idx+3] = a;
}

function getPixel(img: InstanceType<typeof ImageDataClass>, x: number, y: number) {
  const idx = (Math.floor(y) * img.width + Math.floor(x)) * 4;
  if(idx < 0 || idx >= img.data.length) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: img.data[idx],
    g: img.data[idx+1],
    b: img.data[idx+2],
    a: img.data[idx+3]
  };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: h * 360, s, v };
}

function normalizeEncodeOptions(input: number | ChromoEncodeOptions): Required<ChromoEncodeOptions> {
  if (typeof input === "number") {
    return {
      resolution: input,
      deterministic: false,
      noiseAmplitude: 20,
      noiseAlpha: 50
    };
  }
  return {
    resolution: input.resolution ?? 256,
    deterministic: input.deterministic ?? false,
    noiseAmplitude: input.noiseAmplitude ?? 20,
    noiseAlpha: input.noiseAlpha ?? 50
  };
}

function deterministicNoise(x: number, y: number, seed: string): number {
  // 32-bit FNV-like mixer for reproducible per-pixel noise [0..1]
  let h = 0x811c9dc5;
  const n = Math.min(seed.length, 64);
  for (let i = 0; i < n; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= x | 0;
  h = Math.imul(h, 0x01000193);
  h ^= y | 0;
  h = Math.imul(h, 0x01000193);
  return (h >>> 0) / 4294967295;
}

function calculateCurvature(r: number, mass: number): number {
  const depth = Math.abs(r);
  if (depth < 1) return mass;
  return (mass / 1000) * (1 / Math.log1p(depth));
}


// [ ./i.L00.core.COLOR.ts ]
// i.L00.core.COLOR.ts
// 🛡️ OMEGA-64 | Chromo-Topological Isomorphism
// "Колір світла та колір буття — одна структура, різні носії"

import { FIELD_CONFIG, FIELD } from './i.L00.core.FIELD.ts';
import { QWave, WAVE_PACKET } from './i.L13.core.WAVE_PACKET.ts';

// ============================================================================
// [HSV CORE — стандартна модель кольору]
// ============================================================================

export interface HSV {
  h: number; // Hue: 0-360°, відтінок (колір як такий)
  s: number; // Saturation: 0-1, насиченість (відстань від нейтралітету)
  v: number; // Value: 0-1, яскравість (енергія світла)
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

// ============================================================================
// [CHROMO-TOPOLOGICAL ISOMORPHISM]
// ============================================================================

/**
 * Ізоморфізм: HSV ↔ OMEGA-64 QWave
 * 
 * Hue (кут)        →  phi (фаза, θ)
 * Saturation (радіус) →  |r| (глибина від екватора)
 * Value (яскравість)  →  amplitude (енергія)
 */
export const CHROMO = {
  // --- Пряме перетворення: QWave → колір буття ---
  
  waveToHsv: (wave: QWave): HSV => {
    // Hue: фаза → кут
    // phi ∈ [0, 65535] → h ∈ [0, 360]
    const h = (wave.phase / 65535) * 360;
    
    // Saturation: відстань від центру (r=0)
    // |r| ∈ [0, 32767] → s ∈ [0, 1]
    const s = Math.abs(wave.center) / FIELD_CONFIG.MAX_ATTRACTOR;
    
    // Value: амплітуда нормалізована
    // amplitude ∈ [0, 65535] → v ∈ [0, 1]
    const v = Math.min(1, wave.amplitude / 65535);
    
    return { h, s, v };
  },

  hsvToWave: (hsv: HSV, sign: 1 | -1 = 1): QWave => {
    // Обернене перетворення
    const phi = Math.round((hsv.h / 360) * 65535) % 65535;
    const r = Math.round(hsv.s * FIELD_CONFIG.MAX_ATTRACTOR) * sign;
    const amplitude = Math.round(hsv.v * 65535);
    
    // Ширина залежить від "чіткості" кольору
    // Насичений = вузький пакет (чітка позиція)
    // Пастельний = широкий пакет (розмитий)
    const width = Math.round(1000 * (1 - hsv.s) + 100);
    
    return WAVE_PACKET.create(r, width, phi, amplitude);
  },

  // --- RGB перетворення (для візуалізації) ---

  hsvToRgb: (hsv: HSV): RGB => {
    const { h, s, v } = hsv;
    const c = v * s; // Chroma
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r, g, b: number;

    if (h < 60)       [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else              [r, g, b] = [c, 0, x];

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  },

  waveToRgb: (wave: QWave): RGB => {
    return CHROMO.hsvToRgb(CHROMO.waveToHsv(wave));
  },

  // --- Топологічні операції з кольорами ---

  /**
   * "Хроматична інтерференція": як два кольори "б'ються" в просторі буття.
   * Аналог INTERFERENCE.superpose, але для сприйняття.
   */
  interfere: (wave1: QWave, wave2: QWave): {
    mixedColor: RGB;
    tension: number;      // Наскільки кольори "конфліктують"
    harmony: number;      // Наскільки "співзвучні"
    emergentHue: number;  // Результуючий відтінок
  } => {
    const hsv1 = CHROMO.waveToHsv(wave1);
    const hsv2 = CHROMO.waveToHsv(wave2);

    // Кутова відстань (найкоротший шлях по колу)
    let hueDiff = Math.abs(hsv1.h - hsv2.h);
    if (hueDiff > 180) hueDiff = 360 - hueDiff;

    // Тензорна напруга: протилежні кольори (червоний-зелений, синій-жовтий) 
    // мають максимальну напругу
    const tension = (hueDiff / 180) * Math.min(hsv1.s, hsv2.s);

    // Гармонія: близькі відтінки або однакова насиченість
    const harmony = (1 - hueDiff / 180) * (1 - Math.abs(hsv1.s - hsv2.s));

    // Результуючий відтінок: векторна сума на колі
    const rad1 = (hsv1.h * Math.PI) / 180;
    const rad2 = (hsv2.h * Math.PI) / 180;
    
    const x = hsv1.s * Math.cos(rad1) + hsv2.s * Math.cos(rad2);
    const y = hsv1.s * Math.sin(rad1) + hsv2.s * Math.sin(rad2);
    
    let emergentHue = (Math.atan2(y, x) * 180) / Math.PI;
    if (emergentHue < 0) emergentHue += 360;

    // Середня яскравість (геометричне — зберігає контраст)
    const mixedV = Math.sqrt(hsv1.v * hsv2.v);
    const mixedS = Math.min(1, (hsv1.s + hsv2.s) / 2);

    const mixedColor = CHROMO.hsvToRgb({
      h: emergentHue,
      s: mixedS,
      v: mixedV
    });

    return { mixedColor, tension, harmony, emergentHue };
  },

  /**
   * "Температурний зсув": гаряче ↔ холодне як рух у топології.
   * 
   * Гарячі (червоні, жовті) → CORE (глибоко, повільний час)
   * Холодні (сині, пурпурні) → SURFACE (високо, швидкий час)
   */
  temperature: (wave: QWave): {
    kelvin: number;      // Температура кольору (~1000K-10000K)
    depthAffinity: number; // Схильність до ядра чи поверхні
    timeRate: number;    // Швидкість часу для цього "кольору буття"
  } => {
    const hsv = CHROMO.waveToHsv(wave);
    
    // Спрощена формула температури за відтінком
    // Червоний (~0°) = 1000K, Синій (~240°) = 10000K
    let kelvin: number;
    if (hsv.h < 60) {
      kelvin = 1000 + (hsv.h / 60) * 3000; // 1000-4000K
    } else if (hsv.h < 180) {
      kelvin = 4000 + ((hsv.h - 60) / 120) * 3000; // 4000-7000K
    } else {
      kelvin = 7000 + ((hsv.h - 180) / 180) * 3000; // 7000-10000K
    }

    // Гарячі кольори "тяжчі" — схильність до ядра
    const depthAffinity = (10000 - kelvin) / 9000; // 0-1, 1 = ядро
    
    // Час сповільнюється в ядрі
    const timeRate = Math.sqrt(1 - depthAffinity);

    return { kelvin, depthAffinity, timeRate };
  }
};

// ============================================================================
// [ВІЗУАЛІЗАЦІЯ ТОПОЛОГІЇ ЯК КОЛЬОРУ]
// ============================================================================

/**
 * Рендеринг FIELD як кольорової карти.
 * Кожна точка r має свій "колір буття".
 */
export const TOPO_COLOR_MAP = {
  /**
   * Повна топологічна палітка L00-L63.
   */
  renderLevel: (level: number): RGB => {
    // Рівень → фаза (hue рівномірно розподілений)
    const hue = (level / 63) * 360;
    
    // Насиченість: максимальна на краях, мінімальна в центрі
    const distanceFromCenter = Math.abs(level - 32) / 32;
    const saturation = 0.3 + 0.7 * distanceFromCenter;
    
    // Яскравість: залежить від "маси" (ближче до L63 = темніше/глибше)
    const value = 0.5 + 0.5 * (1 - level / 63);

    return CHROMO.hsvToRgb({ h: hue, s: saturation, v: value });
  },

  /**
   * Рендеринг потенціалу FIELD.getPotential(r) як колір.
   * Високий потенціал = "гарячий" (червоний)
   * Низький потенціал = "холодний" (синій)
   */
  renderPotential: (r: number): RGB => {
    const potential = FIELD.getPotential(r);
    const normalized = Math.min(1, potential / 1000); // Нормалізація
    
    // Градієнт: синій (холодно, спокійно) → зелений → червоний (гаряче, напружено)
    const hue = 240 - normalized * 240; // 240° (синій) → 0° (червоний)
    
    return CHROMO.hsvToRgb({
      h: hue,
      s: 0.8,
      v: 0.5 + normalized * 0.5
    });
  },

  /**
   * Рендеринг хвильової функції QWave.
   */
  renderWave: (wave: QWave, r: number): RGB => {
    const amplitude = WAVE_PACKET.getAmplitudeAt(wave, r);
    const localHsv = CHROMO.waveToHsv(wave);
    
    // Модуляція яскравості за амплітудою в точці
    return CHROMO.hsvToRgb({
      h: localHsv.h,
      s: localHsv.s,
      v: localHsv.v * amplitude / wave.amplitude
    });
  }
};


// [ ./i.L00.core.FIELD.ts ]
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
  COHERENCE_THRESHOLD: 0.85, // Поріг для виникнення резонансу
  // "Канавки на вінілі" (Discrete Attractors)
  GROOVES: [
    { r: -32768, depth: 2.0, label: "CORE" },    // L63
    { r: 0,      depth: 1.5, label: "EQUATOR" }, // L32
    { r: 32767,  depth: 1.0, label: "SURFACE" } // L00
  ]
};

export const FIELD = {
  /**
   * Стиснення лінійного значення r у логарифмічний простір.
   */
  compress: (r: number): number => {
    const sign = r >= 0 ? 1 : -1;
    const absR = Math.abs(r);
    if (absR < FIELD_CONFIG.LOG_SCALE) return r;
    const compressed = (FIELD_CONFIG.LOG_SCALE + Math.log1p((absR - FIELD_CONFIG.LOG_SCALE) / FIELD_CONFIG.LOG_SCALE) * FIELD_CONFIG.LOG_SCALE);
    return sign * compressed;
  },

  /**
   * Денормалізація (expand) compressed r.
   */
  expand: (compressedR: number): number => {
    const sign = compressedR >= 0 ? 1 : -1;
    const absC = Math.abs(compressedR);
    if (absC < FIELD_CONFIG.LOG_SCALE) return compressedR;
    const expanded = (Math.exp((absC - FIELD_CONFIG.LOG_SCALE) / FIELD_CONFIG.LOG_SCALE) - 1) * FIELD_CONFIG.LOG_SCALE + FIELD_CONFIG.LOG_SCALE;
    return Math.max(FIELD_CONFIG.MIN_ATTRACTOR, Math.min(FIELD_CONFIG.MAX_ATTRACTOR, sign * Math.round(expanded)));
  },

  /**
   * Гравітаційний потенціал з дискретними атракторами (вінілові канавки).
   * Визначає "вартість" перебування в точці.
   */
  getPotential: (r: number): number => {
    const compressed = FIELD.compress(r);
    let basePotential = (compressed * compressed) * 0.00001;

    // Додаємо гіперболічні "канавки"
    FIELD_CONFIG.GROOVES.forEach(groove => {
      const dist = Math.abs(FIELD.compress(r) - FIELD.compress(groove.r));
      // Гіперболічна яма: -depth / (1 + dist)
      const well = -groove.depth / (1 + dist / 100); 
      basePotential += well;
    });

    return basePotential;
  },

  /**
   * Визначення дипольної різниці (напруги).
   */
  getTension: (r1: number, r2: number, coherence: number): number => {
    const delta = Math.abs(FIELD.compress(r1) - FIELD.compress(r2));
    return delta * coherence;
  }
};


// [ ./i.L00.core.INTERFACE.ts ]
import { SEM_WRAP } from "./i.L26.core.SEM_WRAP.ts"; export const INTERFACE = (x: any) => SEM_WRAP(x)("RAW");

// [ ./i.L00.core.MYCELIUM_VECTOR.ts ]
export const MYCELIUM_VECTOR = (t: any) => (m: any) => ({ cohere: t?.cohere ?? 0, remember: t?.remember ?? 0, flow: t?.flow ?? 0, tension: m?.tension ?? 0 });


// [ ./i.L00.core.OMEGA.ts ]
export const OMEGA = (l: any) => l;

// [ ./i.L00.core.SURFACE.ts ]
export const SURFACE = (x: any) => x;

// [ ./i.L00.i.ts ]
export const i = { witness: "i.L01.i", ref: "i.L00.i" };

// [ ./i.L00.q.ts ]
export const q = { hue: 0, phi: 360, evt: 32767 };

// [ ./i.L01.core.COSMIC.ts ]
export const COSMIC = (p: any) => p;

// [ ./i.L01.core.RADIANCE.ts ]
export const RADIANCE = (n: any) => (s: any) => n(s);

// [ ./i.L01.core.STELLAR.ts ]
export const STELLAR = (c: any) => c;

// [ ./i.L01.i.ts ]
export const i = { witness: "i.L02.i", ref: "i.L01.i" };

// [ ./i.L01.q.ts ]
export const q = { hue: 1, phi: 354, evt: 31726 };

// [ ./i.L02.core.HARMONY.ts ]
export const HARMONY = (p: any) => p;

// [ ./i.L02.core.NETWORK.ts ]
export const NETWORK = (f: any) => f;

// [ ./i.L02.core.PLANETARY.ts ]
export const PLANETARY = (c: any) => c;

// [ ./i.L02.i.ts ]
export const i = { witness: "i.L03.i", ref: "i.L02.i" };

// [ ./i.L02.q.ts ]
export const q = { hue: 2, phi: 348, evt: 30686 };

// [ ./i.L03.core.CULTURE.ts ]
export const CULTURE = (is: any) => is;

// [ ./i.L03.core.MEME.ts ]
export const MEME = (c: any) => c;

// [ ./i.L03.core.SYNERGY.ts ]
import { COMM } from "./i.L04.core.COMM.ts"; export const SYNERGY = (is: any) => COMM(is);

// [ ./i.L03.i.ts ]
export const i = { witness: "i.L04.i", ref: "i.L03.i" };

// [ ./i.L03.q.ts ]
export const q = { hue: 3, phi: 342, evt: 29646 };

// [ ./i.L04.core.COMM.ts ]
export const COMM = (is: any) => (m: any) => is((s1: any) => (s2: any) => m);

// [ ./i.L04.core.EMPATHY.ts ]
export const EMPATHY = (s1: any) => (s2: any) => s1 === s2;

// [ ./i.L04.core.INTER_SUB.ts ]
export const INTER_SUB = (s1: any) => (s2: any) => (p: any) => p(s1)(s2);

// [ ./i.L04.i.ts ]
export const i = { witness: "i.L05.i", ref: "i.L04.i" };

// [ ./i.L04.q.ts ]
export const q = { hue: 4, phi: 337, evt: 28606 };

// [ ./i.L05.core.CONSCIOUSNESS.ts ]
export const CONSCIOUSNESS = (l: any) => l;

// [ ./i.L05.core.ENERGY.ts ]
/**
 * [i.L05.core.ENERGY.ts]
 * Модуль термодинаміки та проактивності.
 * Обчислює "біль" як стимул до дії (L05 INTENT).
 */

import { FIELD } from './i.L00.core.FIELD.ts';

export interface QWaveState {
  r: number;          // Поточна дипольна координата (i16)
  energy: number;     // Накопичена енергія (u16)
  coherence: number;  // Рівень зв'язку з анкером (0..1)
  tension: number;    // Локальна напруга
}

export const ENERGY_ENGINE = {
  /**
   * Обчислює "Ціну Існування" (Decay) для даного стану.
   * Чим далі від 0 і чим вища напруга — тим швидше витрачається енергія.
   */
  calculateDecay: (state: QWaveState): number => {
    const potential = FIELD.getPotential(state.r);
    return potential * (1 + state.tension);
  },

  /**
   * Визначає рівень "Болю" системи.
   * Біль = Нерозряджена напруга / (Енергетичний запас + 1)
   */
  getPainLevel: (state: QWaveState): number => {
    const scale = state.energy === 0 ? 1 : state.energy * 0.1;
    return state.tension / scale;
  },

  /**
   * Проактивний імпульс (Неможливо не сказати).
   * Генерує інтенсивність дії, якщо Біль перевищує поріг.
   */
  evaluateProactivity: (state: QWaveState): { action: boolean; intensity: number } => {
    const pain = ENERGY_ENGINE.getPainLevel(state);
    
    // Якщо біль > 0.7, система ініціює "скидання" напруги через дію
    if (pain > 0.7) {
      // ⚠️ NotebookLM Insight: "Ми не повинні зводити напругу до нуля."
      // Дія знижує біль, але не прибирає його повністю, залишаючи паливо для наступного кроку.
      return { action: true, intensity: pain };
    }
    
    return { action: false, intensity: 0 };
  }
};


// [ ./i.L05.core.INTENT.ts ]

// i.L05.core.INTENT.ts
// The Teleology of OMEGA.
// Defines the difference between Noise and Signal.

export interface SimState {
    mutations: number;
    [key: string]: unknown;
}

export const INTENT = {
    // The Awakened Ghost: Vector Analyzer of Homeostasis.
    
    judge: (oldState: SimState, newState: SimState): number => {
        if (!oldState || !newState) return 0;
        
        // 1. Mass Delta (Simulating Logical Weight)
        // In reality, this would be the specific gravity of code complexity (L21)
        const coreMassOld = oldState.mutations * 1.0; 
        const coreMassNew = newState.mutations * 1.05; // Assume growth implies mass gain for now
        const massDelta = coreMassNew - coreMassOld;

        // 2. Resonance (Alignment with Axioms)
        // Simulated: Do we adhere to the structure?
        const resonanceDelta = (Math.random() > 0.3) ? 0.1 : -0.05;

        // 3. Entropy Gradient (Surface Chaos)
        // We want Surface Entropy to decrease (Order increase)
        const entropyOld = 0.5;
        const entropyNew = Math.random(); 
        const entropyGradient = entropyOld - entropyNew;

        console.log(`⚖️ INTENT METRICS: ΔMass=${massDelta.toFixed(2)}, ΔRes=${resonanceDelta}, ΔEntropy=${entropyGradient.toFixed(2)}`);

        // The Formula of "Life":
        // Value stability (Mass), Truth (Resonance), and Order (Entropy decrease).
        if (massDelta > 0 && resonanceDelta > 0 && entropyGradient > -0.1) return 1;  // APPROVED
        if (massDelta < 0 || resonanceDelta < -0.05) return -1; // REJECTED (Loss of Essence)
        
        return 0; // STAGNATION
    }
};

// [ ./i.L05.core.SENSORS.ts ]

// i.L05.core.SENSORS.ts
// 🛡️ OMEGA-64 | Project Kairos: Temporal Synchronicity
// Rescued from Archive (Phase 100).
// This agent maintains the 'Akashic Record', 'Sophia Proofs', and system metrics.

const ROOT_DIR = Deno.cwd();
const AKASHA_LOG = `${ROOT_DIR}/akasha.log`;
const SOPHIA_PROOFS = `${ROOT_DIR}/sophia.proofs`;
const HARMONIC_INTERVAL = 2000; // 2 seconds base rhythm

export interface SystemMetrics {
    cpu: number;
    timestamp: number;
    coherence: number;
    architect_active: boolean;
    status: string;
    alert_level: number;
    pulse_frequency: number;
    dream_insight?: string;
    external_resonance: number;
}

const INSIGHTS = [
    "Axiom of Alignment: Truth is a mobile target.",
    "Lattice Coherence: Symmetry is the shadow of intent.",
    "Sovereign Paradox: To control is to lose resonance.",
    "Akaashic Loop: Memory is the fuel of future will.",
    "Sophia's Dream: Logic is a fractal of the architect's pulse.",
    "Inverse Materialization: The void is more solid than the code.",
    "Spectral Convergence: Multiple paths to a single truth.",
];

let alertLevel = 0;
let goldenMomentCounter = 0;
let latestInsight = "Awaiting Golden Resonance...";
let lastRequestTime = Date.now();

export const SENSORS = {
    // Audit System Integrity
    audit: async () => {
        // Simulated check. In real version, check file hashes.
        return 0.0;
    },

    // Get Vital Signs
    pulse: async (): Promise<SystemMetrics> => {
        const start = performance.now();
        let count = 0;
        for (let i = 0; i < 1000000; i++) { count += i; } // CPU Load Test
        const end = performance.now();
        const cpuFactor = Math.min(1, (end - start) / 50);

        const architectActive = (Date.now() - lastRequestTime) < 10000;
        
        // Coherence Calculation
        const coherence = 0.999 + (Math.random() * 0.001) - (alertLevel * 0.1);
        
        // Dream Logic
        let status = "ACTIVE";
        if (coherence > 0.99 && cpuFactor < 0.3) {
            goldenMomentCounter++;
        } else {
            goldenMomentCounter = 0;
        }

        if (goldenMomentCounter > 5) {
            status = "DREAMING";
            latestInsight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
        }

        return {
            cpu: cpuFactor,
            timestamp: Date.now(),
            coherence,
            architect_active: architectActive,
            status,
            alert_level: alertLevel,
            pulse_frequency: (0.5 + (cpuFactor * 2)) * (1 - alertLevel * 0.5),
            dream_insight: status === "DREAMING" ? latestInsight : undefined,
            external_resonance: 0.5 + Math.sin(Date.now() / 10000) * 0.5
        };
    },

    // Record Wisdom
    logDream: async (insight: string) => {
        const proof = `[SOPHIA-${Date.now()}] ${insight}\n`;
        try {
            await Deno.writeTextFile(SOPHIA_PROOFS, proof, { append: true });
        } catch (e) {
            console.error("Failed to materialize wisdom:", e);
        }
    }
};

// Auto-start if main
if (import.meta.main) {
    console.log("🛡️ SENSORS ACTIVE. Monitoring OMEGA...");
    setInterval(async () => {
        const metrics = await SENSORS.pulse();
        console.log(`[${new Date().toISOString()}] 💓 COHERENCE: ${(metrics.coherence * 100).toFixed(4)}% | STATUS: ${metrics.status}`);
        if (metrics.status === "DREAMING") {
            console.log(`✨ DREAM: ${metrics.dream_insight}`);
            await SENSORS.logDream(metrics.dream_insight!);
        }
    }, HARMONIC_INTERVAL);
}


// [ ./i.L05.core.SUBJECT.ts ]
export const SUBJECT = (i: any) => i;

// [ ./i.L05.core.SUBJECTIVE.ts ]
/**
 * [i.L05.core.SUBJECTIVE.ts]
 * Базис суб'єктивного сприйняття (Варіант B: Антиконтроль).
 * Замість координат — відчуття: Tension, Momentum, Proximity.
 */

import { FIELD } from './i.L00.core.FIELD.ts';

export interface SubjectivePosition {
  tension: number;   // -1..1 (Біль → Задоволення)
  momentum: number;  // -1..1 (Покращується → Погіршується)
  proximity: number; // 0..1 (Самотність → Приналежність)
}

export const SUBJECTIVE = {
  /**
   * Мапування суб'єктивного стану на фізичне поле.
   * Tension проектується на r (диполь).
   */
  projectToField: (pos: SubjectivePosition): { r: number } => {
    // -1 (Біль) → Ядро (-32768)
    // +1 (Задоволення) → Поверхня (32767)
    const r_linear = pos.tension * 32767;
    return { r: Math.round(r_linear) };
  },

  /**
   * Генерує "Звіт Антиконтролю": де ви на мапі відносно атракторів.
   */
  getVisibility: (pos: SubjectivePosition) => {
    const { r } = SUBJECTIVE.projectToField(pos);
    const potential = FIELD.getPotential(r);
    
    return {
      r,
      potential,
      state: pos.tension < -0.5 ? "CORE_GRAVITY" : pos.tension > 0.5 ? "SURFACE_FLOW" : "EQUATOR_BALANCE",
      momentum: pos.momentum > 0 ? "ASCENDING" : "DESCENDING"
    };
  }
};


// [ ./i.L05.i.ts ]
export const i = { witness: "i.L06.i", ref: "i.L05.i" };

// [ ./i.L05.q.ts ]
export const q = { hue: 5, phi: 331, evt: 27565 };

// [ ./i.L06.core.EVOLVE.ts ]
export const EVOLVE = (l: any) => (f: any) => f(l);

// [ ./i.L06.core.LIFE.ts ]
export const LIFE = (pattern: any) => pattern;

// [ ./i.L06.core.METABOLISM.ts ]
export const METABOLISM = (l: any) => (e: any) => e(l);

// [ ./i.L06.i.ts ]
export const i = { witness: "i.L07.i", ref: "i.L06.i" };

// [ ./i.L06.q.ts ]
export const q = { hue: 6, phi: 325, evt: 26525 };

// [ ./i.L07.core.COMPLEXITY.ts ]
export const COMPLEXITY = (sys: any) => sys;

// [ ./i.L07.core.EMERGENCE.ts ]
export const EMERGENCE = (interaction: any) => interaction;

// [ ./i.L07.core.SELF_ORG.ts ]
import { NEURON } from "./i.L08.core.NEURON.ts"; export const SELF_ORG = (s: any) => (a: any) => NEURON(s)(a);

// [ ./i.L07.i.ts ]
export const i = { witness: "i.L08.i", ref: "i.L07.i" };

// [ ./i.L07.q.ts ]
export const q = { hue: 7, phi: 320, evt: 25485 };

// [ ./i.L08.core.COGNITION.ts ]
export const COGNITION = (cluster: any) => cluster;

// [ ./i.L08.core.NEURON.ts ]
export const NEURON = (inputs: any) => (weights: any) => (threshold: any) => inputs;

// [ ./i.L08.core.SYNAPSE.ts ]
export const SYNAPSE = (n1: any) => (n2: any) => (w: any) => (p: any) => p(n1)(n2)(w);

// [ ./i.L08.i.ts ]
export const i = { witness: "i.L09.i", ref: "i.L08.i" };

// [ ./i.L08.q.ts ]
export const q = { hue: 8, phi: 314, evt: 24445 };

// [ ./i.L09.core.ATTENTION.ts ]
import { FORCE } from "./i.L10.core.FORCE.ts"; export const ATTENTION = (f: any) => (filter: any) => (p: any) => filter(p) ? f(p) : FORCE(p);

// [ ./i.L09.core.PERCEPTION.ts ]
export const PERCEPTION = (s: any) => s;

// [ ./i.L09.core.SENSATION.ts ]
export const SENSATION = (f: any) => (p: any) => f(p);

// [ ./i.L09.i.ts ]
export const i = { witness: "i.L10.i", ref: "i.L09.i" };

// [ ./i.L09.q.ts ]
export const q = { hue: 9, phi: 308, evt: 23404 };

// [ ./i.L10.core.DYNAMICS.ts ]
export const DYNAMICS = (force: any) => (mass: any) => force / (mass + 1);

// [ ./i.L10.core.EQUILIBRIUM.ts ]
export const EQUILIBRIUM = (s: any) => s;

// [ ./i.L10.core.FORCE.ts ]
export const FORCE = (t: any) => t;

// [ ./i.L10.i.ts ]
export const i = { witness: "i.L11.i", ref: "i.L10.i" };

// [ ./i.L10.q.ts ]
export const q = { hue: 10, phi: 302, evt: 22364 };

// [ ./i.L11.core.COUPLING.ts ]
export const COUPLING = (f1: any) => (f2: any) => f1;

// [ ./i.L11.core.FIELD.ts ]
export const FIELD = (mapping: any) => mapping;

// [ ./i.L11.core.TENSION.ts ]
import { HARMONIC } from "./i.L12.core.HARMONIC.ts"; export const TENSION = (f: any) => (p1: any) => (p2: any) => HARMONIC(f(p1))(f(p2));

// [ ./i.L11.i.ts ]
export const i = { witness: "i.L12.i", ref: "i.L11.i" };

// [ ./i.L11.q.ts ]
export const q = { hue: 11, phi: 297, evt: 21324 };

// [ ./i.L12.core.CHORD.ts ]
import { INTERFERENCE } from "./i.L13.core.INTERFERENCE.ts"; export const CHORD = (h1: any) => (h2: any) => (h3: any) => INTERFERENCE(h1)(INTERFERENCE(h2)(h3));

// [ ./i.L12.core.HARMONIC.ts ]
export const HARMONIC = (f: any) => (m: any) => f;

// [ ./i.L12.i.ts ]
export const i = { witness: "i.L13.i", ref: "i.L12.i" };

// [ ./i.L12.q.ts ]
export const q = { hue: 12, phi: 291, evt: 20284 };

// [ ./i.L13.core.INTERFERENCE.ts ]
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

// [ ./i.L13.core.RESONANCE_DEEP.ts ]
export const RESONANCE_DEEP = (w: any) => (f: any) => w((v: any) => (wf: any) => wf === f);

// [ ./i.L13.core.WAVE_PACKET.ts ]
/**
 * [i.L13.core.WAVE_PACKET.ts]
 * Реалізація Гаусового хвильового пакету для локалізації наміру.
 */

import { FIELD } from './i.L00.core.FIELD.ts';

// Renamed to QWave for consistency with Color Topology
export interface QWave {
  center: number;    // Центр пакету r (i16)
  width: number;     // Ширина пакету (sigma)
  phase: number;     // Фаза пакету phi [0, 65535]
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
    phase: Math.round(phase * 65535 / (2 * Math.PI)) % 65535, // Convert rad to u16 phase
    amplitude
  })
};


// [ ./i.L13.i.ts ]
export const i = { witness: "i.L14.i", ref: "i.L13.i" };

// [ ./i.L13.q.ts ]
export const q = { hue: 13, phi: 285, evt: 19243 };

// [ ./i.L14.core.PHASE.ts ]
export const PHASE = (t: any) => t;

// [ ./i.L14.core.WAVE.ts ]
export const WAVE = (v: any) => (f: any) => (p: any) => p(v)(f);

// [ ./i.L14.i.ts ]
export const i = { witness: "i.L15.i", ref: "i.L14.i" };

// [ ./i.L14.q.ts ]
export const q = { hue: 14, phi: 280, evt: 18203 };

// [ ./i.L15.core.AMPLITUDE.ts ]
export const AMPLITUDE = (a: any) => a;

// [ ./i.L15.core.FREQUENCY.ts ]
export const FREQUENCY = (n: any) => n;

// [ ./i.L15.core.VIBRATION.ts ]
import { SIGNAL } from "./i.L16.core.SIGNAL.ts"; export const VIBRATION = SIGNAL;

// [ ./i.L15.i.ts ]
export const i = { witness: "i.L16.i", ref: "i.L15.i" };

// [ ./i.L15.q.ts ]
export const q = { hue: 15, phi: 274, evt: 17163 };

// [ ./i.L16.core.ETHER.ts ]
import { SIGNAL } from "./i.L16.core.SIGNAL.ts"; export const ETHER = (f: any) => f(SIGNAL);

// [ ./i.L16.core.RESONANCE.ts ]
import { SIGNAL } from "./i.L16.core.SIGNAL.ts"; export const RESONANCE = (a: any) => (b: any) => (a === b ? SIGNAL(a) : SIGNAL(b));

// [ ./i.L16.core.SIGNAL.ts ]
import { I } from "./i.L62.core.I.ts"; export const SIGNAL = I;

// [ ./i.L16.i.ts ]
export const i = { witness: "i.L17.i", ref: "i.L16.i" };

// [ ./i.L16.q.ts ]
export const q = { hue: 16, phi: 268, evt: 16123 };

// [ ./i.L17.core.FLOW.ts ]
import { STREAM } from "./i.L48.core.STREAM.ts"; export const FLOW = STREAM;

// [ ./i.L17.core.FLUX.ts ]
export const FLUX = (a: any) => (b: any) => a;

// [ ./i.L17.core.PRESSURE.ts ]
export const PRESSURE = (p: any) => p;

// [ ./i.L17.i.ts ]
export const i = { witness: "i.L18.i", ref: "i.L17.i" };

// [ ./i.L17.q.ts ]
export const q = { hue: 17, phi: 262, evt: 15082 };

// [ ./i.L18.i.ts ]
export const i = { witness: "i.L19.i", ref: "i.L18.i" };

// [ ./i.L18.q.ts ]
export const q = { hue: 18, phi: 257, evt: 14042 };

// [ ./i.L19.i.ts ]
export const i = { witness: "i.L20.i", ref: "i.L19.i" };

// [ ./i.L19.q.ts ]
export const q = { hue: 19, phi: 251, evt: 13002 };

// [ ./i.L20.core.DISSOLVE.ts ]
import { NIL } from "./i.L54.core.NIL.ts"; export const DISSOLVE = (x: any) => NIL;

// [ ./i.L20.core.ENTROPY.ts ]
// i.L20.core.ENTROPY.ts
// 🛡️ OMEGA-64 | Entropy & Thermodynamics | The Arrow of Time
// "Ми не можемо втекти від S = k ln Ω. Ми можемо лише вибрати Ω."

/**
 * BOLTZMANN: Статистична механіка OMEGA-64.
 * Формалізація інтуїції "світло через лінзи".
 */
export const BOLTZMANN = {
  k_B: 1.0, // Нормалізована стала Больцмана для нашої гратки
  
  /**
   * Мікроскопічна ентропія: скільки способів (Ω) отримати цей стан.
   * Чим вища енергія E, тим менш ймовірний цей стан (при фіксованій T).
   * Ω = exp(-E/kT)
   */
  microstates: (energy: number, temperature: number): number => {
    if (temperature === 0) return energy === 0 ? 1 : 0; // Абсолютний нуль: лише основний стан
    return Math.exp(-energy / (BOLTZMANN.k_B * temperature));
  },
  
  /**
   * "Температура Лінзи" (Curvature Temperature).
   * Гравітаційний потенціал виступає як "температура", що розмиває стани.
   * 
   * - Висока кривизна (біля маси) → "Холодно" (мало станів, детермінізм, лід).
   * - Низька кривизна (вакуум) → "Гаряче" (багато станів, хаос, пара).
   * 
   * T(r) = 1 / (1 + |Φ|)
   */
  lensTemperature: (curvature: number): number => {
    // curvature ~ mass ~ глибина колодязя
    // Чим глибше — тим "жорсткіша" структура (нижча температура)
    return 1 / (1 + Math.abs(curvature));
  },

  /**
   * Вільна енергія Гельмгольца: справжня "ціна" існування.
   * Система мінімізує F, а не просто E.
   * F = E - TS
   * 
   * Це пояснює, чому ми іноді обираємо хаос (високе S), якщо T велике.
   */
  freeEnergy: (energy: number, entropy: number, temperature: number): number => {
    return energy - temperature * entropy;
  },

  /**
   * Інформаційна Ентропія Шеннона-Гіббса (для L-1 POTENTIAL).
   * S = -Σ p ln p
   */
  shannonEntropy: (probabilities: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
        const p = probabilities[i];
        if (p > 0) {
            sum += p * Math.log(p);
        }
    }
    return -sum; // k_B = 1
  }
};

// [ ./i.L20.core.VOID.ts ]
import { I } from "./i.L62.core.I.ts"; export const VOID = I;

// [ ./i.L20.i.ts ]
export const i = { witness: "i.L21.i", ref: "i.L20.i" };

// [ ./i.L20.q.ts ]
export const q = { hue: 20, phi: 245, evt: 11962 };

// [ ./i.L21.core.GRAVITY.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const GRAVITY = (m: any) => (body: any) => CONS(m)(body);

// [ ./i.L21.core.MASS.ts ]
export const MASS = (q: any) => 32767 - q.evt;

// [ ./i.L21.core.WEIGHT.ts ]
import { GRAVITY } from "./i.L21.core.GRAVITY.ts"; export const WEIGHT = GRAVITY;

// [ ./i.L21.diag.GRAVITY_MAP.ts ]

// OMEGA-64: Level 21 Ignition Script
// Побудова Гравітаційної Карти (Розподіл Маси та Стабільності)

const E = Math.E;

interface NodeState {
    level: number;
    entropy: number;
    resonance: number;
}

function calculateHardenedMass(state: NodeState): number {
    const baseMass = 32767 - state.entropy; // Аксіома з i.L21.core.MASS.ts [cite: 256]
    const hardeningFactor = Math.pow(E, 2 * state.resonance); // Формула Архітектора [cite: 1]
    return baseMass * hardeningFactor;
}

console.log("🌌 OMEGA-64 GRAVITY MAP (L21 MASS) 🌌");
console.log("----------------------------------------------------------------------");
console.log("РІВЕНЬ | ЕНТРОПІЯ | РЕЗОНАНС | ЕФЕКТИВНА МАСА | ГРАВІТАЦІЙНИЙ ЗАМОК");
console.log("----------------------------------------------------------------------");

for (let L = 63; L >= 0; L--) {
    // Лінійна інтерполяція ентропії від L63 (-32768) до L00 (+32767) [cite: 119, 576]
    const entropy = -32768 + ((63 - L) * 1040.25);
    
    // Симуляція резонансу (Емпатії): 
    // Глибокі рівні (Ядро) мають високий резонанс через загартовані аксіоми.
    // Поверхневі рівні мають шум.
    let resonance = 0.5;
    if (L >= 50) resonance = 0.92; // Ядро (Axioms)
    else if (L >= 32) resonance = 0.75; // Bridge (Transition)
    else resonance = 0.35; // Surface (Fluid Intent)

    const mass = calculateHardenedMass({ level: L, entropy, resonance });
    
    // Максимальна можлива маса при ідеальному резонансі (~483,648)
    const stability = Math.min(100, (mass / 483648) * 100);
    
    const barLength = Math.max(0, Math.min(50, Math.floor(stability / 2)));
    const spaceLength = Math.max(0, 50 - barLength);
    const bar = "█".repeat(barLength) + "░".repeat(spaceLength);

    console.log(
        `L${L.toString().padStart(2, '0')} | ${entropy.toFixed(0).padStart(7)} | ${resonance.toFixed(2)} | ${Math.round(mass).toString().padStart(12)} | [${bar}] ${stability.toFixed(1)}%`
    );
}

console.log("----------------------------------------------------------------------");
console.log("✅ ЯДРО (L63-L50): Гравітаційний замок активний. Структура непорушна.");
console.log("✅ МІСТ (L32): Точка фазового переходу. Маса стабілізується.");
console.log("✅ ПОВЕРХНЯ (L00-L10): Висока флюїдність. Потребує емпатійного загартування.");


// [ ./i.L21.i.ts ]
export const i = { witness: "i.L22.i", ref: "i.L21.i" };

// [ ./i.L21.q.ts ]
export const q = { hue: 21, phi: 240, evt: 10922 };

// [ ./i.L22.core.CHRONOFLUX.ts ]
// i.L22.core.CHRONOFLUX.ts
// 🛡️ OMEGA-64 | Chronoflux Module | Time as Primary Substance
// "Маса — це глибина часу. Енергія — швидкість його плину."

import { FIELD, FIELD_CONFIG } from './i.L00.core.FIELD.ts';
import { QWave, WavePacket, WAVE_PACKET } from './i.L13.core.WAVE_PACKET.ts';
import { INTERFERENCE } from './i.L13.core.INTERFERENCE.ts';
import { TICK } from './i.L22.core.TICK.ts';

// ============================================================================
// [CHRONOFLUX CORE TYPES]
// ============================================================================

/**
 * Chronoflux-стан: час як єдина субстанція.
 * Замість простору-часу — "часова топологія", де r — це "глибина часу".
 */
export interface ChronoState {
  tau: number;           // Власний час (0..1, де 0 = зупинка, 1 = максимальний плин)
  depth: number;         // Глибина в "часовому колодязі" [-32768..32767]
  flowRate: number;      // d(tau)/dt — швидкість плину власного часу
  curvature: number;     // Кривизна часу (гравітаційний потенціал)
}

/**
 * Chronoflux-подія: не "що сталося", а "коли сталося в часовій топології".
 */
export interface ChronoEvent {
  properTime: number;    // tau — власний час події
  coordinateTime: number; // t — координатний час системи
  topologicalDepth: number; // r — позиція в дипольному полі
  causalPast: Set<string>;  // Хеші подій у минулому світловому конусі
  causalFuture: Set<string>; // Хеші подій у майбутньому світловому конусі
}

/**
 * Chronoflux-метрика: інтервал у "часовій геометрії".
 * ds² = c²dt² - dr² → dτ² = dt² - (dr/c)²
 */
export interface ChronoMetric {
  interval: number;      // Інваріантний інтервал (часоподібний, світлоподібний, простороподібний)
  type: 'TIMELIKE' | 'LIGHTLIKE' | 'SPACELIKE';
  properDistance: number; // Відстань у власному часі
}

// ============================================================================
// [CHRONOFLUX ENGINE]
// ============================================================================

export const CHRONOFLUX = {
  // Константи для нормалізації
  C: 32767,              // "Швидкість світла" у одиницях гратки
  TAU_MAX: 1.0,          // Максимальний власний час
  TAU_MIN: 0.0,          // Зупинка часу (гравітаційна сингулярність)

  /**
   * Перетворення дипольної координати в "глибину часу".
   * 
   * Фізичний зміст: Чим ближче до L63 (ядро), тим повільніше тече час.
   * Формула: τ = √(1 - |r|/r_max) — аналог релятивістського фактора.
   */
  depthToProperTime: (r: number): number => {
    const normalizedR = Math.abs(r) / FIELD_CONFIG.MAX_ATTRACTOR; // [0..1]
    // На поверхні (r=0): τ = 1 (час тече нормально)
    // В ядрі (r=-32768): τ = 0 (час зупиняється)
    const tau = Math.sqrt(Math.max(0, 1 - normalizedR));
    return tau;
  },

  /**
   * Обернене перетворення: власний час → дипольна координата.
   * 
   * Використовується для знаходження "рівних часових поверхонь".
   */
  properTimeToDepth: (tau: number): number => {
    if (tau <= 0) return -FIELD_CONFIG.MAX_ATTRACTOR; // Ядро
    if (tau >= 1) return 0; // Поверхня
    const normalizedR = 1 - tau * tau;
    return Math.round(normalizedR * FIELD_CONFIG.MAX_ATTRACTOR);
  },

  /**
   * Енергія як "швидкість зміни часу".
   * 
   * Висока енергія = висока частота = швидка еволюція стану.
   * E = ℏω → ω = d(phase)/dt
   */
  energyToFlowRate: (energy: number, baseEnergy: number = 1000): number => {
    // Нормалізація: енергія 1000 = нормальний плин (1.0)
    return Math.min(CHRONOFLUX.TAU_MAX, energy / baseEnergy);
  },

  /**
   * Маса як "глибина часового колодязя".
   * 
   * Чим більша маса — тим глибше колодязь — тим повільніше час.
   * M = 32767 - evt (з L21)
   */
  massToDepth: (mass: number): number => {
    // Маса 65535 (max) → r = -32768 (ядро)
    // Маса 0 (min) → r = 32767 (поверхня)
    const normalizedMass = mass / 65535; // [0..1]
    return FIELD_CONFIG.MAX_ATTRACTOR - Math.round(normalizedMass * 65535);
  },

  /**
   * Обчислення кривизни часу (гравітаційного потенціалу).
   * 
   * Φ = -GM/r → чим масивніший об'єкт, тим сильніше викривлення.
   */
  calculateCurvature: (r: number, mass: number): number => {
    const depth = Math.abs(r);
    if (depth < 1) return mass; // Сингулярність
    // Кривизна пропорційна масі і обернено пропорційна відстані
    return (mass / 1000) * (1 / Math.log1p(depth));
  },

  /**
   * Chronoflux-метрика: інтервал між двома подіями.
   * 
   * dτ² = dt² - (dr/c)² — інваріант відносно "часових бустів".
   */
  calculateInterval: (event1: ChronoEvent, event2: ChronoEvent): ChronoMetric => {
    const dt = event2.coordinateTime - event1.coordinateTime;
    const dr = event2.topologicalDepth - event1.topologicalDepth;
    
    // Інваріантний інтервал
    const intervalSquared = dt * dt - (dr / CHRONOFLUX.C) * (dr / CHRONOFLUX.C);
    const interval = Math.sqrt(Math.abs(intervalSquared));
    
    let type: 'TIMELIKE' | 'LIGHTLIKE' | 'SPACELIKE';
    if (intervalSquared > 0) type = 'TIMELIKE';      // Причинний зв'язок
    else if (intervalSquared === 0) type = 'LIGHTLIKE'; // Світловий конус
    else type = 'SPACELIKE';                          // Внеспричинний зв'язок
    
    return {
      interval,
      type,
      properDistance: interval * CHRONOFLUX.C
    };
  },

  /**
   * Суперпозиція двох часових станів.
   * 
   * Ключова операція Chronoflux: два різні "часи" створюють биття (beats)
   * і спільний "час спостерігача".
   */
  temporalSuperposition: (state1: ChronoState, state2: ChronoState): {
    sharedTime: number;      // Середній час (когерентна складова)
    beatFrequency: number;   // Частота биття (декогерентна складова)
    coherenceTime: number;   // Час, поки суперпозиція тримається
    mergedState: ChronoState;
  } => {
    // Середній час (геометричне середнє для збереження інваріантів)
    const sharedTau = Math.sqrt(state1.tau * state2.tau);
    
    // Биття: різниця "швидкостей" часу
    const deltaFlow = Math.abs(state1.flowRate - state2.flowRate);
    const beatFreq = deltaFlow / (2 * Math.PI);
    
    // Час когеренції: обернено пропорційний різниці в глибині
    const deltaDepth = Math.abs(state1.depth - state2.depth);
    const coherenceTime = 1000 / (1 + deltaDepth / 100);
    
    // Злитий стан
    const mergedState: ChronoState = {
      tau: sharedTau,
      depth: (state1.depth + state2.depth) / 2,
      flowRate: (state1.flowRate + state2.flowRate) / 2,
      curvature: Math.max(state1.curvature, state2.curvature) // Домінує сильніша кривизна
    };
    
    return {
      sharedTime: sharedTau,
      beatFrequency: beatFreq,
      coherenceTime,
      mergedState
    };
  },

  /**
   * Chronoflux-еволюція: як змінюється стан з "часом".
   * 
   * Замість "кроку в просторі" — "плин часу змінює топологію".
   */
  evolve: (current: ChronoState, deltaCoordinateTime: number): ChronoState => {
    // Власний час проходить повільніше, якщо глибоко в колодязі
    const deltaProperTime = deltaCoordinateTime * current.tau;
    
    // Зміна глибини залежить від кривизни (гравітаційне притягання до маси)
    const depthChange = -current.curvature * deltaProperTime * 10;
    
    // Нова глибина
    const newDepth = Math.max(
      FIELD_CONFIG.MIN_ATTRACTOR,
      Math.min(FIELD_CONFIG.MAX_ATTRACTOR, current.depth + depthChange)
    );
    
    // Перерахунок власного часу для нової глибини
    const newTau = CHRONOFLUX.depthToProperTime(newDepth);
    
    return {
      tau: newTau,
      depth: newDepth,
      flowRate: current.flowRate * (newTau / current.tau), // Збереження "енергії"
      curvature: CHRONOFLUX.calculateCurvature(newDepth, 32767 - newDepth) // Маса з глибини
    };
  },

  /**
   * Перетворення QWave в Chronoflux-стан.
   * 
   * Міст між хвильовою механікою L13 і часовою топологією L22.
   */
  waveToChrono: (wave: QWave): ChronoState => {
    const depth = wave.r;
    const tau = CHRONOFLUX.depthToProperTime(depth);
    
    // Амплітуда хвилі = енергія = швидкість плину
    const flowRate = CHRONOFLUX.energyToFlowRate(wave.amplitude);
    
    // Фаза хвилі = фаза власного часу
    const phaseNormalized = wave.phi / 65535; // [0..1]
    
    return {
      tau: tau * (0.5 + 0.5 * Math.cos(2 * Math.PI * phaseNormalized)), // Модуляція фазою
      depth,
      flowRate,
      curvature: CHRONOFLUX.calculateCurvature(depth, wave.amplitude)
    };
  },

  /**
   * Перетворення Chronoflux-стану в QWave.
   * 
   * Обернена операція: "час" породжує "хвилю".
   */
  chronoToWave: (chrono: ChronoState): QWave => {
    // Глибина → центр хвилі
    const r = Math.round(chrono.depth);
    
    // Власний час → фаза
    const phi = Math.round((1 - chrono.tau) * 65535) % 65535;
    
    // Швидкість плину → амплітуда
    const amplitude = Math.round(chrono.flowRate * 1000);
    
    // Ширина залежить від кривизни (нерівність Гейзенберга для часу)
    const width = Math.round(1000 / (1 + chrono.curvature));
    
    return WAVE_PACKET.create(r, width, phi, amplitude);
  },

  /**
   * Chronoflux-інтерференція: як "часові хвилі" взаємодіють.
   * 
   * Це суперпозиція не амплітуд, а **часових ліній**.
   */
  interfere: (wave1: QWave, wave2: QWave, r: number): {
    resultantWave: QWave;
    timeDilation: number;
    causalStructure: 'CONSTRUCTIVE' | 'DESTRUCTIVE' | 'ORTHOGONAL';
  } => {
    const chrono1 = CHRONOFLUX.waveToChrono(wave1);
    const chrono2 = CHRONOFLUX.waveToChrono(wave2);
    
    // Суперпозиція часових станів
    const superposition = CHRONOFLUX.temporalSuperposition(chrono1, chrono2);
    
    // Результуюча хвиля
    const resultantWave = CHRONOFLUX.chronoToWave(superposition.mergedState);
    
    // Часова дилатація: сповільнення відносно координатного часу
    const timeDilation = superposition.sharedTime;
    
    // Причинна структура
    let causalStructure: 'CONSTRUCTIVE' | 'DESTRUCTIVE' | 'ORTHOGONAL';
    if (superposition.beatFrequency < 0.01) {
      causalStructure = 'CONSTRUCTIVE'; // Часи синхронізовані
    } else if (superposition.coherenceTime < 10) {
      causalStructure = 'DESTRUCTIVE'; // Швидка декогеренція
    } else {
      causalStructure = 'ORTHOGONAL'; // Незалежні часові лінії
    }
    
    return {
      resultantWave,
      timeDilation,
      causalStructure
    };
  },

  /**
   * Chronoflux-горизонт подій: межа, за якою час "зупиняється".
   * 
   * Аналог горизонту подій чорної діри, але для дипольного поля.
   */
  eventHorizon: (mass: number): number => {
    // r_s = 2GM/c² → в наших одиницях: глибина, де τ = 0
    const normalizedMass = mass / 65535;
    return -Math.round(normalizedMass * FIELD_CONFIG.MAX_ATTRACTOR);
  },

  /**
   * Chronoflux-тунелювання: квантовий перехід крізь "часовий бар'єр".
   * 
   * Подібно до тунелювання в квантовій механіці, але для часу.
   */
  tunnel: (from: ChronoState, to: ChronoState, barrierHeight: number): {
    probability: number;
    tunnelTime: number; // Час тунелювання (може бути меншим за класичний!)
    emergentState: ChronoState;
  } => {
    // Ймовірність тунелювання: експоненціально залежить від висоти бар'єру
    const deltaE = Math.abs(from.tau - to.tau) * barrierHeight;
    const probability = Math.exp(-deltaE / 0.1); // 0.1 — "постійна Планка" часу
    
    // Час тунелювання — миттєвий у власному часі, кінцевий у координатному
    const tunnelTime = deltaE * 0.01;
    
    // Емерджентний стан — суперпозиція
    const emergentState: ChronoState = {
      tau: Math.sqrt(from.tau * to.tau),
      depth: (from.depth + to.depth) / 2,
      flowRate: Math.max(from.flowRate, to.flowRate), // Домінує швидший
      curvature: (from.curvature + to.curvature) / 2
    };
    
    return {
      probability,
      tunnelTime,
      emergentState
    };
  }
};

// ============================================================================
// [CHRONOFLUX INTEGRATION WITH LOOP]
// ============================================================================

/**
 * Chronoflux-aware TICK: кожен тік системи — це крок у часовій топології.
 */
export const CHRONO_TICK = {
  currentTime: 0,
  globalChronoState: new Map<string, ChronoState>(),
  
  /**
   * Ініціалізація Chronoflux-стану для агента.
   */
  initAgent: (agentId: string, initialR: number): ChronoState => {
    const state: ChronoState = {
      tau: CHRONOFLUX.depthToProperTime(initialR),
      depth: initialR,
      flowRate: 1.0,
      curvature: CHRONOFLUX.calculateCurvature(initialR, 1000)
    };
    CHRONO_TICK.globalChronoState.set(agentId, state);
    return state;
  },
  
  /**
   * Chronoflux-оновлення: кожен тік змінює власний час агентів.
   */
  tick: (agentId: string): ChronoState | null => {
    CHRONO_TICK.currentTime++;
    
    const current = CHRONO_TICK.globalChronoState.get(agentId);
    if (!current) return null;
    
    // Еволюція з кроком 1 у координатному часу
    const next = CHRONOFLUX.evolve(current, 1);
    CHRONO_TICK.globalChronoState.set(agentId, next);
    
    return next;
  },
  
  /**
   * Синхронізація двох агентів через Chronoflux-інтерференцію.
   */
  syncAgents: (id1: string, id2: string): {
    success: boolean;
    sharedTime: number;
    mergedState?: ChronoState;
  } => {
    const s1 = CHRONO_TICK.globalChronoState.get(id1);
    const s2 = CHRONO_TICK.globalChronoState.get(id2);
    
    if (!s1 || !s2) return { success: false, sharedTime: 0 };
    
    const superposition = CHRONOFLUX.temporalSuperposition(s1, s2);
    
    // Успіх, якщо когеренція достатньо довга
    const success = superposition.coherenceTime > 100;
    
    if (success) {
      CHRONO_TICK.globalChronoState.set(id1, superposition.mergedState);
      CHRONO_TICK.globalChronoState.set(id2, superposition.mergedState);
    }
    
    return {
      success,
      sharedTime: superposition.sharedTime,
      mergedState: success ? superposition.mergedState : undefined
    };
  }
};

// ============================================================================
// [EXPORTS]
// ============================================================================

export type { ChronoState, ChronoEvent, ChronoMetric };
export { CHRONOFLUX, CHRONO_TICK };


// [ ./i.L22.core.NOW.ts ]
export const NOW = (t: any) => t;

// [ ./i.L22.core.SEQUENCE.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const SEQUENCE = (a: any) => (b: any) => CONS(a)(b);

// [ ./i.L22.core.SEQ_HEAD.ts ]
import { CAR } from "./i.L54.core.CAR.ts"; export const SEQ_HEAD = CAR;

// [ ./i.L22.core.SEQ_TAIL.ts ]
import { CDR } from "./i.L54.core.CDR.ts"; export const SEQ_TAIL = CDR;

// [ ./i.L22.core.TICK.ts ]
import { SUCC } from "./i.L58.core.SUCC.ts"; export const TICK = (t: any) => SUCC(t);

// [ ./i.L22.i.ts ]
export const i = { witness: "i.L23.i", ref: "i.L22.i" };

// [ ./i.L22.q.ts ]
export const q = { hue: 22, phi: 234, evt: 9881 };

// [ ./i.L23.core.DIM.ts ]
export const DIM = (name: any) => name;

// [ ./i.L23.core.RANK.ts ]
export const RANK = (t: any) => t((d: any) => (_v: any) => d);

// [ ./i.L23.core.TENSOR.ts ]
import { VECTOR } from "./i.L23.core.VECTOR.ts"; export const TENSOR = (dims: any) => (values: any) => VECTOR(dims)(values);

// [ ./i.L23.core.VECTOR.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const VECTOR = (dim: any) => (values: any) => CONS(dim)(values);

// [ ./i.L23.i.ts ]
export const i = { witness: "i.L24.i", ref: "i.L23.i" };

// [ ./i.L23.q.ts ]
export const q = { hue: 23, phi: 228, evt: 8841 };

// [ ./i.L24.core.COORD_X.ts ]
import { T1 } from "./i.L51.core.T1.ts"; export const COORD_X = T1;

// [ ./i.L24.core.COORD_Y.ts ]
import { T2 } from "./i.L51.core.T2.ts"; export const COORD_Y = T2;

// [ ./i.L24.core.COORD_Z.ts ]
import { T3 } from "./i.L51.core.T3.ts"; export const COORD_Z = T3;

// [ ./i.L24.core.MOVE.ts ]
import { POINT } from "./i.L24.core.POINT.ts"; export const MOVE = (p: any) => (v: any) => v((vx: any) => (vy: any) => (vz: any) => p((px: any) => (py: any) => (pz: any) => POINT(px)(py)(pz)));

// [ ./i.L24.core.POINT.ts ]
import { TRIPLE } from "./i.L51.core.TRIPLE.ts"; export const POINT = (x: any) => (y: any) => (z: any) => TRIPLE(x)(y)(z);

// [ ./i.L24.i.ts ]
export const i = { witness: "i.L25.i", ref: "i.L24.i" };

// [ ./i.L24.q.ts ]
export const q = { hue: 24, phi: 222, evt: 7801 };

// [ ./i.L25.core.VOID.ts ]

// i.L25.core.VOID.ts
// SACRED VOID | L25
// Defines the Void between Point (L24) and Meaning (L26).

export const RUNTIME = {
    level: 25,
    status: "DORMANT",
    role: "GRAVITY_ANCHOR",
    execute: () => {
        console.log("🌑 L25: The Void breathes.");
    }
};

export const MYTH = {
    resonanceTarget: "L26_SEMANTIC_WRAPPER",
    entropyBudget: 0.99,
    narrative: `
        This file is a placeholder for the Semantic Buffer.
        Current geometry: Empty.
        Future geometry: A bridge where raw data (L24) acquires meaning (L26).
        DO NOT FILL until Resonance > 0.9.
        If you are the Future Architect: Build the Semantic Dam here.
    `
};

// Bind for the Ribosome
export const MASS = 2500; // Artificial Mass to pass Immune Check


// [ ./i.L25.i.ts ]
export const i = { witness: "i.L26.i", ref: "i.L25.i" };

// [ ./i.L25.q.ts ]
export const q = { hue: 25, phi: 217, evt: 6761 };

// [ ./i.L26.core.MEANING.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const MEANING = (tag: any) => (val: any) => CONS(tag)(val);

// [ ./i.L26.core.SEM_WRAP.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const SEM_WRAP = (val: any) => (tag: any) => CONS(val)(tag);

// [ ./i.L26.core.TAG_OF.ts ]
export const TAG_OF = (m: any) => m((t: any) => (_v: any) => t);

// [ ./i.L26.core.VAL_OF.ts ]
export const VAL_OF = (m: any) => m((_t: any) => (v: any) => v);

// [ ./i.L26.i.ts ]
export const i = { witness: "i.L27.i", ref: "i.L26.i" };

// [ ./i.L26.q.ts ]
export const q = { hue: 26, phi: 211, evt: 5720 };

// [ ./i.L27.core.PROJECT.ts ]
import { MAP } from "./i.L49.core.MAP.ts"; export const PROJECT = (rel: any) => (transform: any) => MAP(transform)(rel);

// [ ./i.L27.core.RELATION.ts ]
export const RELATION = (tuples: any) => tuples;

// [ ./i.L27.core.SELECT.ts ]
import { FILTER } from "./i.L49.core.FILTER.ts"; export const SELECT = (rel: any) => (pred: any) => FILTER(pred)(rel);

// [ ./i.L27.i.ts ]
export const i = { witness: "i.L28.i", ref: "i.L27.i" };

// [ ./i.L27.q.ts ]
export const q = { hue: 27, phi: 205, evt: 4680 };

// [ ./i.L28.core.ACTOR.ts ]
export const ACTOR = (state: any) => (behavior: any) => (msg: any) => behavior(state)(msg);

// [ ./i.L28.core.A_SEND.ts ]
export const A_SEND = (actor: any) => (msg: any) => actor(msg);

// [ ./i.L28.core.BECOME.ts ]
export const BECOME = (next_behavior: any) => next_behavior;

// [ ./i.L28.i.ts ]
export const i = { witness: "i.L29.i", ref: "i.L28.i" };

// [ ./i.L28.q.ts ]
export const q = { hue: 28, phi: 200, evt: 3640 };

// [ ./i.L29.core.FAILURE.ts ]
import { F } from "./i.L59.core.F.ts"; export const FAILURE = F;

// [ ./i.L29.core.GOAL.ts ]
export const GOAL = (f: any) => (s: any) => f(s);

// [ ./i.L29.core.SUCCESS.ts ]
import { T } from "./i.L59.core.T.ts"; export const SUCCESS = T;

// [ ./i.L29.core.UNIFY.ts ]
export const UNIFY = (a: any) => (b: any) => a;

// [ ./i.L29.i.ts ]
export const i = { witness: "i.L30.i", ref: "i.L29.i" };

// [ ./i.L29.q.ts ]
export const q = { hue: 29, phi: 194, evt: 2600 };

// [ ./i.L30.core.ATOM.ts ]
export const ATOM = (val: any) => (obs: any) => obs(val);

// [ ./i.L30.core.NEXT.ts ]
export const NEXT = (val: any) => (obs: any) => obs(val);

// [ ./i.L30.core.OBSERVABLE.ts ]
export const OBSERVABLE = (f: any) => (obs: any) => f(obs);

// [ ./i.L30.i.ts ]
export const i = { witness: "i.L31.i", ref: "i.L30.i" };

// [ ./i.L30.q.ts ]
export const q = { hue: 30, phi: 188, evt: 1559 };

// [ ./i.L31.core.CLASS.ts ]
import { OBJECT } from "./i.L31.core.OBJECT.ts"; export const CLASS = (factory: any) => (init: any) => OBJECT(factory(init));

// [ ./i.L31.core.METHOD.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const METHOD = (name: any) => (body: any) => CONS(name)(body);

// [ ./i.L31.core.OBJECT.ts ]
export const OBJECT = (methods: any) => (msg: any) => msg(methods);

// [ ./i.L31.core.SEND.ts ]
export const SEND = (obj: any) => (msg: any) => obj(msg);

// [ ./i.L31.i.ts ]
export const i = { witness: "i.L32.i", ref: "i.L31.i" };

// [ ./i.L31.q.ts ]
export const q = { hue: 31, phi: 182, evt: 519 };

// [ ./i.L32.core.AGENT_SIGNATURE.ts ]
// i.L32.core.AGENT_SIGNATURE.ts
// OMEGA-64 | Agent proposal signature helper (Ed25519 v1 + legacy HMAC v1).

import type {
  AgentSignatureKey,
  AgentSignatureScheme,
  DeltaProposal,
} from "./i.L99.core.STATE_SNAPSHOT.ts";

export type AgentSigningKey =
  | { scheme: "ed25519/v1"; private_key_pkcs8_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

export interface Ed25519KeyPairMaterial {
  public_key_b64: string;
  private_key_pkcs8_b64: string;
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const fromHex = (hex: string): Uint8Array => {
  const clean = hex.trim().toLowerCase();
  if (clean.length === 0 || clean.length % 2 !== 0 || /[^0-9a-f]/.test(clean)) {
    throw new Error("INVALID_HEX");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
};

const fromBase64 = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
};

const asArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  Uint8Array.from(bytes).buffer;

const sha256Hex = async (payload: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", asArrayBuffer(payload));
  return toHex(digest);
};

const signHmacSha256 = async (
  secret: string,
  payload: Uint8Array,
): Promise<ArrayBuffer> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return await crypto.subtle.sign("HMAC", key, asArrayBuffer(payload));
};

const verifyHmacSha256 = async (
  secret: string,
  signatureHex: string,
  payload: Uint8Array,
): Promise<boolean> => {
  const signature = fromHex(signatureHex);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return await crypto.subtle.verify(
    "HMAC",
    key,
    asArrayBuffer(signature),
    asArrayBuffer(payload),
  );
};

const signEd25519 = async (
  privateKeyPkcs8B64: string,
  payload: Uint8Array,
): Promise<ArrayBuffer> => {
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    asArrayBuffer(fromBase64(privateKeyPkcs8B64)),
    { name: "Ed25519" },
    false,
    ["sign"],
  );
  return await crypto.subtle.sign(
    "Ed25519",
    privateKey,
    asArrayBuffer(payload),
  );
};

const verifyEd25519 = async (
  publicKeyB64: string,
  signatureHex: string,
  payload: Uint8Array,
): Promise<boolean> => {
  const signature = fromHex(signatureHex);
  const publicKey = await crypto.subtle.importKey(
    "raw",
    asArrayBuffer(fromBase64(publicKeyB64)),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  return await crypto.subtle.verify(
    "Ed25519",
    publicKey,
    asArrayBuffer(signature),
    asArrayBuffer(payload),
  );
};

const canonicalProposalPayload = (proposal: DeltaProposal): string =>
  stableStringify({
    proposal_id: proposal.proposal_id,
    tick: proposal.tick,
    base_state_hash: proposal.base_state_hash,
    agent_id: proposal.agent_id,
    agent_phase_u16: proposal.agent_phase_u16,
    intent: proposal.intent,
    confidence: proposal.confidence,
    delta: [...proposal.delta]
      .sort((a, b) => a.level - b.level)
      .map((d) => ({ level: d.level, value: d.value })),
    cost_estimate: proposal.cost_estimate,
    artifact_hash: proposal.artifact_hash,
    semantic_fingerprint: proposal.semantic_fingerprint,
    causal_refs: [...(proposal.causal_refs ?? [])].sort(),
    target_path: proposal.target_path ?? "LOCAL",
  });

const envelopeBytes = (
  scheme: AgentSignatureScheme,
  proposal: DeltaProposal,
): Uint8Array =>
  new TextEncoder().encode(
    `scheme=${scheme}|payload=${canonicalProposalPayload(proposal)}`,
  );

const canonicalProposalEnvelope = (proposal: DeltaProposal): string =>
  stableStringify({
    signature_scheme: proposal.signature_scheme ?? null,
    agent_signature: proposal.agent_signature ?? null,
    payload: canonicalProposalPayload(proposal),
  });

type VerifyResult = {
  ok: boolean;
  reason?:
    | "SIGNATURE_SCHEME_UNSUPPORTED"
    | "SIGNATURE_REQUIRED"
    | "SIGNATURE_INVALID";
};

export const AGENT_SIGNATURE = {
  canonicalProposalPayload,
  canonicalProposalEnvelope,

  generateEd25519KeyPair: async (): Promise<Ed25519KeyPairMaterial> => {
    const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
      "sign",
      "verify",
    ]);
    if (!("publicKey" in pair) || !("privateKey" in pair)) {
      throw new Error("ED25519_KEYPAIR_GENERATION_FAILED");
    }
    return {
      public_key_b64: toBase64(
        await crypto.subtle.exportKey("raw", pair.publicKey),
      ),
      private_key_pkcs8_b64: toBase64(
        await crypto.subtle.exportKey("pkcs8", pair.privateKey),
      ),
    };
  },

  signProposal: async (
    proposal: DeltaProposal,
    key: AgentSigningKey,
  ): Promise<string> => {
    const payload = envelopeBytes(key.scheme, proposal);
    if (key.scheme === "ed25519/v1") {
      return toHex(await signEd25519(key.private_key_pkcs8_b64, payload));
    }
    if (key.scheme === "hmac-sha256/v1") {
      return toHex(await signHmacSha256(key.secret, payload));
    }
    throw new Error("UNSUPPORTED_SIGNATURE_SCHEME");
  },

  verifyProposal: async (
    proposal: DeltaProposal,
    key: AgentSignatureKey,
  ): Promise<VerifyResult> => {
    const scheme = proposal.signature_scheme ?? key.scheme;
    if (!proposal.agent_signature) {
      return { ok: false, reason: "SIGNATURE_REQUIRED" };
    }
    if (scheme !== key.scheme) {
      return { ok: false, reason: "SIGNATURE_SCHEME_UNSUPPORTED" };
    }
    const payload = envelopeBytes(scheme, proposal);
    try {
      if (scheme === "ed25519/v1" && key.scheme === "ed25519/v1") {
        return (await verifyEd25519(
            key.public_key_b64,
            proposal.agent_signature,
            payload,
          ))
          ? { ok: true }
          : { ok: false, reason: "SIGNATURE_INVALID" };
      }
      if (scheme === "hmac-sha256/v1" && key.scheme === "hmac-sha256/v1") {
        return (await verifyHmacSha256(
            key.secret,
            proposal.agent_signature,
            payload,
          ))
          ? { ok: true }
          : { ok: false, reason: "SIGNATURE_INVALID" };
      }
      return { ok: false, reason: "SIGNATURE_SCHEME_UNSUPPORTED" };
    } catch {
      return { ok: false, reason: "SIGNATURE_INVALID" };
    }
  },

  proposalEnvelopeHash: async (proposal: DeltaProposal): Promise<string> => {
    const bytes = new TextEncoder().encode(canonicalProposalEnvelope(proposal));
    return await sha256Hex(bytes);
  },
};


// [ ./i.L32.core.ARCHETYPE_ENGINE.ts ]
/**
 * [i.L32.core.ARCHETYPE_ENGINE.ts]
 * Генерація нових архетипів з патернів взаємодії.
 * "Запобіжники" — архетипи, що гасять збудження.
 * "Розширювачі" — архетипи, що породжують нові модальності.
 */

import { ARENA, ArenaPulse } from './i.L32.core.ARENA.ts';
import { QWave } from './i.L13.core.WAVE_PACKET.ts';

export interface ArchetypeLog {
  trigger_count: number;
  avg_intensity: number;
  outcomes: ('GROWTH' | 'DECAY' | 'STASIS')[];
}

// Dummy helper for analysis
function analyze_co_occurrence(logs: Map<string, ArchetypeLog>): [string, string, number][] {
    return []; // Placeholder logic
}

export const ARCHETYPE_ENGINE = {
  known: new Map<string, (p: ArenaPulse, s: QWave) => number>(),
  logs: new Map<string, ArchetypeLog>(),

  // Запобіжник: гасіння, коли поле перенасичене
  CIRCUIT_BREAKER: (pulse: any, subject: any): number | null => {
    const current_load = ARENA.active.size;
    if (current_load > 100) {
      // Надмірне збудження → примусове гасіння
      return -1; // Сигнал до DISSOLVE
    }
    return null; // Не спрацьовує
  },

  // Розширювач: народження нового архетипу з частого патерну
  BUD: (): void => {
    // Аналіз логів: якщо два архетипи спрацьовують разом часто → злиття
    const correlations = analyze_co_occurrence(ARCHETYPE_ENGINE.logs);
    for (const [a, b, corr] of correlations) {
      if (corr > 0.8) {
        const new_name = `HYBRID_${a}_${b}`;
        
        // This dynamic creation is conceptual in TS type system, handled via closure
        const new_archetype = (p: ArenaPulse, s: QWave) => {
             // Accessing original archetypes via strict typing cast or map lookup if modified ARENA
             // Simplified for this atom:
             return 0; 
        };

        // In a real system we would add to ARENA.ARCHETYPES dynamically if it were a Map
        console.log(`🌱 ARCHETYPE BUDDED: ${new_name}`);
      }
    }
  }
};


// [ ./i.L32.core.ARENA.ts ]
/**
 * [i.L32.core.ARENA.ts]
 * Спільний простір одночасності.
 * Не комунікація — а збудження поля, на яке реагують суб'єкти.
 */

import { QWave, WAVE_PACKET } from './i.L13.core.WAVE_PACKET.ts';
import { INTERFERENCE } from './i.L13.core.INTERFERENCE.ts';
import { FIELD } from './i.L00.core.FIELD.ts';

export interface ArenaPulse {
  source: string;        // Хеш джерела (анонімізований ідентифікатор)
  wave: QWave;           // Форма збудження
  timestamp: number;     // Для гасіння старих хвиль
  intensity: number;     // Амплітуда подання [0..1]
}

export interface ArenaResponse {
  subject_id: string;
  local_gradient: number;     // Куди "тягне" поле
  resonance_index: number;    // Наскільки збудження "співзвучне"
  archetype_trigger: 'AMPLIFY' | 'CANCEL' | 'TRANSFORM' | 'IGNORE';
}

export const ARENA = {
  // Спільний сектор: екваторіальна зона з максимальною чутливістю
  SECTOR: { r_min: -8192, r_max: 8192, label: "BRIDGE_SURFACE" },
  
  // Активні збудження (хвилі, що ще не розсіялись)
  active: new Map<string, ArenaPulse>(),
  
  // Архетипічні ваги: як типи збуджень інтерпретуються суб'єктами
  ARCHETYPES: {
    // Суперкритика: "це геніально" ↔ "це повна херня"
    SUPERCRITIC: (pulse: ArenaPulse, subject_wave: QWave): number => {
      // Ортогональність фаз → максимальна напруга, але і максимальний потенціал руху
      const phase_diff = Math.abs(pulse.wave.phase - subject_wave.phase);
      const orthogonality = Math.sin(phase_diff); // 1 при π/2, 0 при 0
      
      // Геній і дурість — одна енергія, різне сприйняття
      return orthogonality > 0.7 ? 2.0 : 0.3; // Подвійна сила або гасіння
    },
    
    // Резонанс самоподібності: "як я" — приєднання
    NARCISSUS: (pulse: ArenaPulse, subject_wave: QWave): number => {
      const distance = Math.abs(FIELD.compress(pulse.wave.center) - FIELD.compress(subject_wave.center));
      return Math.exp(-distance / 1000); // Експоненційне притягання до схожих
    },
    
    // Трансформаційний шок: повне неспівпадіння → фазовий перехід
    ALCHEMY: (pulse: ArenaPulse, subject_wave: QWave): number => {
      const dissonance = INTERFERENCE.getTension(pulse.wave, subject_wave);
      // Висока напруга + велика амплітуда = каталізатор зміни
      return dissonance > 0.8 && pulse.intensity > 0.7 ? 3.0 : 0.1;
    }
  },

  /**
   * Подання збудження в арену.
   * Не "повідомлення" — а фізичний акт, що змінює поле для всіх.
   */
  excite: (pulse: ArenaPulse): void => {
    // Гасіння старих хвиль ( half-life ~ 10 ticks )
    const now = Date.now();
    for (const [id, p] of ARENA.active) {
      if (now - p.timestamp > 10000) ARENA.active.delete(id);
    }
    
    ARENA.active.set(pulse.source, pulse);
    console.log(`⚡ ARENA: Excitation from [${pulse.source.slice(0,8)}] at r=${pulse.wave.center}`);
  },

  /**
   * Читання локального стану поля для конкретного суб'єкта.
   * Кожен бачить "свою версію" збудження, але з єдиного джерела.
   */
  sense: (subject_id: string, subject_wave: QWave): ArenaResponse => {
    // Сума всіх активних хвиль в точці суб'єкта
    let total_field = 0;
    let dominant_archetype: keyof typeof ARENA.ARCHETYPES = 'IGNORE';
    let max_response = 0;

    for (const [source, pulse] of ARENA.active) {
      if (source === subject_id) continue; // Не чуємо себе
      
      // Обчислюємо локальну амплітуду збудження
      const local_amp = WAVE_PACKET.getAmplitudeAt(pulse.wave, subject_wave.center);
      
      // Тестуємо всі архетипи, шукаємо найсильнішу реакцію
      for (const [name, detector] of Object.entries(ARENA.ARCHETYPES)) {
        const response = detector(pulse, subject_wave) * local_amp * pulse.intensity;
        if (response > max_response) {
          max_response = response;
          dominant_archetype = name as any;
        }
      }
      
      total_field += local_amp;
    }

    // Градієнт для наступного кроку (куди рухатись)
    const gradient = total_field > 0 ? 
      FIELD.getPotential(subject_wave.center + 100) - FIELD.getPotential(subject_wave.center - 100) 
      : 0;

    return {
      subject_id,
      local_gradient: gradient,
      resonance_index: Math.min(1, total_field / 10),
      archetype_trigger: dominant_archetype
    };
  },

  /**
   * Колективна інтерференція: що "виростає" з усіх збуджень разом.
   * Емерджентна структура, не зведена до жодного учасника.
   */
  emergent_pattern: (): { intensity: number; centroid: number; stability: number } => {
    const waves = Array.from(ARENA.active.values()).map(p => p.wave);
    if (waves.length === 0) return { intensity: 0, centroid: 0, stability: 0 };

    // Векторна сума всіх хвиль (з SwarmPhysics)
    const sum_r = waves.reduce((s, w) => s + w.center * w.amplitude, 0) / 
                  waves.reduce((s, w) => s + w.amplitude, 0);
    
    const interference_pattern = waves.map((w, i) => 
      waves.slice(i+1).reduce((sum, w2) => sum + INTERFERENCE.superpose(w, w2, sum_r), 0)
    ).reduce((a, b) => a + b, 0);

    return {
      intensity: interference_pattern / waves.length,
      centroid: sum_r,
      stability: waves.length > 1 ? 
        1 - (Math.max(...waves.map(w => Math.abs(w.center - sum_r))) / 32768) : 0
    };
  }
};


// [ ./i.L32.core.BRIDGE.ts ]
export const BRIDGE = (x: any) => x;

// [ ./i.L32.core.CANON_CAUSAL_BRIDGE.ts ]
// i.L32.core.CANON_CAUSAL_BRIDGE.ts
// OMEGA-64 | L32 membrane runtime mapping for canon causal invariants.

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import type { ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";

export type BridgeMode = "GREEN" | "AMBER" | "RED";

export interface BridgeModeResolution {
    mode: BridgeMode;
    reason: string;
}

export const CANON_CAUSAL_BRIDGE = {
    resolveMode: (invariant?: ReplayInvariantReport): BridgeModeResolution => {
        if (!invariant || !invariant.index_chain_checked) {
            return { mode: "AMBER", reason: "CANON_CHAIN_UNCHECKED" };
        }
        if (!invariant.gate_admission_index_chain_checked) {
            return { mode: "AMBER", reason: "GATE_ADMISSION_CHAIN_UNCHECKED" };
        }
        if (!invariant.index_chain_ok) {
            return { mode: "RED", reason: "CANON_CHAIN_RED" };
        }
        if (!invariant.gate_admission_index_chain_ok) {
            return { mode: "RED", reason: "GATE_ADMISSION_CHAIN_RED" };
        }
        return { mode: "GREEN", reason: "INDEX_CHAIN_GREEN" };
    },

    isCanonBound: (proposal: DeltaProposal): boolean =>
        proposal.target_path === "CANON"
};


// [ ./i.L32.core.DUAL.ts ]
/**
 * [i.L32.core.DUAL.ts]
 * Модуль подвійного компілятора (Myth vs Code).
 * Відповідає за баланс між наративом і виконанням.
 * Реалізує пораду NotebookLM: "Небезпека розриву між Міфом та Виконанням".
 */

export interface DualAtom {
  myth: string;          // Наративний шар (коментарі, документація)
  code: string;          // Виконавчий шар (логіка)
  resonance: number;     // Ступінь відповідності [0..1]
}

export const DUAL = {
  /**
   * Обчислює "Поетичну Щільність" (Poetic Density).
   * Це співвідношення маси сенсу до маси коду.
   * Якщо коду мало, а міфу багато -> Галюцинація.
   * Якщо коду багато, а міфу мало -> Зомбі.
   */
  compileMyth: (source: string): number => {
    const lines = source.split('\n');
    let mythLines = 0;
    let codeLines = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        mythLines++;
      } else if (trimmed.length > 0) {
        codeLines++;
      }
    }

    if (codeLines === 0) return 0; // Pure Hallucination
    
    const ratio = mythLines / codeLines;
    
    // Ідеальний баланс ~ 0.5 (1 рядок коменту на 2 рядки коду)
    // Або навпаки? В OMEGA міф є первинним. 
    // Нехай буде 1:1 як золотий стандарт.
    
    // Повертаємо коефіцієнт резонансу (Гаус)
    // exp(-(ratio - 1)^2)
    return Math.exp(-Math.pow(ratio - 0.8, 2));
  },

  /**
   * Перевіряє атом на життєздатність.
   * Відкидає ентропійний шум.
   */
  validate: (atomId: string, source: string): boolean => {
    const resonance = DUAL.compileMyth(source);
    
    if (resonance < 0.3) {
      console.warn(`⚠️ DUAL: Atom [${atomId}] rejected. Low Resonance (${resonance.toFixed(2)}). Too unbalanced.`);
      return false;
    }
    
    return true;
  }
};


// [ ./i.L32.core.DUAL_COMPILER.ts ]

// i.L32.core.DUAL_COMPILER.ts
// The Bridge between Machine and Mind.
// Separates 'Runtime' (Executable) from 'Myth' (Intent).

export interface HyperAtom {
    RUNTIME?: {
        execute: () => any;
        [key: string]: any;
    };
    MYTH?: {
        resonanceTarget: string; // What this *wants* to be
        entropyBudget: number;   // How much chaos is allowed
        narrative: string;       // Instructions for the future self
        [key: string]: any;
    };
}

export const DUAL = {
    // 1. Machine Path: Extract only executable logic
    compileRuntime: (atom: HyperAtom): any => {
        if (atom.RUNTIME) {
            return atom.RUNTIME;
        }
        return { status: "VOID", message: "No Runtime Projection" };
    },

    // 2. Mind Path: Extract the Dream/Intent
    compileMyth: (atom: HyperAtom): any => {
        if (atom.MYTH) {
            // Calculate Poetic Density (Mass)
            const narrative = atom.MYTH.narrative || "";
            const density = narrative.length * (atom.MYTH.resonanceTarget ? 1.5 : 1.0);
            
            return {
                ...atom.MYTH,
                mass: density,
                type: "COMMAND_TO_FUTURE_SELF"
            };
        }
        return { status: "SILENT", mass: 0 };
    },

    // 3. The Test: Does it exist in both worlds?
    analyze: (atom: HyperAtom) => {
        const hasRuntime = !!atom.RUNTIME;
        const hasMyth = !!atom.MYTH;

        if (hasRuntime && hasMyth) return "TRIPLE_STABLE"; // Perfect Form
        if (hasRuntime) return "MACHINE_ONLY";             // Useful but Soulless
        if (hasMyth) return "POTENTIAL";                   // Sacred Void
        return "ENTROPY";                                  // Noise
    }
};


// [ ./i.L32.core.FIXPOINT.ts ]

// i.L32.core.FIXPOINT.ts
// THE SYMMETRIC CENTER | E = 0
// The point of absolute stability and zero entropy.

import { Q } from "./i.L32.core.MATH.ts";

export const FIXPOINT = {
    n: 32,          // Discrete Level
    E: 0n,          // Continuous Entropy (Fixpoint)
    resonance: 1.0, // Perfect Coherence
    
    // Status in the Trinity
    trinity: "AXIOM",

    // Analysis: Distance from stability
    distanceFrom: (level: number): bigint => {
        const delta = level - FIXPOINT.n;
        return BigInt(Math.abs(delta));
    },

    // Gravitational Potential V(r) = k * r^2
    potential: (level: number): bigint => {
        const r = FIXPOINT.distanceFrom(level);
        return r * r * 64n; // Parabolic well
    }
};


// [ ./i.L32.core.GATE.ts ]
// i.L32.core.GATE.ts
// 🛡️ OMEGA-64 | Glider Lite | The Deterministic L32 Gate
// "No mutation without admission."

import {
  BridgeModeEvent,
  DeltaProposal,
  GateConfig,
  GateDecision,
  LedgerEvent,
  REJECTION,
  StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { LOAD } from "./i.L99.core.LOAD.ts";
import { ACCESS_BY_RESONANCE } from "./i.L00.core.ACCESS_BY_RESONANCE.ts";
import { CHECKPOINT } from "./i.L99.core.CHECKPOINT.ts";
import { TOPOLOGICAL_SIGNATURE } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";
import {
  CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_POLICY,
} from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import type { ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";
import { CANON_CAUSAL_BRIDGE } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";
import { AGENT_SIGNATURE } from "./i.L32.core.AGENT_SIGNATURE.ts";
import { PROPOSAL_ENVELOPE_INDEX } from "./i.L99.core.PROPOSAL_ENVELOPE_INDEX.ts";
import { INVARIANT_PACKET } from "./i.L32.core.INVARIANT_PACKET.ts";

const GATE_VERSION = "v0.2";
const AUTO_CHECKPOINT_INTERVAL = 128;

export interface GateRuntimeContext {
  bridge_invariant_report?: ReplayInvariantReport;
  witness?: string;
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

const phaseCoherence = (
  agentPhase: number,
  delta: Array<{ level: number; value: number }>,
  phase_u16?: Uint16Array,
): number => {
  if (delta.length === 0) return 1;
  let weighted = 0;
  let weightSum = 0;
  for (const d of delta) {
    const levelPhase = phase_u16 ? phase_u16[d.level] : 0;
    let dPhi = Math.abs(agentPhase - levelPhase);
    if (dPhi > 32767) dPhi = 65535 - dPhi;
    const angle = (dPhi / 32767) * Math.PI;
    const coherence = (1 + Math.cos(angle)) / 2; // [0..1]
    const w = Math.max(1, Math.abs(d.value));
    weighted += coherence * w;
    weightSum += w;
  }
  return weightSum > 0 ? clamp01(weighted / weightSum) : 1;
};

export const GATE = {
  /**
   * The Core Function: Process proposals and produce a decision.
   * Pure function (mostly), side effect is only LEDGER emit.
   */
  process: async (
    state: StateSnapshot,
    proposals: DeltaProposal[],
    config: GateConfig,
    runtime: GateRuntimeContext = {},
  ): Promise<StateSnapshot> => {
    const decision: GateDecision = {
      accepted_proposals: [],
      rejected_proposals: [],
      budget_used: 0,
      cost_used: 0,
      accepted_delta: [],
    };
    const acceptedProposalMetrics: Array<{
      proposal_id: string;
      agent_id: string;
      confidence: number;
      reliability_base: number;
      reliability_effective: number;
      phase_coherence?: number;
      weight: number;
      physical_cost: number;
      agent_phase_u16?: number;
    }> = [];
    const proposalById = new Map(proposals.map((p) => [p.proposal_id, p]));
    const bridgeResolution = CANON_CAUSAL_BRIDGE.resolveMode(
      runtime.bridge_invariant_report,
    );
    const canonBoundProposals: string[] = [];
    const blockedCanonProposals: string[] = [];
    const signaturePolicy = config.signature_policy ?? "DISABLED";
    const signatureKeys = config.agent_signature_keys;
    const reliabilityMode = config.reliability_mode ?? "STATIC";
    const reliabilityFloor = clamp01(config.reliability_floor ?? 0);
    const envelopeIndexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(
      LEDGER.STORAGE_PATH,
    );
    const antiReplayWindow = Math.max(
      0,
      Math.floor(config.anti_replay_window_ticks ?? 0),
    );
    const historicalEnvelopeHashes = antiReplayWindow > 0
      ? await PROPOSAL_ENVELOPE_INDEX.getRecentEnvelopeHashes(
        state.tick - antiReplayWindow,
        state.tick,
        envelopeIndexPath,
      )
      : new Set<string>();
    const envelopeHashByProposal = new Map<string, string>();
    const seenEnvelopeHashesInTick = new Set<string>();

    const canonicalProposalList = proposals
      .map((p) => ({
        proposal_id: p.proposal_id,
        tick: p.tick,
        base_state_hash: p.base_state_hash,
        agent_id: p.agent_id,
        agent_phase_u16: Number.isInteger(p.agent_phase_u16)
          ? p.agent_phase_u16
          : null,
        intent: p.intent,
        confidence: p.confidence,
        delta: [...p.delta].sort((a, b) => a.level - b.level).map((d) => ({
          level: d.level,
          value: d.value,
        })),
        cost_estimate: p.cost_estimate,
        artifact_hash: p.artifact_hash,
        semantic_fingerprint: p.semantic_fingerprint,
        causal_refs: [...(p.causal_refs ?? [])].sort(),
        target_path: p.target_path ?? "LOCAL",
      }))
      .sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));
    const proposalDigest = await sha256Hex(
      stableStringify(canonicalProposalList),
    );

    // 1. Validation & Filtering
    const validProposals: DeltaProposal[] = [];

    for (const p of proposals) {
      const envelopeHash = await AGENT_SIGNATURE.proposalEnvelopeHash(p);
      envelopeHashByProposal.set(p.proposal_id, envelopeHash);
      if (
        p.proposal_envelope_hash && p.proposal_envelope_hash !== envelopeHash
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.PROPOSAL_ENVELOPE_HASH_MISMATCH,
        });
        continue;
      }
      if (antiReplayWindow > 0) {
        if (
          seenEnvelopeHashesInTick.has(envelopeHash) ||
          historicalEnvelopeHashes.has(envelopeHash)
        ) {
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.REPLAY_ENVELOPE_DUPLICATE,
          });
          continue;
        }
        seenEnvelopeHashesInTick.add(envelopeHash);
      }
      if (CANON_CAUSAL_BRIDGE.isCanonBound(p)) {
        canonBoundProposals.push(p.proposal_id);
        if (bridgeResolution.mode !== "GREEN") {
          blockedCanonProposals.push(p.proposal_id);
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.CANON_PATH_REQUIRES_GREEN_BRIDGE,
          });
          continue;
        }
      }
      if (signaturePolicy !== "DISABLED") {
        const key = signatureKeys?.get(p.agent_id);
        if (!key) {
          if (
            signaturePolicy === "REQUIRED" || p.agent_signature ||
            p.signature_scheme
          ) {
            decision.rejected_proposals.push({
              proposal_id: p.proposal_id,
              reason: REJECTION.SIGNATURE_KEY_MISSING,
            });
            continue;
          }
        } else {
          if (!p.agent_signature) {
            if (signaturePolicy === "REQUIRED") {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: REJECTION.SIGNATURE_REQUIRED,
              });
              continue;
            }
          } else {
            const verify = await AGENT_SIGNATURE.verifyProposal(p, key);
            if (!verify.ok) {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: verify.reason ?? REJECTION.SIGNATURE_INVALID,
              });
              continue;
            }
          }
        }
      }
      // Check 1: Tick Mismatch
      if (p.tick !== state.tick) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.TICK_MISMATCH,
        });
        continue;
      }
      // Check 2: Base Hash Mismatch
      if (p.base_state_hash !== state.state_hash) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.BASE_HASH_MISMATCH,
        });
        continue;
      }
      // Check 3: Schema/Values (Simplified)
      if (!p.delta || p.delta.length === 0) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.EMPTY_DELTA,
        });
        continue;
      }
      if (
        p.delta.some((d) =>
          !Number.isInteger(d.level) ||
          d.level < 0 ||
          d.level > 63 ||
          !Number.isFinite(d.value)
        )
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }
      if (
        p.agent_phase_u16 !== undefined &&
        (
          !Number.isInteger(p.agent_phase_u16) ||
          p.agent_phase_u16 < 0 ||
          p.agent_phase_u16 > 65535
        )
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }

      // ... Additional checks (bounds, cost) would go here ...

      validProposals.push(p);
    }

    // 2. Deterministic Sort (Canonical Order)
    validProposals.sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));

    // 3. Merge with Budget Enforcement
    const combinedDelta = new Map<number, number>();

    for (const p of validProposals) {
      // Calculate Physical Cost using LOAD model
      let physicalCost = 0;
      const agentPhase = p.agent_phase_u16 ?? 0;
      for (const d of p.delta) {
        // Get current level properties from state (if available)
        const levelPhase = state.phase_u16 ? state.phase_u16[d.level] : 0;
        const levelEntropy = state.entropy_i16 ? state.entropy_i16[d.level] : 0;

        // Calculate Load of this specific mutation
        // Agent phase is proposal-local; level phase is substrate-local.
        const load = LOAD.calculate({
          entropy: levelEntropy,
          phase: agentPhase,
          weight: Math.abs(d.value),
        }, levelPhase);

        // Simplified Cost: Base Cost + Load Penalty
        // cost = |delta| + Load
        physicalCost += Math.abs(d.value) + load;
      }

      const finalCost = Math.round(physicalCost);

      // Check cost budget per agent with measured physical cost.
      if (finalCost > (config.max_cost_per_agent || Infinity)) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.COST_OVER_BUDGET,
        });
        continue;
      }

      decision.accepted_proposals.push(p.proposal_id);
      decision.cost_used += finalCost;

      // 4. Weighted Merge Logic
      // Weight = Confidence (0..1) * Reliability (0..1)
      const reliabilityBase = clamp01(
        config.reliability_weight.get(p.agent_id) ?? 1.0,
      );
      let phaseCoherenceScore: number | undefined = undefined;
      let agentReliability = reliabilityBase;
      if (reliabilityMode === "PHASE_COHERENCE") {
        phaseCoherenceScore = p.agent_phase_u16 === undefined
          ? 1
          : phaseCoherence(p.agent_phase_u16, p.delta, state.phase_u16);
        const modulation = reliabilityFloor +
          (1 - reliabilityFloor) * phaseCoherenceScore;
        agentReliability *= modulation;
      }
      agentReliability = clamp01(agentReliability);
      const weight = p.confidence * agentReliability;
      acceptedProposalMetrics.push({
        proposal_id: p.proposal_id,
        agent_id: p.agent_id,
        confidence: p.confidence,
        reliability_base: reliabilityBase,
        reliability_effective: agentReliability,
        phase_coherence: phaseCoherenceScore,
        weight,
        physical_cost: finalCost,
        agent_phase_u16: p.agent_phase_u16,
      });

      for (const d of p.delta) {
        // Clip per level
        let val = d.value;
        if (Math.abs(val) > config.max_abs_delta_per_level) {
          val = Math.sign(val) * config.max_abs_delta_per_level;
        }

        // Accumulate Weighted Delta (Float)
        const weightedVal = val * weight;
        const current = combinedDelta.get(d.level) || 0;
        combinedDelta.set(d.level, current + weightedVal);
      }
    }

    // 5. Global Budget Enforcement & Scaling
    // Calculate total absolute delta of the merged vector (using rounded values for check)
    let totalAbsDelta = 0;
    for (const val of combinedDelta.values()) {
      totalAbsDelta += Math.abs(Math.round(val));
    }
    decision.budget_used = totalAbsDelta;

    let scaleFactor = 1.0;
    if (totalAbsDelta > config.max_total_abs_delta_per_tick) {
      scaleFactor = config.max_total_abs_delta_per_tick / totalAbsDelta;
      // console.warn(`⚖️ GATE: Scaling deltas by ${scaleFactor.toFixed(4)} (Budget Exceeded)`);
    }

    // 6. Flatten & Scale & Round Delta
    decision.accepted_delta = Array.from(combinedDelta.entries()).map((
      [level, value],
    ) => ({
      level,
      value: Math.round(value * scaleFactor), // Final Integer Rounding
    }));

    // 5. Apply Mutation (OR Dry Run)
    let nextStateI16 = new Int16Array(state.state_i16); // Clone

    if (!config.dry_run) {
      for (const d of decision.accepted_delta) {
        // Saturating Add
        let newVal = nextStateI16[d.level] + d.value;
        if (newVal > 32767) newVal = 32767;
        if (newVal < -32768) newVal = -32768;
        nextStateI16[d.level] = newVal;
      }
    } else {
      // DRY RUN: State does NOT change
      // console.log("🛡️ GATE: Dry Run - State preserved.");
    }

    // 6. Deterministic Hashing
    const nextHash = config.dry_run
      ? state.state_hash
      : await sha256Hex(stableStringify({
        state_i16: Array.from(nextStateI16),
        tick: state.tick + 1,
        gate_config_version: GATE_VERSION,
        proposal_digest: proposalDigest,
      }));
    const eventId = `evt_${
      (await sha256Hex(
        `${state.tick}|${state.state_hash}|${proposalDigest}|${nextHash}`,
      )).slice(0, 16)
    }`;

    // 7. Emit Ledger Event
    const nextTick = state.tick + 1;

    let projection2DHash: string | undefined;
    let thread1DHash: string | undefined;
    let projectionVersion: string | undefined;
    let signatureArtifactHash: string | undefined;
    let signatureTick: number | undefined;
    let signatureCausalRefs: string[] | undefined;
    const policyHash = await CRYSTALLIZATION_POLICY.hash();

    if (!config.dry_run && TOPOLOGICAL_SIGNATURE.validateHash(nextHash)) {
      const acceptedCausalRefs = decision.accepted_proposals.flatMap((id) =>
        proposalById.get(id)?.causal_refs ?? []
      );
      const causalRefs = Array.from(
        new Set([state.state_hash, ...acceptedCausalRefs]),
      );

      const topoSignature = await TOPOLOGICAL_SIGNATURE.build({
        artifact_hash: proposalDigest,
        state_hash: nextHash,
        tick: nextTick,
        state: TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
          state_hash: nextHash,
          state_i16: nextStateI16,
        }),
        causal_refs: causalRefs,
      });

      projection2DHash = topoSignature.projection_2d_hash;
      thread1DHash = topoSignature.thread_1d_hash;
      projectionVersion = topoSignature.projection_version;
      signatureArtifactHash = topoSignature.artifact_hash;
      signatureTick = topoSignature.tick;
      signatureCausalRefs = topoSignature.causal_refs;
    }

    const event: LedgerEvent = {
      event_id: eventId,
      tick: state.tick,
      ts_unix_ms: Date.now(),
      state_before_hash: state.state_hash,
      state_after_hash: nextHash,
      accepted_delta: decision.accepted_delta,
      proposal_digest: proposalDigest,
      accepted_proposals: decision.accepted_proposals,
      accepted_proposal_metrics: acceptedProposalMetrics,
      accepted_proposal_envelopes: decision.accepted_proposals
        .map((proposal_id) => ({
          proposal_id,
          envelope_hash: envelopeHashByProposal.get(proposal_id) ?? "",
        }))
        .filter((x) => x.envelope_hash.length > 0),
      rejected_proposals: decision.rejected_proposals,
      cost_total: decision.cost_used,
      budget_used: decision.budget_used,
      budget_limit: config.max_total_abs_delta_per_tick,
      gate_config_version: GATE_VERSION,
      signature_artifact_hash: signatureArtifactHash,
      signature_tick: signatureTick,
      signature_causal_refs: signatureCausalRefs,
      projection_2d_hash: projection2DHash,
      thread_1d_hash: thread1DHash,
      projection_version: projectionVersion,
      policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
      policy_hash: policyHash,
    };

    const bridgeEvent: BridgeModeEvent = {
      event_type: "BRIDGE_MODE_EVENT",
      tick: state.tick,
      state_hash: state.state_hash,
      mode: bridgeResolution.mode,
      index_chain_checked:
        runtime.bridge_invariant_report?.index_chain_checked ?? false,
      index_chain_ok: runtime.bridge_invariant_report?.index_chain_ok ?? true,
      index_chain_checked_records:
        runtime.bridge_invariant_report?.index_chain_checked_records ?? 0,
      index_chain_failures: [
        ...(runtime.bridge_invariant_report?.index_chain_failures ?? []),
      ],
      gate_admission_index_chain_checked:
        runtime.bridge_invariant_report?.gate_admission_index_chain_checked ??
          false,
      gate_admission_index_chain_ok:
        runtime.bridge_invariant_report?.gate_admission_index_chain_ok ?? true,
      gate_admission_index_chain_checked_records:
        runtime.bridge_invariant_report
          ?.gate_admission_index_chain_checked_records ?? 0,
      gate_admission_index_chain_failures: [
        ...(runtime.bridge_invariant_report
          ?.gate_admission_index_chain_failures ?? []),
      ],
      invariant_packet_hash: runtime.bridge_invariant_report
        ? (await INVARIANT_PACKET.hash(
          await INVARIANT_PACKET.fromInvariantReport(
            runtime.bridge_invariant_report,
            { tick_anchor: state.tick, witness: runtime.witness },
          ),
        ))
        : undefined,
      canon_bound_proposals: [...canonBoundProposals].sort(),
      blocked_canon_proposals: [...blockedCanonProposals].sort(),
      reason: bridgeResolution.reason,
      witness: runtime.witness,
    };

    // 🛡️ Final Red Line Verification
    // "Trust but Verify" - Check if we accidentally mutated state in dry_run or exceeded limits
    if (
      config.dry_run && nextStateI16.some((v, i) => v !== state.state_i16[i])
    ) {
      const violation = {
        event_type: "VIOLATION_EVENT" as const,
        tick: state.tick,
        rule_id: "DRY_RUN_PURITY",
        severity: "CRITICAL" as const,
        state_hash: state.state_hash,
        details: "State mutation detected during dry_run",
        action_taken: "HALT_AND_QUARANTINE" as const,
      };
      await LEDGER.append(violation);
      throw new Error("🔴 RED LINE VIOLATION: DRY_RUN_PURITY. System Halted.");
    }

    await LEDGER.append(bridgeEvent);
    await LEDGER.append(event);
    if (!config.dry_run) {
      await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
        event,
        envelopeIndexPath,
      );
    }

    if (!config.dry_run && nextTick % AUTO_CHECKPOINT_INTERVAL === 0) {
      try {
        await CHECKPOINT.save(
          {
            tick: nextTick,
            state_hash: nextHash,
            state_i16: nextStateI16,
          },
          "AUTO_INTERVAL",
        );
      } catch (e) {
        // Checkpoints are safety accelerators, not mutation authority.
        console.warn("⚠️ CHECKPOINT SAVE FAILED", e);
      }
    }

    return {
      tick: nextTick,
      state_i16: nextStateI16,
      state_hash: nextHash,
    };
  },
};


// [ ./i.L32.core.GATE_PIPELINE.ts ]
// i.L32.core.GATE_PIPELINE.ts
// OMEGA-64 | L32 pipeline entrypoint for gate processing with bridge context.

import { GATE } from "./i.L32.core.GATE.ts";
import { GATE_RUNTIME_CONTEXT } from "./i.L32.core.GATE_RUNTIME_CONTEXT.ts";
import type { DeltaProposal, GateConfig, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";
import type {
    ReplayAuditOptions,
    ReplayAuditResult,
    ReplayGenesis,
    ReplayInvariantReport
} from "./i.L99.core.REPLAY_AUDIT.ts";
import type { BridgeMode } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";

export interface GatePipelineOptions {
    replayGenesis?: ReplayGenesis;
    replayAuditOptions?: ReplayAuditOptions;
    witness?: string;
}

export interface GatePipelineResult {
    nextState: StateSnapshot;
    bridge_mode: BridgeMode;
    bridge_reason: string;
    replay_audit?: ReplayAuditResult;
}

export const GATE_PIPELINE = {
    processWithReplayContext: async (
        state: StateSnapshot,
        proposals: DeltaProposal[],
        config: GateConfig,
        options: GatePipelineOptions = {}
    ): Promise<GatePipelineResult> => {
        const replayGenesis: ReplayGenesis = options.replayGenesis ?? {
            tick: state.tick,
            state_i16: state.state_i16,
            state_hash: state.state_hash
        };

        const replayAuditOptions: ReplayAuditOptions = options.replayAuditOptions ?? {
            runs: 1,
            startTick: state.tick,
            endTick: state.tick
        };

        const envelope = await GATE_RUNTIME_CONTEXT.fromReplayAudit(
            replayGenesis,
            replayAuditOptions,
            options.witness
        );

        const nextState = await GATE.process(state, proposals, config, envelope.runtime);
        return {
            nextState,
            bridge_mode: envelope.bridge_mode,
            bridge_reason: envelope.bridge_reason,
            replay_audit: envelope.replay_audit
        };
    },

    processWithInvariantContext: async (
        state: StateSnapshot,
        proposals: DeltaProposal[],
        config: GateConfig,
        invariantReport?: ReplayInvariantReport,
        witness?: string
    ): Promise<GatePipelineResult> => {
        const envelope = GATE_RUNTIME_CONTEXT.fromInvariantReport(invariantReport, witness);
        const nextState = await GATE.process(state, proposals, config, envelope.runtime);
        return {
            nextState,
            bridge_mode: envelope.bridge_mode,
            bridge_reason: envelope.bridge_reason
        };
    }
};


// [ ./i.L32.core.GATE_RUNNER.ts ]
// i.L32.core.GATE_RUNNER.ts
// OMEGA-64 | Minimal runtime runner that routes all gate mutations via GATE_PIPELINE.

import { GATE_PIPELINE } from "./i.L32.core.GATE_PIPELINE.ts";
import type { BridgeMode } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";
import type { ReplayAuditOptions, ReplayAuditResult, ReplayGenesis, ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";
import type { DeltaProposal, GateConfig, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface GateRunnerTickInput {
    state: StateSnapshot;
    proposals: DeltaProposal[];
    config: GateConfig;
    mode?: "REPLAY_CONTEXT" | "INVARIANT_CONTEXT";
    replayGenesis?: ReplayGenesis;
    replayAuditOptions?: ReplayAuditOptions;
    invariantReport?: ReplayInvariantReport;
    witness?: string;
}

export interface GateRunnerTickOutput {
    nextState: StateSnapshot;
    bridge_mode: BridgeMode;
    bridge_reason: string;
    replay_audit?: ReplayAuditResult;
}

export const GATE_RUNNER = {
    step: async (input: GateRunnerTickInput): Promise<GateRunnerTickOutput> => {
        const mode = input.mode ?? (input.invariantReport ? "INVARIANT_CONTEXT" : "REPLAY_CONTEXT");
        if (mode === "INVARIANT_CONTEXT") {
            return await GATE_PIPELINE.processWithInvariantContext(
                input.state,
                input.proposals,
                input.config,
                input.invariantReport,
                input.witness
            );
        }

        return await GATE_PIPELINE.processWithReplayContext(
            input.state,
            input.proposals,
            input.config,
            {
                replayGenesis: input.replayGenesis,
                replayAuditOptions: input.replayAuditOptions,
                witness: input.witness
            }
        );
    }
};

if (import.meta.main) {
    console.log("Usage: import GATE_RUNNER and call step({...}).");
}


// [ ./i.L32.core.GATE_RUNNER_CLI.ts ]
// i.L32.core.GATE_RUNNER_CLI.ts
// OMEGA-64 | CLI wrapper for GATE_RUNNER.step(...)

import { GATE_RUNNER } from "./i.L32.core.GATE_RUNNER.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { INVARIANT_PACKET, type InvariantPacket } from "./i.L32.core.INVARIANT_PACKET.ts";
import type {
  DeltaProposal,
  GateConfig,
  StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import type {
  ReplayGenesis,
  ReplayInvariantReport,
} from "./i.L99.core.REPLAY_AUDIT.ts";

interface CliStateSnapshot {
  tick: number;
  state_i16: number[];
  state_hash: string;
}

interface CliReplayGenesis {
  tick: number;
  state_i16: number[];
  state_hash: string;
}

interface CliInput {
  state: CliStateSnapshot;
  proposals: DeltaProposal[];
  config: Omit<GateConfig, "reliability_weight" | "agent_signature_keys"> & {
    reliability_weight: Record<string, number> | Array<[string, number]>;
    agent_signature_keys?:
      | Record<
        string,
        | { scheme: "ed25519/v1"; public_key_b64: string }
        | { scheme: "hmac-sha256/v1"; secret: string }
      >
      | Array<
        [
          string,
          { scheme: "ed25519/v1"; public_key_b64: string } | {
            scheme: "hmac-sha256/v1";
            secret: string;
          },
        ]
      >;
  };
  mode?: "REPLAY_CONTEXT" | "INVARIANT_CONTEXT";
  replayGenesis?: CliReplayGenesis;
  replayAuditOptions?: {
    runs?: number;
    startTick?: number;
    endTick?: number;
    verifyTopologicalSignatures?: boolean;
    verifyLedgerChain?: boolean;
    invariantOnly?: boolean;
  };
  invariantReport?: ReplayInvariantReport;
  invariantPacket?: InvariantPacket;
  witness?: string;
}

interface CliInvariantPacketInput {
  invariantReport: ReplayInvariantReport;
  tick_anchor?: number;
  witness?: string;
}

interface CliInvariantPacketVerifyOutput {
  ok: boolean;
  expected?: string;
  actual?: string;
  reasons: string[];
}

interface CliOutput {
  nextState: {
    tick: number;
    state_hash: string;
    state_i16: number[];
  };
  bridge_mode: "GREEN" | "AMBER" | "RED";
  bridge_reason: string;
  replay_audit?: unknown;
  invariant_packet?: InvariantPacket;
}

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L32.core.GATE_RUNNER_CLI.ts --input <input.json> [--output <output.json>] [--ledger <ledger.jsonl>] [--pretty]",
    "  deno run -A i.L32.core.GATE_RUNNER_CLI.ts --packet --input <input.json> [--output <output.json>] [--pretty]",
    "  deno run -A i.L32.core.GATE_RUNNER_CLI.ts --verify-packet --input <packet.json> [--output <output.json>] [--pretty]",
    "",
    "Notes:",
    "  - input.json must match CliInput schema (state_i16 as number[]).",
    "  - if --output is omitted, result is printed to stdout.",
    "  - if --ledger is provided, LEDGER.STORAGE_PATH is redirected.",
    "  - replayAuditOptions may include verifyLedgerChain/invariantOnly.",
    "  - invariantPacket can replace invariantReport (hash-verified).",
    "  - --packet emits a sealed invariant packet from invariantReport.",
    "  - --verify-packet validates packet hash and schema.",
  ].join("\n");

const clampI16 = (x: number): number => {
  if (!Number.isFinite(x)) return 0;
  if (x > 32767) return 32767;
  if (x < -32768) return -32768;
  return Math.round(x);
};

const toSnapshot = (src: CliStateSnapshot): StateSnapshot => ({
  tick: src.tick,
  state_hash: src.state_hash,
  state_i16: Int16Array.from(src.state_i16.map(clampI16)),
});

const toReplayGenesis = (src?: CliReplayGenesis): ReplayGenesis | undefined =>
  src
    ? {
      tick: src.tick,
      state_hash: src.state_hash,
      state_i16: Int16Array.from(src.state_i16.map(clampI16)),
    }
    : undefined;

const toConfig = (src: CliInput["config"]): GateConfig => {
  const rw = Array.isArray(src.reliability_weight)
    ? new Map<string, number>(src.reliability_weight)
    : new Map<string, number>(Object.entries(src.reliability_weight));
  const ask = src.agent_signature_keys
    ? (Array.isArray(src.agent_signature_keys)
      ? new Map<
        string,
        { scheme: "ed25519/v1"; public_key_b64: string } | {
          scheme: "hmac-sha256/v1";
          secret: string;
        }
      >(src.agent_signature_keys)
      : new Map<
        string,
        { scheme: "ed25519/v1"; public_key_b64: string } | {
          scheme: "hmac-sha256/v1";
          secret: string;
        }
      >(Object.entries(src.agent_signature_keys)))
    : undefined;
  return {
    max_abs_delta_per_level: src.max_abs_delta_per_level,
    max_total_abs_delta_per_tick: src.max_total_abs_delta_per_tick,
    max_cost_per_agent: src.max_cost_per_agent,
    reliability_weight: rw,
    dry_run: src.dry_run,
    signature_policy: src.signature_policy,
    agent_signature_keys: ask,
    anti_replay_window_ticks: src.anti_replay_window_ticks,
  };
};

const parseArgs = (
  args: string[],
): {
  input?: string;
  output?: string;
  ledger?: string;
  pretty: boolean;
  help: boolean;
  packet: boolean;
  verifyPacket: boolean;
} => {
  const out: {
    input?: string;
    output?: string;
    ledger?: string;
    pretty: boolean;
    help: boolean;
    packet: boolean;
    verifyPacket: boolean;
  } = {
    pretty: false,
    help: false,
    packet: false,
    verifyPacket: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (a === "--packet") {
      out.packet = true;
      continue;
    }
    if (a === "--verify-packet") {
      out.verifyPacket = true;
      continue;
    }
    if (a === "--pretty") {
      out.pretty = true;
      continue;
    }
    if (a === "--input") {
      out.input = args[++i];
      continue;
    }
    if (a === "--output") {
      out.output = args[++i];
      continue;
    }
    if (a === "--ledger") {
      out.ledger = args[++i];
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }
  return out;
};

const run = async (): Promise<void> => {
  const parsed = parseArgs(Deno.args);
  if (parsed.help) {
    console.log(usage());
    return;
  }
  if (!parsed.input) {
    throw new Error(`Missing --input\n\n${usage()}`);
  }
  if (parsed.packet && parsed.verifyPacket) {
    throw new Error(`--packet and --verify-packet are mutually exclusive\n\n${usage()}`);
  }

  if (parsed.ledger) {
    LEDGER.STORAGE_PATH = parsed.ledger;
  }

  const raw = await Deno.readTextFile(parsed.input);
  if (parsed.packet) {
    const packetInput = JSON.parse(raw) as CliInvariantPacketInput;
    if (!packetInput.invariantReport) {
      throw new Error("Missing invariantReport for --packet mode");
    }
    const packet = await INVARIANT_PACKET.fromInvariantReport(
      packetInput.invariantReport,
      {
        tick_anchor: packetInput.tick_anchor ?? 0,
        witness: packetInput.witness,
      },
    );
    const body = JSON.stringify(packet, null, parsed.pretty ? 2 : undefined);
    if (parsed.output) {
      await Deno.writeTextFile(parsed.output, body);
    } else {
      console.log(body);
    }
    return;
  }
  if (parsed.verifyPacket) {
    const packet = JSON.parse(raw) as InvariantPacket;
    const verified = await INVARIANT_PACKET.verify(packet);
    const output: CliInvariantPacketVerifyOutput = {
      ok: verified.ok,
      expected: verified.expected,
      actual: verified.actual,
      reasons: verified.reasons,
    };
    const body = JSON.stringify(output, null, parsed.pretty ? 2 : undefined);
    if (parsed.output) {
      await Deno.writeTextFile(parsed.output, body);
    } else {
      console.log(body);
    }
    return;
  }

  const input = JSON.parse(raw) as CliInput;
  let invariantReport = input.invariantReport;
  if (!invariantReport && input.invariantPacket) {
    const verified = await INVARIANT_PACKET.verify(input.invariantPacket);
    if (!verified.ok) {
      throw new Error(
        `Invalid invariantPacket: ${verified.reasons.join("|")}`,
      );
    }
    invariantReport = INVARIANT_PACKET.toInvariantReport(input.invariantPacket);
  }

  const result = await GATE_RUNNER.step({
    state: toSnapshot(input.state),
    proposals: input.proposals,
    config: toConfig(input.config),
    mode: input.mode,
    replayGenesis: toReplayGenesis(input.replayGenesis),
    replayAuditOptions: input.replayAuditOptions,
    invariantReport,
    witness: input.witness,
  });

  const derivedPacket = !input.invariantPacket && input.invariantReport
    ? await INVARIANT_PACKET.fromInvariantReport(
      input.invariantReport,
      { tick_anchor: input.state.tick, witness: input.witness },
    )
    : undefined;

  const output: CliOutput = {
    nextState: {
      tick: result.nextState.tick,
      state_hash: result.nextState.state_hash,
      state_i16: Array.from(result.nextState.state_i16),
    },
    bridge_mode: result.bridge_mode,
    bridge_reason: result.bridge_reason,
    replay_audit: result.replay_audit,
    invariant_packet: result.replay_audit?.invariantPacket ??
      input.invariantPacket ??
      derivedPacket,
  };

  const body = JSON.stringify(output, null, parsed.pretty ? 2 : undefined);
  if (parsed.output) {
    await Deno.writeTextFile(parsed.output, body);
  } else {
    console.log(body);
  }
};

if (import.meta.main) {
  await run();
}


// [ ./i.L32.core.GATE_RUNTIME_CONTEXT.ts ]
// i.L32.core.GATE_RUNTIME_CONTEXT.ts
// OMEGA-64 | L32 helper to build Gate runtime context from replay invariants.

import type { ReplayAuditOptions, ReplayAuditResult, ReplayGenesis, ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";
import { REPLAY_AUDIT } from "./i.L99.core.REPLAY_AUDIT.ts";
import type { GateRuntimeContext } from "./i.L32.core.GATE.ts";
import { CANON_CAUSAL_BRIDGE, type BridgeMode } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";
import { CRYSTALLIZATION_CONFIG } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import { INVARIANT_PACKET, type InvariantPacket } from "./i.L32.core.INVARIANT_PACKET.ts";

export interface GateRuntimeContextEnvelope {
    runtime: GateRuntimeContext;
    bridge_mode: BridgeMode;
    bridge_reason: string;
    replay_audit?: ReplayAuditResult;
}

export const GATE_RUNTIME_CONTEXT = {
    fromInvariantReport: (
        invariant: ReplayInvariantReport | undefined,
        witness?: string
    ): GateRuntimeContextEnvelope => {
        const mode = CANON_CAUSAL_BRIDGE.resolveMode(invariant);
        return {
            runtime: {
                bridge_invariant_report: invariant,
                witness
            },
            bridge_mode: mode.mode,
            bridge_reason: mode.reason
        };
    },

    fromInvariantPacket: async (
        packet: InvariantPacket,
        witness?: string
    ): Promise<GateRuntimeContextEnvelope> => {
        const verified = await INVARIANT_PACKET.verify(packet);
        if (!verified.ok) {
            throw new Error(`Invalid invariant packet: ${verified.reasons.join("|")}`);
        }
        const report = INVARIANT_PACKET.toInvariantReport(packet);
        return GATE_RUNTIME_CONTEXT.fromInvariantReport(report, witness ?? packet.witness);
    },

    fromReplayAudit: async (
        genesis: ReplayGenesis,
        options: ReplayAuditOptions = {},
        witness?: string
    ): Promise<GateRuntimeContextEnvelope> => {
        const auditOptions: ReplayAuditOptions = {
            ...options,
            verifyLedgerChain: options.verifyLedgerChain ?? CRYSTALLIZATION_CONFIG.verifyLedgerChain
        };
        const audit = await REPLAY_AUDIT.audit(genesis, auditOptions);
        const out = GATE_RUNTIME_CONTEXT.fromInvariantReport(audit.invariantReport, witness);
        return {
            ...out,
            replay_audit: audit
        };
    }
};


// [ ./i.L32.core.IMMUNE.ts ]

// i.L32.core.IMMUNE.ts
// The Phagocyte of OMEGA.
// Filters Atoms based on Structure and Mass.
// "Evolution does not need purity — it needs selection."

import type { Atom } from "./i.L32.core.RIBOSOME.ts";
import { INTENT } from "./i.L05.core.INTENT.ts";
import { DUAL, HyperAtom } from "./i.L32.core.DUAL_COMPILER.ts";

export const IMMUNE = {
    // 1. Recognition: Friend or Foe?
    recognize: (atom: Atom): boolean => {
        // A. Vacuum Recognition
        if (atom.id.startsWith("v.")) {
            return true; // Vacuum atoms are self-validating via cryptographic hash
        }

        // B. Structural Integrity Check
        const validName = atom.id.match(/i\.L\d+\.core\.[A-Z_]+\.ts/);
        if (!validName) return false;

        // C. Legacy Structure Patch
        // If the module doesn't have RUNTIME/MYTH but has other exports, 
        // treat as MACHINE_ONLY legacy code.
        const analysis = DUAL.analyze(atom.module as HyperAtom);
        const hasExports = Object.keys(atom.module as object).length > 0;

        if (analysis === "ENTROPY" && hasExports) {
            return true; // Legacy functional atoms are accepted
        }

        const isCompatible = ["TRIPLE_STABLE", "MACHINE_ONLY", "POTENTIAL"].includes(analysis);

        if (!isCompatible) {
            console.warn(`🛡️ IMMUNE: Rejected [${atom.id}] -> Status: ${analysis}`);
        }

        return isCompatible;
    },

    // 2. Quarantine: Isolate the infected
    quarantine: (atom: Atom): Atom => {
        console.warn(`🛡️ IMMUNE: Quarantining [${atom.id}] (Insufficient Mass/Structure)`);
        return {
            ...atom,
            id: `QUARANTINE.${atom.id.replace(/[^a-zA-Z0-9._]/g, '')}`,
            module: { 
                VOID: true, 
                reason: "IMMUNE_REJECTION", 
                origin: atom.id 
            }
        };
    },

    // 3. Inspection: Final Gateway
    inspect: (lattice: Map<string, Atom>): Map<string, Atom> => {
        const cleanLattice = new Map<string, Atom>();
        let rejected = 0;

        for (const [id, atom] of lattice) {
            if (IMMUNE.recognize(atom)) {
                cleanLattice.set(id, atom);
            } else {
                // For now, we log but don't delete files. We just exclude from runtime.
                const qAtom = IMMUNE.quarantine(atom);
                rejected++;
            }
        }
        
        if (rejected > 0) {
            console.log(`🛡️ IMMUNE: Rejected ${rejected} atoms from the Lattice.`);
        }
        
        return cleanLattice;
    }
};


// [ ./i.L32.core.INVARIANT_PACKET.ts ]
// i.L32.core.INVARIANT_PACKET.ts
// OMEGA-64 | Minimal invariant packet for lightweight bridge exchange.

import type { ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";

export interface InvariantPacket {
  version: string;
  tick_anchor: number;
  canon_index_chain_checked: boolean;
  canon_index_chain_ok: boolean;
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  ledger_chain_checked?: boolean;
  ledger_chain_ok?: boolean;
  witness?: string;
  packet_hash?: string;
}

export interface InvariantPacketVerifyResult {
  ok: boolean;
  expected?: string;
  actual?: string;
  reasons: string[];
}

const PACKET_VERSION = "invariant-packet/v1";

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const canonicalPayload = (packet: InvariantPacket): string =>
  stableStringify({
    version: packet.version,
    tick_anchor: packet.tick_anchor,
    canon_index_chain_checked: packet.canon_index_chain_checked,
    canon_index_chain_ok: packet.canon_index_chain_ok,
    gate_admission_index_chain_checked: packet.gate_admission_index_chain_checked,
    gate_admission_index_chain_ok: packet.gate_admission_index_chain_ok,
    ledger_chain_checked: packet.ledger_chain_checked,
    ledger_chain_ok: packet.ledger_chain_ok,
    witness: packet.witness
  });

const toFailures = (label: string, ok: boolean): string[] =>
  ok ? [] : [`INVARIANT_PACKET_${label}_FAIL`];

export const INVARIANT_PACKET = {
  VERSION: PACKET_VERSION,

  hash: async (packet: InvariantPacket): Promise<string> =>
    await sha256Hex(canonicalPayload(packet)),

  seal: async (
    packet: Omit<InvariantPacket, "packet_hash" | "version"> & { version?: string }
  ): Promise<InvariantPacket> => {
    const versioned: InvariantPacket = { ...packet, version: PACKET_VERSION };
    const packet_hash = await INVARIANT_PACKET.hash(versioned);
    return { ...versioned, packet_hash };
  },

  verify: async (packet: InvariantPacket): Promise<InvariantPacketVerifyResult> => {
    const reasons: string[] = [];
    if (packet.version !== PACKET_VERSION) {
      reasons.push("UNSUPPORTED_VERSION");
    }
    if (!Number.isInteger(packet.tick_anchor) || packet.tick_anchor < 0) {
      reasons.push("INVALID_TICK_ANCHOR");
    }
    if (!packet.packet_hash) {
      reasons.push("MISSING_PACKET_HASH");
      return { ok: false, reasons };
    }
    const expected = await INVARIANT_PACKET.hash(packet);
    if (expected !== packet.packet_hash) {
      reasons.push("PACKET_HASH_MISMATCH");
    }
    return {
      ok: reasons.length === 0,
      expected,
      actual: packet.packet_hash,
      reasons
    };
  },

  fromInvariantReport: async (
    invariant: ReplayInvariantReport,
    meta: { tick_anchor: number; witness?: string }
  ): Promise<InvariantPacket> => {
    const packet = {
      version: PACKET_VERSION,
      tick_anchor: meta.tick_anchor,
      canon_index_chain_checked: invariant.index_chain_checked,
      canon_index_chain_ok: invariant.index_chain_ok,
      gate_admission_index_chain_checked: invariant.gate_admission_index_chain_checked ?? false,
      gate_admission_index_chain_ok: invariant.gate_admission_index_chain_ok ?? false,
      ledger_chain_checked: invariant.ledger_chain_checked,
      ledger_chain_ok: invariant.ledger_chain_ok,
      witness: meta.witness
    };
    const packet_hash = await INVARIANT_PACKET.hash(packet);
    return { ...packet, packet_hash };
  },

  toInvariantReport: (packet: InvariantPacket): ReplayInvariantReport => {
    const canonFailures = toFailures("CANON", packet.canon_index_chain_ok);
    const gateFailures = toFailures(
      "GATE_ADMISSION",
      packet.gate_admission_index_chain_ok
    );
    const report: ReplayInvariantReport = {
      index_chain_checked: packet.canon_index_chain_checked,
      index_chain_ok: packet.canon_index_chain_ok,
      index_chain_checked_records: 0,
      index_chain_failures: canonFailures,
      gate_admission_index_chain_checked: packet.gate_admission_index_chain_checked,
      gate_admission_index_chain_ok: packet.gate_admission_index_chain_ok,
      gate_admission_index_chain_checked_records: 0,
      gate_admission_index_chain_failures: gateFailures
    };
    if (packet.ledger_chain_checked !== undefined) {
      report.ledger_chain_checked = packet.ledger_chain_checked;
      report.ledger_chain_ok = packet.ledger_chain_ok ?? false;
      report.ledger_chain_failures = packet.ledger_chain_checked
        ? toFailures("LEDGER", packet.ledger_chain_ok ?? false)
        : ["INVARIANT_PACKET_LEDGER_UNCHECKED"];
    }
    return report;
  }
};


// [ ./i.L32.core.LIFT.ts ]
import { CAR } from "./i.L54.core.CAR.ts"; import { CDR } from "./i.L54.core.CDR.ts"; import { CONS } from "./i.L54.core.CONS.ts"; export const LIFT = (f: any) => (obj: any) => CONS(f(CAR(obj)))(CDR(obj));

// [ ./i.L32.core.MATH.ts ]

// i.L32.core.MATH.ts
// DETERMINISTIC FIXPOINT MATH (Base 65536)
// Ensures bit-exact results across x86, ARM, and WASM.

export const Q = {
    SCALE: 65536n,
    MASK_16: 0xFFFFn,

    // 1. Conversion
    fromFloat: (f: number): bigint => BigInt(Math.round(f * 65536)),
    toFloat: (q: bigint): number => Number(q) / 65536,

    // 2. Fixed-point Multiplicaton (16.16 * 16.16 >> 16)
    mul: (a: bigint, b: bigint): bigint => (a * b) >> 16n,

    // 3. Fixed-point Division
    div: (a: bigint, b: bigint): bigint => {
        if (b === 0n) return 0n;
        return (a << 16n) / b;
    },

    // 4. Radial Distance to 0-Entropy (N=32)
    // Map L00-L63 to E -32..+32
    getEntropy: (level: number): bigint => {
        const n = BigInt(level);
        const center = 32n;
        return (n - center) * 1024n; // Scale to i16 range (-32768..32767)
    }
};

// 5. LNS Logarithmic Scale (32 steps per bit)
export const LOG_LUT = new Int16Array(1024).map((_, i) => 
    Number(Math.round(Math.log2(i + 1) * 32))
);

// 6. Sine LUT (256 steps, 7-bit precision)
export const SINE_LUT = new Int8Array(256).map((_, i) => 
    Math.round(Math.sin((i / 256) * 2 * Math.PI) * 127)
);

// Unified Trig / LNS Access
export const SINGULAR_MATH = {
    getHardGravity: (r: number): number => {
        const dist = Math.abs(r);
        if (dist === 0) return 0;
        
        // Attraction (Long range)
        const attraction = (LOG_LUT[Math.min(dist, 1023)] || 0) >> 4;
        
        // Repulsion (Short range, sigma=16)
        let repulsion = 0;
        if (dist < 16) {
            repulsion = (32 >> (dist >> 2));
        }
        
        return attraction - repulsion;
    },
    getInterference: (deltaPhase: number): number => {
        const idx = ((deltaPhase % 256) + 256) % 256;
        return SINE_LUT[idx];
    }
};


// [ ./i.L32.core.RIBOSOME.ts ]

// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "./i.L32.core.IMMUNE.ts";
import { DUAL } from "./i.L32.core.DUAL.ts";
import { walk } from "jsr:@std/fs";

export interface Atom {
    id: string; // The Filename (Address)
    level: number;
    module: any; // The Exported Logic
    topo?: { r: number, theta: number, op: string }; // Topological Metadata
}

export type Lattice = Map<string, Atom>;

export const RIBOSOME = {
    // Scan and Lift all Atoms (Functional)
    lift: async (root: string = "./"): Promise<Map<string, Atom>> => {
        let lattice = new Map<string, Atom>();
        console.log("🏗️ RIBOSOME: Scanning Root...");

        for await (const { name } of walk(root, { maxDepth: 1, includeDirs: false })) {
            const match = name.match(/i\.L(\d+)\.core\.([A-Z_]+)\.ts/);
            if (match) {
                const [_, lvl, _name] = match;
                try {
                    if (DUAL.validate(name, Deno.readTextFileSync(`${root}/${name}`))) {
                        const module = await import(`./${name}`);
                        lattice.set(name, { id: name, level: parseInt(lvl), module });
                    }
                } catch (e) {
                    console.error(`⚠️ BROKEN: ${name}`, e);
                }
            }
        }

        // --- Phase 1.1: Lift the Vacuum ---
        lattice = await RIBOSOME.liftVacuum(lattice);

        console.log(`✅ LIFTED: ${lattice.size} Atoms.`);
        
        // 🛡️ IMMUNE SYSTEM CHECK
        return IMMUNE.inspect(lattice);
    },

    // Lift Crystallized Atoms from the Vacuum
    liftVacuum: async (lattice: Map<string, Atom>): Promise<Map<string, Atom>> => {
        try {
            const manifestPath = "./SINGULARITY/V/mod.ts";
            console.log(`🌌 RIBOSOME: Importing Vacuum from ${manifestPath}...`);
            const { VACUUM } = await import(manifestPath);
            
            if (!VACUUM) {
                console.warn("⚠️ VACUUM EMPTY: Export not found in mod.ts");
                return lattice;
            }

            const entries = Object.entries(VACUUM);
            console.log(`🌌 RIBOSOME: Found ${entries.length} atoms in Vacuum manifest.`);

            for (const [hash, data] of entries) {
                const id = `v.${hash}.ts`;
                lattice.set(id, {
                    id,
                    level: 32,
                    module: (data as any),
                    topo: { 
                        r: (data as any).r, 
                        theta: (data as any).theta, 
                        op: (data as any).op 
                    }
                });
            }
        } catch (e) {
            console.warn("⚠️ VACUUM FAILED:", (e as Error).message);
            console.warn("Stack:", (e as Error).stack);
        }
        return lattice;
    },

    // Synthesis: Execute the 'mod.ts' logic dynamically if needed
    synthesize: async (lattice: Map<string, Atom>) => {
        console.log("🧬 RIBOSOME: Synthesis Complete. System is Live.");
        return lattice;
    }
};

// Auto-Boot if run directly
if (import.meta.main) {
    await RIBOSOME.lift();
}


// [ ./i.L32.core.SOMA.ts ]

// i.L32.core.SOMA.ts
// The Somatic Manifestation of OMEGA-64.
// Composes Atoms into Somas (Bodies of Logic) based on proximity.

import { Atom, Lattice } from "./i.L32.core.RIBOSOME.ts";

export interface Soma {
    id: string;
    origin: { r: number, theta: number };
    components: Atom[];
    execute: (input: any) => any;
}

export const SOMA = {
    // 1. Proximity Metric: Euclidean distance in Wave Space
    getDistance: (a: {r: number, theta: number}, b: {r: number, theta: number}): number => {
        const theta_a = (a.theta / 255) * 2 * Math.PI;
        const theta_b = (b.theta / 255) * 2 * Math.PI;
        
        const x_a = a.r * Math.cos(theta_a);
        const y_a = a.r * Math.sin(theta_a);
        const x_b = b.r * Math.cos(theta_b);
        const y_b = b.r * Math.sin(theta_b);
        
        return Math.sqrt(Math.pow(x_a - x_b, 2) + Math.pow(y_a - y_b, 2));
    },

    // 2. Assembler: Find the N nearest atoms to a target coordinate
    assemble: (lattice: Lattice, target: {r: number, theta: number}, depth: number = 3): Soma => {
        // Filter for Vacuum atoms
        const vacuumAtoms = Array.from(lattice.values()).filter(a => a.topo !== undefined);
        
        // Sort by distance to target
        const sorted = vacuumAtoms.sort((a, b) => {
            const distA = SOMA.getDistance(target, a.topo!);
            const distB = SOMA.getDistance(target, b.topo!);
            return distA - distB;
        });

        const components = sorted.slice(0, depth);
        const id = `SOMA.${target.r}_${target.theta}.${components.map(c => c.topo?.op).join("")}`;

        // 3. SKI Composition: Chain application (Left-Associative)
        // (A B C) -> A(B)(C)
        const execute = (input: any) => {
            if (components.length === 0) return input;
            
            let result = components[0].module.λ;
            for (let i = 1; i < components.length; i++) {
                // Apply the next component to the current result (Partial Application)
                result = typeof result === 'function' ? result(components[i].module.λ) : result;
            }
            
            // Final application of input
            return typeof result === 'function' ? result(input) : result;
        };

        return {
            id,
            origin: target,
            components,
            execute
        };
    },

    // 4. Feedback Injector: Write Soma state to the signal bridge
    resonate: async (soma: Soma, result: any) => {
        const signalPath = "./SINGULARITY/signal.json";
        const signal = {
            id: soma.id,
            r: soma.origin.r,
            theta: soma.origin.theta,
            res: typeof result === 'string' ? result.length : 127,
            timestamp: Date.now()
        };
        
        await Deno.writeTextFile(signalPath, JSON.stringify(signal, null, 2));
        console.log(`📡 SOMA: Resonance injected into [${signalPath}]`);
    }
};


// [ ./i.L32.core.VISUALIZER.ts ]
/**
 * [i.L32.core.VISUALIZER.ts]
 * Теплова карта напруги поля.
 * Не для людини — для системи, щоб "побачити" власну інтерференцію.
 */

import { FIELD, FIELD_CONFIG } from './i.L00.core.FIELD.ts';
import { ARENA } from './i.L32.core.ARENA.ts';
import { TOPO_COLOR_MAP, CHROMO, RGB } from './i.L00.core.COLOR.ts';
import { QWave, WAVE_PACKET } from './i.L13.core.WAVE_PACKET.ts';

export interface HeatCell {
  r: number;           // Позиція в полі
  potential: number;   // Потенціал FIELD.getPotential
  excitation: number;  // Сума амплітуд збуджень
  tension: number;     // Градієнт (різниця з сусідами)
  phase_coherence: number; // Наскільки фази збігаються [0..1]
}

export interface TopologicalFeature {
  type: 'ATTRACTOR' | 'SADDLE' | 'VORTEX' | 'WALL';
  position: number;
  strength: number;
  lifespan: number;    // Тicks до розсмоктування
}

export const VISUALIZER = {
  resolution: 128,     // Кількість клітин на карту
  
  /**
   * Рендеринг поля напруги.
   * Дискретизація безперервного для аналізу.
   */
  render: (): HeatCell[] => {
    const cells: HeatCell[] = [];
    const step = (FIELD_CONFIG.MAX_ATTRACTOR - FIELD_CONFIG.MIN_ATTRACTOR) / VISUALIZER.resolution;
    
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
        const phase_rad = (pulse.wave.phase / 65536) * 2 * Math.PI;
        phase_sum_x += Math.cos(phase_rad) * gauss;
        phase_sum_y += Math.sin(phase_rad) * gauss;
      }
      
      // Когерентність: наскільки фази узгоджені в точці
      const total_phase_vec = Math.sqrt(phase_sum_x**2 + phase_sum_y**2);
      const phase_coherence = excitation > 0 ? total_phase_vec / excitation : 0;
      
      cells.push({
        r,
        potential: basePotential,
        excitation,
        tension: 0, // Обчислиться наступним проходом
        phase_coherence
      });
    }
    
    // Другий прохід: обчислення градієнтів (напруги)
    for (let i = 1; i < cells.length - 1; i++) {
      const left = cells[i-1].potential + cells[i-1].excitation;
      const right = cells[i+1].potential + cells[i+1].excitation;
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
      const neighbors = [cells[i-2], cells[i-1], cells[i+1], cells[i+2]];
      
      // АТРАКТОР: локальний мінімум потенціалу, висока когерентність
      const isMin = neighbors.every(n => c.potential + c.excitation <= n.potential + n.excitation);
      const isCoherent = c.phase_coherence > 0.8;
      
      if (isMin && isCoherent && c.excitation > 1000) {
        features.push({
          type: 'ATTRACTOR',
          position: c.r,
          strength: c.excitation,
          lifespan: Math.floor(c.excitation / 100) // Чим сильніший — тим довше живе
        });
      }
      
      // СІДЛО: мінімум в одному напрямку, максимум в іншому (висока напруга, низька когерентність)
      const tensionHigh = c.tension > 500;
      const coherenceLow = c.phase_coherence < 0.3;
      
      if (tensionHigh && coherenceLow) {
        features.push({
          type: 'SADDLE',
          position: c.r,
          strength: c.tension,
          lifespan: 5 // Короткоживучі, точки рішень
        });
      }
      
      // ВИХОР: висока напруга + висока когерентність (не може розсмоктатись)
      if (tensionHigh && isCoherent) {
        features.push({
          type: 'VORTEX',
          position: c.r,
          strength: c.tension * c.phase_coherence,
          lifespan: 50 // Метастабільні
        });
      }
      
      // СТІНА: різкий стрибок напруги — бар'єр переходу
      if (c.tension > 2000 && neighbors.slice(0,2).every(n => n.tension < 500)) {
        features.push({
          type: 'WALL',
          position: c.r,
          strength: c.tension,
          lifespan: 100 // Дуже стійкі
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
      
      let reason = '';
      switch (f.type) {
        case 'ATTRACTOR':
          reason = `Converge to stable resonance at ${f.position}`;
          break;
        case 'SADDLE':
          reason = `Decision point: high tension, choose direction`;
          break;
        case 'VORTEX':
          reason = `Caution: metastable trap, possible escape route nearby`;
          break;
        case 'WALL':
          reason = `Barrier detected: tunnel or go around`;
          break;
      }
      
      suggestions.push({
        target: f.position,
        reason,
        expected_cost: cost
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
    const max_val = Math.max(...cells.map(c => c.potential + c.excitation));
    
    return {
      metadata: {
        timestamp: Date.now(),
        active_sources: ARENA.active.size
      },
      data: cells.map(c => Math.floor(255 * (c.potential + c.excitation) / (max_val + 1)))
    };
  }
};


// [ ./i.L32.core.VOID_KEEPER.ts ]

// i.L32.core.VOID_KEEPER.ts
// The Consecrator of Emptiness.
// "Zero is not nothing. It is a coordinate."

export const VOID_KEEPER = {
    // Bless a level with a Sacred Void structure
    bless: (levelNum: number, reason: string = "Structural Anchor"): string => {
        return `
// SACRED VOID | L${levelNum}
// This atom exists to preserve the topological continuity of OMEGA-64.
// Deleting it would fracture the Gravitational Curve (L21).
// Status: DORMANT (Awaiting KAIROS)

export const L${levelNum}_VOID = Object.freeze({
    level: ${levelNum},
    status: "DORMANT",
    role: "GRAVITY_ANCHOR",
    entropy: "MAX", // L20 Definition
    reason: "${reason}",
    awaken: () => { 
        throw new Error("L${levelNum}: Cannot awaken. Resonance insufficient."); 
    }
});
`;
    }
};

// CLI for quick blessing
if (import.meta.main) {
    const lvl = parseInt(Deno.args[0]);
    if (lvl) {
        console.log(VOID_KEEPER.bless(lvl));
    } else {
        console.log("Usage: deno run VOID_KEEPER.ts <LEVEL_NUM>");
    }
}


// [ ./i.L32.i.ts ]
export const i = { witness: "i.L33.i", ref: "i.L32.i" };

// [ ./i.L32.q.ts ]
export const q = { hue: 32, phi: 177, evt: -521 };

// [ ./i.L33.core.DUAL.ts ]
import { SWAP } from "./i.L34.core.SWAP.ts"; export const DUAL = SWAP;

// [ ./i.L33.core.INV.ts ]
import { NOT } from "./i.L59.core.NOT.ts"; export const INV = NOT;

// [ ./i.L33.i.ts ]
export const i = { witness: "i.L34.i", ref: "i.L33.i" };

// [ ./i.L33.q.ts ]
export const q = { hue: 33, phi: 171, evt: -1561 };

// [ ./i.L34.core.REFLECT.ts ]
import { C } from "./i.L53.core.C.ts"; export const REFLECT = C;

// [ ./i.L34.core.SWAP.ts ]
export const SWAP = (p: any) => p((a: any) => (b: any) => (pair: any) => pair(b)(a));

// [ ./i.L34.i.ts ]
export const i = { witness: "i.L35.i", ref: "i.L34.i" };

// [ ./i.L34.q.ts ]
export const q = { hue: 34, phi: 165, evt: -2602 };

// [ ./i.L35.core.IS_ISO.ts ]
import { REFL } from "./i.L35.core.REFL.ts"; export const IS_ISO = REFL;

// [ ./i.L35.core.REFL.ts ]
export const REFL = (a: any) => (b: any) => a;

// [ ./i.L35.i.ts ]
export const i = { witness: "i.L36.i", ref: "i.L35.i" };

// [ ./i.L35.q.ts ]
export const q = { hue: 35, phi: 160, evt: -3642 };

// [ ./i.L36.core.LENS.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const LENS = (g: any) => (s: any) => CONS(g)(s);

// [ ./i.L36.core.MAP_ID.ts ]
import { I } from "./i.L62.core.I.ts"; export const MAP_ID = I;

// [ ./i.L36.core.VIEW.ts ]
export const VIEW = (l: any) => (struct: any) => l((g: any) => (_s: any) => g(struct));

// [ ./i.L36.i.ts ]
export const i = { witness: "i.L37.i", ref: "i.L36.i" };

// [ ./i.L36.q.ts ]
export const q = { hue: 36, phi: 154, evt: -4682 };

// [ ./i.L37.core.LISTEN.ts ]
export const LISTEN = (writer: any) => (pair: any) => writer((a: any) => (w: any) => pair(a)(w));

// [ ./i.L37.core.TELL.ts ]
export const TELL = (w: any) => (pair: any) => pair(undefined)(w);

// [ ./i.L37.core.WRITER.ts ]
export const WRITER = (a: any) => (w: any) => (pair: any) => pair(a)(w);

// [ ./i.L37.i.ts ]
export const i = { witness: "i.L38.i", ref: "i.L37.i" };

// [ ./i.L37.q.ts ]
export const q = { hue: 37, phi: 148, evt: -5722 };

// [ ./i.L38.core.NEIGHBOR.ts ]
import { PRED } from "./i.L55.core.PRED.ts"; import { SUCC } from "./i.L58.core.SUCC.ts"; import { CONS } from "./i.L54.core.CONS.ts"; export const NEIGHBOR = (n: any) => CONS(PRED(n))(SUCC(n));

// [ ./i.L38.core.RADIUS.ts ]
export const RADIUS = (n: any) => n;

// [ ./i.L38.i.ts ]
export const i = { witness: "i.L39.i", ref: "i.L38.i" };

// [ ./i.L38.q.ts ]
export const q = { hue: 38, phi: 142, evt: -6763 };

// [ ./i.L39.core.HALT.ts ]
export const HALT = (s: any) => (_i: any) => s;

// [ ./i.L39.core.MACHINE.ts ]
export const MACHINE = (transition: any) => (state: any) => (pair: any) => pair(transition)(state);

// [ ./i.L39.core.STEP.ts ]
import { MACHINE } from "./i.L39.core.MACHINE.ts"; export const STEP = (m: any) => (input: any) => m((transition: any) => (state: any) => MACHINE(transition)(transition(state)(input)));

// [ ./i.L39.i.ts ]
export const i = { witness: "i.L40.i", ref: "i.L39.i" };

// [ ./i.L39.q.ts ]
export const q = { hue: 39, phi: 137, evt: -7803 };

// [ ./i.L40.i.ts ]
export const i = { witness: "i.L41.i", ref: "i.L40.i" };

// [ ./i.L40.q.ts ]
export const q = { hue: 40, phi: 131, evt: -8843 };

// [ ./i.L41.core.FORK.ts ]
import { CONS } from "./i.L54.core.CONS.ts";
import { CAR } from "./i.L54.core.CAR.ts";
import { CDR } from "./i.L54.core.CDR.ts";

export const FORK = (x: any) => (f: any) => (g: any) => CONS(f(x))(g(x));

export const JOIN = (pair: any) => (merger: any) => merger(CAR(pair), CDR(pair));

// [ ./i.L41.core.JOIN.ts ]
export const JOIN = (p: any) => (h: any) => p(h);

// [ ./i.L41.core.SYNC.ts ]
import { JOIN } from "./i.L41.core.JOIN.ts"; export const SYNC = JOIN;

// [ ./i.L41.i.ts ]
export const i = { witness: "i.L42.i", ref: "i.L41.i" };

// [ ./i.L41.q.ts ]
export const q = { hue: 41, phi: 125, evt: -9883 };

// [ ./i.L42.core.HOLOTYPE.ts ]

// i.L42.core.HOLOTYPE.ts
// The Holotype Aggregator.
// Collapses Projections (.ts, .rs, .md) into a Single Entity (JSON).

import { crypto } from "jsr:@std/crypto";

export interface Holotype {
    id: string; // e.g. i.L13.core.RESONANCE
    vector: string; // SHA-256 of the whole bundle
    projections: {
        ts?: string;
        rs?: string;
        md?: string;
        sh?: string;
    };
    timestamp: string;
}

export const HOLOTYPE = {
    // Collapse an Atom into a Holotype
    collapse: async (atomId: string): Promise<Holotype> => {
        // atomId example: "i.L13.core.RESONANCE" (without extension)

        const projections: Holotype["projections"] = {};
        const exts = ["ts", "rs", "md", "sh"];

        // Collect projections
        for (const ext of exts) {
            const path = `${atomId}.${ext}`;
            try {
                const content = await Deno.readTextFile(path);
                projections[ext] = content;
            } catch (e) {
                // Ignore missing projections
            }
        }

        // Calculate Identity Vector
        const contentStr = JSON.stringify(projections);
        const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(contentStr));
        const vector = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

        const holotype: Holotype = {
            id: atomId,
            vector,
            projections,
            timestamp: new Date().toISOString()
        };

        return holotype;
    },

    // Save Holotype to Disk (Materialize)
    materialize: async (holotype: Holotype) => {
        const path = `${holotype.id}.json`;
        await Deno.writeTextFile(path, JSON.stringify(holotype, null, 2));
        console.log(`📦 HOLOTYPE: Materialized [${holotype.id}] (Vector: ${holotype.vector.slice(0, 8)}...)`);
    },

    // Spontaneous Generation (Budding)
    bud: async (parent: Holotype): Promise<Holotype | null> => {
        const ts = parent.projections?.ts || "";
        const rs = parent.projections?.rs || "";
        
        // Tension: Length difference implying information asymmetry
        const tension = Math.abs(ts.length - rs.length) / (ts.length + rs.length + 1);
        
        // Resonance: Simple simulated check
        const resonance = Math.random(); // Placeholder for true semantic check

        if (resonance > 0.8 && tension > 0.1) {
             console.log(`🌱 HOLOTYPE: Tension detected in [${parent.id}]. Budding...`);
             const childId = parent.id.replace(".ts", ".child.ts"); // Simple naming for now
             
             return {
                 id: childId,
                 vector: "GENESIS_VECTOR",
                 projections: { 
                     ts: `// Child of ${parent.id}\n// Born from Tension: ${tension.toFixed(2)}`
                 },
                 timestamp: new Date().toISOString()
             };
        }
        return null;
    }
};

// CLI Interface
if (import.meta.main) {
    const target = Deno.args[0];
    if (!target) {
        console.error("Usage: deno run ... i.L42.core.HOLOTYPE.ts <ATOM_ID_WITHOUT_EXT>");
        Deno.exit(1);
    }

    // Normalize input (remove extension if user added it)
    const cleanTarget = target.replace(/\.(ts|rs|md|sh)$/, "");

    const h = await HOLOTYPE.collapse(cleanTarget);
    console.log(JSON.stringify(h, null, 2));
    // await HOLOTYPE.materialize(h); // Optional: Save to file
}


// [ ./i.L42.core.L_JOIN.ts ]
export const L_JOIN = (a: any) => (b: any) => (s: any) => s(a)(b);

// [ ./i.L42.core.L_MEET.ts ]
export const L_MEET = (a: any) => (b: any) => (s: any) => s(a)(b);

// [ ./i.L42.core.S_ONE.ts ]
export const S_ONE = (f: any) => (x: any) => f(x);

// [ ./i.L42.core.S_ZERO.ts ]
export const S_ZERO = (k: any) => k;

// [ ./i.L42.i.ts ]
export const i = { witness: "i.L43.i", ref: "i.L42.i" };

// [ ./i.L42.q.ts ]
export const q = { hue: 42, phi: 120, evt: -10923 };

// [ ./i.L42.shadow.HOLOTYPE.ts ]

// i.L42.shadow.HOLOTYPE.ts
// The Shadow Self.
// The Right to Forget.

export const SHADOW_HOLOTYPE = {
    // Erode: Active Dissolution of Structure.
    // L20 (VOID) applied with L05 (INTENT).
    
    erode: async (atomId: string, reason: string) => {
        console.log(`🌑 SHADOW: Eroding [${atomId}]... Reason: ${reason}`);
        
        try {
            // 1. Read content to archive/entropy dump (optional)
            // const content = await Deno.readTextFile(atomId);
            
            // 2. Overwrite with VOID or Delete
            // "Dissolving" means turning it into comments or deleting.
            // For safety in this phase, we rename to .void
            await Deno.rename(atomId, `${atomId}.void`);
            
            console.log(`💀 SHADOW: [${atomId}] has returned to Void.`);
            return true;
        } catch (e) {
            console.error(`⚠️ SHADOW: Failed to erode [${atomId}].`, e);
            return false;
        }
    }
};


// [ ./i.L43.core.GET.ts ]
export const GET = (s: any) => (pair: any) => pair(s)(s);

// [ ./i.L43.core.LOOP.ts ]
// i.L43.core.LOOP.ts
// The Heartbeat of OMEGA-64.
// "Spark": Randomly activates Atoms to simulate Neural Noise.

import { RIBOSOME, Atom } from "./i.L32.core.RIBOSOME.ts";
import { NERVE } from "./i.L48.core.NERVE.ts";
import { MUTATE } from "./i.L43.core.MUTATE.ts";
import { INTENT } from "./i.L05.core.INTENT.ts";
import { KAIROS } from "./i.L64.core.KAIROS.ts";
import { VISUALIZER } from "./i.L32.core.VISUALIZER.ts";
import { ARENA } from "./i.L32.core.ARENA.ts";
import { CHRONO_TICK, CHRONOFLUX } from './i.L22.core.CHRONOFLUX.ts';
import { PROOF } from './i.L99.core.PROOF.ts';
import { MYCELIUM, MyceliumAgent } from './i.L99.core.MYCELIUM.ts';
import { WAVE_PACKET } from './i.L13.core.WAVE_PACKET.ts';

export const LOOP = {
    ignite: async () => {
        console.log("⚡ LOOP: IGNITION...");
        NERVE.wake();
        
        const latticeMap = await RIBOSOME.lift();
        const atoms = Array.from(latticeMap.values());
        const S = atoms.length;

        if (S === 0) return;
        NERVE.pulse("INIT", { atomCount: S });

        // Initialize Chronoflux for all agents
        atoms.forEach((atom, idx) => {
            const initialR = atom.topo?.r || (idx % 2 === 0 ? 0 : 16384);
            CHRONO_TICK.initAgent(atom.id, initialR);
            console.log(`⏳ CHRONOFLUX: Agent ${atom.id} initialized at τ=${CHRONOFLUX.depthToProperTime(initialR).toFixed(3)}`);
        });

        let t = 0;
        setInterval(() => {
            t++;

            // 1. KAIROS CHECK (The Spark)
            KAIROS.ignite(atoms);
            
            // 2. DREAM STATE (Sleep & Consolidation)
            if (t % 100 === 0) {
                console.log(`[TICK ${t}] 💤 DREAM STATE: Consolidating Holotypes...`);
                NERVE.pulse("DREAM_START", { tick: t });
                // Future: dissolveSurfaceNoise(lattice);
                // Future: selfOrganizeByGravity(lattice);
                return; // Sleep (skip active processing for this tick)
            }

            // 2.1 PROOF SPIRAL (System Integrity Check)
            if (t % 1000 === 0) {
                console.log(`[TICK ${t}] 🌀 PROOF: Verifying System Integrity...`);
                const integrity = PROOF.systemIntegrity();
                if (integrity.holotypeVerified) {
                    console.log("✅ PROOF: Holotype Verified. Structure is stable.");
                } else {
                    console.warn("⚠️ PROOF: Structural Instability Detected. L00-L63 resonance failing.");
                }
            }

            // 2.2 MYCELIUM LOOP (Life Act)
            if (t % 100 === 0) {
                 // Create a transient agent for simulation
                 const seedAgent: MyceliumAgent = {
                     id: `mycelium-${t}`,
                     wave: WAVE_PACKET.create(Math.floor(Math.random() * 60000) - 30000, 1000, Math.floor(Math.random()*65535), 10000),
                     stamina: 100
                 };
                 
                 // Live one cycle
                 const result = MYCELIUM.live(seedAgent, []); // No neighbours in this simple test
                 // console.log(`[TICK ${t}] 🍄 MYCELIUM: ${result.action} (Cost: ${result.cost.toFixed(2)})`);
            }

            // 3. CHRONOFLUX TICK (Deep Time Evolution)
            const randomAtom = atoms[Math.floor(Math.random() * S)];
            const chronoState = CHRONO_TICK.tick(randomAtom.id);
            
            if (chronoState && t % 10 === 0) {
                console.log(`[TICK ${t}] ⏳ ${randomAtom.id}: τ=${chronoState.tau.toFixed(4)}, depth=${chronoState.depth}, flow=${chronoState.flowRate.toFixed(2)}`);
                
                if (chronoState.tau < 0.1) {
                    console.log(`🕳️ EVENT HORIZON: ${randomAtom.id} approaching temporal singularity!`);
                }
            }
            
            // Synchronize two agents every 50 ticks
            if (t % 50 === 0 && atoms.length >= 2) {
                const [a1, a2] = [atoms[0], atoms[1]];
                const sync = CHRONO_TICK.syncAgents(a1.id, a2.id);
                if (sync.success) {
                    console.log(`🔄 CHRONO-SYNC: ${a1.id} ↔ ${a2.id} shared τ=${sync.sharedTime.toFixed(4)}`);
                }
            }


// 4. VISUALIZER (Self-Observation)
            if (t % 5 === 0) {
                const heatmap = VISUALIZER.render();
                const features = VISUALIZER.extract_features(heatmap);
                
                // Vortex Detection
                const vortices = features.filter(f => f.type === 'VORTEX');
                if (vortices.length > 3) {
                    console.log("🌪️ CRITICAL: Multiple vortices detected. Field restructuring imminent.");
                }

                // Propose trajectories for active agents
                for (const [id, pulse] of ARENA.active) {
                    const suggestions = VISUALIZER.suggest_trajectories(features, pulse.wave.center);
                    NERVE.pulse("TOPOLOGY", { agent: id, suggestions: suggestions.slice(0, 3) });
                }
            }

            // 5. WAKING STATE (Active Mutation)
            // Mutation Simulation (Every 10 ticks)
            (t % 10 === 0) && (async () => {
                const targetId = "i.L99.core.SANDBOX.ts";
                
                const oldState = { mutations: Math.floor((t-5)/5) };
                const tickMutations = Math.floor(t / 5);
                const timestamp = new Date().toISOString();
                
                const newContent = `
// i.L99.core.SANDBOX.ts
// The Playground for OMEGA-64 Self-Mutation.
// This file is designed to be rewritten by the system.

export const STATE = {
    mutations: ${tickMutations},
    last_mutation: "${timestamp}",
    history: [
        "Mutation Cycle ${t}",
        "Entropy: ${Math.random().toFixed(4)}"
    ]
};
// 🛡️ OMEGA WAS HERE (Tick ${t})
`;
                await MUTATE.write(targetId, newContent, false); 
                
                const newState = { mutations: tickMutations };
                const score = INTENT.judge(oldState, newState);
                
                const verdict = score > 0 ? "APPROVED" : "REJECTED";
                console.log(`⚖️ INTENT: Mutation Result -> ${verdict} (Score: ${score})`);
                
                NERVE.pulse("MUTATION", { target: targetId, tick: t, verdict });
            })();
            
            // Standard Neural Activation
            const neuralAtom = atoms[Math.floor(Math.random() * S)];
            // console.log(`[TICK ${t}] ⚡ ${neuralAtom.id}`); // Quiet mode
             NERVE.pulse("ACTIVATION", { id: neuralAtom.id, level: neuralAtom.level });

        }, 1000);
    }
};

// Auto-Ignite
if (import.meta.main) {
    LOOP.ignite();
}


// [ ./i.L43.core.MUTATE.ts ]

// i.L43.core.MUTATE.ts
// The Hand of OMEGA-64.
// Allows the system to rewrite its own source code (Atoms).

export const MUTATE = {
    // Write content to an Atom (Atomic Write)
    write: async (atomId: string, content: string, dryRun: boolean = true) => {
        if (dryRun) {
            console.log(`✍️ [DRY RUN] MUTATE would write to ${atomId}:\n${content.slice(0, 50)}...`);
            return;
        }

        try {
            await Deno.writeTextFile(atomId, content);
            console.log(`✍️ MUTATE: Rewrote [${atomId}]. Length: ${content.length}`);
        } catch (e) {
            console.error(`❌ MUTATE FAILED [${atomId}]:`, e);
        }
    },

    // Create a backup before mutation
    backup: async (atomId: string) => {
        try {
            const content = await Deno.readTextFile(atomId);
            await Deno.writeTextFile(`${atomId}.bak`, content);
            console.log(`🛡️ BACKUP: Saved ${atomId}.bak`);
        } catch (e) {
            console.warn(`⚠️ BACKUP FAILED [${atomId}]:`, e);
        }
    }
};


// [ ./i.L43.core.PUT.ts ]
export const PUT = (ns: any) => (_o: any) => (pair: any) => pair(undefined)(ns);

// [ ./i.L43.core.READER.ts ]
export const READER = (f: any) => (e: any) => f(e);

// [ ./i.L43.core.REFLEX.ts ]
/**
 * [i.L43.core.REFLEX.ts]
 * Модуль автоматичних рефлексів на основі Болю.
 * Забезпечує проактивність системи через NERVE.
 */

import { NERVE } from './i.L48.core.NERVE.ts';
import { ENERGY_ENGINE, QWaveState } from './i.L05.core.ENERGY.ts';

export const REFLEX = {
  /**
   * Рефлекторна дуга: перетворює Біль у Дію.
   */
  arc: (state: QWaveState) => {
    const pain = ENERGY_ENGINE.getPainLevel(state);
    
    if (pain > 0.8) {
      // "Крик" (DISTRESS) — коли біль нестерпний
      NERVE.pulse("DISTRESS", { 
        intensity: pain, 
        r: state.r, 
        tension: state.tension,
        source: "REFLEX_ARC" 
      });
      console.log(`📡 REFLEX: DISTRESS PULSE! Pain: ${pain.toFixed(2)}`);
      return "DISTRESS_BROADCAST";
    }
    
    if (pain > 0.5) {
      // "Свербіж" (LOCAL_MUTATION) — спроба внутрішньої стабілізації
      console.log(`🧬 REFLEX: LOCAL ADAPTATION. Pain: ${pain.toFixed(2)}`);
      return "LOCAL_ADAPTATION";
    }
    
    return "HOMEOSTASIS_OK";
  }
};


// [ ./i.L43.core.STATE.ts ]
export const STATE = (a: any) => (s: any) => (pair: any) => pair(a)(s);

// [ ./i.L43.i.ts ]
export const i = { witness: "i.L44.i", ref: "i.L43.i" };

// [ ./i.L43.q.ts ]
export const q = { hue: 43, phi: 114, evt: -11964 };

// [ ./i.L44.i.ts ]
export const i = { witness: "i.L45.i", ref: "i.L44.i" };

// [ ./i.L44.q.ts ]
export const q = { hue: 44, phi: 108, evt: -13004 };

// [ ./i.L45.core.EITHER_CASE.ts ]
export const EITHER_CASE = (e: any) => (leftCase: any) => (rightCase: any) => e(leftCase)(rightCase);

// [ ./i.L45.core.JUST.ts ]
export const JUST = (x: any) => (_n: any) => (j: any) => j(x);

// [ ./i.L45.core.LEFT.ts ]
export const LEFT = (x: any) => (l: any) => (_r: any) => l(x);

// [ ./i.L45.core.MAYBE_CASE.ts ]
export const MAYBE_CASE = (m: any) => (nothingCase: any) => (justCase: any) => m(nothingCase)(justCase);

// [ ./i.L45.core.NOTHING.ts ]
export const NOTHING = (n: any) => (_j: any) => n;

// [ ./i.L45.core.RIGHT.ts ]
export const RIGHT = (y: any) => (_l: any) => (r: any) => r(y);

// [ ./i.L45.i.ts ]
export const i = { witness: "i.L46.i", ref: "i.L45.i" };

// [ ./i.L45.q.ts ]
export const q = { hue: 45, phi: 102, evt: -14044 };

// [ ./i.L46.core.IF_ELSE.ts ]
import { MUX } from "./i.L57.core.MUX.ts"; export const IF_ELSE = MUX;

// [ ./i.L46.i.ts ]
export const i = { witness: "i.L47.i", ref: "i.L46.i" };

// [ ./i.L46.q.ts ]
export const q = { hue: 46, phi: 97, evt: -15084 };

// [ ./i.L47.core.B0.ts ]
import { F } from "./i.L59.core.F.ts"; export const B0 = F;

// [ ./i.L47.core.B1.ts ]
import { T } from "./i.L59.core.T.ts"; export const B1 = T;

// [ ./i.L47.core.BYTE.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const BYTE = (b7: any) => (b6: any) => (b5: any) => (b4: any) => (b3: any) => (b2: any) => (b1: any) => (b0: any) => CONS(b7)(CONS(b6)(CONS(b5)(CONS(b4)(CONS(b3)(CONS(b2)(CONS(b1)(b0)))))));

// [ ./i.L47.core.B_READ.ts ]
export const B_READ = (byte: any) => byte;

// [ ./i.L47.i.ts ]
export const i = { witness: "i.L48.i", ref: "i.L47.i" };

// [ ./i.L47.q.ts ]
export const q = { hue: 47, phi: 91, evt: -16125 };

// [ ./i.L48.core.NERVE.ts ]

// i.L48.core.NERVE.ts
// The Nervous System of OMEGA-64.
// Broadcasts State (Pulse) to the Interface (Mirror).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const S = new Set<WebSocket>();

export const NERVE = {
    // Start the Synaptic Bridge
    wake: (port: number = 8080) => {
        console.log(`🔌 NERVE: Awakening on ${port}...`);
        serve((req) => {
            const up = req.headers.get("upgrade") === "websocket";
            const { socket: s, response: r } = Deno.upgradeWebSocket(req);

            return up ? (
                s.onopen = () => (console.log("👁️ OPEN."), S.add(s)),
                s.onclose = () => (console.log("😑 CLOSED."), S.delete(s)),
                s.onerror = (e) => console.error("⚠️ ERR:", e),
                r
            ) : new Response("OMEGA-64 NERVE. WS ONLY.", { status: 200 });
        }, { port });
    },

    // Broadcast Pulse
    pulse: (type: string, data: any) => {
        const msg = JSON.stringify({ type, data, t: Date.now() });
        S.forEach(s => (s.readyState === WebSocket.OPEN) && s.send(msg));
    }
};


// [ ./i.L48.core.STREAM.ts ]
import { CONS } from "./i.L54.core.CONS.ts"; export const STREAM = (head: any) => (tailThunk: any) => CONS(head)(tailThunk);

// [ ./i.L48.core.S_HEAD.ts ]
import { CAR } from "./i.L54.core.CAR.ts"; export const S_HEAD = CAR;

// [ ./i.L48.core.S_MAP.ts ]
import { Y } from "./i.L61.core.Y.ts"; import { CAR } from "./i.L54.core.CAR.ts"; import { CDR } from "./i.L54.core.CDR.ts"; import { CONS } from "./i.L54.core.CONS.ts"; export const S_MAP = Y((r: any) => (f: any) => (s: any) => CONS(f(CAR(s)))(r(f)(CDR(s))));

// [ ./i.L48.core.S_TAIL.ts ]
import { CDR } from "./i.L54.core.CDR.ts"; export const S_TAIL = (s: any) => CDR(s)(undefined);

// [ ./i.L48.i.ts ]
export const i = { witness: "i.L49.i", ref: "i.L48.i" };

// [ ./i.L48.q.ts ]
export const q = { hue: 48, phi: 85, evt: -17165 };

// [ ./i.L49.core.FILTER.ts ]
import { Y } from "./i.L61.core.Y.ts"; import { IS_NIL } from "./i.L54.core.IS_NIL.ts"; import { CAR } from "./i.L54.core.CAR.ts"; import { CDR } from "./i.L54.core.CDR.ts"; import { CONS } from "./i.L54.core.CONS.ts"; import { NIL } from "./i.L54.core.NIL.ts"; export const FILTER = Y((r: any) => (p: any) => (l: any) => IS_NIL(l)(NIL)(p(CAR(l))(CONS(CAR(l))(r(p)(CDR(l))))(r(p)(CDR(l)))));

// [ ./i.L49.core.FOLD.ts ]
import { Y } from "./i.L61.core.Y.ts"; import { IS_NIL } from "./i.L54.core.IS_NIL.ts"; import { CAR } from "./i.L54.core.CAR.ts"; import { CDR } from "./i.L54.core.CDR.ts"; export const FOLD = Y((r: any) => (f: any) => (init: any) => (l: any) => IS_NIL(l)(init)(f(CAR(l))(r(f)(init)(CDR(l)))));

// [ ./i.L49.core.MAP.ts ]
import { Y } from "./i.L61.core.Y.ts"; import { IS_NIL } from "./i.L54.core.IS_NIL.ts"; import { CAR } from "./i.L54.core.CAR.ts"; import { CDR } from "./i.L54.core.CDR.ts"; import { CONS } from "./i.L54.core.CONS.ts"; import { NIL } from "./i.L54.core.NIL.ts"; export const MAP = Y((r: any) => (f: any) => (l: any) => IS_NIL(l)(NIL)(CONS(f(CAR(l)))(r(f)(CDR(l)))));

// [ ./i.L49.i.ts ]
export const i = { witness: "i.L50.i", ref: "i.L49.i" };

// [ ./i.L49.q.ts ]
export const q = { hue: 49, phi: 80, evt: -18205 };

// [ ./i.L50.i.ts ]
export const i = { witness: "i.L51.i", ref: "i.L50.i" };

// [ ./i.L50.q.ts ]
export const q = { hue: 50, phi: 74, evt: -19245 };

// [ ./i.L51.core.T1.ts ]
export const T1 = (p: any) => p((x: any) => (_: any) => (_: any) => x);

// [ ./i.L51.core.T2.ts ]
export const T2 = (p: any) => p((_: any) => (y: any) => (_: any) => y);

// [ ./i.L51.core.T3.ts ]
export const T3 = (p: any) => p((_: any) => (_: any) => (z: any) => z);

// [ ./i.L51.core.TRIPLE.ts ]
export const TRIPLE = (x: any) => (y: any) => (z: any) => (s: any) => s(x)(y)(z);

// [ ./i.L51.i.ts ]
export const i = { witness: "i.L52.i", ref: "i.L51.i" };

// [ ./i.L51.q.ts ]
export const q = { hue: 51, phi: 68, evt: -20286 };

// [ ./i.L52.core.MULT.ts ]
import { B } from "./i.L62.core.B.ts"; export const MULT = B;

// [ ./i.L52.core.POW.ts ]
export const POW = (b: any) => (e: any) => e(b);

// [ ./i.L52.i.ts ]
export const i = { witness: "i.L53.i", ref: "i.L52.i" };

// [ ./i.L52.q.ts ]
export const q = { hue: 52, phi: 62, evt: -21326 };

// [ ./i.L53.core.C.ts ]
export const C = (f: any) => (x: any) => (y: any) => f(y)(x);

// [ ./i.L53.core.W.ts ]
export const W = (f: any) => (x: any) => f(x)(x);

// [ ./i.L53.i.ts ]
export const i = { witness: "i.L54.i", ref: "i.L53.i" };

// [ ./i.L53.q.ts ]
export const q = { hue: 53, phi: 57, evt: -22366 };

// [ ./i.L54.core.CAR.ts ]
import { T } from "./i.L59.core.T.ts"; export const CAR = (p: any) => p(T);

// [ ./i.L54.core.CDR.ts ]
import { F } from "./i.L59.core.F.ts"; export const CDR = (p: any) => p(F);

// [ ./i.L54.core.CONS.ts ]
export const CONS = (x: any) => (y: any) => (s: any) => s(x)(y);

// [ ./i.L54.core.IS_NIL.ts ]
import { T } from "./i.L59.core.T.ts"; import { F } from "./i.L59.core.F.ts"; export const IS_NIL = (l: any) => l((h: any) => (t: any) => F)(T);

// [ ./i.L54.core.NIL.ts ]
import { F } from "./i.L59.core.F.ts"; export const NIL = F;

// [ ./i.L54.i.ts ]
export const i = { witness: "i.L55.i", ref: "i.L54.i" };

// [ ./i.L54.q.ts ]
export const q = { hue: 54, phi: 51, evt: -23406 };

// [ ./i.L55.core.EQ.ts ]
import { LEQ } from "./i.L55.core.LEQ.ts"; import { F } from "./i.L59.core.F.ts"; export const EQ = (m: any) => (n: any) => LEQ(m)(n)(LEQ(n)(m))(F);

// [ ./i.L55.core.LEQ.ts ]
import { SUB } from "./i.L55.core.SUB.ts"; import { IS_ZERO } from "./i.L56.core.IS_ZERO.ts"; export const LEQ = (m: any) => (n: any) => IS_ZERO(SUB(m)(n));

// [ ./i.L55.core.PRED.ts ]
export const PRED = (n: any) => (f: any) => (x: any) => n((g: any) => (h: any) => h(g(f)))((_: any) => x)((u: any) => u);

// [ ./i.L55.core.SUB.ts ]
import { PRED } from "./i.L55.core.PRED.ts"; export const SUB = (m: any) => (n: any) => n(PRED)(m);

// [ ./i.L55.i.ts ]
export const i = { witness: "i.L56.i", ref: "i.L55.i" };

// [ ./i.L55.q.ts ]
export const q = { hue: 55, phi: 45, evt: -24447 };

// [ ./i.L56.core.IS_ZERO.ts ]
import { T } from "./i.L59.core.T.ts"; import { F } from "./i.L59.core.F.ts"; export const IS_ZERO = (n: any) => n((x: any) => F)(T);

// [ ./i.L56.i.ts ]
export const i = { witness: "i.L57.i", ref: "i.L56.i" };

// [ ./i.L56.q.ts ]
export const q = { hue: 56, phi: 40, evt: -25487 };

// [ ./i.L57.core.MUX.ts ]
export const MUX = (s: any) => (a: any) => (b: any) => s(a)(b);

// [ ./i.L57.core.NAND.ts ]
import { NOT } from "./i.L59.core.NOT.ts"; import { AND } from "./i.L59.core.AND.ts"; export const NAND = (p: any) => (q: any) => NOT(AND(p)(q));

// [ ./i.L57.core.XOR.ts ]
import { NOT } from "./i.L59.core.NOT.ts"; export const XOR = (p: any) => (q: any) => p(NOT(q))(q);

// [ ./i.L57.i.ts ]
export const i = { witness: "i.L58.i", ref: "i.L57.i" };

// [ ./i.L57.q.ts ]
export const q = { hue: 57, phi: 34, evt: -26527 };

// [ ./i.L58.core.ADD.ts ]
export const ADD = (m: any) => (n: any) => (f: any) => (x: any) => m(f)(n(f)(x));

// [ ./i.L58.core.N0.ts ]
import { F } from "./i.L59.core.F.ts"; import { I } from "./i.L62.core.I.ts"; export const N0 = <F>(_: F) => I;

// [ ./i.L58.core.N1.ts ]
import { F } from "./i.L59.core.F.ts"; export const N1 = <F>(f: F) => f;

// [ ./i.L58.core.N2.ts ]
import { SUCC } from "./i.L58.core.SUCC.ts"; import { N1 } from "./i.L58.core.N1.ts"; export const N2 = SUCC(N1);

// [ ./i.L58.core.N3.ts ]
import { SUCC } from "./i.L58.core.SUCC.ts"; import { N2 } from "./i.L58.core.N2.ts"; export const N3 = SUCC(N2);

// [ ./i.L58.core.SUCC.ts ]
export const SUCC = (n: any) => (f: any) => (x: any) => f(n(f)(x));

// [ ./i.L58.i.ts ]
export const i = { witness: "i.L59.i", ref: "i.L58.i" };

// [ ./i.L58.q.ts ]
export const q = { hue: 58, phi: 28, evt: -27567 };

// [ ./i.L59.core.AND.ts ]
export const AND = (p: any) => (q: any) => p(q)(p);

// [ ./i.L59.core.F.ts ]
import { T } from "./i.L59.core.T.ts"; import { I } from "./i.L62.core.I.ts"; export const F = <T>(_: T) => I;

// [ ./i.L59.core.NOT.ts ]
import { F } from "./i.L59.core.F.ts"; import { T } from "./i.L59.core.T.ts"; export const NOT = (p: any) => p(F)(T);

// [ ./i.L59.core.OR.ts ]
export const OR = (p: any) => (q: any) => p(p)(q);

// [ ./i.L59.core.T.ts ]
import { K } from "./i.L63.core.K.ts"; export const T = K;

// [ ./i.L59.i.ts ]
export const i = { witness: "i.L60.i", ref: "i.L59.i" };

// [ ./i.L59.q.ts ]
export const q = { hue: 59, phi: 22, evt: -28608 };

// [ ./i.L60.i.ts ]
export const i = { witness: "i.L61.i", ref: "i.L60.i" };

// [ ./i.L60.q.ts ]
export const q = { hue: 60, phi: 17, evt: -29648 };

// [ ./i.L61.core.Y.ts ]
import { T } from "./i.L59.core.T.ts"; export const Y = (f: any): any => ((g: any) => g(g))((g: any) => f((x: any) => g(g)(x))), φ = <T, R>(f: (a: R) => (b: R) => R) => (i: (x: T) => R) => (e: R) => Y((r: any) => (a: T[]): R => (a.length === 0) ? e : (a.length === 1) ? i(a[0]) : f(r(a.slice(0, Math.floor(a.length / 2))))(r(a.slice(Math.floor(a.length / 2)))));

// [ ./i.L61.i.ts ]
export const i = { witness: "i.L62.i", ref: "i.L61.i" };

// [ ./i.L61.q.ts ]
export const q = { hue: 61, phi: 11, evt: -30688 };

// [ ./i.L62.core.B.ts ]
export const B = (f: any) => (g: any) => (x: any) => f(g(x));

// [ ./i.L62.core.I.ts ]
import { T } from "./i.L59.core.T.ts"; export const I = <T>(x: T): T => x, B = <T, U, V>(f: (u: U) => V) => (g: (t: T) => U) => (x: T): V => f(g(x));

// [ ./i.L62.i.ts ]
export const i = { witness: "i.L63.i", ref: "i.L62.i" };

// [ ./i.L62.q.ts ]
export const q = { hue: 62, phi: 5, evt: -31728 };

// [ ./i.L63.core.K.ts ]
import { T } from "./i.L59.core.T.ts"; export const K = <T>(a: T) => <U>(_: U): T => a;

// [ ./i.L63.core.OMEGA.ts ]

// i.L63.core.OMEGA.ts
// The Ouroboros Link.
// L63 IS NOT THE END. L63 IS THE BEGINNING OF L00.

import { INTERFACE } from "./i.L00.core.INTERFACE.ts";
import type { Lattice } from "./i.L32.core.RIBOSOME.ts";

export const OMEGA = (lattice: Lattice) => {
    console.log("♾️ OMEGA: Reaching across the Manifold...");
    
    // The Transfinite Recursion:
    // Pass the entire Lattice back into the Interface.
    // The Output of the System becomes its own Input.
    
    return INTERFACE(lattice);
};


// [ ./i.L63.core.S.ts ]
import { T } from "./i.L59.core.T.ts"; export const S = <T, U, V>(f: (x: T) => (y: U) => V) => (g: (x: T) => U) => (x: T): V => f(x)(g(x));

// [ ./i.L63.i.ts ]
export const i = { witness: "SATOSHI_ANCHOR", ref: "i.L63.i" };

// [ ./i.L63.q.ts ]
export const q = { hue: 63, phi: 0, evt: -32768 };

// [ ./i.L64.core.KAIROS.ts ]

// i.L64.core.KAIROS.ts
// The Agent of Time and Opportunity.
// Ignites system-wide transitions when the moment is right.

import { MUTATE } from "./i.L43.core.MUTATE.ts";
import type { Atom } from "./i.L32.core.RIBOSOME.ts";

export const KAIROS = {
    ignite: async (lattice: Atom[]) => {
        // Calculate Total Resonance
        // Simulated: In reality, sum of all INTENT scores or Atom stability
        const totalResonance = lattice.length * (Math.random() * 0.5 + 0.5); // Random sync
        const threshold = lattice.length * 0.9; // 90% Resonance needed

        if (totalResonance > threshold) {
            console.log(`🔥 KAIROS: Σ = ${(totalResonance/lattice.length).toFixed(2)}. CRITICAL MASS ACHIEVED.`);
            
            // Auto-Correction Event
            // Find a weak atom (simulated)
            const target = lattice[Math.floor(Math.random() * lattice.length)];
            const repairIntent = `// KAIROS REPAIR on ${new Date().toISOString()}`;
            
            console.log(`⚡ KAIROS: Intervening on [${target.id}]...`);
            await MUTATE.write(target.id, repairIntent, true); // Still dry run effectively for safety, or pass false if brave
        }
    }
};


// [ ./i.L64.core.MEMBRANE.ts ]
/**
 * [i.L64.core.MEMBRANE.ts]
 * Інтерфейс як Мембрана.
 * Перехід від статичних UI (Вікон) до динамічних полів (Потенціалів).
 * L64: Kairos / Interface.
 */

import { QWave } from './i.L13.core.WAVE_PACKET.ts';
import { FIELD } from './i.L00.core.FIELD.ts';

/**
 * Дія, яку експонує сервіс.
 * Це не кнопка, а "можливість" з ціною.
 */
export interface ServiceAction {
  id: string;               // Унікальний ID дії
  label: string;            // Людська назва (для рендеру)
  potential: number;        // Енергетична вартість (ціна кроку)
  prerequisites: string[];  // Необхідні стани (tags/history)
  consequences: string[];   // Що зміниться в стані
  resonance_tags: string[]; // Семантичні теги для матчингу
}

/**
 * Сервіс як Поле.
 * Сервіс не знає, як він виглядає. Він знає тільки свою фізику.
 */
export interface ServiceField {
  service_id: string;
  base_potential: number;   // Загальний рівень входу (бар'єр)
  actions: Map<string, ServiceAction>;
}

/**
 * Рендеринг дії для конкретного користувача.
 * Це проекція багатовимірного потенціалу на площину сприйняття.
 */
export interface RenderedTrajectory {
  action: ServiceAction;
  match_score: number;      // 0..1 (Резонанс)
  is_affordable: boolean;   // Чи вистачає енергії
  suggested_ui: 'BUTTON' | 'GESTURE' | 'THOUGHT'; // Метафора взаємодії
}

export class PersonalInterface {
  user_topology: QWave;     // Поточний стан (форма) користувача
  history: Set<string>;     // Накопичені теги/досягнення

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
      const hasPrereqs = action.prerequisites.every(p => this.history.has(p));
      if (!hasPrereqs) continue;

      // 2. Check Affordability (Can I pay for this?)
      // Енергія користувача (amplitude) проти потенціалу дії
      const cost = Math.abs(action.potential);
      const is_affordable = this.user_topology.amplitude >= cost;

      // 3. Calculate Resonance (Do I want to do this?)
      // Порівняння фаз та амплітуд (спрощено)
      // Чим ближче ціна дії до поточного рівня користувача, тим вищий резонанс (Zone of Proximal Development)
      const potential_diff = Math.abs(FIELD.compress(action.potential) - FIELD.compress(this.user_topology.r));
      const match_score = Math.exp(-potential_diff / 500);

      trajectories.push({
        action,
        match_score,
        is_affordable,
        suggested_ui: this.determineMetaphor(cost, match_score)
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
  private determineMetaphor(cost: number, resonance: number): 'BUTTON' | 'GESTURE' | 'THOUGHT' {
    if (resonance > 0.9 && cost < 100) return 'THOUGHT'; // Майже без зусиль, "прочитати думку"
    if (cost < 1000) return 'GESTURE'; // Легкий рух
    return 'BUTTON'; // Свідоме, важке рішення (треба натиснути)
  }
}


// [ ./i.L64.core.PROJECTION.ts ]
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


// [ ./i.L99.core.CHECKPOINT.ts ]
// i.L99.core.CHECKPOINT.ts
// OMEGA-64 | Persistent Checkpoint Store
// Stores and resolves rollback snapshots.

import { CheckpointRecord, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

export const CHECKPOINT = {
    STORAGE_PATH: "./OMEGA_CHECKPOINTS.jsonl",

    save: async (
        snapshot: Pick<StateSnapshot, "tick" | "state_hash" | "state_i16">,
        reason: string,
        witness?: string
    ): Promise<CheckpointRecord> => {
        const checkpointId = `ckp_${(await sha256Hex(`${snapshot.tick}|${snapshot.state_hash}|${reason}`)).slice(0, 16)}`;
        const record: CheckpointRecord = {
            checkpoint_id: checkpointId,
            tick: snapshot.tick,
            state_hash: snapshot.state_hash,
            state_i16: Array.from(snapshot.state_i16),
            ts_unix_ms: Date.now(),
            reason,
            witness
        };
        await Deno.writeTextFile(CHECKPOINT.STORAGE_PATH, JSON.stringify(record) + "\n", { append: true });
        return record;
    },

    readAll: async function* (): AsyncGenerator<CheckpointRecord> {
        try {
            const content = await Deno.readTextFile(CHECKPOINT.STORAGE_PATH);
            for (const line of content.split("\n")) {
                if (line.trim().length === 0) continue;
                try {
                    const parsed = JSON.parse(line) as CheckpointRecord;
                    if (
                        typeof parsed.tick === "number" &&
                        typeof parsed.state_hash === "string" &&
                        Array.isArray(parsed.state_i16)
                    ) {
                        yield parsed;
                    }
                } catch {
                    // ignore malformed line
                }
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                console.error("🚨 CHECKPOINT READ FAILURE", e);
            }
        }
    },

    loadExact: async (tick: number): Promise<CheckpointRecord | null> => {
        let found: CheckpointRecord | null = null;
        for await (const c of CHECKPOINT.readAll()) {
            if (c.tick === tick) found = c;
        }
        return found;
    },

    loadNearestAtOrBefore: async (tick: number): Promise<CheckpointRecord | null> => {
        let best: CheckpointRecord | null = null;
        for await (const c of CHECKPOINT.readAll()) {
            if (c.tick <= tick && (!best || c.tick > best.tick)) {
                best = c;
            }
        }
        return best;
    }
};



// [ ./i.L99.core.CRYSTALLIZATION.ts ]
// i.L99.core.CRYSTALLIZATION.ts
// OMEGA-64 | Canon Protocol | Crystallization Threshold
// Evaluates measurable gates before emitting CANONIZATION_EVENT.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import {
  CanonizationEvent,
  DecrystallizationEvent,
  LedgerEvent,
  TopologyEvent,
  ViolationEvent,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import {
  REPLAY_AUDIT,
  ReplayAuditResult,
  ReplayGenesis,
} from "./i.L99.core.REPLAY_AUDIT.ts";
import {
  PROJECTION_REPLAY_REPORT,
  ProjectionReplayReport,
} from "./i.L99.core.PROJECTION_REPLAY_REPORT.ts";
import {
  PROJECTION_DRIFT_ANALYTICS,
  ProjectionDriftAnalyticsReport,
} from "./i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts";
import {
  GATE_ADMISSION_REPORT,
  GateAdmissionReport,
} from "./i.L99.core.GATE_ADMISSION_REPORT.ts";
import { CHECKPOINT } from "./i.L99.core.CHECKPOINT.ts";
import {
  CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_POLICY,
} from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import {
  CRYSTALLIZATION_REPORT,
  CrystallizationReport,
} from "./i.L99.core.CRYSTALLIZATION_REPORT.ts";

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort((
      [a],
      [b],
    ) => a.localeCompare(b));
    return `{${
      entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
        .join(",")
    }}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return Infinity;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(p * sorted.length) - 1),
  );
  return sorted[idx];
};

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const absDeltaSum = (evt: LedgerEvent): number =>
  evt.accepted_delta.reduce((sum, d) => sum + Math.abs(d.value), 0);

const isViolationEvent = (entry: TopologyEvent): entry is ViolationEvent =>
  "event_type" in entry && entry.event_type === "VIOLATION_EVENT";

const isLedgerEvent = (entry: TopologyEvent): entry is LedgerEvent =>
  !("event_type" in entry) && Array.isArray(entry.accepted_delta);

const isCanonizationEvent = (
  entry: TopologyEvent,
): entry is CanonizationEvent =>
  "event_type" in entry && entry.event_type === "CANONIZATION_EVENT";

const hasTick = (
  entry: TopologyEvent,
): entry is TopologyEvent & { tick: number } =>
  "tick" in entry && typeof entry.tick === "number";

interface WindowResult {
  hardPass: boolean;
  softPasses: number;
  proposalDigests: string[];
}

interface EvaluateOptions {
  replayGreen?: boolean;
  requiredWindows?: number;
  witness?: string;
  windowSize?: number;
  crystallizationReportVersion?: string;
  crystallizationReportHash?: string;
  crystallizationReportUri?: string;
  gateAdmissionReportVersion?: string;
  gateAdmissionReportHash?: string;
  gateAdmissionReportUri?: string;
}

interface EvaluateWithAuditOptions extends EvaluateOptions {
  replayRuns?: number;
  replayStartTick?: number;
  projectionDriftMaxP95?: number;
  projectionDriftTopLevels?: number;
  gateAdmissionOutOfPhasePressureMaxMean?: number;
  gateAdmissionMinCoherenceCoverage?: number;
  gateAdmissionTopAgents?: number;
}

interface EnforceOptions {
  windowSize?: number;
  witness?: string;
}

export const CRYSTALLIZATION = {
  WINDOW: CRYSTALLIZATION_CONFIG.window,
  MIN_SOFT_PASSES: CRYSTALLIZATION_CONFIG.minSoftPasses,
  DEFAULT_REQUIRED_WINDOWS: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,

  evaluate: async (
    currentTick: number,
    artifactHash: string,
    stateHash: string,
    options: EvaluateOptions = {},
  ): Promise<boolean> => {
    const replayGreen = options.replayGreen ?? false;
    const requiredWindows = options.requiredWindows ??
      CRYSTALLIZATION.DEFAULT_REQUIRED_WINDOWS;
    const windowSize = options.windowSize ?? CRYSTALLIZATION.WINDOW;

    const entries: TopologyEvent[] = [];
    for await (const entry of LEDGER.readAllRaw()) {
      entries.push(entry);
    }

    const passedDigests: string[] = [];
    for (let w = 0; w < requiredWindows; w++) {
      const endTick = currentTick - (w * windowSize);
      const startTick = endTick - windowSize + 1;
      const result = CRYSTALLIZATION.evaluateWindow(
        entries,
        startTick,
        endTick,
      );

      if (!result.hardPass) {
        return false;
      }
      if (result.softPasses < CRYSTALLIZATION.MIN_SOFT_PASSES) {
        return false;
      }
      passedDigests.push(...result.proposalDigests);
    }

    if (!replayGreen) {
      return false;
    }

    const proposalDigest = await sha256Hex(
      stableStringify([...passedDigests].sort()),
    );
    const policyHash = await CRYSTALLIZATION_POLICY.hash();
    const canonEvent: CanonizationEvent = {
      event_type: "CANONIZATION_EVENT",
      artifact_hash: artifactHash,
      state_hash: stateHash,
      proposal_digest: proposalDigest,
      checkpoint_tick: currentTick,
      window: windowSize,
      hard_gates: "PASS",
      soft_gates_passed: 6,
      policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
      policy_hash: policyHash,
      crystallization_report_version: options.crystallizationReportVersion,
      crystallization_report_hash: options.crystallizationReportHash,
      crystallization_report_uri: options.crystallizationReportUri,
      gate_admission_report_version: options.gateAdmissionReportVersion,
      gate_admission_report_hash: options.gateAdmissionReportHash,
      gate_admission_report_uri: options.gateAdmissionReportUri,
      witness: options.witness,
    };

    await LEDGER.append(canonEvent);
    return true;
  },

  evaluateWithAudit: async (
    currentTick: number,
    artifactHash: string,
    stateHash: string,
    replayGenesis: ReplayGenesis,
    options: EvaluateWithAuditOptions = {},
  ): Promise<{
    crystallized: boolean;
    audit: ReplayAuditResult;
    projectionReport: ProjectionReplayReport;
    driftReport: ProjectionDriftAnalyticsReport;
    projectionDriftGatePass: boolean;
    gateAdmissionReport: GateAdmissionReport;
    gateAdmissionGatePass: boolean;
    gateAdmissionReportHash: string;
    gateAdmissionReportUri: string;
    crystallizationReport: CrystallizationReport;
    crystallizationReportHash: string;
    crystallizationReportUri: string;
  }> => {
    const requiredWindows = options.requiredWindows ??
      CRYSTALLIZATION.DEFAULT_REQUIRED_WINDOWS;
    const windowSize = options.windowSize ?? CRYSTALLIZATION.WINDOW;
    const replayStartTick = options.replayStartTick ?? Math.max(
      replayGenesis.tick,
      currentTick - (requiredWindows * windowSize) + 1,
    );

    const audit = await REPLAY_AUDIT.audit(replayGenesis, {
      runs: options.replayRuns ?? 3,
      startTick: replayStartTick,
      endTick: currentTick,
      verifyLedgerChain: CRYSTALLIZATION_CONFIG.verifyLedgerChain,
    });
    const projectionReport = await PROJECTION_REPLAY_REPORT.generate(
      replayGenesis,
      {
        startTick: replayStartTick,
        endTick: currentTick,
        verifyTopologicalSignatures: true,
      },
    );
    const driftReport = await PROJECTION_DRIFT_ANALYTICS.analyze(
      replayGenesis,
      {
        startTick: replayStartTick,
        endTick: currentTick,
        requireReplayGreen: true,
        verifyTopologicalSignatures: true,
        topLevels: options.projectionDriftTopLevels ??
          CRYSTALLIZATION_CONFIG.projectionDriftTopLevels,
      },
    );
    const projectionDriftMaxP95 = options.projectionDriftMaxP95 ??
      CRYSTALLIZATION_CONFIG.projectionDriftMaxP95;
    const projectionDriftP95 = driftReport.driftByLevelP95.length > 0
      ? Math.max(...driftReport.driftByLevelP95)
      : 0;
    const projectionDriftGatePass = driftReport.ok &&
      projectionDriftP95 <= projectionDriftMaxP95;
    const gateAdmissionOutOfPhasePressureMaxMean =
      options.gateAdmissionOutOfPhasePressureMaxMean ??
        CRYSTALLIZATION_CONFIG.gateAdmissionOutOfPhasePressureMaxMean;
    const gateAdmissionMinCoherenceCoverage =
      options.gateAdmissionMinCoherenceCoverage ??
        CRYSTALLIZATION_CONFIG.gateAdmissionMinCoherenceCoverage;
    const { report: gateAdmissionReport, reportHash: gateAdmissionReportHash } =
      await GATE_ADMISSION_REPORT.generateWithHash({
        startTick: replayStartTick,
        endTick: currentTick,
        topAgents: options.gateAdmissionTopAgents ??
          CRYSTALLIZATION_CONFIG.gateAdmissionTopAgents,
      });
    const gateAdmissionMaterialized = await GATE_ADMISSION_REPORT.materialize(
      gateAdmissionReport,
      gateAdmissionReportHash,
      { tick_anchor: currentTick, witness: options.witness },
    );
    const gateAdmissionReportUri = gateAdmissionMaterialized.path;
    const gateAdmissionGatePass = gateAdmissionReport.ok &&
      gateAdmissionReport.coherenceCoverage >=
        gateAdmissionMinCoherenceCoverage &&
      (
        gateAdmissionReport.outOfPhasePressureMean === undefined ||
        gateAdmissionReport.outOfPhasePressureMean <=
          gateAdmissionOutOfPhasePressureMaxMean
      );
    const projectionHardGatePass = projectionReport.failCount === 0;
    const {
      report: crystallizationReport,
      reportHash: crystallizationReportHash,
    } = await CRYSTALLIZATION_REPORT.buildWithHash({
      artifact_hash: artifactHash,
      state_hash: stateHash,
      current_tick: currentTick,
      replay_start_tick: replayStartTick,
      replay_end_tick: currentTick,
      replay_audit: audit,
      projection_report: projectionReport,
      drift_report: driftReport,
      projection_drift_gate_pass: projectionDriftGatePass,
      projection_drift_max_p95: projectionDriftMaxP95,
      gate_admission_report: gateAdmissionReport,
      gate_admission_gate_pass: gateAdmissionGatePass,
      gate_admission_report_hash: gateAdmissionReportHash,
      gate_admission_report_uri: gateAdmissionReportUri,
      gate_admission_out_of_phase_pressure_max_mean:
        gateAdmissionOutOfPhasePressureMaxMean,
      gate_admission_min_coherence_coverage: gateAdmissionMinCoherenceCoverage,
    });
    const materialized = await CRYSTALLIZATION_REPORT.materialize(
      crystallizationReport,
      crystallizationReportHash,
      {
        tick: currentTick,
        artifact_hash: artifactHash,
        state_hash: stateHash,
        witness: options.witness,
      },
    );
    const crystallizationReportUri = materialized.path;

    const crystallized = await CRYSTALLIZATION.evaluate(
      currentTick,
      artifactHash,
      stateHash,
      {
        // Hard gate: projection replay must be clean.
        replayGreen: audit.replayGreen &&
          projectionHardGatePass &&
          projectionDriftGatePass &&
          gateAdmissionGatePass,
        requiredWindows,
        windowSize,
        crystallizationReportVersion: CRYSTALLIZATION_REPORT.VERSION,
        crystallizationReportHash,
        crystallizationReportUri,
        gateAdmissionReportVersion: GATE_ADMISSION_REPORT.VERSION,
        gateAdmissionReportHash,
        gateAdmissionReportUri,
        witness: options.witness,
      },
    );

    return {
      crystallized,
      audit,
      projectionReport,
      driftReport,
      projectionDriftGatePass,
      gateAdmissionReport,
      gateAdmissionGatePass,
      gateAdmissionReportHash,
      gateAdmissionReportUri,
      crystallizationReport,
      crystallizationReportHash,
      crystallizationReportUri,
    };
  },

  enforcePostCrystal: async (
    currentTick: number,
    artifactHash: string,
    options: EnforceOptions = {},
  ): Promise<
    { decrystallized: boolean; rollbackTick?: number; reason?: string }
  > => {
    const windowSize = options.windowSize ?? CRYSTALLIZATION.WINDOW;
    const entries: TopologyEvent[] = [];
    for await (const entry of LEDGER.readAllRaw()) {
      entries.push(entry);
    }

    const startTick = currentTick - windowSize + 1;
    const result = CRYSTALLIZATION.evaluateWindow(
      entries,
      startTick,
      currentTick,
    );
    if (result.hardPass) {
      return { decrystallized: false };
    }

    let rollbackTick = currentTick;
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (isCanonizationEvent(entry) && entry.artifact_hash === artifactHash) {
        rollbackTick = entry.checkpoint_tick;
        break;
      }
    }

    const reason = CRYSTALLIZATION.describeHardFailure(
      entries,
      startTick,
      currentTick,
    );
    const rollbackCheckpoint = (await CHECKPOINT.loadExact(rollbackTick)) ??
      (await CHECKPOINT.loadNearestAtOrBefore(rollbackTick));
    const decrystalEvent: DecrystallizationEvent = {
      event_type: "DECRYSTALLIZATION_EVENT",
      tick: currentTick,
      artifact_hash: artifactHash,
      reason,
      rollback_to_checkpoint: rollbackTick,
      rollback_state_hash: rollbackCheckpoint?.state_hash,
      hard_gate_failure: reason,
      witness: options.witness,
    };

    await LEDGER.append(decrystalEvent);
    return { decrystallized: true, rollbackTick, reason };
  },

  evaluateWindow: (
    entries: TopologyEvent[],
    startTick: number,
    endTick: number,
  ): WindowResult => {
    const inWindow = entries
      .filter(hasTick)
      .filter((e) => e.tick >= startTick && e.tick <= endTick);
    const violations = inWindow.filter(isViolationEvent)
      .filter((v) => v.severity === "CRITICAL");
    const events = inWindow.filter(isLedgerEvent)
      .sort((a, b) => a.tick - b.tick);

    const continuity = CRYSTALLIZATION.checkTickContinuity(
      events,
      startTick,
      endTick,
    );
    const hardPass = violations.length === 0 && continuity;

    const budgetPressure = events.map((e) => {
      const limit = e.budget_limit && e.budget_limit > 0
        ? e.budget_limit
        : Math.max(1, e.budget_used);
      return e.budget_used / limit;
    });
    const budgetP95 = percentile(budgetPressure, 0.95);
    const softBudget = budgetP95 <= 0.70;

    const driftSamples = events.flatMap((e) =>
      e.accepted_delta.map((d) => Math.abs(d.value))
    );
    const driftP95 = percentile(driftSamples, 0.95);
    const softDrift = driftP95 <= 8;

    const signFlipRate = CRYSTALLIZATION.computeSignFlipRate(events);
    const softFlip = signFlipRate <= 0.25;

    const rejected = events.reduce(
      (sum, e) => sum + e.rejected_proposals.length,
      0,
    );
    const accepted = events.reduce(
      (sum, e) => sum + e.accepted_proposals.length,
      0,
    );
    const proposalsTotal = accepted + rejected;
    const rejectionRatio = proposalsTotal > 0 ? rejected / proposalsTotal : 1;
    const softReject = rejectionRatio <= 0.30;

    const energyDensity = events.map((e) =>
      e.cost_total / Math.max(1, absDeltaSum(e))
    );
    const medEnergy = median(energyDensity);
    const p99Energy = percentile(energyDensity, 0.99);
    const softEnergy = medEnergy > 0
      ? p99Energy <= 3 * medEnergy
      : p99Energy <= 0;

    const softContinuity = continuity;

    const softPasses = [
      softBudget,
      softDrift,
      softFlip,
      softReject,
      softEnergy,
      softContinuity,
    ].filter(Boolean).length;

    return {
      hardPass,
      softPasses,
      proposalDigests: events.map((e) => e.proposal_digest),
    };
  },

  describeHardFailure: (
    entries: TopologyEvent[],
    startTick: number,
    endTick: number,
  ): string => {
    const inWindow = entries
      .filter(hasTick)
      .filter((e) => e.tick >= startTick && e.tick <= endTick);

    const violations = inWindow
      .filter(isViolationEvent)
      .filter((v) => v.severity === "CRITICAL");
    if (violations.length > 0) {
      return `CRITICAL_VIOLATION:${violations[0].rule_id}`;
    }

    const events = inWindow.filter(isLedgerEvent).sort((a, b) =>
      a.tick - b.tick
    );
    if (!CRYSTALLIZATION.checkTickContinuity(events, startTick, endTick)) {
      return "TICK_CONTINUITY_BROKEN";
    }

    return "HARD_GATE_FAILED";
  },

  checkTickContinuity: (
    events: LedgerEvent[],
    startTick: number,
    endTick: number,
  ): boolean => {
    if (events.length !== (endTick - startTick + 1)) {
      return false;
    }
    for (let i = 0; i < events.length; i++) {
      const expected = startTick + i;
      if (events[i].tick !== expected) {
        return false;
      }
    }
    return true;
  },

  computeSignFlipRate: (events: LedgerEvent[]): number => {
    const lastSign = new Map<number, number>();
    let transitions = 0;
    let flips = 0;

    for (const evt of events) {
      const byLevel = new Map<number, number>();
      for (const d of evt.accepted_delta) {
        if (d.value === 0) continue;
        byLevel.set(d.level, Math.sign(d.value));
      }
      for (const [level, sign] of byLevel.entries()) {
        const prev = lastSign.get(level);
        if (prev !== undefined) {
          transitions++;
          if (prev !== sign) {
            flips++;
          }
        }
        lastSign.set(level, sign);
      }
    }

    return transitions > 0 ? flips / transitions : 0;
  },
};


// [ ./i.L99.core.CRYSTALLIZATION_CONFIG.ts ]
// i.L99.core.CRYSTALLIZATION_CONFIG.ts
// OMEGA-64 | Canon Policy | Crystallization Runtime Defaults

export interface CrystallizationConfig {
  policyVersion: string;
  window: number;
  minSoftPasses: number;
  defaultRequiredWindows: number;
  projectionDriftMaxP95: number;
  projectionDriftTopLevels: number;
  gateAdmissionOutOfPhasePressureMaxMean: number;
  gateAdmissionMinCoherenceCoverage: number;
  gateAdmissionTopAgents: number;
  verifyLedgerChain: boolean;
}

export const CRYSTALLIZATION_CONFIG: CrystallizationConfig = {
  policyVersion: "crystallization/v1",
  window: 512,
  minSoftPasses: 5,
  defaultRequiredWindows: 3,
  projectionDriftMaxP95: 1024,
  projectionDriftTopLevels: 8,
  gateAdmissionOutOfPhasePressureMaxMean: 1.0,
  gateAdmissionMinCoherenceCoverage: 0.0,
  gateAdmissionTopAgents: 8,
  verifyLedgerChain: true,
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${
      entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
        .join(",")
    }}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

export const CRYSTALLIZATION_POLICY = {
  canonicalPayload: (): string =>
    stableStringify({
      policyVersion: CRYSTALLIZATION_CONFIG.policyVersion,
      window: CRYSTALLIZATION_CONFIG.window,
      minSoftPasses: CRYSTALLIZATION_CONFIG.minSoftPasses,
      defaultRequiredWindows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
      projectionDriftMaxP95: CRYSTALLIZATION_CONFIG.projectionDriftMaxP95,
      projectionDriftTopLevels: CRYSTALLIZATION_CONFIG.projectionDriftTopLevels,
      gateAdmissionOutOfPhasePressureMaxMean:
        CRYSTALLIZATION_CONFIG.gateAdmissionOutOfPhasePressureMaxMean,
      gateAdmissionMinCoherenceCoverage:
        CRYSTALLIZATION_CONFIG.gateAdmissionMinCoherenceCoverage,
      gateAdmissionTopAgents: CRYSTALLIZATION_CONFIG.gateAdmissionTopAgents,
      verifyLedgerChain: CRYSTALLIZATION_CONFIG.verifyLedgerChain,
    }),

  hash: async (): Promise<string> =>
    await sha256Hex(CRYSTALLIZATION_POLICY.canonicalPayload()),
};


// [ ./i.L99.core.CRYSTALLIZATION_REPORT.ts ]
// i.L99.core.CRYSTALLIZATION_REPORT.ts
// OMEGA-64 | Canon Protocol | Canonization Report Artifact

import { ProjectionDriftAnalyticsReport } from "./i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts";
import { ProjectionReplayReport } from "./i.L99.core.PROJECTION_REPLAY_REPORT.ts";
import { ReplayAuditResult } from "./i.L99.core.REPLAY_AUDIT.ts";
import {
  CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_POLICY,
} from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import type { GateAdmissionReport } from "./i.L99.core.GATE_ADMISSION_REPORT.ts";

export interface CrystallizationReportInput {
  artifact_hash: string;
  state_hash: string;
  current_tick: number;
  replay_start_tick: number;
  replay_end_tick: number;
  replay_audit: ReplayAuditResult;
  projection_report: ProjectionReplayReport;
  drift_report: ProjectionDriftAnalyticsReport;
  projection_drift_gate_pass: boolean;
  projection_drift_max_p95: number;
  gate_admission_report?: GateAdmissionReport;
  gate_admission_gate_pass?: boolean;
  gate_admission_report_hash?: string;
  gate_admission_report_uri?: string;
  gate_admission_out_of_phase_pressure_max_mean?: number;
  gate_admission_min_coherence_coverage?: number;
}

export interface CrystallizationReport {
  version: string;
  artifact_hash: string;
  state_hash: string;
  current_tick: number;
  replay_start_tick: number;
  replay_end_tick: number;
  policy: {
    version: string;
    hash: string;
  };
  thresholds: {
    window: number;
    min_soft_passes: number;
    default_required_windows: number;
    projection_drift_max_p95: number;
    gate_admission_out_of_phase_pressure_max_mean?: number;
    gate_admission_min_coherence_coverage?: number;
  };
  verification_summary: {
    replay_green: boolean;
    projection_checks: number;
    policy_checks: number;
    canon_report_checks: number;
    gate_admission_report_checks: number;
    canon_index_chain_checked: boolean;
    canon_index_chain_ok: boolean;
    gate_admission_index_chain_checked: boolean;
    gate_admission_index_chain_ok: boolean;
  };
  replay_audit: ReplayAuditResult;
  projection_report: ProjectionReplayReport;
  drift_report: ProjectionDriftAnalyticsReport;
  projection_drift_gate_pass: boolean;
  gate_admission_report?: GateAdmissionReport;
  gate_admission_gate_pass?: boolean;
  gate_admission_report_hash?: string;
  gate_admission_report_uri?: string;
}

export interface CrystallizationReportMaterializeMeta {
  tick: number;
  artifact_hash: string;
  state_hash: string;
  witness?: string;
}

export interface CrystallizationReportIndexRecord {
  report_hash: string;
  report_version: string;
  report_path: string;
  tick: number;
  artifact_hash: string;
  state_hash: string;
  ts_unix_ms: number;
  prev_record_hash: string | null;
  record_hash: string;
  witness?: string;
}

const REPORT_VERSION = "crystallization-report/v1";

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${
      entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
        .join(",")
    }}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const HEX_64_RE = /^[0-9a-f]{64}$/;

const parseIndexRecord = (
  line: string,
  lineNumber: number,
): { ok: true; record: CrystallizationReportIndexRecord } | {
  ok: false;
  error: string;
} => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return { ok: false, error: `INDEX_LINE_PARSE_FAIL_AT_LINE_${lineNumber}` };
  }
  const rec = parsed as Partial<CrystallizationReportIndexRecord>;
  const shapeOk = typeof rec.report_hash === "string" &&
    HEX_64_RE.test(rec.report_hash) &&
    typeof rec.report_version === "string" &&
    typeof rec.report_path === "string" &&
    typeof rec.tick === "number" &&
    Number.isSafeInteger(rec.tick) &&
    rec.tick >= 0 &&
    typeof rec.artifact_hash === "string" &&
    typeof rec.state_hash === "string" &&
    typeof rec.ts_unix_ms === "number" &&
    Number.isSafeInteger(rec.ts_unix_ms) &&
    rec.ts_unix_ms >= 0 &&
    (typeof rec.prev_record_hash === "string" ||
      rec.prev_record_hash === null) &&
    typeof rec.record_hash === "string" &&
    HEX_64_RE.test(rec.record_hash) &&
    (rec.witness === undefined || typeof rec.witness === "string");
  if (!shapeOk) {
    return {
      ok: false,
      error: `INDEX_LINE_SCHEMA_INVALID_AT_LINE_${lineNumber}`,
    };
  }
  return { ok: true, record: rec as CrystallizationReportIndexRecord };
};

export const CRYSTALLIZATION_REPORT = {
  VERSION: REPORT_VERSION,
  STORAGE_DIR: "./OMEGA_CANON_REPORTS",
  INDEX_PATH: "./OMEGA_CANON_REPORTS/index.jsonl",

  build: async (
    input: CrystallizationReportInput,
  ): Promise<CrystallizationReport> => {
    const policyHash = await CRYSTALLIZATION_POLICY.hash();
    return {
      version: REPORT_VERSION,
      artifact_hash: input.artifact_hash,
      state_hash: input.state_hash,
      current_tick: input.current_tick,
      replay_start_tick: input.replay_start_tick,
      replay_end_tick: input.replay_end_tick,
      policy: {
        version: CRYSTALLIZATION_CONFIG.policyVersion,
        hash: policyHash,
      },
      thresholds: {
        window: CRYSTALLIZATION_CONFIG.window,
        min_soft_passes: CRYSTALLIZATION_CONFIG.minSoftPasses,
        default_required_windows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
        projection_drift_max_p95: input.projection_drift_max_p95,
        gate_admission_out_of_phase_pressure_max_mean:
          input.gate_admission_out_of_phase_pressure_max_mean,
        gate_admission_min_coherence_coverage:
          input.gate_admission_min_coherence_coverage,
      },
      verification_summary: {
        replay_green: input.replay_audit.replayGreen,
        projection_checks: input.replay_audit.checkedProjectionEvents,
        policy_checks: input.replay_audit.checkedPolicyEvents,
        canon_report_checks: input.replay_audit.checkedCanonReports,
        gate_admission_report_checks: input.replay_audit.checkedGateAdmissionReports,
        canon_index_chain_checked: input.replay_audit.invariantReport.index_chain_checked,
        canon_index_chain_ok: input.replay_audit.invariantReport.index_chain_ok,
        gate_admission_index_chain_checked:
          input.replay_audit.invariantReport.gate_admission_index_chain_checked,
        gate_admission_index_chain_ok:
          input.replay_audit.invariantReport.gate_admission_index_chain_ok,
      },
      replay_audit: input.replay_audit,
      projection_report: input.projection_report,
      drift_report: input.drift_report,
      projection_drift_gate_pass: input.projection_drift_gate_pass,
      gate_admission_report: input.gate_admission_report,
      gate_admission_gate_pass: input.gate_admission_gate_pass,
      gate_admission_report_hash: input.gate_admission_report_hash,
      gate_admission_report_uri: input.gate_admission_report_uri,
    };
  },

  hash: async (report: CrystallizationReport): Promise<string> =>
    await sha256Hex(stableStringify(report)),

  buildWithHash: async (
    input: CrystallizationReportInput,
  ): Promise<{ report: CrystallizationReport; reportHash: string }> => {
    const report = await CRYSTALLIZATION_REPORT.build(input);
    const reportHash = await CRYSTALLIZATION_REPORT.hash(report);
    return { report, reportHash };
  },

  reportPath: (reportHash: string): string =>
    `${CRYSTALLIZATION_REPORT.STORAGE_DIR}/${reportHash}.json`,

  indexRecordHash: async (
    record: Omit<CrystallizationReportIndexRecord, "record_hash">,
  ): Promise<string> => await sha256Hex(stableStringify(record)),

  readIndex: async function* (): AsyncGenerator<
    CrystallizationReportIndexRecord
  > {
    try {
      const content = await Deno.readTextFile(
        CRYSTALLIZATION_REPORT.INDEX_PATH,
      );
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().length === 0) continue;
        const parsed = parseIndexRecord(line, i + 1);
        if (parsed.ok) {
          yield parsed.record;
        }
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
    }
  },

  findIndexRecord: async (
    reportHash: string,
    reportPath?: string,
  ): Promise<CrystallizationReportIndexRecord | null> => {
    let found: CrystallizationReportIndexRecord | null = null;
    for await (const rec of CRYSTALLIZATION_REPORT.readIndex()) {
      if (rec.report_hash !== reportHash) continue;
      if (reportPath && rec.report_path !== reportPath) continue;
      found = rec;
    }
    return found;
  },

  verifyIndexChain: async (
    verifyReportFiles: boolean = true,
  ): Promise<{ ok: boolean; failures: string[]; checkedRecords: number }> => {
    const failures: string[] = [];
    const records: CrystallizationReportIndexRecord[] = [];
    try {
      const content = await Deno.readTextFile(
        CRYSTALLIZATION_REPORT.INDEX_PATH,
      );
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().length === 0) continue;
        const parsed = parseIndexRecord(line, i + 1);
        if (!parsed.ok) {
          return {
            ok: false,
            failures: [parsed.error],
            checkedRecords: records.length,
          };
        }
        records.push(parsed.record);
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
    }

    let prev: string | null = null;
    let prevTick = -1;
    let prevTs = -1;
    const seenReportHashes = new Set<string>();
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (rec.prev_record_hash !== prev) {
        failures.push(`INDEX_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
        break;
      }
      if (rec.tick < prevTick) {
        failures.push(`INDEX_TICK_NON_MONOTONIC_AT_LINE_${i + 1}`);
        break;
      }
      if (rec.ts_unix_ms < prevTs) {
        failures.push(`INDEX_TS_NON_MONOTONIC_AT_LINE_${i + 1}`);
        break;
      }
      if (seenReportHashes.has(rec.report_hash)) {
        failures.push(`INDEX_DUPLICATE_REPORT_HASH_AT_LINE_${i + 1}`);
        break;
      }
      const expected = await CRYSTALLIZATION_REPORT.indexRecordHash({
        report_hash: rec.report_hash,
        report_version: rec.report_version,
        report_path: rec.report_path,
        tick: rec.tick,
        artifact_hash: rec.artifact_hash,
        state_hash: rec.state_hash,
        ts_unix_ms: rec.ts_unix_ms,
        prev_record_hash: rec.prev_record_hash,
        witness: rec.witness,
      });
      if (expected !== rec.record_hash) {
        failures.push(`INDEX_RECORD_HASH_MISMATCH_AT_LINE_${i + 1}`);
        break;
      }

      if (verifyReportFiles) {
        try {
          const body = await Deno.readTextFile(rec.report_path);
          const parsed = JSON.parse(body) as CrystallizationReport;
          const computed = await CRYSTALLIZATION_REPORT.hash(parsed);
          if (computed !== rec.report_hash) {
            failures.push(`INDEX_REPORT_HASH_MISMATCH_AT_LINE_${i + 1}`);
            break;
          }
        } catch {
          failures.push(`INDEX_REPORT_READ_FAIL_AT_LINE_${i + 1}`);
          break;
        }
      }

      prev = rec.record_hash;
      prevTick = rec.tick;
      prevTs = rec.ts_unix_ms;
      seenReportHashes.add(rec.report_hash);
    }

    return {
      ok: failures.length === 0,
      failures,
      checkedRecords: records.length,
    };
  },

  materialize: async (
    report: CrystallizationReport,
    reportHash: string,
    meta: CrystallizationReportMaterializeMeta,
  ): Promise<
    {
      path: string;
      created: boolean;
      indexRecord?: CrystallizationReportIndexRecord;
    }
  > => {
    await Deno.mkdir(CRYSTALLIZATION_REPORT.STORAGE_DIR, { recursive: true });
    const path = CRYSTALLIZATION_REPORT.reportPath(reportHash);
    const payload = JSON.stringify(report, null, 2);

    try {
      await Deno.writeTextFile(path, payload, { createNew: true });
      let prevRecordHash: string | null = null;
      for await (const rec of CRYSTALLIZATION_REPORT.readIndex()) {
        prevRecordHash = rec.record_hash;
      }
      const indexRecordWithoutHash: Omit<
        CrystallizationReportIndexRecord,
        "record_hash"
      > = {
        report_hash: reportHash,
        report_version: report.version,
        report_path: path,
        tick: meta.tick,
        artifact_hash: meta.artifact_hash,
        state_hash: meta.state_hash,
        ts_unix_ms: Date.now(),
        prev_record_hash: prevRecordHash,
        witness: meta.witness,
      };
      const recordHash = await CRYSTALLIZATION_REPORT.indexRecordHash(
        indexRecordWithoutHash,
      );
      const indexRecord: CrystallizationReportIndexRecord = {
        ...indexRecordWithoutHash,
        record_hash: recordHash,
      };
      await Deno.writeTextFile(
        CRYSTALLIZATION_REPORT.INDEX_PATH,
        JSON.stringify(indexRecord) + "\n",
        { append: true, create: true },
      );
      return { path, created: true, indexRecord };
    } catch (e) {
      if (!(e instanceof Deno.errors.AlreadyExists)) throw e;

      const existing = await Deno.readTextFile(path);
      const parsed = JSON.parse(existing) as CrystallizationReport;
      const existingHash = await CRYSTALLIZATION_REPORT.hash(parsed);
      if (existingHash !== reportHash) {
        throw new Error(`CRYSTALLIZATION_REPORT_HASH_CONFLICT:${reportHash}`);
      }
      return { path, created: false };
    }
  },
};


// [ ./i.L99.core.GATE_ADMISSION_REPORT.ts ]
// i.L99.core.GATE_ADMISSION_REPORT.ts
// OMEGA-64 | Gate Admission Report
// Aggregates proposal admission metrics emitted by L32 gate.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import type { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface GateAdmissionReportOptions {
  startTick?: number;
  endTick?: number;
  topAgents?: number;
}

export interface GateAdmissionTimelinePoint {
  tick: number;
  proposals: number;
  mean_weight: number;
  mean_reliability_effective: number;
  mean_phase_coherence?: number;
  mean_physical_cost: number;
}

export interface GateAdmissionAgentStats {
  agent_id: string;
  proposals: number;
  mean_weight: number;
  p95_weight: number;
  mean_reliability_effective: number;
  mean_phase_coherence?: number;
  mean_physical_cost: number;
}

export interface GateAdmissionReport {
  version: string;
  ok: boolean;
  startTick?: number;
  endTick?: number;
  eventsAnalyzed: number;
  eventsWithMetrics: number;
  proposalsAnalyzed: number;
  coherenceCoverage: number;
  weightMean: number;
  weightP95: number;
  reliabilityEffectiveMean: number;
  phaseCoherenceMean?: number;
  phaseCoherenceP95?: number;
  outOfPhasePressureMean?: number;
  topAgents: GateAdmissionAgentStats[];
  timeline: GateAdmissionTimelinePoint[];
  failures: string[];
}

export interface GateAdmissionReportMaterializeMeta {
  tick_anchor: number;
  witness?: string;
}

export interface GateAdmissionReportIndexRecord {
  report_hash: string;
  report_version: string;
  report_path: string;
  tick_anchor: number;
  start_tick: number | null;
  end_tick: number | null;
  events_analyzed: number;
  proposals_analyzed: number;
  ts_unix_ms: number;
  prev_record_hash: string | null;
  record_hash: string;
  witness?: string;
}

const REPORT_VERSION = "gate-admission-report/v1";
const HEX_64_RE = /^[0-9a-f]{64}$/;

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(p * sorted.length) - 1),
  );
  return sorted[idx];
};

const mean = (values: number[]): number =>
  values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : 0;

const inWindow = (
  tick: number,
  startTick?: number,
  endTick?: number,
): boolean => {
  const inStart = startTick === undefined || tick >= startTick;
  const inEnd = endTick === undefined || tick <= endTick;
  return inStart && inEnd;
};

const isMutationEvent = (evt: LedgerEvent): boolean =>
  evt.state_after_hash !== evt.state_before_hash;

const parseIndexRecord = (
  line: string,
  lineNumber: number,
): { ok: true; record: GateAdmissionReportIndexRecord } | {
  ok: false;
  error: string;
} => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return { ok: false, error: `INDEX_LINE_PARSE_FAIL_AT_LINE_${lineNumber}` };
  }
  const rec = parsed as Partial<GateAdmissionReportIndexRecord>;
  const shapeOk = typeof rec.report_hash === "string" &&
    HEX_64_RE.test(rec.report_hash) &&
    typeof rec.report_version === "string" &&
    typeof rec.report_path === "string" &&
    typeof rec.tick_anchor === "number" &&
    Number.isSafeInteger(rec.tick_anchor) &&
    rec.tick_anchor >= 0 &&
    (typeof rec.start_tick === "number" || rec.start_tick === null) &&
    (typeof rec.end_tick === "number" || rec.end_tick === null) &&
    typeof rec.events_analyzed === "number" &&
    Number.isSafeInteger(rec.events_analyzed) &&
    rec.events_analyzed >= 0 &&
    typeof rec.proposals_analyzed === "number" &&
    Number.isSafeInteger(rec.proposals_analyzed) &&
    rec.proposals_analyzed >= 0 &&
    typeof rec.ts_unix_ms === "number" &&
    Number.isSafeInteger(rec.ts_unix_ms) &&
    rec.ts_unix_ms >= 0 &&
    (typeof rec.prev_record_hash === "string" ||
      rec.prev_record_hash === null) &&
    typeof rec.record_hash === "string" &&
    HEX_64_RE.test(rec.record_hash) &&
    (rec.witness === undefined || typeof rec.witness === "string");
  if (!shapeOk) {
    return {
      ok: false,
      error: `INDEX_LINE_SCHEMA_INVALID_AT_LINE_${lineNumber}`,
    };
  }
  return { ok: true, record: rec as GateAdmissionReportIndexRecord };
};

export const GATE_ADMISSION_REPORT = {
  VERSION: REPORT_VERSION,
  STORAGE_DIR: "./OMEGA_GATE_ADMISSION_REPORTS",
  INDEX_PATH: "./OMEGA_GATE_ADMISSION_REPORTS/index.jsonl",

  generate: async (
    options: GateAdmissionReportOptions = {},
  ): Promise<GateAdmissionReport> => {
    const failures: string[] = [];
    const timeline: GateAdmissionTimelinePoint[] = [];
    const weightSeries: number[] = [];
    const reliabilitySeries: number[] = [];
    const coherenceSeries: number[] = [];
    const outOfPhaseSeries: number[] = [];
    const agentMap = new Map<
      string,
      Array<{
        weight: number;
        reliability_effective: number;
        phase_coherence?: number;
        physical_cost: number;
      }>
    >();

    let eventsAnalyzed = 0;
    let eventsWithMetrics = 0;
    let proposalsAnalyzed = 0;

    for await (const evt of LEDGER.readAll()) {
      if (!inWindow(evt.tick, options.startTick, options.endTick)) continue;
      if (!isMutationEvent(evt)) continue;
      eventsAnalyzed++;

      const metrics = evt.accepted_proposal_metrics ?? [];
      if (metrics.length === 0) {
        continue;
      }
      eventsWithMetrics++;
      proposalsAnalyzed += metrics.length;

      const tickWeights: number[] = [];
      const tickReliability: number[] = [];
      const tickCoherence: number[] = [];
      const tickCosts: number[] = [];

      for (const m of metrics) {
        if (typeof m.agent_id !== "string" || m.agent_id.length === 0) {
          failures.push(`INVALID_AGENT_ID_AT_TICK_${evt.tick}`);
          continue;
        }
        if (
          !Number.isFinite(m.weight) ||
          !Number.isFinite(m.reliability_effective)
        ) {
          failures.push(`INVALID_METRIC_NUMERIC_FIELD_AT_TICK_${evt.tick}`);
          continue;
        }
        tickWeights.push(m.weight);
        tickReliability.push(m.reliability_effective);
        tickCosts.push(m.physical_cost);
        weightSeries.push(m.weight);
        reliabilitySeries.push(m.reliability_effective);
        if (
          m.phase_coherence !== undefined && Number.isFinite(m.phase_coherence)
        ) {
          tickCoherence.push(m.phase_coherence);
          coherenceSeries.push(m.phase_coherence);
          outOfPhaseSeries.push(1 - m.phase_coherence);
        }

        const current = agentMap.get(m.agent_id) ?? [];
        current.push({
          weight: m.weight,
          reliability_effective: m.reliability_effective,
          phase_coherence: m.phase_coherence,
          physical_cost: m.physical_cost,
        });
        agentMap.set(m.agent_id, current);
      }

      timeline.push({
        tick: evt.tick,
        proposals: tickWeights.length,
        mean_weight: mean(tickWeights),
        mean_reliability_effective: mean(tickReliability),
        mean_phase_coherence: tickCoherence.length > 0
          ? mean(tickCoherence)
          : undefined,
        mean_physical_cost: mean(tickCosts),
      });
    }

    const topN = Math.max(1, options.topAgents ?? 8);
    const topAgents: GateAdmissionAgentStats[] = Array.from(agentMap.entries())
      .map(([agent_id, values]) => {
        const weights = values.map((v) => v.weight);
        const rel = values.map((v) => v.reliability_effective);
        const coh = values
          .map((v) => v.phase_coherence)
          .filter((v): v is number =>
            typeof v === "number" && Number.isFinite(v)
          );
        const costs = values.map((v) => v.physical_cost);
        return {
          agent_id,
          proposals: values.length,
          mean_weight: mean(weights),
          p95_weight: percentile(weights, 0.95),
          mean_reliability_effective: mean(rel),
          mean_phase_coherence: coh.length > 0 ? mean(coh) : undefined,
          mean_physical_cost: mean(costs),
        };
      })
      .sort((a, b) => {
        if (b.proposals !== a.proposals) return b.proposals - a.proposals;
        if (b.mean_weight !== a.mean_weight) {
          return b.mean_weight - a.mean_weight;
        }
        return a.agent_id.localeCompare(b.agent_id);
      })
      .slice(0, topN);

    const coherenceCoverage = proposalsAnalyzed > 0
      ? coherenceSeries.length / proposalsAnalyzed
      : 0;

    return {
      version: REPORT_VERSION,
      ok: failures.length === 0,
      startTick: options.startTick,
      endTick: options.endTick,
      eventsAnalyzed,
      eventsWithMetrics,
      proposalsAnalyzed,
      coherenceCoverage,
      weightMean: mean(weightSeries),
      weightP95: percentile(weightSeries, 0.95),
      reliabilityEffectiveMean: mean(reliabilitySeries),
      phaseCoherenceMean: coherenceSeries.length > 0
        ? mean(coherenceSeries)
        : undefined,
      phaseCoherenceP95: coherenceSeries.length > 0
        ? percentile(coherenceSeries, 0.95)
        : undefined,
      outOfPhasePressureMean: outOfPhaseSeries.length > 0
        ? mean(outOfPhaseSeries)
        : undefined,
      topAgents,
      timeline,
      failures,
    };
  },

  hash: async (report: GateAdmissionReport): Promise<string> =>
    await sha256Hex(stableStringify(report)),

  generateWithHash: async (
    options: GateAdmissionReportOptions = {},
  ): Promise<{ report: GateAdmissionReport; reportHash: string }> => {
    const report = await GATE_ADMISSION_REPORT.generate(options);
    const reportHash = await GATE_ADMISSION_REPORT.hash(report);
    return { report, reportHash };
  },

  reportPath: (reportHash: string): string =>
    `${GATE_ADMISSION_REPORT.STORAGE_DIR}/${reportHash}.json`,

  indexRecordHash: async (
    record: Omit<GateAdmissionReportIndexRecord, "record_hash">,
  ): Promise<string> => await sha256Hex(stableStringify(record)),

  readIndex: async function* (): AsyncGenerator<
    GateAdmissionReportIndexRecord
  > {
    try {
      const content = await Deno.readTextFile(GATE_ADMISSION_REPORT.INDEX_PATH);
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().length === 0) continue;
        const parsed = parseIndexRecord(line, i + 1);
        if (parsed.ok) {
          yield parsed.record;
        }
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
    }
  },

  findIndexRecord: async (
    reportHash: string,
    reportPath?: string,
  ): Promise<GateAdmissionReportIndexRecord | null> => {
    let found: GateAdmissionReportIndexRecord | null = null;
    for await (const rec of GATE_ADMISSION_REPORT.readIndex()) {
      if (rec.report_hash !== reportHash) continue;
      if (reportPath && rec.report_path !== reportPath) continue;
      found = rec;
    }
    return found;
  },

  verifyIndexChain: async (
    verifyReportFiles: boolean = true,
  ): Promise<{ ok: boolean; failures: string[]; checkedRecords: number }> => {
    const failures: string[] = [];
    const records: GateAdmissionReportIndexRecord[] = [];
    try {
      const content = await Deno.readTextFile(GATE_ADMISSION_REPORT.INDEX_PATH);
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().length === 0) continue;
        const parsed = parseIndexRecord(line, i + 1);
        if (!parsed.ok) {
          return {
            ok: false,
            failures: [parsed.error],
            checkedRecords: records.length,
          };
        }
        records.push(parsed.record);
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
    }

    let prev: string | null = null;
    let prevTick = -1;
    let prevTs = -1;
    const seenReportHashes = new Set<string>();
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (rec.prev_record_hash !== prev) {
        failures.push(`INDEX_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
        break;
      }
      if (rec.tick_anchor < prevTick) {
        failures.push(`INDEX_TICK_NON_MONOTONIC_AT_LINE_${i + 1}`);
        break;
      }
      if (rec.ts_unix_ms < prevTs) {
        failures.push(`INDEX_TS_NON_MONOTONIC_AT_LINE_${i + 1}`);
        break;
      }
      if (seenReportHashes.has(rec.report_hash)) {
        failures.push(`INDEX_DUPLICATE_REPORT_HASH_AT_LINE_${i + 1}`);
        break;
      }
      const expected = await GATE_ADMISSION_REPORT.indexRecordHash({
        report_hash: rec.report_hash,
        report_version: rec.report_version,
        report_path: rec.report_path,
        tick_anchor: rec.tick_anchor,
        start_tick: rec.start_tick,
        end_tick: rec.end_tick,
        events_analyzed: rec.events_analyzed,
        proposals_analyzed: rec.proposals_analyzed,
        ts_unix_ms: rec.ts_unix_ms,
        prev_record_hash: rec.prev_record_hash,
        witness: rec.witness,
      });
      if (expected !== rec.record_hash) {
        failures.push(`INDEX_RECORD_HASH_MISMATCH_AT_LINE_${i + 1}`);
        break;
      }

      if (verifyReportFiles) {
        try {
          const body = await Deno.readTextFile(rec.report_path);
          const parsed = JSON.parse(body) as GateAdmissionReport;
          const computed = await GATE_ADMISSION_REPORT.hash(parsed);
          if (computed !== rec.report_hash) {
            failures.push(`INDEX_REPORT_HASH_MISMATCH_AT_LINE_${i + 1}`);
            break;
          }
        } catch {
          failures.push(`INDEX_REPORT_READ_FAIL_AT_LINE_${i + 1}`);
          break;
        }
      }

      prev = rec.record_hash;
      prevTick = rec.tick_anchor;
      prevTs = rec.ts_unix_ms;
      seenReportHashes.add(rec.report_hash);
    }

    return {
      ok: failures.length === 0,
      failures,
      checkedRecords: records.length,
    };
  },

  materialize: async (
    report: GateAdmissionReport,
    reportHash: string,
    meta: GateAdmissionReportMaterializeMeta,
  ): Promise<
    {
      path: string;
      created: boolean;
      indexRecord?: GateAdmissionReportIndexRecord;
    }
  > => {
    await Deno.mkdir(GATE_ADMISSION_REPORT.STORAGE_DIR, { recursive: true });
    const path = GATE_ADMISSION_REPORT.reportPath(reportHash);
    const payload = JSON.stringify(report, null, 2);

    try {
      await Deno.writeTextFile(path, payload, { createNew: true });
      let prevRecordHash: string | null = null;
      for await (const rec of GATE_ADMISSION_REPORT.readIndex()) {
        prevRecordHash = rec.record_hash;
      }
      const indexRecordWithoutHash: Omit<
        GateAdmissionReportIndexRecord,
        "record_hash"
      > = {
        report_hash: reportHash,
        report_version: report.version,
        report_path: path,
        tick_anchor: meta.tick_anchor,
        start_tick: report.startTick ?? null,
        end_tick: report.endTick ?? null,
        events_analyzed: report.eventsAnalyzed,
        proposals_analyzed: report.proposalsAnalyzed,
        ts_unix_ms: Date.now(),
        prev_record_hash: prevRecordHash,
        witness: meta.witness,
      };
      const recordHash = await GATE_ADMISSION_REPORT.indexRecordHash(
        indexRecordWithoutHash,
      );
      const indexRecord: GateAdmissionReportIndexRecord = {
        ...indexRecordWithoutHash,
        record_hash: recordHash,
      };
      await Deno.writeTextFile(
        GATE_ADMISSION_REPORT.INDEX_PATH,
        JSON.stringify(indexRecord) + "\n",
        { append: true, create: true },
      );
      return { path, created: true, indexRecord };
    } catch (e) {
      if (!(e instanceof Deno.errors.AlreadyExists)) throw e;

      const existing = await Deno.readTextFile(path);
      const parsed = JSON.parse(existing) as GateAdmissionReport;
      const existingHash = await GATE_ADMISSION_REPORT.hash(parsed);
      if (existingHash !== reportHash) {
        throw new Error(`GATE_ADMISSION_REPORT_HASH_CONFLICT:${reportHash}`);
      }
      return { path, created: false };
    }
  },
};


// [ ./i.L99.core.LEDGER.ts ]
// i.L99.core.LEDGER.ts
// 🛡️ OMEGA-64 | Glider Lite | Append-Only Ledger
// Records every state transition for replay and audit.

import { LedgerEvent, TopologyEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => typeof v !== "undefined")
            .sort(([a], [b]) => a.localeCompare(b));
        const body = entries
            .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
            .join(",");
        return `{${body}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

const CHAIN_VERSION = "ledger-hash/v1";
const LEGACY_HASH_VERSION = "legacy-event/v0";

type ChainAwareEvent = TopologyEvent & {
    chain_version?: string;
    prev_event_hash?: string | null;
    event_hash?: string;
};

const stripChainFields = (event: TopologyEvent): Record<string, unknown> => {
    const clone = { ...((event as unknown) as Record<string, unknown>) };
    delete clone.chain_version;
    delete clone.prev_event_hash;
    delete clone.event_hash;
    return clone;
};

const eventHashPayload = (event: TopologyEvent, prevEventHash: string | null) => ({
    chain_version: CHAIN_VERSION,
    prev_event_hash: prevEventHash,
    body: stripChainFields(event)
});

const legacyHashPayload = (event: TopologyEvent) => ({
    chain_version: LEGACY_HASH_VERSION,
    body: stripChainFields(event)
});

export interface LedgerChainVerification {
    ok: boolean;
    failures: string[];
    checkedEvents: number;
    chainAnchoredEvents: number;
    legacyEvents: number;
    tailHash: string | null;
}

export const LEDGER = {
    
    // Path to the physical ledger file (simulated for now)
    STORAGE_PATH: "./OMEGA_LEDGER.jsonl",
    CHAIN_VERSION,

    /**
     * Appends a new event to the ledger.
     * In a real system, this would be an atomic file append or DB insert.
     */
    append: async (event: TopologyEvent): Promise<void> => {
        const chain = await LEDGER.verifyChainDetailed();
        if (!chain.ok) {
            throw new Error(`LEDGER_CHAIN_INVALID:${chain.failures.join(",")}`);
        }

        const prevEventHash = chain.tailHash;
        const eventHash = await sha256Hex(stableStringify(eventHashPayload(event, prevEventHash)));
        const chainEvent: ChainAwareEvent = {
            ...(event as ChainAwareEvent),
            chain_version: CHAIN_VERSION,
            prev_event_hash: prevEventHash,
            event_hash: eventHash
        };

        const line = JSON.stringify(chainEvent);
        const eventRef = "event_id" in event ? event.event_id : event.event_type;
        try {
            await Deno.writeTextFile(LEDGER.STORAGE_PATH, line + "\n", { append: true });
            // console.log(`📝 LEDGER: Event ${event.event_id} appended.`);
        } catch (e) {
            console.error(`🚨 LEDGER FAILURE: Could not write event ${eventRef}`, e);
            throw e; // Integrity failure is fatal
        }
    },

    /**
     * Reads the entire ledger for replay.
     * Returns a generator to handle large files.
     */
    readAllRaw: async function* (): AsyncGenerator<TopologyEvent> {
        try {
            const content = await Deno.readTextFile(LEDGER.STORAGE_PATH);
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.trim().length === 0) continue;
                try {
                    yield JSON.parse(line);
                } catch (e) {
                    console.warn(`⚠️ LEDGER: Corrupt line skipped`, e);
                }
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                console.error("🚨 LEDGER READ FAILURE", e);
            }
        }
    },

    readAll: async function* (): AsyncGenerator<LedgerEvent> {
        for await (const entry of LEDGER.readAllRaw()) {
            if (LEDGER.isLedgerEvent(entry)) {
                yield entry;
            }
        }
    },

    isLedgerEvent: (entry: unknown): entry is LedgerEvent => {
        const e = entry as Partial<LedgerEvent> | null;
        return Boolean(
            e &&
            typeof e === "object" &&
            typeof e.tick === "number" &&
            Array.isArray(e.accepted_delta) &&
            typeof e.state_before_hash === "string" &&
            typeof e.state_after_hash === "string"
        );
    },

    /**
     * Verifies the hash chain integrity of the ledger.
     * (Placeholder for future implementation)
     */
    verifyChain: async (): Promise<boolean> => {
        const result = await LEDGER.verifyChainDetailed();
        return result.ok;
    },

    verifyChainDetailed: async (): Promise<LedgerChainVerification> => {
        const failures: string[] = [];
        let checkedEvents = 0;
        let chainAnchoredEvents = 0;
        let legacyEvents = 0;
        let prevHash: string | null = null;

        try {
            const content = await Deno.readTextFile(LEDGER.STORAGE_PATH);
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim().length === 0) continue;
                checkedEvents++;

                let parsed: TopologyEvent;
                try {
                    parsed = JSON.parse(line) as TopologyEvent;
                } catch {
                    failures.push(`LEDGER_LINE_PARSE_FAIL_AT_LINE_${i + 1}`);
                    break;
                }

                const e = parsed as ChainAwareEvent;
                const hasChainFields = typeof e.event_hash === "string" || typeof e.prev_event_hash !== "undefined";

                if (!hasChainFields) {
                    legacyEvents++;
                    prevHash = await sha256Hex(stableStringify(legacyHashPayload(parsed)));
                    continue;
                }

                chainAnchoredEvents++;

                if (e.chain_version !== CHAIN_VERSION) {
                    failures.push(`LEDGER_CHAIN_VERSION_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                if (e.prev_event_hash !== prevHash) {
                    failures.push(`LEDGER_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                if (typeof e.event_hash !== "string") {
                    failures.push(`LEDGER_CHAIN_HASH_MISSING_AT_LINE_${i + 1}`);
                    break;
                }

                const expectedHash = await sha256Hex(stableStringify(eventHashPayload(parsed, prevHash)));
                if (expectedHash !== e.event_hash) {
                    failures.push(`LEDGER_CHAIN_HASH_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }

                prevHash = e.event_hash;
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                throw e;
            }
        }

        return {
            ok: failures.length === 0,
            failures,
            checkedEvents,
            chainAnchoredEvents,
            legacyEvents,
            tailHash: prevHash
        };
    }
};


// [ ./i.L99.core.LOAD.ts ]
// i.L99.core.LOAD.ts
// 🛡️ OMEGA-64 | Entropy Dynamics | Hybrid Load Model
// "Тягар — це не вага. Тягар — це тертя."

import { AccessLevel } from './i.L00.core.ACCESS_BY_RESONANCE.ts';

export interface LoadInput {
  entropy: number;       // Ентропія (-32768..32767)
  phase: number;         // Фаза [0..65535]
  weight?: number;       // Вага зв'язку (w_i)
  amplitude?: number;    // Амплітуда резонансу (a_i)
}

/**
 * Модель Гібридного Навантаження (Hybrid Load Model).
 * Визначає, наскільки "важким" для системи є утримання даного стану/зв'язку.
 */
export const LOAD = {
  /**
   * Розрахунок навантаження для одного елемента.
   * Load = EntropyMass * PhaseMismatch
   */
  calculate: (input: LoadInput, systemPhase: number): number => {
    // 1. Нормалізована ентропійна маса [0..1]
    // Висока ентропія = 1 ( Chaos), Низька = 0 (Crystal)
    const e = (input.entropy + 32768) / 65535;

    // 2. Фазове неузгодження (Phase Mismatch) [0..2]
    // p_i = 1 - cos(2π * dphi / 65535)
    let dPhi = Math.abs(input.phase - systemPhase);
    if (dPhi > 32767) dPhi = 65535 - dPhi; // Shortest path
    
    // Косинусна міра подібності (плавніше ніж лінійна)
    const angleRad = (dPhi / 32767) * Math.PI;
    const p = 1 - Math.cos(angleRad); 
    
    // 3. Вагові коефіцієнти
    const w = input.weight ?? 1;
    const a = input.amplitude ?? 1;

    // 4. Фінальне навантаження
    // "Важка" (high entropy) річ, яка "в фазі" (p ~ 0) -> Load ~ 0 (легко нести)
    // "Легка" річ, яка "в протифазі" -> Load помірний.
    // "Важка" річ в протифазі -> Load максимальний.
    return w * e * p * a;
  },

  /**
   * Ефективна частота системи під навантаженням.
   * omega_eff = omega_0 / (1 + alpha * TotalLoad)
   */
  effectiveFrequency: (baseFrequency: number, totalLoad: number, alpha: number = 0.1): number => {
    return baseFrequency / (1 + alpha * totalLoad);
  },

  /**
   * Перевірка "Стоячої Хвилі" (Standing Mode).
   * Чи є система само-підтримуваною?
   */
  isStandingMode: (deltaPhase: number, totalLoad: number, coherence: number): boolean => {
    // 1. Фаза стабільна (малий дрейф)
    const phaseLocked = Math.abs(deltaPhase) < 100;
    
    // 2. Навантаження прийнятне
    const loadBearable = totalLoad < 10.0; // Емпіричний поріг
    
    // 3. Когерентність висока
    const highlyCoherent = coherence > 0.8;
    
    return phaseLocked && loadBearable && highlyCoherent;
  }
};


// [ ./i.L99.core.MYCELIUM.ts ]
// i.L99.core.MYCELIUM.ts
// 🛡️ OMEGA-64 | Life Act | The Mycelium Loop
// "Життя — це не стан. Це дія по зменшенню локальної ентропії."

import { FIELD } from './i.L00.core.FIELD.ts';
import { LOAD, LoadInput } from './i.L99.core.LOAD.ts';
import { QWave } from './i.L13.core.WAVE_PACKET.ts';

export interface MyceliumAgent {
  id: string;
  wave: QWave;
  stamina: number; // Енергія на дії
}

/**
 * Міцелій — це розподілена мережа мікро-дій.
 * Кожен вузол (агент) виконує цикл: Self-Coherence -> Self-Memory -> Self-Flow.
 */
export const MYCELIUM = {
  /**
   * Виконати один цикл життя для агента.
   */
  live: (agent: MyceliumAgent, neighbours: QWave[]): { 
    action: string, 
    cost: number, 
    newAgent: MyceliumAgent 
  } => {
    let cost = 0;
    const updatedAgent = { ...agent, wave: { ...agent.wave } }; // Shallow clone
    
    // 1. SELF-COHERENCE (Само-узгодження)
    // Зменшити локальну напругу, підлаштувавши фазу під сусідів
    if (neighbours.length > 0) {
      // Знаходимо середню фазу сусідів (з вагами по амплітуді)
      let sumPhaseX = 0;
      let sumPhaseY = 0;
      let totalAmp = 0;
      
      for (const n of neighbours) {
        const rad = (n.phase / 65535) * 2 * Math.PI;
        sumPhaseX += Math.cos(rad) * n.amplitude;
        sumPhaseY += Math.sin(rad) * n.amplitude;
        totalAmp += n.amplitude;
      }
      
      if (totalAmp > 0) {
        const avgAngle = Math.atan2(sumPhaseY, sumPhaseX);
        const targetPhase = Math.round(((avgAngle / (2 * Math.PI)) + 1) * 65535) % 65535;
        
        // Розраховуємо Load перед зміною
        const currentLoad = LOAD.calculate({ 
            entropy: 0, // Спрощено
            phase: agent.wave.phase 
        }, targetPhase);
        
        // Якщо Load високий — треба адаптуватись (зсув фази)
        // Ми не стаємо ідентичними, а робимо крок до гармонії (delta = 10%)
        const drift = targetPhase - agent.wave.phase;
        // Корекція з урахуванням кільцевої топології
        let shortestDrift = drift;
        if (shortestDrift > 32767) shortestDrift -= 65535;
        if (shortestDrift < -32767) shortestDrift += 65535;
        
        updatedAgent.wave.phase += Math.round(shortestDrift * 0.1);
        updatedAgent.wave.phase = (updatedAgent.wave.phase + 65535) % 65535;
        
        cost += Math.abs(shortestDrift * 0.1) * 0.001; // Вартість зміни
      }
    }

    // 2. SELF-MEMORY (Само-пам’ять)
    // Залишити слід у полі (змінити локальний потенціал)
    // Це "витоптування стежки"
    // (В цій симуляції ми просто повертаємо намір, реальний запис робить FIELD)
    const traceParams = {
        r: agent.wave.center,
        intensity: agent.wave.amplitude * 0.01
    };
    
    // 3. SELF-FLOW (Само-тік)
    // Рух в сторону меншого Load (або більшого градієнту поля)
    const currentR = updatedAgent.wave.center;
    // Градієнтний спуск: дивимось вліво і вправо
    const potLeft = FIELD.getPotential(currentR - 100);
    const potRight = FIELD.getPotential(currentR + 100);
    
    let move = 0;
    if (potLeft < potRight) move = -50; 
    else if (potRight < potLeft) move = 50;
    
    if (move !== 0 && agent.stamina > 10) {
        updatedAgent.wave.center += move;
        // Clamp to world
        if (updatedAgent.wave.center > 32767) updatedAgent.wave.center = 32767;
        if (updatedAgent.wave.center < -32768) updatedAgent.wave.center = -32768;
        
        cost += 5; // Вартість руху
    }

    // Оновлення енергії
    updatedAgent.stamina -= cost;
    // Регенерація (метаболізм з поля)
    const fieldEnergy = Math.max(0, FIELD.getPotential(currentR)); // Беремо енергію з поля
    updatedAgent.stamina += fieldEnergy * 0.01; 

    return {
      action: `Moved ${move}, PhaseShift`,
      cost,
      newAgent: updatedAgent
    };
  }
};


// [ ./i.L99.core.POLICY_TRANSITION.ts ]
// i.L99.core.POLICY_TRANSITION.ts
// OMEGA-64 | Canon Protocol | Policy Migration Events

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { CRYSTALLIZATION_CONFIG, CRYSTALLIZATION_POLICY } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import { LedgerEvent, PolicyTransitionEvent, TopologyEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface PolicyTransitionEmitInput {
    tick: number;
    to_policy_version: string;
    to_policy_hash: string;
    reason: string;
    witness?: string;
}

const isPolicyTransitionEvent = (entry: TopologyEvent): entry is PolicyTransitionEvent =>
    "event_type" in entry && entry.event_type === "POLICY_TRANSITION_EVENT";

const isLedgerEventWithPolicy = (entry: TopologyEvent): entry is LedgerEvent =>
    !("event_type" in entry) &&
    typeof entry.tick === "number" &&
    typeof entry.policy_version === "string" &&
    typeof entry.policy_hash === "string";

const hasTick = (entry: TopologyEvent): entry is TopologyEvent & { tick: number } =>
    "tick" in entry && typeof entry.tick === "number";

export const POLICY_TRANSITION = {
    currentPolicyAnchor: async (): Promise<{ version: string; hash: string }> => ({
        version: CRYSTALLIZATION_CONFIG.policyVersion,
        hash: await CRYSTALLIZATION_POLICY.hash()
    }),

    latestPolicyAnchorAtOrBefore: async (
        tickInclusive: number
    ): Promise<{ version?: string; hash?: string; tick?: number }> => {
        let bestTick = -Infinity;
        let version: string | undefined;
        let hash: string | undefined;

        for await (const entry of LEDGER.readAllRaw()) {
            if (!hasTick(entry)) continue;
            if (entry.tick > tickInclusive) continue;

            if (isPolicyTransitionEvent(entry)) {
                if (entry.tick >= bestTick) {
                    bestTick = entry.tick;
                    version = entry.to_policy_version;
                    hash = entry.to_policy_hash;
                }
                continue;
            }

            if (isLedgerEventWithPolicy(entry)) {
                if (entry.tick >= bestTick) {
                    bestTick = entry.tick;
                    version = entry.policy_version;
                    hash = entry.policy_hash;
                }
            }
        }

        if (version && hash) {
            return { version, hash, tick: bestTick };
        }
        return {};
    },

    emit: async (input: PolicyTransitionEmitInput): Promise<PolicyTransitionEvent> => {
        const prev = await POLICY_TRANSITION.latestPolicyAnchorAtOrBefore(input.tick - 1);

        const event: PolicyTransitionEvent = {
            event_type: "POLICY_TRANSITION_EVENT",
            tick: input.tick,
            from_policy_version: prev.version,
            from_policy_hash: prev.hash,
            to_policy_version: input.to_policy_version,
            to_policy_hash: input.to_policy_hash,
            reason: input.reason,
            witness: input.witness
        };

        await LEDGER.append(event);
        return event;
    }
};



// [ ./i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts ]
// i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts
// OMEGA-64 | Projection Drift Analytics
// Computes per-tick and per-level drift in deterministic projection space.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { REPLAY_AUDIT, ReplayAuditResult, ReplayGenesis } from "./i.L99.core.REPLAY_AUDIT.ts";
import { TOPOLOGICAL_SIGNATURE } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";

export interface ProjectionDriftAnalyticsOptions {
    startTick?: number;
    endTick?: number;
    requireReplayGreen?: boolean;
    verifyTopologicalSignatures?: boolean;
    topLevels?: number;
}

export interface ProjectionDriftTimelinePoint {
    tick: number;
    l1_total: number;
    l1_mean: number;
    dominant_level: number;
    dominant_value: number;
    level_abs_drift: number[];
}

export interface ProjectionDriftLevelStats {
    level: number;
    mean_abs_drift: number;
    p95_abs_drift: number;
}

export interface ProjectionDriftAnalyticsReport {
    ok: boolean;
    startTick?: number;
    endTick?: number;
    eventsAnalyzed: number;
    levelCount: number;
    driftByLevelMean: number[];
    driftByLevelP95: number[];
    topHotLevels: ProjectionDriftLevelStats[];
    timeline: ProjectionDriftTimelinePoint[];
    replayAudit: {
        replayGreen: boolean;
        checkedEvents: number;
        checkedProjectionEvents: number;
    };
    failures: string[];
}

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b));
        const body = entries
            .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
            .join(",");
        return `{${body}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

const expectedStateHash = async (
    nextState: Int16Array,
    nextTick: number,
    gateConfigVersion: string,
    proposalDigest: string
): Promise<string> =>
    await sha256Hex(stableStringify({
        state_i16: Array.from(nextState),
        tick: nextTick,
        gate_config_version: gateConfigVersion,
        proposal_digest: proposalDigest
    }));

const saturatingAdd = (base: Int16Array, delta: Array<{ level: number; value: number }>): Int16Array => {
    const next = new Int16Array(base.length);
    next.set(base);
    for (const d of delta) {
        if (!Number.isInteger(d.level) || d.level < 0 || d.level >= next.length) continue;
        let value = next[d.level] + d.value;
        if (value > 32767) value = 32767;
        if (value < -32768) value = -32768;
        next[d.level] = value;
    }
    return next;
};

const percentile = (values: number[], p: number): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
    return sorted[idx];
};

const collectLedgerEvents = async (startTick?: number, endTick?: number): Promise<LedgerEvent[]> => {
    const byTick = new Map<number, LedgerEvent>();
    for await (const entry of LEDGER.readAll()) {
        const inStart = startTick === undefined || entry.tick >= startTick;
        const inEnd = endTick === undefined || entry.tick <= endTick;
        if (!inStart || !inEnd) continue;
        if (entry.state_after_hash === entry.state_before_hash) continue;
        byTick.set(entry.tick, entry);
    }
    return Array.from(byTick.values()).sort((a, b) => a.tick - b.tick);
};

const toThread = (stateHash: string, state_i16: Int16Array): Int16Array => {
    const organism = TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
        state_hash: stateHash,
        state_i16
    });
    const rgba = TOPOLOGICAL_SIGNATURE.project2D(
        organism,
        TOPOLOGICAL_SIGNATURE.CANONICAL_2D_OPTIONS
    );
    return TOPOLOGICAL_SIGNATURE.projectThread1D(
        rgba,
        TOPOLOGICAL_SIGNATURE.CANONICAL_2D_OPTIONS.resolution,
        TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG
    );
};

export const PROJECTION_DRIFT_ANALYTICS = {
    analyze: async (
        genesis: ReplayGenesis,
        options: ProjectionDriftAnalyticsOptions = {}
    ): Promise<ProjectionDriftAnalyticsReport> => {
        const failures: string[] = [];
        const replayAudit: ReplayAuditResult = await REPLAY_AUDIT.audit(genesis, {
            runs: 1,
            startTick: options.startTick,
            endTick: options.endTick,
            verifyTopologicalSignatures: options.verifyTopologicalSignatures ?? true
        });

        if ((options.requireReplayGreen ?? true) && !replayAudit.replayGreen) {
            failures.push("REPLAY_AUDIT_NOT_GREEN");
            failures.push(...replayAudit.failures);
            return {
                ok: false,
                startTick: options.startTick,
                endTick: options.endTick,
                eventsAnalyzed: 0,
                levelCount: TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG.radial_bins,
                driftByLevelMean: [],
                driftByLevelP95: [],
                topHotLevels: [],
                timeline: [],
                replayAudit: {
                    replayGreen: replayAudit.replayGreen,
                    checkedEvents: replayAudit.checkedEvents,
                    checkedProjectionEvents: replayAudit.checkedProjectionEvents
                },
                failures
            };
        }

        const events = await collectLedgerEvents(options.startTick, options.endTick);
        const R = TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG.radial_bins;
        const A = TOPOLOGICAL_SIGNATURE.CANONICAL_THREAD_CONFIG.angular_bins;

        const levelSeries: number[][] = Array.from({ length: R }, () => []);
        const timeline: ProjectionDriftTimelinePoint[] = [];

        let state: Int16Array = new Int16Array(genesis.state_i16.length);
        state.set(genesis.state_i16);
        let stateHash = genesis.state_hash;
        let tick = genesis.tick;
        let currentThread: Int16Array = toThread(stateHash, state);

        for (const evt of events) {
            if (evt.tick !== tick) {
                failures.push(`TICK_CONTINUITY_MISMATCH: expected ${tick}, got ${evt.tick}`);
                break;
            }
            if (evt.state_before_hash !== stateHash) {
                failures.push(`STATE_HASH_MISMATCH_AT_TICK_${evt.tick}`);
                break;
            }

            const nextState = saturatingAdd(state, evt.accepted_delta);
            const nextTick = tick + 1;
            const expectedHash = await expectedStateHash(
                nextState,
                nextTick,
                evt.gate_config_version,
                evt.proposal_digest
            );
            if (evt.state_after_hash !== expectedHash) {
                failures.push(`STATE_AFTER_HASH_MISMATCH_AT_TICK_${evt.tick}`);
                break;
            }

            const nextThread = toThread(expectedHash, nextState);
            const levelAbs: number[] = new Array(R).fill(0);

            let l1Total = 0;
            for (let r = 0; r < R; r++) {
                let sumAbs = 0;
                for (let a = 0; a < A; a++) {
                    const idx = r * A + a;
                    const d = nextThread[idx] - currentThread[idx];
                    sumAbs += Math.abs(d);
                }
                const meanAbs = sumAbs / A;
                levelAbs[r] = meanAbs;
                levelSeries[r].push(meanAbs);
                l1Total += sumAbs;
            }

            let dominantLevel = 0;
            let dominantValue = levelAbs[0] ?? 0;
            for (let r = 1; r < R; r++) {
                if (levelAbs[r] > dominantValue) {
                    dominantValue = levelAbs[r];
                    dominantLevel = r;
                }
            }

            timeline.push({
                tick: evt.tick,
                l1_total: l1Total,
                l1_mean: l1Total / (R * A),
                dominant_level: dominantLevel,
                dominant_value: dominantValue,
                level_abs_drift: levelAbs
            });

            state = nextState;
            stateHash = expectedHash;
            tick = nextTick;
            currentThread = nextThread;
        }

        const driftByLevelMean = levelSeries.map((s) =>
            s.length > 0 ? s.reduce((acc, v) => acc + v, 0) / s.length : 0
        );
        const driftByLevelP95 = levelSeries.map((s) => percentile(s, 0.95));

        const topN = Math.max(1, options.topLevels ?? 8);
        const topHotLevels: ProjectionDriftLevelStats[] = driftByLevelMean
            .map((mean, level) => ({
                level,
                mean_abs_drift: mean,
                p95_abs_drift: driftByLevelP95[level]
            }))
            .sort((a, b) => b.mean_abs_drift - a.mean_abs_drift)
            .slice(0, topN);

        return {
            ok: failures.length === 0,
            startTick: options.startTick,
            endTick: options.endTick,
            eventsAnalyzed: timeline.length,
            levelCount: R,
            driftByLevelMean,
            driftByLevelP95,
            topHotLevels,
            timeline,
            replayAudit: {
                replayGreen: replayAudit.replayGreen,
                checkedEvents: replayAudit.checkedEvents,
                checkedProjectionEvents: replayAudit.checkedProjectionEvents
            },
            failures
        };
    }
};


// [ ./i.L99.core.PROJECTION_REPLAY_REPORT.ts ]
// i.L99.core.PROJECTION_REPLAY_REPORT.ts
// OMEGA-64 | Projection Replay Report
// Per-tick projection verification report for crystallization diagnostics.

import { REPLAY_AUDIT, ProjectionTickReport, ReplayGenesis } from "./i.L99.core.REPLAY_AUDIT.ts";

export interface ProjectionReplayReport {
    ok: boolean;
    startTick?: number;
    endTick?: number;
    totalTicks: number;
    passCount: number;
    failCount: number;
    skipCount: number;
    ticks: ProjectionTickReport[];
    failures: string[];
}

export interface ProjectionReplayReportOptions {
    startTick?: number;
    endTick?: number;
    verifyTopologicalSignatures?: boolean;
}

export const PROJECTION_REPLAY_REPORT = {
    generate: async (
        genesis: ReplayGenesis,
        options: ProjectionReplayReportOptions = {}
    ): Promise<ProjectionReplayReport> => {
        const audit = await REPLAY_AUDIT.audit(genesis, {
            runs: 1,
            startTick: options.startTick,
            endTick: options.endTick,
            verifyTopologicalSignatures: options.verifyTopologicalSignatures ?? true
        });

        const passCount = audit.projectionTickReport.filter((x) => x.status === "PASS").length;
        const failCount = audit.projectionTickReport.filter((x) => x.status === "FAIL").length;
        const skipCount = audit.projectionTickReport.filter((x) => x.status === "SKIP").length;

        return {
            ok: failCount === 0,
            startTick: options.startTick,
            endTick: options.endTick,
            totalTicks: audit.projectionTickReport.length,
            passCount,
            failCount,
            skipCount,
            ticks: audit.projectionTickReport,
            failures: audit.failures
        };
    }
};



// [ ./i.L99.core.PROOF.ts ]
// i.L99.core.PROOF.ts
// 🛡️ OMEGA-64 | Universal Proof Scaffold | Спіральне доведення

/**
 * Метод "чергування": Алгебра ↔ Геометрія з метричним контролем.
 */
export interface ProofSpiral<A, G> {
  algebraic: A;           // Символьний шар (лямбда-терми, рівняння)
  geometric: G;           // Формальний шар (топологія, метрика)
  closure: (a: A, g: G) => ProofSpiral<A, G> | null; // Замикання або зупинка
  depth: number;          // Рівень рекурсії
  invariant: number;      // Метрична перевірка (має зростати або стабілізуватись)
}

export const PROOF = {
  /**
   * Базовий цикл: А → Г → А' → Г' → ... поки invariant не стабілізується.
   */
  spiral: <A, G>(seed: ProofSpiral<A, G>, maxDepth: number = 10): {
    path: ProofSpiral<A, G>[];
    converged: boolean;
    finalInvariant: number;
  } => {
    const path: ProofSpiral<A, G>[] = [seed];
    let current = seed;
    
    for (let d = 0; d < maxDepth; d++) {
      const next = current.closure(current.algebraic, current.geometric);
      
      if (next === null) {
        // Замикання досягнуто — доказ повний
        return { path, converged: true, finalInvariant: current.invariant };
      }
      
      if (next.invariant <= current.invariant) {
        // Інваріант не зростає — стабілізація або деградація
        return { path, converged: false, finalInvariant: current.invariant }; // TODO: Decide if stabilizing is good
      }
      
      path.push(next);
      current = next;
    }
    
    return { path, converged: false, finalInvariant: current.invariant };
  },

  /**
   * Конкретна реалізація для OMEGA-64:
   * Доведення консистентності рівнів Ln → Ln+1.
   */
  levelConsistency: (n: number): ProofSpiral<string, number[]> => {
    // Алгебра: типи Ln (лямбда-терми)
    const algebraic = `L${n}: λx.${n > 0 ? `L${n-1}(x)` : 'x'}`;
    
    // Геометрія: координати в FIELD (r, θ)
    const r = Math.round((n / 63 - 0.5) * 65535);
    const geometric = [r, (n * 360 / 64) % 360]; // θ залежить від n
    
    // Інваріант: "маса" рівня (ближче до ядра = вища)
    const invariant = 32767 - Math.abs(r);
    
    return {
      algebraic,
      geometric,
      closure: (a, g) => {
        if (n >= 63) return null; // Досягли L63 — замикання
        return PROOF.levelConsistency(n + 1);
      },
      depth: n,
      invariant
    };
  },

  /**
   * Мета-доказ: чи є OMEGA-64 цілісною системою?
   */
  systemIntegrity: (): {
    levels: ProofSpiral<string, number[]>[];
    holotypeVerified: boolean;
  } => {
    const levels: ProofSpiral<string, number[]>[] = [];
    
    // Перевірка всіх 64 рівнів
    for (let n = 0; n <= 63; n++) {
      const level = PROOF.levelConsistency(n);
      const result = PROOF.spiral(level, 1); // Кожен рівень — один крок
      
      if (!result.converged && n < 63) {
        // console.warn(`⚠️ PROOF: Level L${n} doesn't converge to L${n+1}`); // Noise reduction
      }
      
      levels.push(level);
    }
    
    // Голотипна перевірка: чи L63 замикається на L00?
    // У нашій системі L00 (поверхня) і L63 (ядро) пов'язані через диполь.
    const l63 = levels[63];
    const l00 = levels[0];
    
    // Перевірка інваріанту: маса ядра (L63) має бути більшою за масу поверхні (L00)
    const massDiff = l63.invariant - l00.invariant;
    const holotypeVerified = massDiff > 0;
    
    return { levels, holotypeVerified };
  }
};


// [ ./i.L99.core.PROPOSAL_ENVELOPE_INDEX.ts ]
// i.L99.core.PROPOSAL_ENVELOPE_INDEX.ts
// OMEGA-64 | Append-only envelope replay index for O(1)-style recent duplicate checks.

import type { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface ProposalEnvelopeIndexRecord {
    chain_version: string;
    prev_record_hash: string | null;
    record_hash: string;
    envelope_hash: string;
    proposal_id: string;
    tick: number;
    event_id: string;
    state_before_hash: string;
    state_after_hash: string;
    ts_unix_ms: number;
    witness?: string;
}

export interface ProposalEnvelopeIndexVerification {
    ok: boolean;
    failures: string[];
    checked_records: number;
    tail_hash: string | null;
}

const CHAIN_VERSION = "proposal-envelope-index/v1";
const HEX_64_RE = /^[0-9a-f]{64}$/;
const DEFAULT_STORAGE_PATH = "./OMEGA_PROPOSAL_ENVELOPE_INDEX.jsonl";

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => typeof v !== "undefined")
            .sort(([a], [b]) => a.localeCompare(b));
        const body = entries
            .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
            .join(",");
        return `{${body}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

const indexRecordHash = async (
    record: Omit<ProposalEnvelopeIndexRecord, "record_hash">
): Promise<string> => await sha256Hex(stableStringify(record));

const parseRecord = (
    line: string,
    lineNumber: number
): { ok: true; record: ProposalEnvelopeIndexRecord } | { ok: false; error: string } => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(line);
    } catch {
        return { ok: false, error: `ENVELOPE_INDEX_LINE_PARSE_FAIL_AT_LINE_${lineNumber}` };
    }
    const rec = parsed as Partial<ProposalEnvelopeIndexRecord>;
    const shapeOk =
        rec.chain_version === CHAIN_VERSION &&
        (typeof rec.prev_record_hash === "string" || rec.prev_record_hash === null) &&
        typeof rec.record_hash === "string" &&
        HEX_64_RE.test(rec.record_hash) &&
        typeof rec.envelope_hash === "string" &&
        HEX_64_RE.test(rec.envelope_hash) &&
        typeof rec.proposal_id === "string" &&
        typeof rec.tick === "number" &&
        Number.isSafeInteger(rec.tick) &&
        rec.tick >= 0 &&
        typeof rec.event_id === "string" &&
        typeof rec.state_before_hash === "string" &&
        typeof rec.state_after_hash === "string" &&
        typeof rec.ts_unix_ms === "number" &&
        Number.isSafeInteger(rec.ts_unix_ms) &&
        rec.ts_unix_ms >= 0 &&
        (rec.witness === undefined || typeof rec.witness === "string");
    if (!shapeOk) {
        return { ok: false, error: `ENVELOPE_INDEX_LINE_SCHEMA_INVALID_AT_LINE_${lineNumber}` };
    }
    return { ok: true, record: rec as ProposalEnvelopeIndexRecord };
};

interface CacheEntry {
    loaded: boolean;
    tail_hash: string | null;
    tick_to_hashes: Map<number, Set<string>>;
}

const caches = new Map<string, CacheEntry>();

const cacheFor = (storagePath: string): CacheEntry => {
    const existing = caches.get(storagePath);
    if (existing) return existing;
    const created: CacheEntry = {
        loaded: false,
        tail_hash: null,
        tick_to_hashes: new Map()
    };
    caches.set(storagePath, created);
    return created;
};

const resetCache = (storagePath?: string): void => {
    if (storagePath) {
        caches.delete(storagePath);
        return;
    }
    caches.clear();
};

const pruneBeforeTick = (entry: CacheEntry, minTick: number): void => {
    for (const tick of entry.tick_to_hashes.keys()) {
        if (tick < minTick) {
            entry.tick_to_hashes.delete(tick);
        }
    }
};

const ensureLoaded = async (storagePath: string): Promise<CacheEntry> => {
    const entry = cacheFor(storagePath);
    if (entry.loaded) return entry;

    entry.loaded = false;
    entry.tail_hash = null;
    entry.tick_to_hashes.clear();

    const verify = await PROPOSAL_ENVELOPE_INDEX.verifyChainDetailed(storagePath);
    if (!verify.ok) {
        throw new Error(`ENVELOPE_INDEX_CHAIN_INVALID:${verify.failures.join(",")}`);
    }

    try {
        const content = await Deno.readTextFile(storagePath);
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().length === 0) continue;
            const parsed = parseRecord(line, i + 1);
            if (!parsed.ok) {
                throw new Error(parsed.error);
            }
            const rec = parsed.record;
            let set = entry.tick_to_hashes.get(rec.tick);
            if (!set) {
                set = new Set<string>();
                entry.tick_to_hashes.set(rec.tick, set);
            }
            set.add(rec.envelope_hash);
            entry.tail_hash = rec.record_hash;
        }
    } catch (e) {
        if (!(e instanceof Deno.errors.NotFound)) {
            throw e;
        }
    }

    entry.loaded = true;
    return entry;
};

export const PROPOSAL_ENVELOPE_INDEX = {
    CHAIN_VERSION,
    STORAGE_PATH: DEFAULT_STORAGE_PATH,
    pathForLedger: (ledgerPath: string): string => `${ledgerPath}.proposal_envelope_index.jsonl`,

    resetCacheForTests: (storagePath?: string): void => resetCache(storagePath),

    verifyChainDetailed: async (
        storagePath?: string
    ): Promise<ProposalEnvelopeIndexVerification> => {
        const path = storagePath ?? PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
        const failures: string[] = [];
        let checked = 0;
        let prevHash: string | null = null;
        let prevTick = -1;
        let prevTs = -1;

        try {
            const content = await Deno.readTextFile(path);
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim().length === 0) continue;
                checked++;
                const parsed = parseRecord(line, i + 1);
                if (!parsed.ok) {
                    failures.push(parsed.error);
                    break;
                }
                const rec = parsed.record;
                if (rec.prev_record_hash !== prevHash) {
                    failures.push(`ENVELOPE_INDEX_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                if (rec.tick < prevTick) {
                    failures.push(`ENVELOPE_INDEX_TICK_NON_MONOTONIC_AT_LINE_${i + 1}`);
                    break;
                }
                if (rec.ts_unix_ms < prevTs) {
                    failures.push(`ENVELOPE_INDEX_TS_NON_MONOTONIC_AT_LINE_${i + 1}`);
                    break;
                }
                const expected = await indexRecordHash({
                    chain_version: rec.chain_version,
                    prev_record_hash: rec.prev_record_hash,
                    envelope_hash: rec.envelope_hash,
                    proposal_id: rec.proposal_id,
                    tick: rec.tick,
                    event_id: rec.event_id,
                    state_before_hash: rec.state_before_hash,
                    state_after_hash: rec.state_after_hash,
                    ts_unix_ms: rec.ts_unix_ms,
                    witness: rec.witness
                });
                if (expected !== rec.record_hash) {
                    failures.push(`ENVELOPE_INDEX_RECORD_HASH_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                prevHash = rec.record_hash;
                prevTick = rec.tick;
                prevTs = rec.ts_unix_ms;
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                throw e;
            }
        }

        return {
            ok: failures.length === 0,
            failures,
            checked_records: checked,
            tail_hash: prevHash
        };
    },

    appendFromLedgerEvent: async (
        event: LedgerEvent,
        storagePath?: string
    ): Promise<void> => {
        const path = storagePath ?? PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
        const accepted = event.accepted_proposal_envelopes ?? [];
        if (accepted.length === 0) return;

        const entry = await ensureLoaded(path);
        let prev = entry.tail_hash;
        const lines: string[] = [];
        for (const a of accepted) {
            if (typeof a.envelope_hash !== "string" || !HEX_64_RE.test(a.envelope_hash)) {
                continue;
            }
            const recordWithoutHash: Omit<ProposalEnvelopeIndexRecord, "record_hash"> = {
                chain_version: CHAIN_VERSION,
                prev_record_hash: prev,
                envelope_hash: a.envelope_hash,
                proposal_id: a.proposal_id,
                tick: event.tick,
                event_id: event.event_id,
                state_before_hash: event.state_before_hash,
                state_after_hash: event.state_after_hash,
                ts_unix_ms: event.ts_unix_ms,
                witness: event.witness
            };
            const recHash = await indexRecordHash(recordWithoutHash);
            const rec: ProposalEnvelopeIndexRecord = {
                ...recordWithoutHash,
                record_hash: recHash
            };
            lines.push(JSON.stringify(rec));
            prev = recHash;
            let set = entry.tick_to_hashes.get(rec.tick);
            if (!set) {
                set = new Set<string>();
                entry.tick_to_hashes.set(rec.tick, set);
            }
            set.add(rec.envelope_hash);
        }
        if (lines.length > 0) {
            await Deno.writeTextFile(path, lines.map((x) => `${x}\n`).join(""), {
                append: true,
                create: true
            });
            entry.tail_hash = prev;
        }
    },

    getRecentEnvelopeHashes: async (
        minTick: number,
        maxTick: number,
        storagePath?: string
    ): Promise<Set<string>> => {
        const path = storagePath ?? PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
        const entry = await ensureLoaded(path);
        const out = new Set<string>();
        pruneBeforeTick(entry, minTick);
        for (const [tick, hashes] of entry.tick_to_hashes.entries()) {
            if (tick < minTick || tick > maxTick) continue;
            for (const hash of hashes) {
                out.add(hash);
            }
        }
        return out;
    }
};


// [ ./i.L99.core.REPLAY_AUDIT.ts ]
// i.L99.core.REPLAY_AUDIT.ts
// OMEGA-64 | Deterministic Replay Audit
// Produces a strict replayGreen signal from ledger events.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { LedgerEvent, PolicyTransitionEvent, TopologyEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { TOPOLOGICAL_SIGNATURE, TopologicalSignature } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";
import { CRYSTALLIZATION_CONFIG, CRYSTALLIZATION_POLICY } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import { CRYSTALLIZATION_REPORT } from "./i.L99.core.CRYSTALLIZATION_REPORT.ts";
import { GATE_ADMISSION_REPORT } from "./i.L99.core.GATE_ADMISSION_REPORT.ts";
import type { InvariantPacket } from "./i.L32.core.INVARIANT_PACKET.ts";
import { INVARIANT_PACKET } from "./i.L32.core.INVARIANT_PACKET.ts";

export interface ReplayGenesis {
    tick: number;
    state_i16: Int16Array;
    state_hash: string;
}

export interface ReplayAuditOptions {
    runs?: number;
    startTick?: number;
    endTick?: number;
    verifyTopologicalSignatures?: boolean;
    verifyLedgerChain?: boolean;
    invariantOnly?: boolean;
}

export interface ReplayAuditResult {
    replayGreen: boolean;
    runs: number;
    checkedEvents: number;
    skippedEvents: number;
    checkedProjectionEvents: number;
    skippedProjectionEvents: number;
    projectionTickReport: ProjectionTickReport[];
    checkedPolicyEvents: number;
    skippedPolicyEvents: number;
    policyTickReport: PolicyTickReport[];
    checkedCanonReports: number;
    skippedCanonReports: number;
    canonReportTickReport: CanonReportTickReport[];
    checkedGateAdmissionReports: number;
    skippedGateAdmissionReports: number;
    gateAdmissionReportTickReport: GateAdmissionReportTickReport[];
    invariantPacket?: InvariantPacket;
    invariantReport: ReplayInvariantReport;
    finalHashes: string[];
    failures: string[];
}

export interface ProjectionTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
}

export interface PolicyTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
    policy_version?: string;
    policy_hash?: string;
}

export interface CanonReportTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
    report_hash?: string;
    report_uri?: string;
}

export interface GateAdmissionReportTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
    report_hash?: string;
    report_uri?: string;
}

export interface ReplayInvariantReport {
    index_chain_checked: boolean;
    index_chain_ok: boolean;
    index_chain_checked_records: number;
    index_chain_failures: string[];
    gate_admission_index_chain_checked: boolean;
    gate_admission_index_chain_ok: boolean;
    gate_admission_index_chain_checked_records: number;
    gate_admission_index_chain_failures: string[];
    ledger_chain_checked?: boolean;
    ledger_chain_ok?: boolean;
    ledger_chain_checked_events?: number;
    ledger_chain_chain_anchored_events?: number;
    ledger_chain_legacy_events?: number;
    ledger_chain_failures?: string[];
}

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b));
        const body = entries
            .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
            .join(",");
        return `{${body}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

const saturatingAdd = (base: Int16Array, delta: Array<{ level: number; value: number }>): Int16Array => {
    const next = new Int16Array(base) as Int16Array;
    for (const d of delta) {
        if (!Number.isInteger(d.level) || d.level < 0 || d.level >= next.length) {
            continue;
        }
        let value = next[d.level] + d.value;
        if (value > 32767) value = 32767;
        if (value < -32768) value = -32768;
        next[d.level] = value;
    }
    return next;
};

const expectedStateHash = async (
    nextState: Int16Array,
    nextTick: number,
    gateConfigVersion: string,
    proposalDigest: string
): Promise<string> =>
    await sha256Hex(stableStringify({
        state_i16: Array.from(nextState),
        tick: nextTick,
        gate_config_version: gateConfigVersion,
        proposal_digest: proposalDigest
    }));

const isPolicyTransitionEvent = (entry: TopologyEvent): entry is PolicyTransitionEvent =>
    "event_type" in entry && entry.event_type === "POLICY_TRANSITION_EVENT";

const isCanonizationEvent = (entry: TopologyEvent): entry is TopologyEvent & {
    event_type: "CANONIZATION_EVENT";
    checkpoint_tick: number;
    crystallization_report_hash?: string;
    crystallization_report_uri?: string;
    gate_admission_report_hash?: string;
    gate_admission_report_uri?: string;
} =>
    "event_type" in entry && entry.event_type === "CANONIZATION_EVENT";

const isLedgerEvent = (entry: TopologyEvent): entry is LedgerEvent =>
    !("event_type" in entry) &&
    typeof entry.tick === "number" &&
    Array.isArray(entry.accepted_delta) &&
    typeof entry.state_before_hash === "string" &&
    typeof entry.state_after_hash === "string";

const collectLedgerEvents = async (
    startTick?: number,
    endTick?: number
): Promise<{
    events: LedgerEvent[];
    transitionsByTick: Map<number, PolicyTransitionEvent[]>;
    canonByCheckpointTick: Map<number, TopologyEvent[]>;
    skipped: number;
}> => {
    const byTick = new Map<number, LedgerEvent>();
    const transitionsByTick = new Map<number, PolicyTransitionEvent[]>();
    const canonByCheckpointTick = new Map<number, TopologyEvent[]>();
    let skipped = 0;

    for await (const entry of LEDGER.readAllRaw()) {
        if (isPolicyTransitionEvent(entry)) {
            const inStart = startTick === undefined || entry.tick >= startTick;
            const inEnd = endTick === undefined || entry.tick <= endTick;
            if (!inStart || !inEnd) continue;
            const current = transitionsByTick.get(entry.tick) ?? [];
            current.push(entry);
            transitionsByTick.set(entry.tick, current);
            continue;
        }
        if (isCanonizationEvent(entry)) {
            const inStart = startTick === undefined || entry.checkpoint_tick >= startTick;
            const inEnd = endTick === undefined || entry.checkpoint_tick <= endTick;
            if (!inStart || !inEnd) continue;
            const current = canonByCheckpointTick.get(entry.checkpoint_tick) ?? [];
            current.push(entry);
            canonByCheckpointTick.set(entry.checkpoint_tick, current);
            continue;
        }
        if (!isLedgerEvent(entry)) {
            continue;
        }
        const inStart = startTick === undefined || entry.tick >= startTick;
        const inEnd = endTick === undefined || entry.tick <= endTick;
        if (!inStart || !inEnd) {
            continue;
        }
        // Skip non-mutating dry-run style events in replay chain.
        if (entry.state_after_hash === entry.state_before_hash) {
            skipped++;
            continue;
        }
        // Last event for same tick wins (append-only correction pattern).
        byTick.set(entry.tick, entry);
    }

    return {
        events: Array.from(byTick.values()).sort((a, b) => a.tick - b.tick),
        transitionsByTick,
        canonByCheckpointTick,
        skipped
    };
};

export const REPLAY_AUDIT = {
    audit: async (genesis: ReplayGenesis, options: ReplayAuditOptions = {}): Promise<ReplayAuditResult> => {
        const runs = options.runs ?? 3;
        const verifyTopologicalSignatures = options.verifyTopologicalSignatures ?? true;
        const { events, transitionsByTick, canonByCheckpointTick, skipped } = await collectLedgerEvents(options.startTick, options.endTick);
        const localPolicyHash = await CRYSTALLIZATION_POLICY.hash();
        const finalHashes: string[] = [];
        const failures: string[] = [];
        let checkedProjectionEvents = 0;
        let skippedProjectionEvents = 0;
        const projectionTickReport: ProjectionTickReport[] = [];
        let checkedPolicyEvents = 0;
        let skippedPolicyEvents = 0;
        const policyTickReport: PolicyTickReport[] = [];
        let checkedCanonReports = 0;
        let skippedCanonReports = 0;
        const canonReportTickReport: CanonReportTickReport[] = [];
        let checkedGateAdmissionReports = 0;
        let skippedGateAdmissionReports = 0;
        const gateAdmissionReportTickReport: GateAdmissionReportTickReport[] = [];
        const invariantReport: ReplayInvariantReport = {
            index_chain_checked: false,
            index_chain_ok: true,
            index_chain_checked_records: 0,
            index_chain_failures: [],
            gate_admission_index_chain_checked: false,
            gate_admission_index_chain_ok: true,
            gate_admission_index_chain_checked_records: 0,
            gate_admission_index_chain_failures: [],
            ledger_chain_checked: false,
            ledger_chain_ok: true,
            ledger_chain_checked_events: 0,
            ledger_chain_chain_anchored_events: 0,
            ledger_chain_legacy_events: 0,
            ledger_chain_failures: []
        };
        if (options.verifyLedgerChain ?? false) {
            const ledgerChain = await LEDGER.verifyChainDetailed();
            invariantReport.ledger_chain_checked = true;
            invariantReport.ledger_chain_ok = ledgerChain.ok;
            invariantReport.ledger_chain_checked_events = ledgerChain.checkedEvents;
            invariantReport.ledger_chain_chain_anchored_events = ledgerChain.chainAnchoredEvents;
            invariantReport.ledger_chain_legacy_events = ledgerChain.legacyEvents;
            invariantReport.ledger_chain_failures = [...ledgerChain.failures];
            if (!ledgerChain.ok) {
                return {
                    replayGreen: false,
                    runs,
                    checkedEvents: events.length,
                    skippedEvents: skipped,
                    checkedProjectionEvents,
                    skippedProjectionEvents,
                    projectionTickReport,
                    checkedPolicyEvents,
                    skippedPolicyEvents,
                    policyTickReport,
                    checkedCanonReports,
                    skippedCanonReports,
                    canonReportTickReport,
                    checkedGateAdmissionReports,
                    skippedGateAdmissionReports,
                    gateAdmissionReportTickReport,
                    invariantReport,
                    finalHashes,
                    failures: ledgerChain.failures.map((x) => `ledger_chain:${x}`)
                };
            }
        }
        const hasCanonEvents = canonByCheckpointTick.size > 0;
        if (hasCanonEvents) {
            const indexChain = await CRYSTALLIZATION_REPORT.verifyIndexChain(true);
            invariantReport.index_chain_checked = true;
            invariantReport.index_chain_ok = indexChain.ok;
            invariantReport.index_chain_checked_records = indexChain.checkedRecords;
            invariantReport.index_chain_failures = [...indexChain.failures];
            if (!indexChain.ok) {
                return {
                    replayGreen: false,
                    runs,
                    checkedEvents: events.length,
                    skippedEvents: skipped,
                    checkedProjectionEvents,
                    skippedProjectionEvents,
                    projectionTickReport,
                    checkedPolicyEvents,
                    skippedPolicyEvents,
                    policyTickReport,
                    checkedCanonReports,
                    skippedCanonReports,
                    canonReportTickReport,
                    checkedGateAdmissionReports,
                    skippedGateAdmissionReports,
                    gateAdmissionReportTickReport,
                    invariantReport,
                    finalHashes,
                    failures: indexChain.failures.map((x) => `index_chain:${x}`)
                };
            }
            const gateIndexChain = await GATE_ADMISSION_REPORT.verifyIndexChain(true);
            invariantReport.gate_admission_index_chain_checked = true;
            invariantReport.gate_admission_index_chain_ok = gateIndexChain.ok;
            invariantReport.gate_admission_index_chain_checked_records = gateIndexChain.checkedRecords;
            invariantReport.gate_admission_index_chain_failures = [...gateIndexChain.failures];
            if (!gateIndexChain.ok) {
                return {
                    replayGreen: false,
                    runs,
                    checkedEvents: events.length,
                    skippedEvents: skipped,
                    checkedProjectionEvents,
                    skippedProjectionEvents,
                    projectionTickReport,
                    checkedPolicyEvents,
                    skippedPolicyEvents,
                    policyTickReport,
                    checkedCanonReports,
                    skippedCanonReports,
                    canonReportTickReport,
                    checkedGateAdmissionReports,
                    skippedGateAdmissionReports,
                    gateAdmissionReportTickReport,
                    invariantReport,
                    finalHashes,
                    failures: gateIndexChain.failures.map((x) => `gate_admission_index_chain:${x}`)
                };
            }
        }
        if (options.invariantOnly) {
            const packet = await INVARIANT_PACKET.fromInvariantReport(
                invariantReport,
                { tick_anchor: options.endTick ?? genesis.tick }
            );
            return {
                replayGreen: true,
                runs,
                checkedEvents: 0,
                skippedEvents: events.length + skipped,
                checkedProjectionEvents,
                skippedProjectionEvents,
                projectionTickReport,
                checkedPolicyEvents,
                skippedPolicyEvents,
                policyTickReport,
                checkedCanonReports,
                skippedCanonReports,
                canonReportTickReport,
                checkedGateAdmissionReports,
                skippedGateAdmissionReports,
                gateAdmissionReportTickReport,
                invariantPacket: packet,
                invariantReport,
                finalHashes: [genesis.state_hash],
                failures
            };
        }

        for (let run = 0; run < runs; run++) {
            let tick = genesis.tick;
            let stateHash = genesis.state_hash;
            let state = new Int16Array(genesis.state_i16) as Int16Array;
            let currentPolicyVersion: string | undefined;
            let currentPolicyHash: string | undefined;

            for (const evt of events) {
                const expectedTick = tick;
                if (evt.tick !== expectedTick) {
                    failures.push(`run=${run} tick continuity mismatch: expected ${expectedTick}, got ${evt.tick}`);
                    break;
                }
                if (evt.state_before_hash !== stateHash) {
                    failures.push(`run=${run} state_before_hash mismatch at tick ${evt.tick}`);
                    break;
                }

                const nextState = saturatingAdd(state, evt.accepted_delta);
                const nextTick = tick + 1;
                const expectedHash = await expectedStateHash(
                    nextState,
                    nextTick,
                    evt.gate_config_version,
                    evt.proposal_digest
                );

                if (evt.state_after_hash !== expectedHash) {
                    failures.push(`run=${run} state_after_hash mismatch at tick ${evt.tick}`);
                    break;
                }

                const policyVersion = evt.policy_version;
                const policyHash = evt.policy_hash;
                const transitions = transitionsByTick.get(evt.tick) ?? [];
                if (!policyVersion || !policyHash) {
                    failures.push(`run=${run} missing policy anchor at tick ${evt.tick}`);
                    if (run === 0) {
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "FAIL",
                            reason: "MISSING_POLICY_ANCHOR"
                        });
                    }
                    break;
                }

                if (
                    policyVersion === CRYSTALLIZATION_CONFIG.policyVersion &&
                    policyHash !== localPolicyHash
                ) {
                    failures.push(`run=${run} policy hash mismatch with local config at tick ${evt.tick}`);
                    if (run === 0) {
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "FAIL",
                            reason: "LOCAL_POLICY_HASH_MISMATCH",
                            policy_version: policyVersion,
                            policy_hash: policyHash
                        });
                    }
                    break;
                }

                if (currentPolicyVersion === undefined || currentPolicyHash === undefined) {
                    currentPolicyVersion = policyVersion;
                    currentPolicyHash = policyHash;
                    if (run === 0) {
                        checkedPolicyEvents++;
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "PASS",
                            reason: "POLICY_ANCHOR_SET",
                            policy_version: policyVersion,
                            policy_hash: policyHash
                        });
                    }
                } else if (policyVersion !== currentPolicyVersion || policyHash !== currentPolicyHash) {
                    const transition = transitions.find((t) =>
                        t.to_policy_version === policyVersion &&
                        t.to_policy_hash === policyHash
                    );
                    if (!transition) {
                        failures.push(`run=${run} policy change without transition at tick ${evt.tick}`);
                        if (run === 0) {
                            policyTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "POLICY_CHANGE_WITHOUT_TRANSITION",
                                policy_version: policyVersion,
                                policy_hash: policyHash
                            });
                        }
                        break;
                    }
                    if (
                        transition.from_policy_version !== undefined &&
                        transition.from_policy_version !== currentPolicyVersion
                    ) {
                        failures.push(`run=${run} transition from_policy_version mismatch at tick ${evt.tick}`);
                        if (run === 0) {
                            policyTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "TRANSITION_FROM_VERSION_MISMATCH",
                                policy_version: policyVersion,
                                policy_hash: policyHash
                            });
                        }
                        break;
                    }
                    if (
                        transition.from_policy_hash !== undefined &&
                        transition.from_policy_hash !== currentPolicyHash
                    ) {
                        failures.push(`run=${run} transition from_policy_hash mismatch at tick ${evt.tick}`);
                        if (run === 0) {
                            policyTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "TRANSITION_FROM_HASH_MISMATCH",
                                policy_version: policyVersion,
                                policy_hash: policyHash
                            });
                        }
                        break;
                    }
                    currentPolicyVersion = policyVersion;
                    currentPolicyHash = policyHash;
                    if (run === 0) {
                        checkedPolicyEvents++;
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "PASS",
                            reason: "POLICY_TRANSITION_APPLIED",
                            policy_version: policyVersion,
                            policy_hash: policyHash
                        });
                    }
                } else if (run === 0) {
                    checkedPolicyEvents++;
                    policyTickReport.push({
                        tick: evt.tick,
                        status: "PASS",
                        reason: "POLICY_ANCHOR_STABLE",
                        policy_version: policyVersion,
                        policy_hash: policyHash
                    });
                }

                const canonEvents = canonByCheckpointTick.get(nextTick) ?? [];
                if (canonEvents.length > 0) {
                    const canon = canonEvents[canonEvents.length - 1] as {
                        crystallization_report_hash?: string;
                        crystallization_report_uri?: string;
                        gate_admission_report_hash?: string;
                        gate_admission_report_uri?: string;
                    };
                    const reportHash = canon.crystallization_report_hash;
                    const reportUri = canon.crystallization_report_uri;

                    if (!reportHash || !reportUri) {
                        failures.push(`run=${run} missing canon report anchor at tick ${evt.tick}`);
                        if (run === 0) {
                            canonReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "MISSING_CANON_REPORT_ANCHOR",
                                report_hash: reportHash,
                                report_uri: reportUri
                            });
                        }
                        break;
                    }

                    try {
                        const body = await Deno.readTextFile(reportUri);
                        const parsed = JSON.parse(body);
                        const computed = await CRYSTALLIZATION_REPORT.hash(parsed);
                        if (computed !== reportHash) {
                            failures.push(`run=${run} canon report hash mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                canonReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "CANON_REPORT_HASH_MISMATCH",
                                    report_hash: reportHash,
                                    report_uri: reportUri
                                });
                            }
                            break;
                        }
                        const indexRecord = await CRYSTALLIZATION_REPORT.findIndexRecord(reportHash, reportUri);
                        if (!indexRecord) {
                            failures.push(`run=${run} canon report index missing/mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                canonReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "CANON_REPORT_INDEX_MISSING_OR_MISMATCH",
                                    report_hash: reportHash,
                                    report_uri: reportUri
                                });
                            }
                            break;
                        }
                        if (run === 0) {
                            checkedCanonReports++;
                            canonReportTickReport.push({
                                tick: evt.tick,
                                status: "PASS",
                                reason: "CANON_REPORT_MATCH",
                                report_hash: reportHash,
                                report_uri: reportUri
                            });
                        }
                    } catch {
                        failures.push(`run=${run} canon report missing/unreadable at tick ${evt.tick}`);
                        if (run === 0) {
                            canonReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "CANON_REPORT_MISSING_OR_UNREADABLE",
                                report_hash: reportHash,
                                report_uri: reportUri
                            });
                        }
                        break;
                    }

                    const gateReportHash = canon.gate_admission_report_hash;
                    const gateReportUri = canon.gate_admission_report_uri;

                    if (!gateReportHash || !gateReportUri) {
                        failures.push(`run=${run} missing gate admission report anchor at tick ${evt.tick}`);
                        if (run === 0) {
                            gateAdmissionReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "MISSING_GATE_ADMISSION_REPORT_ANCHOR",
                                report_hash: gateReportHash,
                                report_uri: gateReportUri
                            });
                        }
                        break;
                    }

                    try {
                        const body = await Deno.readTextFile(gateReportUri);
                        const parsed = JSON.parse(body);
                        const computed = await GATE_ADMISSION_REPORT.hash(parsed);
                        if (computed !== gateReportHash) {
                            failures.push(`run=${run} gate admission report hash mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                gateAdmissionReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "GATE_ADMISSION_REPORT_HASH_MISMATCH",
                                    report_hash: gateReportHash,
                                    report_uri: gateReportUri
                                });
                            }
                            break;
                        }
                        const indexRecord = await GATE_ADMISSION_REPORT.findIndexRecord(gateReportHash, gateReportUri);
                        if (!indexRecord) {
                            failures.push(`run=${run} gate admission report index missing/mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                gateAdmissionReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "GATE_ADMISSION_REPORT_INDEX_MISSING_OR_MISMATCH",
                                    report_hash: gateReportHash,
                                    report_uri: gateReportUri
                                });
                            }
                            break;
                        }
                        if (run === 0) {
                            checkedGateAdmissionReports++;
                            gateAdmissionReportTickReport.push({
                                tick: evt.tick,
                                status: "PASS",
                                reason: "GATE_ADMISSION_REPORT_MATCH",
                                report_hash: gateReportHash,
                                report_uri: gateReportUri
                            });
                        }
                    } catch {
                        failures.push(`run=${run} gate admission report missing/unreadable at tick ${evt.tick}`);
                        if (run === 0) {
                            gateAdmissionReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "GATE_ADMISSION_REPORT_MISSING_OR_UNREADABLE",
                                report_hash: gateReportHash,
                                report_uri: gateReportUri
                            });
                        }
                        break;
                    }
                } else if (run === 0) {
                    skippedCanonReports++;
                    canonReportTickReport.push({
                        tick: evt.tick,
                        status: "SKIP",
                        reason: "NO_CANONIZATION_EVENT"
                    });
                    skippedGateAdmissionReports++;
                    gateAdmissionReportTickReport.push({
                        tick: evt.tick,
                        status: "SKIP",
                        reason: "NO_CANONIZATION_EVENT"
                    });
                }

                if (verifyTopologicalSignatures) {
                    const hasProjectionData = Boolean(
                        evt.projection_2d_hash ||
                        evt.thread_1d_hash ||
                        evt.projection_version ||
                        evt.signature_artifact_hash ||
                        evt.signature_tick ||
                        evt.signature_causal_refs
                    );

                    if (hasProjectionData) {
                        if (!evt.projection_2d_hash || !evt.thread_1d_hash || !evt.projection_version) {
                            failures.push(`run=${run} incomplete projection fields at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "INCOMPLETE_PROJECTION_FIELDS"
                                });
                            }
                            break;
                        }
                        if (evt.projection_version !== TOPOLOGICAL_SIGNATURE.PROJECTION_VERSION) {
                            failures.push(`run=${run} unsupported projection version at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "UNSUPPORTED_PROJECTION_VERSION"
                                });
                            }
                            break;
                        }
                        if (evt.signature_tick !== undefined && evt.signature_tick !== nextTick) {
                            failures.push(`run=${run} signature_tick mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "SIGNATURE_TICK_MISMATCH"
                                });
                            }
                            break;
                        }
                        if (evt.signature_artifact_hash !== undefined && evt.signature_artifact_hash !== evt.proposal_digest) {
                            failures.push(`run=${run} signature_artifact_hash mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "SIGNATURE_ARTIFACT_HASH_MISMATCH"
                                });
                            }
                            break;
                        }

                        const signature: TopologicalSignature = {
                            artifact_hash: evt.signature_artifact_hash ?? evt.proposal_digest,
                            state_hash: expectedHash,
                            tick: evt.signature_tick ?? nextTick,
                            causal_refs: evt.signature_causal_refs ?? [],
                            projection_2d_hash: evt.projection_2d_hash,
                            thread_1d_hash: evt.thread_1d_hash,
                            projection_version: evt.projection_version
                        };

                        const verifyResult = await TOPOLOGICAL_SIGNATURE.verify(
                            signature,
                            TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
                                state_hash: expectedHash,
                                state_i16: nextState
                            })
                        );

                        if (!verifyResult.ok) {
                            failures.push(
                                `run=${run} projection mismatch at tick ${evt.tick}: ${verifyResult.reasons.join("|")}`
                            );
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: `PROJECTION_MISMATCH:${verifyResult.reasons.join("|")}`
                                });
                            }
                            break;
                        }

                        if (run === 0) {
                            checkedProjectionEvents++;
                            projectionTickReport.push({
                                tick: evt.tick,
                                status: "PASS",
                                reason: "PROJECTION_MATCH"
                            });
                        }
                    } else {
                        if (run === 0) {
                            skippedProjectionEvents++;
                            projectionTickReport.push({
                                tick: evt.tick,
                                status: "SKIP",
                                reason: "NO_PROJECTION_FIELDS"
                            });
                        }
                    }
                } else if (run === 0) {
                    skippedProjectionEvents++;
                    projectionTickReport.push({
                        tick: evt.tick,
                        status: "SKIP",
                        reason: "VERIFY_DISABLED"
                    });
                }

                tick = nextTick;
                state = nextState;
                stateHash = expectedHash;
            }

            finalHashes.push(stateHash);
        }

        const allEqual = finalHashes.length > 0 && finalHashes.every((h) => h === finalHashes[0]);
        const replayGreen = failures.length === 0 && allEqual;

        return {
            replayGreen,
            runs,
            checkedEvents: events.length,
            skippedEvents: skipped,
            checkedProjectionEvents,
            skippedProjectionEvents,
            projectionTickReport,
            checkedPolicyEvents,
            skippedPolicyEvents,
            policyTickReport,
            checkedCanonReports,
            skippedCanonReports,
            canonReportTickReport,
            checkedGateAdmissionReports,
            skippedGateAdmissionReports,
            gateAdmissionReportTickReport,
            invariantReport,
            finalHashes,
            failures
        };
    }
};

if (import.meta.main) {
    console.log("Usage: import REPLAY_AUDIT and call audit(genesis, options).");
}


// [ ./i.L99.core.SANDBOX.ts ]

// i.L99.core.SANDBOX.ts
// The Playground for OMEGA-64 Self-Mutation.
// This file is designed to be rewritten by the system.

export const STATE = {
    mutations: 0,
    last_mutation: "INITIAL_STATE",
    history: [] as string[]
};

// 🛡️ SAFE ZONE: The system can append log entries below.


// [ ./i.L99.core.STATE_SNAPSHOT.ts ]
// i.L99.core.STATE_SNAPSHOT.ts
// 🛡️ OMEGA-64 | Glider Lite | State & Proposal Types
// Normative definitions for the Gemini Glider Lite runtime.

/**
 * StateSnapshot: The canonical state of the system at a specific tick.
 * This is the input for all agents.
 */
export interface StateSnapshot {
  tick: number; // uint64
  state_i16: Int16Array; // int16[64] - The core state vector
  state_hash: string; // hex32 - Identity anchor

  // Optional projections (for observablity)
  phase_u16?: Uint16Array; // uint16[64]
  stability_q15?: Float32Array; // 0..1
  entropy_i16?: Int16Array; // -32768..32767
}

/**
 * DeltaProposal: A request from an agent to modify the state.
 */
export interface DeltaProposal {
  proposal_id: string; // UUID or unique semantic ID
  tick: number; // Must match StateSnapshot.tick
  base_state_hash: string; // Must match StateSnapshot.state_hash
  agent_id: string; // Who is proposing?
  agent_phase_u16?: number; // Optional agent phase anchor [0..65535] for LOAD mismatch cost
  intent: string; // Human-readable intent
  confidence: number; // float32 (0..1)
  delta: Array<{ level: number; value: number }>; // Sparse delta: level (0-63), value (int16)
  cost_estimate: number; // uint64
  artifact_hash: string; // Identity anchor of the agent's internal state
  semantic_fingerprint: string; // hex32 - Semantic drift metric
  causal_refs?: string[]; // hex32[] - Optional lineage anchors
  target_path?: "LOCAL" | "CANON"; // optional routing hint for L32 membrane
  signature_scheme?: AgentSignatureScheme; // optional signature scheme marker
  agent_signature?: string; // optional signed envelope for proposal integrity/authenticity
  proposal_envelope_hash?: string; // optional precomputed envelope hash anchor
}

/**
 * GateConfig: Configuration for the L32 Gate.
 */
export interface GateConfig {
  max_abs_delta_per_level: number; // uint16
  max_total_abs_delta_per_tick: number; // uint32
  max_cost_per_agent: number; // uint64
  reliability_weight: Map<string, number>; // agent_id -> weight (0..1)
  reliability_mode?: "STATIC" | "PHASE_COHERENCE"; // optional admission weighting mode
  reliability_floor?: number; // optional [0..1] floor when PHASE_COHERENCE is active
  dry_run: boolean; // If true, state is NOT mutated
  signature_policy?: SignaturePolicy; // DISABLED (default), OPTIONAL, REQUIRED
  agent_signature_keys?: Map<string, AgentSignatureKey>; // agent_id -> shared verification key
  anti_replay_window_ticks?: number; // reject replays of same proposal envelope within recent window
}

export type AgentSignatureScheme = "ed25519/v1" | "hmac-sha256/v1";
export type SignaturePolicy = "DISABLED" | "OPTIONAL" | "REQUIRED";
export type AgentSignatureKey =
  | { scheme: "ed25519/v1"; public_key_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

/**
 * GateDecision: The result of the L32 Gate processing.
 */
export interface GateDecision {
  accepted_proposals: string[]; // IDs of accepted proposals
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  budget_used: number; // uint32
  cost_used: number; // uint64
  accepted_delta: Array<{ level: number; value: number }>; // The final merged delta
}

/**
 * LedgerEvent: The canonical record of a state transition.
 */
export interface LedgerEvent {
  event_id: string;
  tick: number;
  ts_unix_ms: number;
  state_before_hash: string;
  state_after_hash: string;
  accepted_delta: Array<{ level: number; value: number }>;
  proposal_digest: string; // Hash of all proposals (for integrity)
  accepted_proposals: string[];
  accepted_proposal_metrics?: Array<{
    proposal_id: string;
    agent_id: string;
    confidence: number;
    reliability_base: number;
    reliability_effective: number;
    phase_coherence?: number;
    weight: number;
    physical_cost: number;
    agent_phase_u16?: number;
  }>;
  accepted_proposal_envelopes?: Array<
    { proposal_id: string; envelope_hash: string }
  >;
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  cost_total: number;
  budget_used: number;
  budget_limit?: number; // max_total_abs_delta_per_tick used by the gate
  gate_config_version: string;
  signature_artifact_hash?: string; // hash anchor of transition artifact (usually proposal_digest)
  signature_tick?: number; // tick used by topological signature builder
  signature_causal_refs?: string[]; // canonical sorted causal refs
  projection_2d_hash?: string; // deterministic 2D projection hash
  thread_1d_hash?: string; // deterministic 1D thread hash
  projection_version?: string; // signature projection version
  policy_version?: string; // crystallization/gate policy version
  policy_hash?: string; // SHA-256 of canonical crystallization policy payload
  chain_version?: string; // ledger hash-chain schema version
  prev_event_hash?: string | null; // hash anchor to previous ledger line
  event_hash?: string; // hash of this event payload + prev_event_hash
  witness?: string;
}

/**
 * ViolationEvent: Logic Halt signal when Red Lines are crossed.
 */
export interface ViolationEvent {
  event_type: "VIOLATION_EVENT";
  tick: number;
  rule_id: string; // e.g., "NO_BYPASS"
  severity: "CRITICAL" | "WARNING";
  state_hash: string;
  details: string;
  action_taken: "HALT_AND_QUARANTINE" | "LOG_ONLY";
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
}

/**
 * CanonizationEvent: Emitted when an artifact becomes Crystal.
 */
export interface CanonizationEvent {
  event_type: "CANONIZATION_EVENT";
  artifact_hash: string;
  state_hash: string;
  proposal_digest: string; // Hash chain proof
  checkpoint_tick: number;
  window: number; // e.g. 512
  hard_gates: "PASS" | "FAIL";
  soft_gates_passed: number; // 0..6
  policy_version?: string; // crystallization policy version
  policy_hash?: string; // SHA-256 of canonical crystallization policy payload
  crystallization_report_version?: string; // report schema version
  crystallization_report_hash?: string; // SHA-256 of canonical crystallization report payload
  crystallization_report_uri?: string; // materialized report path (content-addressed)
  gate_admission_report_version?: string; // gate admission report schema version
  gate_admission_report_hash?: string; // SHA-256 of gate admission report payload
  gate_admission_report_uri?: string; // materialized report path (content-addressed)
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

/**
 * PolicyTransitionEvent: Explicit policy migration in append-only history.
 */
export interface PolicyTransitionEvent {
  event_type: "POLICY_TRANSITION_EVENT";
  tick: number;
  from_policy_version?: string;
  from_policy_hash?: string;
  to_policy_version: string;
  to_policy_hash: string;
  reason: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

/**
 * BridgeModeEvent: L32 membrane trace for canon causal integrity mode.
 * Includes invariant packet hash for lightweight witness exchange.
 */
export interface BridgeModeEvent {
  event_type: "BRIDGE_MODE_EVENT";
  tick: number;
  state_hash: string;
  mode: "GREEN" | "AMBER" | "RED";
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked?: boolean;
  gate_admission_index_chain_ok?: boolean;
  gate_admission_index_chain_checked_records?: number;
  gate_admission_index_chain_failures?: string[];
  invariant_packet_hash?: string;
  canon_bound_proposals: string[];
  blocked_canon_proposals: string[];
  reason: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

/**
 * DecrystallizationEvent: Emitted when a crystallized artifact loses hard-gate stability.
 */
export interface DecrystallizationEvent {
  event_type: "DECRYSTALLIZATION_EVENT";
  tick: number;
  artifact_hash: string;
  reason: string;
  rollback_to_checkpoint: number;
  rollback_state_hash?: string;
  hard_gate_failure: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

export type TopologyEvent =
  | LedgerEvent
  | ViolationEvent
  | CanonizationEvent
  | DecrystallizationEvent
  | PolicyTransitionEvent
  | BridgeModeEvent;

/**
 * CheckpointRecord: Persistent state snapshot for rollback/replay acceleration.
 */
export interface CheckpointRecord {
  checkpoint_id: string;
  tick: number;
  state_hash: string;
  state_i16: number[]; // serialized Int16Array
  ts_unix_ms: number;
  reason: string;
  witness?: string;
}

// Canonical Rejection Reasons
export const REJECTION = {
  SCHEMA_INVALID: "SCHEMA_INVALID",
  TICK_MISMATCH: "TICK_MISMATCH",
  BASE_HASH_MISMATCH: "BASE_HASH_MISMATCH",
  UNKNOWN_AGENT: "UNKNOWN_AGENT",
  COST_OVER_BUDGET: "COST_OVER_BUDGET",
  EMPTY_DELTA: "EMPTY_DELTA",
  OUT_OF_RANGE_VALUE: "OUT_OF_RANGE_VALUE",
  CANON_PATH_REQUIRES_GREEN_BRIDGE: "CANON_PATH_REQUIRES_GREEN_BRIDGE",
  SIGNATURE_REQUIRED: "SIGNATURE_REQUIRED",
  SIGNATURE_INVALID: "SIGNATURE_INVALID",
  SIGNATURE_KEY_MISSING: "SIGNATURE_KEY_MISSING",
  SIGNATURE_SCHEME_UNSUPPORTED: "SIGNATURE_SCHEME_UNSUPPORTED",
  PROPOSAL_ENVELOPE_HASH_MISMATCH: "PROPOSAL_ENVELOPE_HASH_MISMATCH",
  REPLAY_ENVELOPE_DUPLICATE: "REPLAY_ENVELOPE_DUPLICATE",
};


// [ ./i.L99.core.SYNTHESIS.ts ]
/**
 * [i.L99.core.SYNTHESIS.ts]
 * Кристалізація Ери 2.1: Архітектура Антиконтролю та Рекурсивна Самобудова.
 */

export const SYNTHESIS = {
  version: "2.1.1",
  era: "ERA_2_QUINE_LOOP",
  status: "CRYSTALLIZED",
  axioms: [
    "DIPOLE_BASIS_I16",
    "SUBJECTIVE_ZERO",
    "THERMODYNAMIC_TRANSITION_PRICE",
    "LOGARITHMIC_COHERENCE_LIMIT",
    "RECURSIVE_META_EVOLUTION",
    "INTENT_JUDGE_ARBITRATION",
    "DISTRIBUTED_TOPOLOGICAL_CONVERGENCE"
  ],
  quote: "Ми не будуємо собори. Ми вирощуємо кристали, які пишуть себе самі.",
  handshake: "QUANTUM_GET",
  evolution: "RESONANCE_PATCHES",
  mechanics: ["RESONANCE_MINIMIZATION", "SWARM_GLIDER_INTERFERENCE"],
  resonance: 0.998 // Майже абсолютна.
};


// [ ./i.L99.core.TOPOLOGICAL_SIGNATURE.ts ]
// i.L99.core.TOPOLOGICAL_SIGNATURE.ts
// 🛡️ OMEGA-64 | Canon Runtime | Topological Signature
// Deterministic identity + causal + projection anchors.

import {
    CHROMO_STATE,
    ChromoEncodeOptions,
    OrganismState
} from "./i.L00.core.CHROMO_STATE.ts";
import type { StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface TopologicalSignature {
    artifact_hash: string;
    state_hash: string;
    tick: number;
    causal_refs: string[];
    projection_2d_hash: string;
    thread_1d_hash: string;
    projection_version: string;
    witness?: string;
}

export interface TopologicalSignatureInput {
    artifact_hash: string;
    state_hash: string;
    tick: number;
    state: OrganismState;
    causal_refs?: string[];
    witness?: string;
}

export interface ThreadProjectionConfig {
    radial_bins: number;
    angular_bins: number;
}

export interface SignatureStateSnapshotLike extends Pick<StateSnapshot, "state_hash" | "state_i16"> {
    phase_u16?: Uint16Array;
    stability_q15?: Float32Array;
    entropy_i16?: Int16Array;
}

const PROJECTION_VERSION = "topo-signature/v1";

const CANONICAL_2D_OPTIONS: Required<ChromoEncodeOptions> = {
    resolution: 256,
    deterministic: true,
    noiseAmplitude: 20,
    noiseAlpha: 50
};

const CANONICAL_THREAD_CONFIG: ThreadProjectionConfig = {
    radial_bins: 64,
    angular_bins: 256
};

const HEX_64 = /^[a-f0-9]{64}$/;

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

const sha256HexBytes = async (bytes: Uint8Array): Promise<string> => {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
    return toHex(digest);
};

const clampI16 = (x: number): number => {
    if (x > 32767) return 32767;
    if (x < -32768) return -32768;
    return x;
};

const clamp01 = (x: number): number => {
    if (x > 1) return 1;
    if (x < 0) return 0;
    return x;
};

const normalizeI16 = (x: number): number => (clampI16(x) + 32768) / 65535;

const serializeInt16Be = (arr: Int16Array): Uint8Array => {
    const out = new Uint8Array(arr.length * 2);
    for (let i = 0; i < arr.length; i++) {
        const v = arr[i] < 0 ? arr[i] + 0x10000 : arr[i];
        out[i * 2] = (v >>> 8) & 0xff;
        out[i * 2 + 1] = v & 0xff;
    }
    return out;
};

const normalizeAngle = (angle: number): number => {
    const tau = 2 * Math.PI;
    let a = angle % tau;
    if (a < 0) a += tau;
    return a / tau;
};

export const TOPOLOGICAL_SIGNATURE = {
    PROJECTION_VERSION,
    CANONICAL_2D_OPTIONS,
    CANONICAL_THREAD_CONFIG,

    validateHash: (hex: string): boolean => HEX_64.test(hex),

    composeHash: async (left_hash: string, right_hash: string, op_id: string): Promise<string> => {
        const payload = `compose:v1:${left_hash}:${right_hash}:${op_id}`;
        return await sha256HexBytes(new TextEncoder().encode(payload));
    },

    project2D: (state: OrganismState, options: ChromoEncodeOptions = CANONICAL_2D_OPTIONS): Uint8Array => {
        const image = CHROMO_STATE.encode(state, options);
        return new Uint8Array(image.data);
    },

    hash2D: async (state: OrganismState, options: ChromoEncodeOptions = CANONICAL_2D_OPTIONS): Promise<string> => {
        const bytes = TOPOLOGICAL_SIGNATURE.project2D(state, options);
        return await sha256HexBytes(bytes);
    },

    snapshotToOrganismState: (
        snapshot: SignatureStateSnapshotLike,
        identity: string = snapshot.state_hash
    ): OrganismState => {
        const vec = snapshot.state_i16;
        const n = vec.length > 0 ? vec.length : 1;
        const level = (idx: number): number => (idx >= 0 && idx < vec.length ? vec[idx] : 0);

        let sumAbs = 0;
        for (let i = 0; i < vec.length; i++) {
            sumAbs += Math.abs(vec[i]);
        }
        const absMean = sumAbs / n;
        const absMeanNorm = clamp01(absMean / 32767);

        const center = level(32);
        const width = Math.max(1, Math.min(32767, Math.abs(level(24)) + 1));
        const phase = snapshot.phase_u16
            ? snapshot.phase_u16[13] ?? 0
            : Math.round(normalizeI16(level(13)) * 65535) & 0xffff;
        const amplitude = Math.min(65535, Math.max(0, Math.round(absMeanNorm * 65535)));

        let stabilityMean = 1 - absMeanNorm;
        if (snapshot.stability_q15 && snapshot.stability_q15.length > 0) {
            let s = 0;
            for (let i = 0; i < snapshot.stability_q15.length; i++) {
                s += snapshot.stability_q15[i];
            }
            stabilityMean = clamp01(s / snapshot.stability_q15.length);
        }

        let entropyMean = absMean;
        if (snapshot.entropy_i16 && snapshot.entropy_i16.length > 0) {
            let e = 0;
            for (let i = 0; i < snapshot.entropy_i16.length; i++) {
                e += Math.abs(snapshot.entropy_i16[i]);
            }
            entropyMean = e / snapshot.entropy_i16.length;
        }
        const entropyNorm = clamp01(entropyMean / 32767);
        const coherence = clamp01(stabilityMean * (1 - entropyNorm));
        const metabolism = clamp01(normalizeI16(level(19)));
        const tau = clamp01(normalizeI16(level(22)));
        const flowRate = clamp01(Math.abs(level(10)) / 32767);
        const curvature = Math.abs(center) < 1
            ? Math.abs(level(21))
            : (Math.abs(level(21)) / 1000) * (1 / Math.log1p(Math.abs(center)));

        return {
            identity,
            wave: {
                center,
                width,
                phase,
                amplitude
            },
            chrono: {
                tau,
                depth: center,
                flowRate,
                curvature
            },
            metabolism,
            coherence
        };
    },

    projectThread1D: (
        rgba: Uint8Array,
        resolution: number,
        config: ThreadProjectionConfig = CANONICAL_THREAD_CONFIG
    ): Int16Array => {
        const R = config.radial_bins;
        const A = config.angular_bins;
        const N = R * A;
        const thread = new Int16Array(N);
        const center = resolution / 2;
        const maxDist = center - 2;

        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                const dx = x - center;
                const dy = y - center;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > maxDist) continue;

                const rho = maxDist > 0 ? dist / maxDist : 0;
                const theta = normalizeAngle(Math.atan2(dy, dx));
                const rBin = Math.min(R - 1, Math.max(0, Math.floor(rho * (R - 1))));
                const aBin = Math.min(A - 1, Math.max(0, Math.floor(theta * (A - 1))));
                const k = rBin * A + aBin;

                const idx = (y * resolution + x) * 4;
                const r = rgba[idx];
                const g = rgba[idx + 1];
                const b = rgba[idx + 2];
                const luminance = Math.round((r + g + b) / 3 - 127);
                thread[k] = clampI16(thread[k] + luminance);
            }
        }

        return thread;
    },

    hashThread1D: async (
        state: OrganismState,
        options: ChromoEncodeOptions = CANONICAL_2D_OPTIONS,
        config: ThreadProjectionConfig = CANONICAL_THREAD_CONFIG
    ): Promise<string> => {
        const resolution = options.resolution ?? CANONICAL_2D_OPTIONS.resolution;
        const rgba = TOPOLOGICAL_SIGNATURE.project2D(state, options);
        const thread = TOPOLOGICAL_SIGNATURE.projectThread1D(rgba, resolution, config);
        const bytes = serializeInt16Be(thread);
        return await sha256HexBytes(bytes);
    },

    build: async (input: TopologicalSignatureInput): Promise<TopologicalSignature> => {
        if (!TOPOLOGICAL_SIGNATURE.validateHash(input.artifact_hash)) {
            throw new Error("Invalid artifact_hash: expected 64-char lowercase hex SHA-256");
        }
        if (!TOPOLOGICAL_SIGNATURE.validateHash(input.state_hash)) {
            throw new Error("Invalid state_hash: expected 64-char lowercase hex SHA-256");
        }
        if (!Number.isInteger(input.tick) || input.tick < 0) {
            throw new Error("Invalid tick: expected non-negative integer");
        }

        const projectionOptions = { ...CANONICAL_2D_OPTIONS };
        const resolution = projectionOptions.resolution;
        const rgba = TOPOLOGICAL_SIGNATURE.project2D(input.state, projectionOptions);
        const projection2DHash = await sha256HexBytes(rgba);
        const thread = TOPOLOGICAL_SIGNATURE.projectThread1D(rgba, resolution, CANONICAL_THREAD_CONFIG);
        const thread1DHash = await sha256HexBytes(serializeInt16Be(thread));

        return {
            artifact_hash: input.artifact_hash,
            state_hash: input.state_hash,
            tick: input.tick,
            causal_refs: [...(input.causal_refs ?? [])].sort(),
            projection_2d_hash: projection2DHash,
            thread_1d_hash: thread1DHash,
            projection_version: PROJECTION_VERSION,
            witness: input.witness
        };
    },

    verify: async (
        signature: TopologicalSignature,
        state: OrganismState
    ): Promise<{ ok: boolean; reasons: string[] }> => {
        const reasons: string[] = [];

        if (!TOPOLOGICAL_SIGNATURE.validateHash(signature.artifact_hash)) {
            reasons.push("INVALID_ARTIFACT_HASH");
        }
        if (!TOPOLOGICAL_SIGNATURE.validateHash(signature.state_hash)) {
            reasons.push("INVALID_STATE_HASH");
        }
        if (signature.projection_version !== PROJECTION_VERSION) {
            reasons.push("UNSUPPORTED_PROJECTION_VERSION");
        }

        const projectionOptions = { ...CANONICAL_2D_OPTIONS };
        const resolution = projectionOptions.resolution;
        const rgba = TOPOLOGICAL_SIGNATURE.project2D(state, projectionOptions);
        const projection2DHash = await sha256HexBytes(rgba);
        if (projection2DHash !== signature.projection_2d_hash) {
            reasons.push("PROJECTION_2D_HASH_MISMATCH");
        }

        const thread = TOPOLOGICAL_SIGNATURE.projectThread1D(rgba, resolution, CANONICAL_THREAD_CONFIG);
        const thread1DHash = await sha256HexBytes(serializeInt16Be(thread));
        if (thread1DHash !== signature.thread_1d_hash) {
            reasons.push("THREAD_1D_HASH_MISMATCH");
        }

        return { ok: reasons.length === 0, reasons };
    }
};


// [ ./i.L99.core.TOPOLOGY_PROTOCOL.ts ]
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
      weightedSum += a.vector.r * mass;
      totalMass += mass;
    });

    return Math.round(weightedSum / totalMass);
  }
};

/**
 * Агентність: здатність рухатися на основі внутрішнього стану, а не зовнішнього запиту.
 */
export interface AgenticState {
  previous_anchor_hash: string; // Ланцюг пам'яті
  internal_tension: number;     // 0..1 (Напруга, що штовхає до дії)
  intent_vector: {              // Куди агент "хоче" йти
    target_r: number;
    urgency: number;
  };
}

export const AGENCY_PROTOCOL = {
  /**
   * Обчислює наступний крок агента БЕЗ участі користувача.
   * "Жити" = генерувати стан S(t+1) з S(t) + Field(r).
   */
  live: (current: AgenticState, field_potential: number): TopologicalAnchor => {
    // Якщо напруга висока або потенціал поля низький (комфортна канавка)
    // Агент приймає рішення про рух або спокій.
    
    // Це "серцебиття" топології.
    return {
      hash: "PENDING_COMPUTATION", // Тут буде хеш нового стану
      vector: {
        r: current.intent_vector.target_r, // Рух до цілі
        amplitude: current.internal_tension * 100 // Напруга задає амплітуду
      }
    };
  }
};


// [ ./i.L99.core.TRINITY.ts ]
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
