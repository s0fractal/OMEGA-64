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

        // --- Helper: Scan a Director for Legacy Atoms ---
        const scanLegacy = async (dirPath: string) => {
            try {
                // console.log(`[RIBOSOME] Scanning Legacy Path: ${dirPath}`);
                for await (const { name } of walk(dirPath, { maxDepth: 1, includeDirs: false })) {
                    // 1. Semantic Name (ATOM.ts)
                    if (name.match(/^[A-Z0-9_]+\.ts$/)) {
                        let lvl = 0;
                        try {
                            const yamlPath = `${dirPath}/${name.replace('.ts', '.yaml')}`;
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
                            // Validate with DUAL
                            const source = await Deno.readTextFile(`${dirPath}/${name}`);
                            if (DUAL.validate(name, source)) {
                                if (name !== "TEST_PURE_RIBOSOME.ts") {
                                    // console.log(`[RIBOSOME] Lifting Legacy: ${name}`);
                                    const module = await import(`file://${dirPath}/${name}`);
                                    lattice.set(name, { id: name, level: lvl, module });
                                }
                            }
                        } catch (e) { }
                    }
                    // 2. Legacy Name (i.Lxx.core.ATOM.ts)
                    else {
                        const match = name.match(/i\.L(\d+)\.core\.([A-Z_]+)\.ts/);
                        if (match) {
                            const [_, lvlStr] = match;
                            try {
                                const source = await Deno.readTextFile(`${dirPath}/${name}`);
                                if (DUAL.validate(name, source)) {
                                    // console.log(`[RIBOSOME] Lifting Lxx: ${name}`);
                                    const module = await import(`file://${dirPath}/${name}`);
                                    lattice.set(name, { id: name, level: parseInt(lvlStr), module });
                                }
                            } catch (e) { }
                        }
                    }
                }
            } catch (e) { 
                // Directory might not exist, ignore
            }
        };

        // --- Phase 1: Legacy Flat Scan (Root) ---
        // Removed to prevent performance hangs (Legacy atoms should live in i/ or matrix)
        // await scanLegacy(root);

        // --- Phase 1.5: Legacy Subdirectory Scan (i/) ---
        console.log("[RIBOSOME] Phase 1.5: i/ Scan");
        await scanLegacy(`${root}/i`);

        // --- Phase 2: Octal Scan (The 8x8 Matrix + Laboratorium) ---
        // Scan i/{0..8}/{0..7}/ATOM/
        for (let M = 0; M < 9; M++) {
            for (let m = 0; m < 8; m++) {
                const minorPath = `${root}/${M}/${m}`;
                try {
                    // Check if minor level directory exists
                    for await (const entry of Deno.readDir(minorPath)) {
                        if (entry.isDirectory) {
                            // Found a potential Atom: M/m/ATOM/
                            const atomName = entry.name;
                            const atomPath = `${minorPath}/${atomName}`;
                            
                            // Check for _.ts (Logic) and _.yaml (Meta)
                            try {
                                const codePath = `${atomPath}/_.ts`;
                                const metaPath = `${atomPath}/_.yaml`;
                                
                                // 1. Verify Existence
                                await Deno.stat(codePath);
                                await Deno.stat(metaPath);

                                // 2. Calculate Level
                                const absoluteLevel = M * 8 + m;
                                const id = `${M}/${m}/${atomName}`;

                                // 3. Load Module
                                const absCodePath = codePath.startsWith('/') ? codePath : `${Deno.cwd()}/${codePath}`;
                                // console.log(`[RIBOSOME] Lifting Octal: ${id}`);
                                const module = await import(`file://${absCodePath}`);
                                
                                lattice.set(id, { 
                                    id: id, 
                                    level: absoluteLevel, 
                                    module: module 
                                });
                                
                            } catch (e) {
                                // Not a valid atom (missing _ files), skip silently
                            }
                        }
                    }
                } catch (e) {
                     // Minor Level Directory does not exist. Ignore.
                }
            }
        }

        // --- Phase 3: Lift the Vacuum ---
        // console.log("[RIBOSOME] Phase 3: Vacuum Scan");
        lattice = await RIBOSOME.liftVacuum(lattice);

        // 🛡️ IMMUNE SYSTEM CHECK
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
        // console.log(`[RIBOSOME] Injecting: ${id}`);
        // 1. Find Atom in Lattice
        const target = lattice.get(id); // ID might need adjustment based on how it's stored
        
        if (!target) return null;
        
        // Resolve YAML path from ID
        let yamlPath = "";
        
        if (target.id.match(/^\d+\/\d+\//)) {
            // Octal ID: 0/0/PURE_TEST
            // ROOT PATH FIX: Remove 'i/' prefix
            yamlPath = `./${target.id}/_.yaml`;
        } else {
            // Legacy ID: ATOM.ts
            // Legacy still lives in i/
            yamlPath = `./i/${target.id.replace('.ts', '.yaml')}`;
        }

        try {
            const yamlText = await Deno.readTextFile(yamlPath);
            const raw = parseYaml(yamlText);
            const meta = AtomSchema.safeParse(raw);
            
            if (!meta.success) {
                console.error(`[RIBOSOME] YAML Validation Failed for ${id}:`, meta.error.format());
                return null;
            }
            if (!meta.data.relations?.use) {
                return null; // No dependencies
            }
            
            const ctx = { siblings: {} as any };
            
            for (const depName of meta.data.relations.use) {
                // console.log(`   - Resolving Dependency: ${depName}`);
                // Find dependency in lattice (by name/symbol?)
                
                // Brute-force search with filtering
                let candidates: Atom[] = [];
                for (const a of lattice.values()) {
                    // Matches the exact tag component (e.g., .../LOG/_.ts)
                    const parts = a.id.split('/');
                    const tag = parts[parts.length - 1].replace('.ts', '');
                    if (tag === depName) {
                        candidates.push(a);
                    }
                }
                
                // Filter by Causality (Level <= Target)
                const validCandidates = candidates.filter(a => a.level <= target.level);
                
                // Pick best candidate
                validCandidates.sort((a, b) => b.level - a.level); // Descending order
                
                const depAtom = validCandidates[0];
                
                if (depAtom) {
                     // console.log(`     ✅ Found: ${depAtom.id} (L${depAtom.level})`);
                     ctx.siblings[depName] = depAtom.module.ATOM || depAtom.module.default || depAtom.module[depName] || depAtom.module;
                } else {
                     if (candidates.length > 0) {
                         console.warn(`[Causality Violation] ${target.id} (L${target.level}) needs ${depName}, but all candidates are higher level: ${candidates.map(c => `L${c.level}`).join(', ')}`);
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
