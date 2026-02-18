/**
 * [i.L32.core.SCHEMA.ts]
 * The Platonic Shapes of OMEGA-64.
 * Defines the strict structure of Atoms using Zod.
 * Acts as the Law of Shapes for the Ribosome.
 */

import { z } from "npm:zod";

// 1. Vector: The Coordinate (L.D.V)
// Matches "32.0.0" or "64.12.4"
export const Vector = z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: "Vector must be in L.D.V format (e.g. '32.0.0')"
});

// 2. Relations: The Web of dependency
export const Relations = z.object({
    attractor: z.string().describe("The gravitating center (e.g. 'VOID' or 'SINGULARITY')").optional(),
    use: z.array(z.string()).describe("Dependencies (Outbound edges)").optional(),
    used: z.array(z.string()).describe("Consumers (Inbound edges)").optional()
});

// 3. Q-State: The Quantum Properties
export const QState = z.object({
    hue: z.number().min(0).max(360).optional(),
    phi: z.number().optional(), // Phase
    evt: z.number().optional()  // Event / Energy
});

// 4. Firewall Rule: Canon rule blocks (path/extension policies)
export const FirewallRule = z.object({
    id: z.string(),
    scope: z.string().describe("Path or vector range scope (projection-aware)"),
    ext: z.string().describe("File extension or protocol (e.g. ts, rs, md, yaml, *)").optional(),
    action: z.string(),
    status: z.string(),
    reason: z.string().optional(),
    allow: z.array(z.string()).optional()
});

// 4. The Atom: The Fundamental Particle
export const Atom = z.object({
    vector: Vector,
    origin: z.string().describe("Path to the source code (TS/RS). Optional for pure-platonic atoms.").optional(),
    symbol: z.string().optional(),
    relations: Relations.optional(),
    q: QState.optional(),
    rules: z.array(FirewallRule).optional()
});

// Export Static Type for TypeScript usage
export type IAtom = z.infer<typeof Atom>;
