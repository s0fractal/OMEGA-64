/// <reference lib="deno.window" />
// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "../IMMUNE/_.ts";
import { DUAL } from "../DUAL/_.ts";
import { walk } from "jsr:@std/fs";
import { Atom as AtomSchema } from "../SCHEMA/_.ts";
import { parse as parseYaml } from "jsr:@std/yaml";

export interface Atom {
    id: string; // The Filename (Address)
    level: number;
    module: any; // The Exported Logic
    topo?: { r: number, theta: number, op: string }; // Topological Metadata
}

export type Lattice = Map<string, Atom>;

export const RIBOSOME = {
    // Scan and Lift all Atoms (Functional)
    lift: async (root: string = Deno.cwd()): Promise<Map<string, Atom>> => {
        let lattice = new Map<string, Atom>();

        // --- Phase 1: Legacy Flat Scan (Backward Compatibility) ---
        for await (const { name } of walk(root, { maxDepth: 1, includeDirs: false })) {
            // 1. Semantic Name (ATOM.ts)
            if (name.match(/^[A-Z0-9_]+\.ts$/)) {
                let lvl = 0;
                // Try to extract Level from YAML sidecar using SCHEMA
                try {
                    const yamlPath = `${root}/${name.replace('.ts', '.yaml')}`;
                    const yamlText = await Deno.readTextFile(yamlPath);
                    const raw = parseYaml(yamlText);
                    const result = AtomSchema.safeParse(raw);
                    
                    if (result.success) {
                        const vectorParts = result.data.vector.split('.');
                        lvl = parseInt(vectorParts[0]);
                    } else {
                         const originMatch = yamlText.match(/origin:\s*[^L]*L(\d+)/);
                         if (originMatch) lvl = parseInt(originMatch[1]);
                    }
                } catch { }

                try {
                    if (DUAL.validate(name, Deno.readTextFileSync(`${root}/${name}`))) {
                        const module = await import(`./${name}`);
                        lattice.set(name, { id: name, level: lvl, module });
                    }
                } catch (e) { }
            }
            // 2. Legacy Name (i.Lxx.core.ATOM.ts)
            else {
                const match = name.match(/i\.L(\d+)\.core\.([A-Z_]+)\.ts/);
                if (match) {
                    const [_, lvlStr] = match;
                    try {
                        if (DUAL.validate(name, Deno.readTextFileSync(`${root}/${name}`))) {
                            const module = await import(`./${name}`);
                            lattice.set(name, { id: name, level: parseInt(lvlStr), module });
                        }
                    } catch (e) { }
                }
            }
        }

        // --- Phase 2: Octal Scan (The 8x8 Matrix) ---
        // Scan i/{0..7}/{0..7}/ATOM/
        for (let M = 0; M < 8; M++) {
            for (let m = 0; m < 8; m++) {
                const minorPath = `${root}/${M}/${m}`;
                try {
                    // Check if minor level directory exists
                    // console.log(`[RIBOSOME] Scanning ${minorPath}`);
                    for await (const entry of Deno.readDir(minorPath)) {
                        // console.log(`  -> Found ${entry.name} (Dir: ${entry.isDirectory})`);
                        if (entry.isDirectory) {
                            // console.log(`    -> Processing Potential Atom: ${entry.name}`);
                            // Found a potential Atom: i/M/m/ATOM/
                            const atomName = entry.name;
                            const atomPath = `${minorPath}/${atomName}`;
                            
                            // Check for _.ts (Logic) and _.yaml (Meta)
                            try {
                                const codePath = `${atomPath}/_.ts`;
                                const metaPath = `${atomPath}/_.yaml`;
                                
                                // 1. Verify Existence
                                await Deno.stat(codePath);
                                await Deno.stat(metaPath);
                                console.log(`    -> Files Verified for ${atomName}`);

                                // 2. Calculate Level
                                const absoluteLevel = M * 8 + m;
                                const id = `${M}/${m}/${atomName}`;

                                // 3. Load Module
                                // Dynamic import path must be absolute to work reliably across CWDs
                                const absCodePath = codePath.startsWith('/') ? codePath : `${Deno.cwd()}/${codePath}`;
                                // console.log(`    -> Importing ${atomName} from ${absCodePath}`);
                                const module = await import(`file://${absCodePath}`);
                                // console.log(`    -> Imported ${atomName}`);
                                
                                // console.log(`    -> Setting Lattice ID: ${id}`);
                                lattice.set(id, { 
                                    id: id, 
                                    level: absoluteLevel, 
                                    module: module 
                                });
                                
                            } catch (e) {
                                // Not a valid atom (missing _ files), skip silently
                                // console.error(`[RIBOSOME] Skipped ${atomPath}:`, e);
                            }
                        }
                    }
                } catch (e) {
                     // Minor Level Directory does not exist. Ignore.
                }
            }
        }

        // --- Phase 3: Lift the Vacuum ---
        lattice = await RIBOSOME.liftVacuum(lattice);

        // 🛡️ IMMUNE SYSTEM CHECK
        // console.log(`[RIBOSOME] Lift Complete. Atoms: ${lattice.size}`);
        return IMMUNE.inspect(lattice);
    },

    // Lift Crystallized Atoms from the Vacuum
    liftVacuum: async (lattice: Map<string, Atom>): Promise<Map<string, Atom>> => {
        try {
            const manifestPath = "../../../SINGULARITY/V/mod.ts";
            const { VACUUM } = await import(manifestPath);
            if (!VACUUM) return lattice;

            for (const [hash, data] of Object.entries(VACUUM)) {
                const id = `v.${hash}.ts`;
                lattice.set(id, {
                    id,
                    level: 32,
                    module: (data as any),
                    topo: { r: (data as any).r, theta: (data as any).theta, op: (data as any).op }
                });
            }
        } catch (e) { }
        return lattice;
    },

    // Inject Dependencies into a Pure Atom
    inject: async (id: string, lattice: Map<string, Atom>) => {
        // 1. Find Atom in Lattice
        const target = lattice.get(id); // ID might need adjustment based on how it's stored
        // Wait, 'id' in lattice for Octal is 'M/m/ATOM'.
        // But for injection we probably need the full path to find the YAML.
        
        if (!target) return null;
        
        // Resolve YAML path from ID
        let yamlPath = "";
        let isOctal = false;
        
        if (target.id.match(/^\d+\/\d+\//)) {
            // Octal ID: 0/0/PURE_TEST
            // ROOT PATH FIX: Remove 'i/' prefix
            yamlPath = `./${target.id}/_.yaml`;
            isOctal = true;
        } else {
            // Legacy ID: ATOM.ts
            // Legacy still lives in i/
            yamlPath = `./i/${target.id.replace('.ts', '.yaml')}`;
        }

        try {
            const yamlText = await Deno.readTextFile(yamlPath);
            const raw = parseYaml(yamlText);
            const meta = AtomSchema.safeParse(raw);
            
            if (!meta.success || !meta.data.relations?.use) {
                return null; // No dependencies
            }
            
            const ctx = { siblings: {} as any };
            
            for (const depName of meta.data.relations.use) {
                // Find dependency in lattice (by name/symbol?)
                // Current Lattice keys are Filenames or FolderNames.
                // We need a way to look up by 'Symbol' or 'Name' (ignoring path).
                
                // Brute-force search for now (Map values)
                let depAtom: Atom | undefined;
                for (const a of lattice.values()) {
                    // Check if ID contains name (simple heuristic)
                    if (a.id.includes(depName)) {
                        depAtom = a;
                        break;
                    }
                }
                
                if (depAtom) {
                    // Causal Check: Target Level vs Source Level
                    // We assume 'target' is the Consumer.
                    if (depAtom.level <= target.level) {
                        // Safe to use
                         // Check if module has default export or named export matching usage
                         // For PURE_TEST, it used CTX.siblings.LOG.
                         // Only if the dependency IS the function.
                         
                         // If legacy module, it might be an object.
                         ctx.siblings[depName] = depAtom.module.ATOM || depAtom.module.default || depAtom.module[depName] || depAtom.module;
                    } else {
                        console.warn(`[Causality Violation] ${target.id} (L${target.level}) tried to access ${depName} (L${depAtom.level})`);
                    }
                }
            }
            
            return ctx;
            
        } catch (e) {
            console.error(`Injection failed for ${id}:`, e);
            return null;
        }
    }
};

// Auto-Boot if run directly
if (import.meta.main) {
    await RIBOSOME.lift();
}
