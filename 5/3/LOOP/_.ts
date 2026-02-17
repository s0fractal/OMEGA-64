// i.L43.core.LOOP.ts
// @noncanonical
// The Heartbeat of OMEGA-64.
// "Spark": Randomly activates Atoms to simulate Neural Noise.

import { RIBOSOME } from "../../../4/0/RIBOSOME/_.ts";
import { NERVE } from "../../../6/0/NERVE/_.ts";
import { KAIROS } from "../../../8/1/KAIROS/_.ts";
import { ATOM as FIELD_ATOM } from "../../../7/7/FIELD/_.ts";
import { I16_LIMITS } from "../../../7/7/I16_LIMITS/_.ts";
import { U16_LIMITS } from "../../../7/7/U16_LIMITS/_.ts";
import { ATOM as WAVE_PACKET_ATOM } from "../../../6/2/WAVE_PACKET/_.ts";
import { ATOM as CHRONOFLUX_ATOM } from "../../1/CHRONOFLUX/_.ts";
import { MYCELIUM, MyceliumAgent } from "../../../8/5/MYCELIUM/_.ts";

// 🛡️ Era 4.0: Swarm Imports
import { PEER } from "../../../8/4/PEER/_.ts";
import { DISCOVERY } from "../../../8/0/DISCOVERY/_.ts";
import { SYNC } from "../../../2/6/SYNC/_.ts";

// 🛡️ Era 3.3: Topological Projection
import { PROJECTION } from "../../../8/5/PROJECTION/_.ts";

const U16 = U16_LIMITS();

// 🛡️ Era 2.6: The Spark Imports
import { GATE_RUNNER } from "../../../4/0/GATE_RUNNER/_.ts";
import { DeltaProposal, StateSnapshot, GateConfig } from "../../../8/0/STATE_SNAPSHOT/_.ts";
import { LEDGER } from "../../../8/0/LEDGER/_.ts";

const FIELD = FIELD_ATOM({ siblings: { I16_LIMITS } });
const WAVE_PACKET_ATOM_RESULT = WAVE_PACKET_ATOM({ siblings: { FIELD, U16_LIMITS } });
const WAVE_PACKET = WAVE_PACKET_ATOM_RESULT.WAVE_PACKET;
const CHRONOFLUX = CHRONOFLUX_ATOM({
    siblings: { FIELD, I16_LIMITS, U16_LIMITS, WAVE_PACKET: WAVE_PACKET_ATOM_RESULT }
}).CHRONOFLUX;

const CHRONO_TICK = {
    currentTime: 0,
    globalChronoState: new Map<string, { tau: number; depth: number; flowRate: number }>(),

    initAgent: (agentId: string, initialR: number) => {
        const state = {
            tau: CHRONOFLUX.depthToProperTime(initialR),
            depth: initialR,
            flowRate: 1.0
        };
        CHRONO_TICK.globalChronoState.set(agentId, state);
        return state;
    },

    tick: (agentId: string) => {
        CHRONO_TICK.currentTime++;
        const current = CHRONO_TICK.globalChronoState.get(agentId);
        if (!current) return null;
        const next = {
            ...current,
            tau: CHRONOFLUX.depthToProperTime(current.depth)
        };
        CHRONO_TICK.globalChronoState.set(agentId, next);
        return next;
    }
};

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
        console.log("⚡ LOOP: IGNITION... (Era 4.0: Federated)");
        const port = options.port || 8080;
        NERVE.wake(port);

        // 🛡️ Era 4.0: Isolate Ledger per Node
        if (port !== 8080) {
            LEDGER.STORAGE_PATH = `./OMEGA_LEDGER_${port}.jsonl`;
            console.log(`📝 LEDGER: Isolated at ${LEDGER.STORAGE_PATH}`);
        }
        
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
        let isSyncing = false;
        const isLooping = true;

        const cycle = async () => {
            if (!isLooping) return;
            if (isSyncing) {
                setTimeout(cycle, 100);
                return;
            }

            if (t >= maxTicks) {
                console.log("⚡ LOOP: Shutdown (Max Ticks reached).");
                return;
            }
            t++;

            // 1. KAIROS CHECK
            KAIROS.ignite(atoms);
            
            // 2. MYCELIUM LIFE ACT & PROPOSAL GENERATION
            const proposals: DeltaProposal[] = [];
            const nextGeneration: MyceliumAgent[] = [];
            
            activeAgents.forEach(agent => {
                const neighbors = [
                    activeAgents[Math.floor(Math.random() * activeAgents.length)].wave,
                    activeAgents[Math.floor(Math.random() * activeAgents.length)].wave
                ];

                const result = MYCELIUM.live(agent, neighbors);
                if (result.action === "DIED") return;
                nextGeneration.push(result.newAgent);

                if (result.action === "SPAWN") {
                    const child: MyceliumAgent = {
                        id: `spore_${t}_${Math.floor(Math.random()*1000)}`,
                        wave: {
                            ...result.newAgent.wave,
                            center: result.newAgent.wave.center + (Math.random() > 0.5 ? 200 : -200),
                            phase: (result.newAgent.wave.phase + 1000) % U16.span
                        },
                        stamina: 80
                    };
                    nextGeneration.push(child);
                }

                if (result.action.startsWith("Moved") || result.action === "PhaseShift") {
                     const proposal = MYCELIUM.toProposal(result.newAgent, result.action, currentState);
                     if (proposal) proposals.push(proposal);
                }
            });

            activeAgents = nextGeneration;

            // 3. GATE EXECUTION
            if (proposals.length > 0) {
                const output = await GATE_RUNNER.step({
                    state: currentState,
                    proposals: proposals,
                    config: gateConfig
                });
                currentState = output.nextState;
                console.log(`[TICK ${currentState.tick}] 🛡️ GATE: Bridge=${output.bridge_mode} | Accepted=${proposals.length}`);
            } else {
                 currentState.tick++;
            }

            // 4. VISUALIZER & HOLOGRAM (Era 3.3: Topological Lens)
            if (t % 5 === 0) {
                 const mode = NERVE.getProjectionMode();
                 const points = PROJECTION.projectState(currentState.state_i16, mode);
                 NERVE.pulse("HOLOGRAM", {
                     tick: currentState.tick,
                     mode: mode,
                     points: points
                 });
            }

            // 5. CHRONOFLUX
             if (t % 10 === 0) {
                 const randomAtom = atoms[Math.floor(Math.random() * S)];
                 CHRONO_TICK.tick(randomAtom.id);
             }

            // 6. SWARM HEARTBEAT & SYNC
            if (t % 10 === 0) {
                 PEER.updateSelf(currentState.tick, 0, port);
                 DISCOVERY.pulse();

                 // Check for Sync
                 for (const peer of PEER.knownPeers.values()) {
                     if (peer.tick > currentState.tick + 2) {
                         console.log(`⚡ SWARM: Detected advanced peer [${peer.id}] (Tick ${peer.tick} > ${currentState.tick})`);
                         isSyncing = true;
                         try {
                             const events = await SYNC.pull(peer, currentState);
                             if (events.length > 0) {
                                 currentState = await SYNC.apply(events, currentState);
                                 t = currentState.tick; 
                             }
                         } catch (e) {
                             console.error("❌ SWARM SYNC FAILED:", e);
                         } finally {
                             isSyncing = false;
                         }
                         break; 
                     }
                 }
            }

            setTimeout(cycle, 100);
        };

        cycle();
    
    },

    monitorSwarm: async () => {
         // DISCOVERY.pulse 
    }
};

if (import.meta.main) {
    const portArg = Deno.args.find(a => a.startsWith("--port="));
    const port = portArg ? parseInt(portArg.split("=")[1]) : 8080;
    LOOP.ignite({ port });
}
