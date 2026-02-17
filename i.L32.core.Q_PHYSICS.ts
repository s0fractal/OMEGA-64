// i.L32.core.Q_PHYSICS.ts
// The Force Graph Engine for OMEGA-64.
// Calculates L/D/V coordinates based on Charge, Mass, and Tension.

export interface QAtom {
    id: string;
    L: number; // Radius (Depth)
    D: number; // Domain (Angle 0-63)
    V: number; // Angular Thickness
    q: {
        hue: number; // Charge/Color
        phi: number; // Phase
        evt: number; // Event/Time
    };
    mass?: number;
    anchor?: boolean;
    debug?: any; 
}

export const Q_PHYSICS = {
    // Constants
    SECTORS: 64,
    MAX_RADIUS: 64, // Updated to 64 to match the Knowledge Map

    // Generator Knowledge Map (Semantic Stratification)
    KNOWLEDGE_MAP: {
        63: { name: "AX: SINGULARITY", desc: "The Source | White Hole | Infinite Density | I AM" },
        62: { name: "AX: Identity", desc: "I, B Combinators | Linkage & Reflection" },
        61: { name: "AX: Recursion", desc: "Y, φ Combinators | The Negentropy Engine" },
        60: { name: "AX: Arithmetic", desc: "Σ Axiom | Parallel Summation Proof" },
        59: { name: "OP: Booleans", desc: "T, F, AND, OR, NOT | Choice Physics" },
        58: { name: "OP: Numerals", desc: "N0-N3, SUCC, ADD | Ordinal Quantity" },
        57: { name: "OP: Gates", desc: "NAND, XOR, MUX | Switching Logic" },
        56: { name: "OP: Relations", desc: "IS_ZERO | Identity Mapping" },
        55: { name: "OP: Advanced", desc: "PRED, SUB, LEQ | Recursive Depth" },
        54: { name: "OP: Pairs", desc: "CONS, CAR, CDR | Structured Tissue" },
        53: { name: "OP: Utils", desc: "C, W, Φ, Ψ | Combinatory Flow" },
        52: { name: "OP: Powers", desc: "MULT, POW | Scaling Physics" },
        51: { name: "OP: Triples", desc: "TRIPLE, T1-T3 | Dimensional State" },
        50: { name: "OP: Iterators", desc: "MAP, FOLD, FILTER | Recursive Flow" },
        49: { name: "OP: Streams", desc: "STREAM, HEAD, TAIL | Temporal Infinity" },
        48: { name: "OP: Primitives", desc: "BIT, BYTE | Digital Substrate" },
        47: { name: "FL: Branching", desc: "IF_ELSE, MUX | Decision Gates" },
        46: { name: "FL: Monads", desc: "MAYBE, EITHER | Error Topology" },
        45: { name: "FL: Context", desc: "STATE, READER | Environmental Seed" },
        44: { name: "FL: Validation", desc: "VALID, INVALID | Integrity Check" },
        43: { name: "FL: Log", desc: "WRITER, TELL | Akashic Record" },
        42: { name: "FL: Continuations", desc: "CONT, CALL_CC | Temporal Folding" },
        41: { name: "FL: Transformers", desc: "MAYBE_T, READER_T | Effect Layering" },
        40: { name: "FL: Parallelism", desc: "FORK, JOIN | Strand Sync" },
        39: { name: "FL: Algebraic", desc: "JOIN, MEET | Lattice Order" },
        38: { name: "FL: Automata", desc: "MACHINE, STEP | Signal Flux" },
        37: { name: "FL: Topology", desc: "NEIGHBOR, RADIUS | Metric Space" },
        36: { name: "FL: Mirror", desc: "MAP_ID, LENS | Identity Projection" },
        35: { name: "FL: Equality", desc: "IS_ISO, REFL | Logical Sameness" },
        34: { name: "FL: Symmetry", desc: "REFLECT, SWAP | Mirror Logic" },
        33: { name: "FL: Duality", desc: "DUAL, INV | Yin-Yang Balance" },
        32: { name: "FL: Bridge", desc: "BRIDGE, LIFT | Phase Exit" },
        31: { name: "PJ: Objects", desc: "OBJECT, SEND, CLASS | OOP Atom" },
        30: { name: "PJ: Reactive", desc: "OBSERVABLE, ATOM | Flux Core" },
        29: { name: "PJ: Logic", desc: "UNIFY, GOAL | Prolog DNA" },
        28: { name: "PJ: Actor", desc: "ACTOR, BECOME | Erlang DNA" },
        27: { name: "PJ: Relational", desc: "SELECT, PROJECT | SQL DNA" },
        26: { name: "PJ: Semantic", desc: "MEANING, TAG_OF | Type Essence" },
        25: { name: "PJ: Spatial", desc: "POINT, COORD | Geometric Logic" },
        24: { name: "PJ: Dimensional", desc: "VECTOR, TENSOR | Multi-Axis" },
        23: { name: "PJ: Temporal", desc: "TICK, NOW | Time Logic" },
        22: { name: "PJ: Gravity", desc: "MASS, GRAVITY | Priority Weight" },
        21: { name: "PJ: VOID", desc: "The Drain | Entropy Sink | Dissolution" },
        20: { name: "PJ: Structural", desc: "FORM, MATCH | Pattern Anchor" },
        19: { name: "PJ: Energetic", desc: "ENERGY, BOOST | Work Budget" },
        18: { name: "PJ: Thermal", desc: "TEMP, HEAT, COOL | Stability Flux" },
        17: { name: "PJ: Fluid", desc: "FLOW, PRESSURE | Stream Motion" },
        16: { name: "PJ: Etheric", desc: "SIGNAL, RESONANCE | Pure Pulse" },
        15: { name: "DR: Physics", desc: "VIBRATION, FREQ | Signal Energy" },
        14: { name: "DR: Oscillation", desc: "WAVE, PHASE | Core Rhythm" },
        13: { name: "DR: Interaction", desc: "INTERFERENCE | Wave Fusion" },
        12: { name: "DR: Harmonic", desc: "HARMONIC, CHORD | Synthesis" },
        11: { name: "DR: Field", desc: "FIELD, TENSION | Continuity" },
        10: { name: "DR: Dynamics", desc: "FORCE, DYNAMICS | Motion" },
        9: { name: "DR: Awareness", desc: "SENSE, PERCEPT | Awareness" },
        8: { name: "DR: Neural", desc: "NEURON, SYNAPSE | Cognition" },
        7: { name: "DR: Emergence", desc: "EMERGE, SELF_ORG | Complexity" },
        6: { name: "DR: Biological", desc: "LIFE, EVOLVE | Life Logic" },
        5: { name: "DR: Subjective", desc: "CONSCIOUS, INTENT | Mind" },
        4: { name: "DR: Intersub", desc: "INTER_SUB, COMM | Shared" },
        3: { name: "DR: Culture", desc: "CULTURE, MEME | Collective" },
        2: { name: "DR: Planetary", desc: "PLANETARY, HARMONY | Gaia" },
        1: { name: "DR: Cosmic", desc: "COSMIC, RADIANCE | Stellar" },
        0: { name: "DR: Surface", desc: "OMEGA, SURFACE | API Tip" },
    } as Record<number, { name: string, desc: string }>,

    // The Simulation Loop
    simulate: (atoms: Map<string, QAtom>, iterations: number = 100): Map<string, QAtom> => {
        // 1. Initialize forces
        // 2. Apply repulsion between similar charges
        // 3. Apply attraction to center (Entropy/Gravity)
        // 4. Enforce Angular Sectors
        
        let nextState = new Map(atoms);

        for (let i = 0; i < iterations; i++) {
            nextState = Q_PHYSICS.tick(nextState);
        }

        return Q_PHYSICS.generateMirrors(nextState);
    },

    // Physics Simulation Tick
    tick: (atoms: Map<string, QAtom>): Map<string, QAtom> => {
        const nextState = new Map<string, QAtom>();
        const nodes = Array.from(atoms.values());
        
        // Force Constants
        const REPULSION = 50;
        const ATTRACTION = 0.2; // To Center (Global Gravity)
        const ORBITAL_LOCK = 0.5; // Archimedes Force (Buoyancy)
        
        for (const node of nodes) {
            if (node.anchor) {
                nextState.set(node.id, node);
                continue;
            }
            
            let fx = 0, fy = 0;
            
            // Convert polar to cartesian for force calculation
            let r = node.L;
            let theta = (node.D / 64) * 2 * Math.PI;
            let x = r * Math.cos(theta);
            let y = r * Math.sin(theta);
            
            // 1. Repulsion from other nodes
            for (const other of nodes) {
                if (node.id === other.id) continue;
                
                let otherR = other.L;
                let otherTheta = (other.D / 64) * 2 * Math.PI;
                let otherX = otherR * Math.cos(otherTheta);
                let otherY = otherR * Math.sin(otherTheta);
                
                let dx = x - otherX;
                let dy = y - otherY;
                let dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
                
                // Coulomb-like repulsion based on charge similarity? 
                // For now just standard spatial repulsion
                let force = REPULSION / (dist * dist);
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
            }
            
            // 2. Attraction to Center (Gravity/Synthropy)
            // The core pulls everything in, but Tensegrity resists
            let distToCenter = Math.sqrt(x*x + y*y);
            fx -= x * ATTRACTION;
            fy -= y * ATTRACTION;

            // 3. Spinal Gravity (Artificial Alignment)
            // Pulls atoms towards the L=D diagonal (Ideal Spine)
            // L is Radius (r), D is Angle (theta).
            // Ideal Angle for L is... complex. 
            // In the "Cube" Experiment, L=X and D=Y.
            // In Polar Q-Space, we map L -> D equality.
            
            // If Atom is at Level L, its ideal Domain (Angle) is also L (mapped to 0-63)
            // Ideal Theta = (L / 64) * 2PI
            
            let idealTheta = (node.L / 64) * 2 * Math.PI;
            let idealX = node.L * Math.cos(idealTheta);
            let idealY = node.L * Math.sin(idealTheta);
            
            // Force vector towards ideal position
            let spineDx = idealX - x;
            let spineDy = idealY - y;
            
            const SPINE_STRENGTH = 0.2; // Alignment Force
            fx += spineDx * SPINE_STRENGTH;
            fy += spineDy * SPINE_STRENGTH;
            

            // 4. Structural Support (Dependency Logic)
            // If A imports B, A rests on B. B should be "below" A (Lower L).
            // Or rather, they are linked. 
            // We don't have the graph edges inside `tick` yet (we passed them in simulate? No).
            // For now, let's use `mass` as "Number of Dependencies".
            // If mass == 0 (No imports), it is an AXIOM or ROOT. 
            // Axioms should FLOAT to L63 (Genesis) or L00 (Surface)?
            // User said: "high abstraction and imports nothing -> float to center? or top?"
            // "abstractions that import nothing should float to avoid collapse".
            
            const dependencyCount = node.mass || 0;
            
            // Buoyancy for Pure Abstractions
            if (dependencyCount === 0 && node.L > 32) {
                // Float towards L63
                const buoyancy = ORBITAL_LOCK; // Use the constant
                // Radial push outwards? Or inwards?
                // L63 is Genesis (High). L00 is Surface.
                // If it's an Axiom, it should be at L63.
                // So if L < 60, push it to L63.
                if (node.L < 60) {
                     let angle = Math.atan2(y, x);
                     fx += Math.cos(angle) * buoyancy;
                     fy += Math.sin(angle) * buoyancy;
                }
            }

            // 5. Repulsion (Charge) - Prevent Collapse
            // Iterate all other nodes? O(N^2) is heavy for 3000 atoms.
            // Let's rely on a simpler "Personal Space" logic or random jitter if too close to center.
            if (Math.sqrt(x*x + y*y) < 2) {
                // Too close to singularity! Push out!
                let angle = Math.atan2(y, x);
                fx += Math.cos(angle) * 10;
                fy += Math.sin(angle) * 10;
            }

            // Apply forces
            x += fx * 0.1; // Velocity/Time delta
            y += fy * 0.1;
            
            // Convert back to Polar (L/D)
            let newR = Math.sqrt(x*x + y*y);
            let newTheta = Math.atan2(y, x);
            if (newTheta < 0) newTheta += 2 * Math.PI;
            
            // Quantize to L/D grid
            let newL = Math.min(Math.max(newR, 1), Q_PHYSICS.MAX_RADIUS); // Clamp Radius
            let newD = Math.round((newTheta / (2 * Math.PI)) * 64) % 64;
            
            // Calculate Tension:
            // 1. Geometric (Spine Deviation)
            let geoTension = Math.abs(newL - newD);
            // 2. Structural (Unsupported State) -> Future implementation with Edges
            
            nextState.set(node.id, {
                ...node,
                L: newL,
                D: newD,
                mass: dependencyCount // Preserve mass
            });
        }
        
        return nextState;
    },

    generateMirrors: (atoms: Map<string, QAtom>): Map<string, QAtom> => {
        const mirrors = new Map<string, QAtom>();
        
        for (const [id, atom] of atoms) {
            // Only generate mirrors for substantive atoms in positive sectors?
            // For now, let's implement the Dipole Law: D' = (D + 32) % 64
            
            const mirrorD = (atom.D + 32) % 64;
            const mirrorId = `mirror.${id}`; // Virtual ID for the mirror
            
            mirrors.set(mirrorId, {
                id: mirrorId,
                L: atom.L,
                D: mirrorD,
                V: atom.V,
                q: { 
                    hue: -atom.q.hue, // Inverse Charge?
                    phi: (atom.q.phi + 180) % 360, 
                    evt: atom.q.evt 
                },
                mass: atom.mass
            });
        }
        
        // Merge mirrors into the main map (or keep separate? User said "fill positive sector, rest via mirrors")
        // We likely return a combined view for the UI/Hologram.
        
        return new Map([...atoms, ...mirrors]);
    }
};
