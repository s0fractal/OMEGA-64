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
