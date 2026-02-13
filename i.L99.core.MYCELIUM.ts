// i.L99.core.MYCELIUM.ts
// 🛡️ OMEGA-64 | Life Act | The Mycelium Loop
// "Життя — це не стан. Це дія по зменшенню локальної ентропії."

import { FIELD } from './i.L00.core.FIELD.ts';
import { LOAD, LoadInput } from './i.L99.core.LOAD.ts';
import { QWave } from './i.L13.core.WAVE_PACKET.ts';

import { DeltaProposal, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

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
      action: move !== 0 ? `Moved ${move}` : (cost > 0 ? "PhaseShift" : "Idle"),
      cost,
      newAgent: updatedAgent
    };
  },

  /**
   * Convert Mycelium Action to Physical Proposal.
   */
  toProposal: (
      agent: MyceliumAgent, 
      actionLabel: string, 
      state: StateSnapshot
  ): DeltaProposal | null => {
      // 1. Map "World Position" to "State Levels"
      // World: -32768..32767
      // Levels: 0..63
      // Mapping: 64 levels cover the spectrum. Each level covers ~1024 units?
      // Or simply: Level = ((center + 32768) / 65536) * 64
      
      if (actionLabel === "Idle") return null;

      const normalizedPos = (agent.wave.center + 32768) / 65536; // 0..1
      const targetLevel = Math.floor(normalizedPos * 64);
      const level = Math.max(0, Math.min(63, targetLevel));

      const delta: Array<{ level: number, value: number }> = [];

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
          proposal_id: `prop_${agent.id}_${state.tick}_${crypto.randomUUID().slice(0, 8)}`,
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
          target_path: "LOCAL"
      };
  }
};
