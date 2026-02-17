
// e/EXPORT_DATA.ts
// Exports the Q-Space state to JSON for 3D visualization.
// NOW READING FROM DECENTRALIZED YAML (RELATIONS).

import { RIBOSOME } from "../i.L32.core.RIBOSOME.ts";
import { Q_PHYSICS, QAtom } from "../i.L32.core.Q_PHYSICS.ts";
import { parse } from "jsr:@std/yaml";

console.log("Scanning Real Q-Space Data (YAML Relations)...");

// 1. Lift Real Atoms
const lattice = await RIBOSOME.lift();
const atoms = new Map<string, QAtom>();
const edges: { source: string, target: string }[] = [];

// Helper for inline Q state (might still be in TS)
const RE_Q = /export\s+const\s+q\s+=\s+(\{[^;]+\})/; 

for (const [id, atom] of lattice) {
    let L = 0, D = 0, V = 0;
    let q = { hue: 0, phi: 0, evt: 0 };
    let deps: string[] = [];

    try {
        // 1. Try to resolve YAML sidecar
        // RIBOSOME lifts full paths: "i.L32.core.RIBOSOME.ts"
        // But sidecars are flat: "i/RIBOSOME.yaml"
        let yamlContent = "";
        const match = id.match(/i\.L(\d+)\.core\.([A-Z0-9_]+)\.ts/); // Added 0-9 to regex just in case
        
        if (match) {
            const shortName = match[2];
            try {
                yamlContent = await Deno.readTextFile(`i/${shortName}.yaml`); 
            } catch (e) {
                // If not found in i/, try root just in case
                try {
                     yamlContent = await Deno.readTextFile(`${shortName}.yaml`);
                } catch (e2) {}
            }
        } else {
             // Fallback for non-standard IDs
             try {
                yamlContent = await Deno.readTextFile(id.replace(/\.ts$/, ".yaml"));
            } catch (e) {
                try {
                     // Try relative i/
                     yamlContent = await Deno.readTextFile(`i/${id.split('/').pop()?.replace('.ts', '.yaml')}`);
                } catch (e2) {}
            }
        }

        if (yamlContent) {
            try {
                const meta = parse(yamlContent) as any;
                
                // Parse Vector
                if (meta.vector) {
                    const parts = String(meta.vector).split('.');
                    if (parts.length === 3) {
                        L = parseInt(parts[0]);
                        D = parseInt(parts[1]);
                        V = parseInt(parts[2]);
                    }
                }

                // Parse Relations (Dependencies)
                if (meta.relations && meta.relations.use && Array.isArray(meta.relations.use)) {
                    const uses = meta.relations.use;
                    
                    for (const targetName of uses) {
                        let found = false;
                        // Find full ID for target basename
                        for (const key of lattice.keys()) {
                                // Check if key contains name (e.g. i.L32.core.RIDOSOME.ts contains RIBOSOME)
                                if (key.includes(`.${targetName}.ts`) || key === `${targetName}.ts` || key.endsWith(`/${targetName}.ts`)) {
                                    deps.push(key);
                                    edges.push({ source: id, target: key });
                                    found = true;
                                    break;
                                }
                        }
                        // if (!found) console.warn(`Could not resolve dependency ${targetName} for ${id}`);
                    }
                }
            } catch (e) {
                console.error(`Error parsing YAML for ${id}`, e);
            }

            // Fallback L from filename if not in YAML (or if YAML missing)
            if (L === 0) {
                 const levelMatch = id.match(/i\.L(\d+)\./);
                 L = levelMatch ? parseInt(levelMatch[1]) : 0;
                 if (D === 0) D = L;
            }
        } else {
             // Fallback L from filename
             const levelMatch = id.match(/i\.L(\d+)\./);
             L = levelMatch ? parseInt(levelMatch[1]) : 0;
             if (D === 0) D = L; 
        }

        // 2. Read TS file ONLY for Q-State (Behavior) if needed
        // We skip parsing imports from TS now!
        let tsContent = "";
        // Only read if we suspect inline Q state or if we want to be thorough.
        // Let's keep reading it for Q-state.
        try {
            tsContent = await Deno.readTextFile(id);
        } catch (e) {
             try {
                tsContent = await Deno.readTextFile(`i/${id.split('.').pop()}`);
             } catch (e2) {}
        }

        if (tsContent) {
             // Parse Q State (if still inline)
            const qMatch = tsContent.match(RE_Q);
            if (qMatch) {
                try {
                    const hueM = tsContent.match(/hue:\s*(-?\d+)/);
                    const phiM = tsContent.match(/phi:\s*(-?\d+)/);
                    const evtM = tsContent.match(/evt:\s*(-?\d+)/);
                    if (hueM) q.hue = parseInt(hueM[1]);
                    if (phiM) q.phi = parseInt(phiM[1]);
                    if (evtM) q.evt = parseInt(evtM[1]);
                } catch (e) {}
            } else {
                q.hue = L % 6;
            }
        }
    } catch (e) {
        console.error(`Error processing ${id}:`, e);
    }

    // Radial Inversion:
    // L (Level) 63 = Singularity (Center) = Radius 1
    // L (Level) 0 = Surface (Edge) = Radius 64
    // Physics operates on R (Radius).
    let R = 64 - L; // Inverted Radius for Physics
    if (R < 1) R = 1; // Singularity limit
    
    atoms.set(id, {
        id,
        L: R, // Physics uses L as Radius (Legacy name in QAtom, effectively R now)
        targetL: 64 - L, // Target Radius is also inverted
        
        // Custom Fields for Export/Debug
        level: L, // Semantic Level (0-63)
        
        D, V,
        q,
        mass: deps.length
    } as any); // Cast to any to allow extra 'level' field
}

console.log(`Loaded ${atoms.size} atoms. Found ${edges.length} connections.`);
console.log("Simulating Physics with Structural Support...");

// 2. Run Physics
const finalText = Q_PHYSICS.simulate(atoms, edges, 150); // Increased iterations for settling

// 3. Write Back Mutation (The Quine Cycle)
console.log("Mutating YAML Vectors...");
let mutations = 0;

for (const [id, atom] of finalText) {
    if (atom.id.startsWith("mirror")) continue;
    
    // Check if moved
    const oldL = atoms.get(id)?.level || 0; // Compare against original LEVEL
    
    // Physics 'L' is actually Radius 'R'. Convert back to Level.
    const simR = atom.L; 
    let newLevel = 64 - simR;
    if (newLevel < 0) newLevel = 0;
    if (newLevel > 63) newLevel = 63;
    
    // Only write if significant change? 
    // Or just write everything to ensure consistency?
    // User said "spoils so be it". Let's write.
    
    const newVector = `${Math.round(newLevel)}.${Math.round(atom.D)}.${atom.V}`;
    
    // Resolve YAML path (same logic as reading)
    let yamlPath = "";
     const match = id.match(/i\.L(\d+)\.core\.([A-Z0-9_]+)\.ts/);
    if (match) {
        yamlPath = `i/${match[2]}.yaml`;
    } else {
        yamlPath = id.replace(/\.ts$/, ".yaml");
        if (!yamlPath.includes("/")) yamlPath = `i/${yamlPath}`; // Assume flat i/ if no path
        // Wait, above logic in reading was complex. Let's try checking existence.
        try { await Deno.stat(yamlPath); } 
        catch { 
             try { 
                 const check = `i/${id.split('/').pop()?.replace('.ts', '.yaml')}`;
                 await Deno.stat(check);
                 yamlPath = check;
             } catch { yamlPath = ""; }
        }
    }

    if (yamlPath) {
        try {
            const content = await Deno.readTextFile(yamlPath);
            // Regex replace vector line
            // Matches "vector: 32.0.0" or "vector: '32.0.0'"
            const updated = content.replace(/vector:\s*['"]?[\d\.]+['"]?/, `vector: ${newVector}`);
            
            if (content !== updated) {
                await Deno.writeTextFile(yamlPath, updated);
                mutations++;
            }
        } catch (e) {
            // console.warn(`Failed to mutate ${yamlPath}`);
        }
    }
}
console.log(`Mutated ${mutations} atoms in YAML.`);

// 4. Export
const exportData = {
    nodes: Array.from(finalText.values()).map(a => ({
        id: a.id,
        L: a.L, // Visual Radius
        level: (a as any).level, // Semantic Level
        D: a.D,
        V: a.V,
        tension: a.mass || 0, // Need to separate mass from tension in future
        isMirror: a.id.startsWith("mirror"),
        debug: a.debug // Force Vectors
    })),
    links: edges
};

const json = JSON.stringify(exportData, null, 2);
await Deno.writeTextFile("e/q_data.json", json);
console.log(`Exported data to e/q_data.json`);
