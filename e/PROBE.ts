
// e/PROBE.ts
// Interactive Probe for the Nameless Space.
// Usage: deno run -A PROBE.ts <int> OR <L> <D> <V>

import { SPACE_16 } from "./SPACE_16.ts";
import { Q_PHYSICS } from "../i.L32.core.Q_PHYSICS.ts";

const args = Deno.args;

if (args.length === 0) {
    console.log("Usage: deno run -A PROBE.ts <int> OR <L> <D> <V>");
    Deno.exit(1);
}

let address = 0;

if (args.length === 1) {
    // Probe by Integer Address
    address = parseInt(args[0]);
    if (isNaN(address)) {
        // Try hex
        address = parseInt(args[0], 16);
    }
} else if (args.length === 3) {
    // Probe by Coordinates
    const L = parseInt(args[0]);
    const D = parseInt(args[1]);
    const V = parseInt(args[2]);
    address = SPACE_16.encode({ L, D, V });
}

console.log(SPACE_16.info(address));

// Semantic Lookup
const { L, D } = SPACE_16.decode(address);
const knowledge = Q_PHYSICS.KNOWLEDGE_MAP[L];

if (knowledge) {
    console.log(`\n--- Semantic Layer L${L} ---`);
    console.log(`Name: ${knowledge.name}`);
    console.log(`Desc: ${knowledge.desc}`);
} else {
    console.log(`\n--- Semantic Layer L${L} ---`);
    console.log("(Unknown / Void)");
}

// Dipole Calculation
const dipoleD = (D + 32) % 64;
const dipoleAddr = SPACE_16.encode({ L, D: dipoleD, V: 0 }); // Assuming V0 for point check
console.log(`\nDipole: D${dipoleD} -> Address [0x${dipoleAddr.toString(16).toUpperCase()}]`);
