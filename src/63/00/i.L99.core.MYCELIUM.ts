// i.L99.core.MYCELIUM.ts
// 🛡️ OMEGA-64 | Life Act | The Mycelium Loop
// "Життя — це не стан. Це дія по зменшенню локальної ентропії."

import { FIELD } from "./i.L00.core.FIELD.ts";
import { QWave } from "./i.L13.core.WAVE_PACKET.ts";
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";
import { U16_LIMITS } from "./i.L00.core.U16_LIMITS.ts";

import { DeltaProposal, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

const I16 = I16_LIMITS();
const U16 = U16_LIMITS();

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
    action: string;
    cost: number;
    newAgent: MyceliumAgent;
  } => {
    let cost = 0;
    const updatedAgent = { ...agent, wave: { ...agent.wave } }; // Shallow clone

    // 0. METABOLISM (Entropy Tax)
    // Життя коштує енергії.
    const ENTROPY_TAX = 1.0;
    updatedAgent.stamina -= ENTROPY_TAX;

    // Check for Death
    if (updatedAgent.stamina <= 0) {
      return { action: "DIED", cost: 0, newAgent: updatedAgent };
    }

    // Check for Reproduction (Mitosis)
    // Якщо енергії забагато (> 200), агент ділиться
    if (updatedAgent.stamina > 200) {
      updatedAgent.stamina /= 2; // Split energy
      return { action: "SPAWN", cost: 0, newAgent: updatedAgent };
      // Note: LOOP will handle creating the SECOND agent based on this signal
    }

    // 1. SELF-COHERENCE (Само-узгодження) & SOCIAL GRAVITY
    // Зменшити локальну напругу, підлаштувавши фазу під сусідів
    if (neighbours.length > 0) {
      // Знаходимо середню фазу сусідів (з вагами по амплітуді)
      let sumPhaseX = 0;
      let sumPhaseY = 0;
      let totalAmp = 0;
      let centerOfGravity = 0;

      for (const n of neighbours) {
        const rad = (n.phase / U16.span) * 2 * Math.PI;
        sumPhaseX += Math.cos(rad) * n.amplitude;
        sumPhaseY += Math.sin(rad) * n.amplitude;
        totalAmp += n.amplitude;
        centerOfGravity += n.center;
      }

      if (totalAmp > 0) {
        // A. Phase Synchronization
        const avgAngle = Math.atan2(sumPhaseY, sumPhaseX);
        const targetPhase =
          Math.round(((avgAngle / (2 * Math.PI)) + 1) * U16.span) % U16.span;

        const drift = targetPhase - agent.wave.phase;
        let shortestDrift = drift;
        if (shortestDrift > U16.half) shortestDrift -= U16.span;
        if (shortestDrift < -U16.half) shortestDrift += U16.span;

        updatedAgent.wave.phase += Math.round(shortestDrift * 0.1);
        updatedAgent.wave.phase = (updatedAgent.wave.phase + U16.span) %
          U16.span;
        cost += Math.abs(shortestDrift * 0.1) * 0.001;

        // B. Social Gravity (Attraction to Center)
        const avgCenter = centerOfGravity / neighbours.length;
        const dist = avgCenter - agent.wave.center;

        // Attraction (Pull towards group)
        if (Math.abs(dist) > 100 && Math.abs(dist) < 5000) {
          const pull = Math.round(dist * 0.05);
          updatedAgent.wave.center += pull;
          cost += Math.abs(pull) * 0.01;
        }

        // Repulsion (Push from overcrowding)
        if (neighbours.length > 5 && Math.abs(dist) < 50) {
          const push = Math.round(dist * -0.2) ||
            (Math.random() > 0.5 ? 20 : -20);
          updatedAgent.wave.center += push;
          cost += Math.abs(push) * 0.02;
        }
      }
    }

    // 2. SELF-MEMORY (Само-пам’ять)
    // Залишити слід у полі (змінити локальний потенціал)
    // Це "витоптування стежки"
    // (В цій симуляції ми просто повертаємо намір, реальний запис робить FIELD)
    const traceParams = {
      r: agent.wave.center,
      intensity: agent.wave.amplitude * 0.01,
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

    // Random wiggle (Brownian motion for life)
    if (move === 0) move = (Math.random() - 0.5) * 20;

    if (Math.abs(move) > 0 && agent.stamina > 10) {
      updatedAgent.wave.center += Math.round(move);
      // Clamp to world
      if (updatedAgent.wave.center > I16.max) {
        updatedAgent.wave.center = I16.max;
      }
      if (updatedAgent.wave.center < I16.min) {
        updatedAgent.wave.center = I16.min;
      }

      cost += 2; // Вартість руху
    }

    // Оновлення енергії
    updatedAgent.stamina -= cost;
    // Регенерація (метаболізм з поля)
    // Енергія є тільки в певних зонах (наприклад, біля 0)
    // Створимо "зону життя" (Goldilocks zone): -5000..5000
    const inZone = Math.abs(currentR) < 5000;
    const fieldEnergy = inZone
      ? Math.max(0, FIELD.getPotential(currentR)) * 2
      : 0;

    updatedAgent.stamina += fieldEnergy * 0.05;

    // Cap stamina
    if (updatedAgent.stamina > 300) updatedAgent.stamina = 300;

    return {
      action: move !== 0
        ? `Moved ${Math.round(move)}`
        : (cost > 0 ? "PhaseShift" : "Idle"),
      cost,
      newAgent: updatedAgent,
    };
  },

  /**
   * Convert Mycelium Action to Physical Proposal.
   */
  toProposal: (
    agent: MyceliumAgent,
    actionLabel: string,
    state: StateSnapshot,
  ): DeltaProposal | null => {
    // 1. Map "World Position" to "State Levels"
    // World: I16.min..I16.max
    // Levels: 0..63
    // Mapping: Level = ((center - I16.min) / I16.cycle) * 64

    if (actionLabel === "Idle") return null;

    const normalizedPos = (agent.wave.center - I16.min) / I16.cycle; // 0..1
    const targetLevel = Math.floor(normalizedPos * 64);
    const level = Math.max(0, Math.min(63, targetLevel));

    const delta: Array<{ level: number; value: number }> = [];

    if (actionLabel.startsWith("Moved")) {
      // Movement acts on the level matching current position
      // Intent: "Increase Probability/Amplitude at this level"
      delta.push({ level, value: 10 }); // Small nudges
    }

    if (actionLabel === "PhaseShift") {
      // Phase shift doesn't change state directly in this model (it changes agent internal state)
      // But we can propose a change to the Phase Field if we want (i.L13)
      // For now, let's say PhaseShift is internal only.
      return null;
    }

    if (delta.length === 0) return null;

    return {
      proposal_id: `prop_${agent.id}_${state.tick}_${
        crypto.randomUUID().slice(0, 8)
      }`,
      tick: state.tick,
      base_state_hash: state.state_hash,
      agent_id: agent.id,
      agent_phase_u16: agent.wave.phase,
      intent: actionLabel,
      confidence: Math.min(1.0, agent.stamina / 100),
      delta,
      cost_estimate: 10, // heuristic
      artifact_hash: "mycelium_v1", // simplified
      semantic_fingerprint: "beef", // simplified
      target_path: "LOCAL",
    };
  },
};
