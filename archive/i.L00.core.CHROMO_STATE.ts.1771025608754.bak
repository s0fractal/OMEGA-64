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
