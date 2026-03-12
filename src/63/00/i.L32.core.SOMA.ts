// i.L32.core.SOMA.ts
// The Somatic Manifestation of OMEGA-64.
// Composes Atoms into Somas (Bodies of Logic) based on proximity.

import { Atom, Lattice } from "./i.L32.core.RIBOSOME.ts";
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export interface Soma {
  id: string;
  origin: { r: number; theta: number };
  components: Atom[];
  execute: (input: any) => any;
}

export const SOMA = {
  // 1. Proximity Metric: Euclidean distance in Wave Space
  getDistance: (
    a: { r: number; theta: number },
    b: { r: number; theta: number },
  ): number => {
    const theta_a = (a.theta / 255) * 2 * Math.PI;
    const theta_b = (b.theta / 255) * 2 * Math.PI;

    const x_a = a.r * Math.cos(theta_a);
    const y_a = a.r * Math.sin(theta_a);
    const x_b = b.r * Math.cos(theta_b);
    const y_b = b.r * Math.sin(theta_b);

    return Math.sqrt(Math.pow(x_a - x_b, 2) + Math.pow(y_a - y_b, 2));
  },

  // 2. Assembler: Find the N nearest atoms to a target coordinate
  assemble: (
    lattice: Lattice,
    target: { r: number; theta: number },
    depth: number = 3,
  ): Soma => {
    // Filter for Vacuum atoms
    const vacuumAtoms = Array.from(lattice.values()).filter((a) =>
      a.topo !== undefined
    );

    // Sort by distance to target
    const sorted = vacuumAtoms.sort((a, b) => {
      const distA = SOMA.getDistance(target, a.topo!);
      const distB = SOMA.getDistance(target, b.topo!);
      return distA - distB;
    });

    const components = sorted.slice(0, depth);
    const id = `SOMA.${target.r}_${target.theta}.${
      components.map((c) => c.topo?.op).join("")
    }`;

    // 3. SKI Composition: Chain application (Left-Associative)
    // (A B C) -> A(B)(C)
    const execute = (input: any) => {
      if (components.length === 0) return input;

      let result = components[0].module.λ;
      for (let i = 1; i < components.length; i++) {
        // Apply the next component to the current result (Partial Application)
        result = typeof result === "function"
          ? result(components[i].module.λ)
          : result;
      }

      // Final application of input
      return typeof result === "function" ? result(input) : result;
    };

    return {
      id,
      origin: target,
      components,
      execute,
    };
  },

  // 4. Feedback Injector: Write Soma state to the signal bridge
  resonate: async (soma: Soma, result: any) => {
    const signalPath = "./SINGULARITY/signal.json";
    const signal = {
      id: soma.id,
      r: soma.origin.r,
      theta: soma.origin.theta,
      res: typeof result === "string" ? result.length : 127,
      timestamp: soma.origin.r * I16.cycle + soma.origin.theta,
    };

    await Deno.writeTextFile(signalPath, JSON.stringify(signal, null, 2));
  },
};
