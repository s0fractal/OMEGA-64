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
    const depth = wave.center;
    const tau = CHRONOFLUX.depthToProperTime(depth);
    
    // Амплітуда хвилі = енергія = швидкість плину
    const flowRate = CHRONOFLUX.energyToFlowRate(wave.amplitude);
    
    // Фаза хвилі = фаза власного часу
    const phaseNormalized = wave.phase / 65535; // [0..1]
    
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

