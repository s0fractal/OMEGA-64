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

// 🛡️ Era 3.0: Hologram
import { HOLOGRAM } from "./i.L64.core.HOLOGRAM.ts";

// 🛡️ Era 2.6: The Spark Imports
import { GATE_RUNNER } from "./i.L32.core.GATE_RUNNER.ts";
import { DeltaProposal, StateSnapshot, GateConfig } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";

export const LOOP = {
    /**
     * The Spark.
     * Starts the autonomous cycle of OMEGA-64.
     */
    ignite: async (options: { 
        maxTicks?: number, 
        config?: Partial<GateConfig>,
        initialState?: StateSnapshot,
        port?: number
    } = {}) => {
        console.log("⚡ LOOP: IGNITION... (Era 2.6: The Spark)");
        NERVE.wake(options.port || 8080);
        
        const latticeMap = await RIBOSOME.lift();
        const atoms = Array.from(latticeMap.values());
        const S = atoms.length;

        if (S === 0) return;
        NERVE.pulse("INIT", { atomCount: S });

        // Initialize Chronoflux
        atoms.forEach((atom, idx) => {
            const initialR = atom.topo?.r || (idx % 2 === 0 ? 0 : 16384);
            CHRONO_TICK.initAgent(atom.id, initialR);
        });

        // 🛡️ Runtime State Initialization
        let currentState: StateSnapshot = options.initialState || {
            tick: 0,
            state_hash: "genesis_s0",
            state_i16: new Int16Array(64)
        };
        
        const gateConfig: GateConfig = {
            max_abs_delta_per_level: 1000,
            max_total_abs_delta_per_tick: 5000,
            max_cost_per_agent: 100,
            reliability_weight: new Map(),
            dry_run: false,
            ...(options.config || {})
        };

        // Persistent Agents (Mycelium)
        let activeAgents: MyceliumAgent[] = [
             {
                 id: "mycelium-alpha",
                 wave: WAVE_PACKET.create(-10000, 1000, 0, 10000),
                 stamina: 100
             },
             {
                 id: "mycelium-beta",
                 wave: WAVE_PACKET.create(10000, 1000, 32000, 10000),
                 stamina: 100
             }
        ];

        let t = 0;
        const maxTicks = options.maxTicks || Infinity;

        const intervalId = setInterval(async () => {
            if (t >= maxTicks) {
                clearInterval(intervalId);
                console.log("⚡ LOOP: Shutdown (Max Ticks reached).");
                return;
            }
            t++;

            // 1. KAIROS CHECK
            KAIROS.ignite(atoms);
            
            // 2. MYCELIUM LIFE ACT & PROPOSAL GENERATION
            // "The Dream becomes Action"
            const proposals: DeltaProposal[] = [];

            // 2. MYCELIUM CYCLE (Act)
            // Agents observe, decide, and act.
            const nextGeneration: MyceliumAgent[] = [];
            const newProposals: DeltaProposal[] = [];

            activeAgents.forEach(agent => {
                // Find neighbors (simplification: just 2 random others for now)
                // In full version: use spatial hashing
                const neighbors = [
                    activeAgents[Math.floor(Math.random() * activeAgents.length)].wave,
                    activeAgents[Math.floor(Math.random() * activeAgents.length)].wave
                ];

                const result = MYCELIUM.live(agent, neighbors);
                
                if (result.action === "DIED") {
                    console.log(`💀 AGENT DIED: ${agent.id}`);
                    return; // Drop from nextGeneration
                }

                nextGeneration.push(result.newAgent);

                if (result.action === "SPAWN") {
                    // Create offspring
                    const child: MyceliumAgent = {
                        id: `spore_${t}_${Math.floor(Math.random()*1000)}`,
                        wave: {
                            ...result.newAgent.wave,
                            center: result.newAgent.wave.center + (Math.random() > 0.5 ? 200 : -200), // Spat out
                            phase: (result.newAgent.wave.phase + 1000) % 65535
                        },
                        stamina: 80 // Start with some boost
                    };
                    nextGeneration.push(child);
                    console.log(`👶 SPAWN: ${child.id} from ${agent.id}`);
                }

                // Convert to Physical Proposal (only if moved)
                if (result.action.startsWith("Moved") || result.action === "PhaseShift") {
                     const proposal = MYCELIUM.toProposal(result.newAgent, result.action, currentState);
                     if (proposal) newProposals.push(proposal);
                }
            });

            activeAgents = nextGeneration;
            proposals.push(...newProposals);

            // 3. GATE EXECUTION (The Pivot)
            // Submit proposals to the physical body
            if (proposals.length > 0) {
                const output = await GATE_RUNNER.step({
                    state: currentState,
                    proposals: proposals,
                    config: gateConfig
                });

                // Update Local State
                currentState = output.nextState;
                console.log(`[TICK ${currentState.tick}] 🛡️ GATE: Bridge=${output.bridge_mode} | Hash=${currentState.state_hash.slice(0,8)} | Accepted=${proposals.length}`);
            } else {
                 // Even with no proposals, we might want to advance tick?
                 // For now, Glider Lite is event-driven by proposals, but time flows linearly.
                 // We simulate "Tick with no changes" by creating an Identity Proposal?
                 // Or just increment local counter.
                 currentState.tick++;
                 // console.log(`[TICK ${currentState.tick}] 💤 Idle...`);
            }


            // 4. VISUALIZER & HOLOGRAM (The Face)
            if (t % 5 === 0) {
                 // 🛡️ Era 3.0: Holographic Broadcast
                 const hologram = HOLOGRAM.render(currentState);
                 NERVE.pulse("HOLOGRAM", hologram);
            }

            // 5. CHRONOFLUX (Time)
             if (t % 10 === 0) {
                 const randomAtom = atoms[Math.floor(Math.random() * S)];
                 const chronoState = CHRONO_TICK.tick(randomAtom.id);
             }

        }, 100); // Fast loop for simulation
    }
};

// Auto-Ignite
if (import.meta.main) {
    LOOP.ignite();
}
