// i.L43.core.LOOP.ts
// The Heartbeat of OMEGA-64.
// "Spark": Randomly activates Atoms to simulate Neural Noise.

import { RIBOSOME, Atom } from "./i.L32.core.RIBOSOME.ts";
import { NERVE } from "./i.L48.core.NERVE.ts";
import { MUTATE } from "./i.L43.core.MUTATE.ts";

export const LOOP = {
    ignite: async () => {
        console.log("⚡ LOOP: IGNITION...");
        NERVE.wake();

        const lattice = await RIBOSOME.lift();
        const atoms = Array.from(lattice.values());
        const S = atoms.length;

        (S === 0) ? console.error("💀 VOID.") : console.log(`❤️ ALIVE. Atoms: ${S}`);
        if (S === 0) return;

        NERVE.pulse("INIT", { atomCount: S });

        let t = 0;
        setInterval(() => {
            t++;
            const atom = atoms[Math.floor(Math.random() * S)];
            const vector = atom.id.split(".").pop()?.replace("ts", "") || "?";

            console.log(`[TICK ${String(t).padStart(6, "0")}] ⚡ ${atom.id}`);
            NERVE.pulse("ACTIVATION", { id: atom.id, vector, level: atom.level });

            // Deep Resonance Check (Every 10 ticks)
            (t % 10 === 0) && (
                console.log(`[TICK ${String(t).padStart(6, "0")}] 🧘 RESONANCE.`),
                NERVE.pulse("RESONANCE", { status: "OK", tick: t })
            );

            // Mutation Simulation (Every 20 ticks)
            (t % 20 === 0) && (async () => {
                const target = atoms[Math.floor(Math.random() * S)];
                console.log(`🧬 SIMULATING MUTATION on ${target.id}`);
                await MUTATE.write(target.id, "// MUTATED BY OMEGA", true); // Dry Run
            })();

        }, 1000);
    }
};

// Auto-Ignite
if (import.meta.main) {
    LOOP.ignite();
}
