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

// 4. Forces: Physical fields for self-organization
export const ForceLink = z.object({
    kind: z.string().describe("spring|repulsion|attraction|gravity|charge|damping|anchor|orbit"),
    target: z.string().optional(),
    strength: z.number().optional(),
    axis: z.string().optional(),
    note: z.string().optional()
});

export const Forces = z.object({
    self: z.object({
        mass: z.number().optional(),
        charge: z.number().optional(),
        spin: z.number().optional(),
        gravity: z.number().optional(),
        damping: z.number().optional(),
        anchor: z.boolean().optional()
    }).optional(),
    links: z.array(ForceLink).optional(),
    net: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
        magnitude: z.number()
    }).optional(),
    pairs: z.array(z.object({
        target: z.string(),
        dx: z.number(),
        dy: z.number(),
        dz: z.number(),
        r: z.number(),
        gravity: z.number().optional(),
        charge: z.number().optional(),
        spin: z.number().optional(),
        fx: z.number(),
        fy: z.number(),
        fz: z.number()
    })).optional(),
    tension: z.number().optional()
});

// 5. Laws: Codex interaction laws (used to derive forces)
export const Law = z.object({
    id: z.string(),
    when: z.string().describe("Trigger condition (e.g. relations.use)"),
    kind: z.string().describe("spring|repulsion|attraction|gravity|charge|damping|anchor|orbit"),
    strength: z.number().optional(),
    note: z.string().optional()
});

// 4. Firewall Rule: Canon rule blocks (path/extension policies)
export const FirewallRule = z.object({
    id: z.string(),
    path: z.string().describe("Glob path pattern (canonical path matcher)"),
    action: z.string(),
    status: z.string(),
    reason: z.string().optional(),
    allow: z.array(z.string()).optional(),
    deny: z.array(z.string()).optional()
});

// 4. The Atom: The Fundamental Particle
export const Atom = z.object({
    vector: Vector,
    origin: z.string().describe("Path to the source code (TS/RS). Optional for pure-platonic atoms.").optional(),
    symbol: z.string().optional(),
    relations: Relations.optional(),
    q: QState.optional(),
    forces: Forces.optional(),
    laws: z.array(Law).optional(),
    rules: z.array(FirewallRule).optional()
});

// Export Static Type for TypeScript usage
export type IAtom = z.infer<typeof Atom>;
