// OMEGA-64 | PULSE.ts | The Autonomic Heartbeat (Era 13)
// Orchestrates the multi-timeline Structure-of-Arrays (SoA) simulation.

import { parse as parseYaml } from "jsr:@std/yaml@^1.0.5";
import { STATE_MATRIX, MAX_ATOMS, GOD_ATOM_INDEX, GOD_ATOM_ID } from "./STATE_MATRIX.ts";
import { RIBOSOME, ID_TO_IDX, IDX_TO_ID } from "./RIBOSOME.ts";
import { SNAP } from "./SNAP.ts";
import { LAMBDA_VM } from "./LAMBDA_VM.ts";
import { PRNG } from "./PRNG.ts";
import { RECOVERY } from "./RECOVERY.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { ECOLOGY_ENGINE } from "./ECOLOGY_ENGINE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { TIMELINE_FORK } from "./TIMELINE_FORK.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";

async function logAkasha(msg: string) {
    try {
        const timestamp = new Date().toISOString();
        const line = `[${timestamp}] ${msg}\n`;
        await Deno.writeTextFile("AKASHA.log", line, { append: true });
    } catch { /* ignore */ }
}

const ROOT = Deno.cwd();
const PULSE_INTERVAL = 1000; // Faster pulses for interactive era

export const PULSE = {
    run: async () => {
        console.log("🛡️ OMEGA-64 | ERA 13: ALEPH | PULSE ACTIVE");
        
        // 1. Initial Sync
        const lastKnownAtoms: Map<string, any> = new Map();
        const lattice = await RIBOSOME.lift(ROOT);
        
        for (const [filename, atom] of lattice.entries()) {
            const idx = ID_TO_IDX.get(filename)!;
            lastKnownAtoms.set(filename, {
                ...atom,
                energy: STATE_MATRIX.getEnergy(idx),
                resonance: STATE_MATRIX.getResonance(idx)
            });
        }

        TIMELINE_FORK.init();
        let pulseCount = 0;
        const state = { tick: Date.now() };

        while (true) {
            pulseCount++;
            const timelines = Array.from(TIMELINE_FORK.timelines.values());
            
            for (const timeline of timelines) {
                const activeIndices = PULSE.getTimelineActiveIndices(timeline.buffer);
                let totalRes = 0;

                // Influence primary spatial context
                if (timeline.id === "ALPHA") {
                    SPATIAL_HASH.build(activeIndices);
                    PHYSICS_ENGINE.decayPheromones();
                    AVATAR_ENGINE.applyInfluence();
                }

                const sovState = SOVEREIGNTY_ENGINE.electRegent(activeIndices);
                const mods = sovState?.mods || { speed: 1.0, decay: 1.0, mutation: 0.1 };

                // Process atoms for this timeline
                const outputs = activeIndices.map(idx => {
                    const result = PULSE.processAtom(idx, timeline.buffer, mods, state.tick + pulseCount);
                    totalRes += result.resonance;

                    // Exodus Check (only on primary ALPHA)
                    if (timeline.id === "ALPHA" && P2P_FEDERATION.checkWanderlust(idx)) {
                        P2P_FEDERATION.migrate(idx);
                    }

                    return result;
                });

                // Apply results
                PULSE.applyOutputs(outputs, timeline.buffer);
                
                timeline.avgResonance = totalRes / (activeIndices.length || 1);
                timeline.pulseCount++;
            }

            // Convergence check
            if (pulseCount % 100 === 0 && timelines.length > 1) {
                TIMELINE_FORK.collapse();
            }

            const primary = TIMELINE_FORK.timelines.get("ALPHA")!;
            const activeIndices = PULSE.getTimelineActiveIndices(primary.buffer);
            if (activeIndices.length > 0 && pulseCount % 5 === 0) {
                console.log(`💓 Pulse #${pulseCount} | Realities: ${timelines.length} | Resonance: ${primary.avgResonance.toFixed(2)} | Atoms: ${activeIndices.length}`);
            }

            // Sync simulation state to SNAP for ALPHA
            await SNAP.save(PULSE.getTimelineActiveIndices(primary.buffer));
            await new Promise(r => setTimeout(r, PULSE_INTERVAL));
        }
    },

    getTimelineActiveIndices: (buffer: SharedArrayBuffer) => {
        const ids = new BigUint64Array(buffer, 0, MAX_ATOMS);
        const active: number[] = [];
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (ids[i] !== 0n) active.push(i);
        }
        return active;
    },

    processAtom: (idx: number, buffer: SharedArrayBuffer, mods: any, tick: number) => {
        const xs = new Int16Array(buffer, MAX_ATOMS * 8, MAX_ATOMS);
        const ys = new Int16Array(buffer, MAX_ATOMS * 8 + MAX_ATOMS * 2, MAX_ATOMS);
        const energies = new Float32Array(buffer, MAX_ATOMS * 12, MAX_ATOMS);
        const resonances = new Float32Array(buffer, MAX_ATOMS * 12 + MAX_ATOMS * 4, MAX_ATOMS);
        const logic = new Uint8Array(buffer, MAX_ATOMS * 20 + MAX_ATOMS * 4, MAX_ATOMS * 8);

        let x = xs[idx], y = ys[idx], energy = energies[idx], resonance = resonances[idx];
        const logicBytes = logic.subarray(idx * 8, idx * 8 + 8);
        const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);

        // Core metabolism
        energy -= 0.05 * mods.decay;
        const { velX, velY } = PHYSICS_ENGINE.getGenomeVelocity(logicStr);
        x += velX * mods.speed;
        y += velY * mods.speed;

        // God-Atom immortality
        if (idx === GOD_ATOM_INDEX) {
            energy = 1000;
            resonance = 500;
        } else {
            const vmResult = LAMBDA_VM.execute(logicBytes, { energy, resonance });
            energy += vmResult.energy;
            resonance += vmResult.resonance;
        }

        // Boundaries
        x = Math.max(50, Math.min(1350, x));
        y = Math.max(50, Math.min(750, y));

        return { idx, x, y, energy, resonance, dead: energy <= 0 };
    },

    applyOutputs: (outputs: any[], buffer: SharedArrayBuffer) => {
        const xs = new Int16Array(buffer, MAX_ATOMS * 8, MAX_ATOMS);
        const ys = new Int16Array(buffer, MAX_ATOMS * 8 + MAX_ATOMS * 2, MAX_ATOMS);
        const energies = new Float32Array(buffer, MAX_ATOMS * 12, MAX_ATOMS);
        const resonances = new Float32Array(buffer, MAX_ATOMS * 12 + MAX_ATOMS * 4, MAX_ATOMS);
        const ids = new BigUint64Array(buffer, 0, MAX_ATOMS);

        for (const out of outputs) {
            if (out.dead && out.idx !== GOD_ATOM_INDEX) {
                ids[out.idx] = 0n;
            } else {
                xs[out.idx] = out.x;
                ys[out.idx] = out.y;
                energies[out.idx] = out.energy;
                resonances[out.idx] = out.resonance;
            }
        }
    }
};

if (import.meta.main) {
    PULSE.run();
}
