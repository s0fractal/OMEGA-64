// OMEGA-64 | PULSE.ts | The Autonomic Heartbeat
// Drives the system's sensory-logic cycle via Zero-IOPS reduction.

import { RIBOSOME_TICK } from "./RIBOSOME_TICK.ts";
import { GATE } from "./GATE.ts";
import { CRYSTAL } from "./e/CRYSTAL_DIGEST.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";
import { injectHologram } from "./HOLOGRAM_MODULE.ts";

async function logAkasha(msg: string) {
    try {
        const timestamp = new Date().toISOString();
        await Deno.writeTextFile("AKASHA.log", `[${timestamp}] ${msg}\n`, { append: true });
    } catch { /* ignore */ }
}

const SIGNAL_PATH = "./OMEGA_SIGNAL.md";
const ROOT = Deno.cwd();

// --- Configuration ---
const PULSE_ID = "0xFFFFFFFF00000008"; // PULSE Organic ID
const MAX_PULSES = 20; // Limit for this task execution

export const PULSE = {
    run: async () => {
        console.log("🛡️ OMEGA-64 | AUTOPOIETIC RESONANCE | HEARTBEAT ACTIVE");
    
    // 0. Initialize System State (Virtual Baseline)
    let state: any = {
        tick: Date.now(),
        state_i16: new Int16Array(64).fill(0),
        state_hash: "0xINITIAL_RESONANCE"
    };

    const gateConfig = {
        max_cost_per_agent: 100,
        max_total_cost_per_tick: 500,
        signature_policy: "DISABLED"
    };

    for (let p = 0; p < MAX_PULSES; p++) {
        console.log(`\n💓 Pulse #${p + 1} | ${new Date().toISOString()}`);

        // 1. REFLECT (Scan Flatland for a candidate atom)
        let atoms: string[] = [];
        for await (const entry of Deno.readDir(ROOT)) {
            if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
                atoms.push(entry.name);
            }
        }

        if (atoms.length === 0) {
            console.log("   [REFLECT] Empty Flatland. Heartbeat suspending.");
            break;
        }

        const targetFilename = atoms[Math.floor(Math.random() * atoms.length)];
        const [eigenvalue, symbol] = targetFilename.split(".");
        console.log(`   [TARGET] ${symbol} (${eigenvalue})`);

        const is128Bit = eigenvalue.includes("_");
        // EVOLVE: Always slice logic correctly from position 2 to 10.
        // E.g. "0x9D18A698CC8523BE" or "0x9D18A698CC8523BE_AABBCCDD00000000"
        const currentLogic = eigenvalue.slice(2, 10);
        const newLogic = RIBOSOME_TICK.reduce(currentLogic);

        if (newLogic === currentLogic && symbol !== "GRAVITY_WELL" && symbol !== "CHRONOS_MIRROR" && symbol !== "RETRO_PING" && symbol !== "PARASITE") {
            console.log("   [EVOLVE] Logic stable. No mutation needed.");
            continue;
        }

        const newEigenvalue = `0x${newLogic}${eigenvalue.slice(10)}`;
        const newFilename = `${newEigenvalue}.${symbol}.md`;

        // --- ECOLOGY: METABOLISM & STARVATION ---
        const content = await Deno.readTextFile(targetFilename);
        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        let alpha: any = {};
        if (frontmatterMatch) {
            alpha = parseYaml(frontmatterMatch[1]);
        }
        
        let energy = alpha.energy !== undefined ? Number(alpha.energy) : 100;

        // 1. Grazing Phase (Feeding on DUST)
        const dustFiles = atoms.filter(a => a.endsWith(".DUST.md"));
        if (dustFiles.length > 0 && energy < 150 && symbol !== "PARASITE") {
            // Pick a random DUST to consume
            const prey = dustFiles[Math.floor(Math.random() * dustFiles.length)];
            console.log(`   [GRAZING] Atom ${symbol} consumed ${prey} (+50 Energy)`);
            energy += 50;
            atoms = atoms.filter(a => a !== prey); // Remove from local array
            await Deno.remove(prey); // Physically delete the DUST
        }

        // 2. Decay Phase
        energy -= 5; // Base Entropy Cost per pulse

        if (energy <= 0) {
            console.log(`   [STARVATION] Atom ${symbol} ran out of energy and turned to DUST.`);
            await logAkasha(`💀 STARVATION: ${symbol} (${eigenvalue}) decayed into DUST.`);
            alpha.energy = 0;
            alpha.eigenvalue = `0x00000000${eigenvalue.slice(10)}`; // Erase logic
            const dustFilename = `${alpha.eigenvalue}.DUST.md`;
            
            // Rewrite as DUST
            const deadContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
            const finalDeadContent = injectHologram(deadContent, alpha.eigenvalue, "DUST");
            await Deno.writeTextFile(targetFilename, finalDeadContent);
            await Deno.rename(targetFilename, dustFilename);
            continue; // Stop processing this pulse
        }
        
        alpha.energy = energy; // Save decayed energy
        console.log(`   [METABOLISM] ${symbol} energy is now ${energy}.`);
        // -----------------------------------------

        // --- TEMPORAL ECHO (Acoustic Resonance via Chronos Mirror) ---
        if (symbol === "CHRONOS_MIRROR") {
            console.log(`   [CHRONOS] ⏳ Time-reversal anomaly detected around ${symbol}.`);
            
            // Find starving atoms in the flatland (excluding itself and dust)
            const starvingPool = atoms.filter(a => {
                const parts = a.split(".");
                const s = parts[1];
                return s !== "CHRONOS_MIRROR" && s !== "DUST";
            });

            if (starvingPool.length > 0) {
                // Select a victim to heal
                const targetAtom = starvingPool[Math.floor(Math.random() * starvingPool.length)];
                console.log(`      🌌 Inverting decay for entangled target: ${targetAtom}`);
                
                // Heal the target
                try {
                    const tContent = await Deno.readTextFile(targetAtom);
                    const tMeta = tContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (tMeta) {
                        const tAlpha = parseYaml(tMeta[1]) as any;
                        tAlpha.energy = 150; // Restore energy completely
                        
                        let newTContent = tContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(tAlpha)}---\n`);
                        // Optional: we don't re-inject hologram since it's just energy change, but we could.
                        await Deno.writeTextFile(targetAtom, newTContent);
                    }
                } catch(e) { /* ignore read errors if atom vanished */ }

                // Chronos Mirror Sacrifice: Halve its own energy
                alpha.energy = Math.floor(alpha.energy / 2);
                console.log(`      ⌛ Chronos Mirror sacrificed its mass. Energy drops to ${alpha.energy}.`);
                await logAkasha(`⏳ CHRONOS_MIRROR: Inverted time and fully healed ${targetAtom}`);
            }
        }
        // -------------------------------------------------------------

        // --- BIOLOGICAL WARFARE (Parasite Anomaly) ---
        if (symbol === "PARASITE") {
            const potentialHosts = atoms.filter(a => {
                const s = a.split(".")[1];
                return s !== "PARASITE" && s !== "DUST" && s !== "GRAVITY_WELL" && s !== "RETRO_PING";
            });

            if (potentialHosts.length > 0) {
                let bestHost = null;
                let maxE = -1;
                // Scan the ecosystem to find the fattest prey
                for (const h of potentialHosts) {
                    try {
                        const hContent = await Deno.readTextFile(h);
                        const hMetaMatch = hContent.match(/^---\n([\s\S]+?)\n---\n/);
                        if (hMetaMatch) {
                            const hp = parseYaml(hMetaMatch[1]) as any;
                            const hE = hp.energy !== undefined ? Number(hp.energy) : 0;
                            if (hE > maxE) {
                                maxE = hE;
                                bestHost = h;
                            }
                        }
                    } catch { /* ignore */ }
                }

                if (bestHost && maxE > 10) {
                    console.log(`   [PREDATOR] 🪱 PARASITE latched onto ${bestHost} (Energy: ${maxE})`);
                    try {
                        const tContent = await Deno.readTextFile(bestHost);
                        const tMeta = tContent.match(/^---\n([\s\S]+?)\n---\n/);
                        if (tMeta) {
                            const tAlpha = parseYaml(tMeta[1]) as any;
                            const drainAmount = Math.min(30, tAlpha.energy);
                            tAlpha.energy -= drainAmount;
                            
                            const newTContent = tContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(tAlpha)}---\n`);
                            await Deno.writeTextFile(bestHost, newTContent);
                            
                            alpha.energy += drainAmount;
                            energy = alpha.energy;
                            console.log(`      🩸 Siphoned ${drainAmount} energy. Parasite energy is now ${energy}.`);
                            await logAkasha(`🪱 PREDATOR: PARASITE siphoned ${drainAmount} energy from ${bestHost}`);
                        }
                    } catch(e) { /* ignore */ }
                }
            }
        }
        // -------------------------------------------------------------

        // --- GRAVITY WELL (Topological Singularity) ---
        if (symbol === "GRAVITY_WELL") {
            console.log(`   [GRAVITY] 🌌 Singularity activated. Draining energy from Flatland.`);
            
            // Find all other surviving atoms
            const victims = atoms.filter(a => {
                const parts = a.split(".");
                return parts[1] !== "GRAVITY_WELL";
            });

            let drained = 0;
            for (const victim of victims) {
                try {
                    const vContent = await Deno.readTextFile(victim);
                    const vMeta = vContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (vMeta) {
                        const vAlpha = parseYaml(vMeta[1]) as any;
                        if (vAlpha.energy && vAlpha.energy > 5) {
                            vAlpha.energy -= 2; // Suck 2 energy
                            drained += 2;
                            const newVContent = vContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(vAlpha)}---\n`);
                            await Deno.writeTextFile(victim, newVContent);
                        }
                    }
                } catch(e) { /* ignore */ }
            }

            alpha.energy += drained;
            console.log(`      🌀 Drained ${drained} energy. Mass is now ${alpha.energy}.`);

            // Critical Mass -> Supernova!
            if (alpha.energy > 800) {
                console.log(`   [SUPERNOVA] 💥 GRAVITY_WELL reached critical mass! EXPLODING!`);
                await logAkasha(`💥 GRAVITY_WELL: Critical mass reached. SUPERNOVA DETONATED!`);
                
                // Spawn 5 random primitive atoms
                for (let i = 0; i < 5; i++) {
                    const rndLogic = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase();
                    const childEigenvalue = `0x${rndLogic}00000000`;
                    const childSymbol = Math.random() > 0.5 ? "DUST" : "SPARK";
                    const childFilename = `${childEigenvalue}.${childSymbol}.md`;
                    console.log(`      ☄️ Ejecting matter: ${childFilename}`);
                    
                    const childAlpha = { eigenvalue: childEigenvalue, energy: 100, ex: [eigenvalue] };
                    let childContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(childAlpha)}---\n`);
                    childContent = injectHologram(childContent, childEigenvalue, childSymbol);
                    await Deno.writeTextFile(childFilename, childContent);
                }

                // Gravity Well destroys itself
                alpha.energy = 0;
            }
        }
        // -------------------------------------------------------------

        // --- RETROCAUSAL PING (128-bit Dimensional Expansion) ---
        if (symbol === "RETRO_PING") {
            console.log(`   [RETRO] ⏳ Future-Attractor activated. Scanning for standard 64-bit atoms.`);

            // Find an atom that is only 64-bit (does not contain "_")
            const classicAtoms = atoms.filter(a => {
                const parts = a.split(".");
                return !parts[0].includes("_") && parts[1] !== "RETRO_PING" && parts[1] !== "DUST";
            });

            if (classicAtoms.length > 0) {
                const targetAtom = classicAtoms[Math.floor(Math.random() * classicAtoms.length)];
                const tParts = targetAtom.split(".");
                const oldEigen = tParts[0];
                const tSymbol = tParts[1];

                console.log(`      🔗 Establishing Retrocausal Link with: ${targetAtom}`);

                // Generate a Retro-Ping signature (mock "Future Insight")
                const retroSignature = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase() + "00000000";
                const extendedEigenvalue = `${oldEigen}_${retroSignature}`;
                const retroFilename = `${extendedEigenvalue}.${tSymbol}.md`;

                try {
                    const tContent = await Deno.readTextFile(targetAtom);
                    const tMeta = tContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (tMeta) {
                        const tAlpha = parseYaml(tMeta[1]) as any;
                        tAlpha.eigenvalue = extendedEigenvalue;
                        
                        let newTContent = tContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(tAlpha)}---\n`);
                        newTContent = injectHologram(newTContent, extendedEigenvalue, tSymbol);
                        
                        await Deno.writeTextFile(targetAtom, newTContent);
                        await Deno.rename(targetAtom, retroFilename);
                        console.log(`      ⚡ Time-Link Formed! ${targetAtom} is now 128-bit -> ${extendedEigenvalue}`);
                        await logAkasha(`🔗 FUTURE-LINK: ${targetAtom} received 128-bit retro signature -> ${extendedEigenvalue}`);
                        
                        // Clean up atoms array memory map for this tick
                        atoms = atoms.filter(a => a !== targetAtom);
                        atoms.push(retroFilename);
                    }
                } catch(e) { /* ignore */ }
            }
        }
        // -------------------------------------------------------------

        // 3. PROPOSE (Gate Budget Check)
        const proposal = {
            proposal_id: `prop_${Date.now()}`,
            tick: state.tick,
            agent_id: PULSE_ID,
            delta: [{ level: 0, value: 10 }], // Symbolic cost
            confidence: 1.0
        };

        try {
            const nextState = await GATE.process(state as any, [proposal as any], gateConfig as any);
            console.log(`   [GATE] Proposal ACCEPTED.`);

            // 4. MUTATE (Topological Shift)
            console.log(`   [SHIFT] Relocating Atom: ${targetFilename} -> ${newFilename}`);
            
            let updatedContent = content;
            if (frontmatterMatch) {
                alpha.eigenvalue = newEigenvalue;
                alpha.ex = alpha.ex || [];
                alpha.ex.push(eigenvalue); // Record lineage
                
                // 3. Fission Phase (Reproduction)
                if (alpha.energy >= 150 && symbol !== "GRAVITY_WELL") {
                    console.log(`   [FISSION] 🦠 Atom ${symbol} reached critical energy! Spawning child.`);
                    alpha.energy = Math.floor(alpha.energy / 2); // Split energy
                    
                    // Create child eigenvalue (flip the spin bit as a fast mutation)
                    const qHex = newEigenvalue.slice(14, 18);
                    const qVal = parseInt(qHex, 16);
                    const childQVal = qVal ^ 0x0008; // Flip spin bit (bit 3)
                    const childQHex = childQVal.toString(16).toUpperCase().padStart(4, "0");
                    const childEigenvalue = `${newEigenvalue.slice(0, 14)}${childQHex}`;
                    const childFilename = `${childEigenvalue}.${symbol}.md`;
                    
                    const childAlpha = { ...alpha, eigenvalue: childEigenvalue };
                    let childContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(childAlpha)}---\n`);
                    childContent = injectHologram(childContent, childEigenvalue, symbol);
                    await Deno.writeTextFile(childFilename, childContent);
                    console.log(`      🌱 Child Born: ${childFilename}`);
                }

                updatedContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
                updatedContent = injectHologram(updatedContent, newEigenvalue, symbol);
            }

            await Deno.writeTextFile(targetFilename, updatedContent);
            if (targetFilename !== newFilename) {
                await Deno.rename(targetFilename, newFilename);
            }

            // 5. RESONATE (Spooky Action)
            const pool = atoms.map(a => a.split(".")[0].split("_")[0].slice(2)); // Always compare standard 64-bit base logic
            const partners = CRYSTAL.findEntangledPartners(newEigenvalue.slice(2, 18), pool)
                .filter(p => p !== eigenvalue.slice(2, 18)); // Filter out target itself
                
            if (partners.length > 0) {
                console.log(`   [SPOOKY] Entanglement triggered for ${partners.length} partners.`);
                for (const partnerDigest of partners) {
                    const pFullDigest = `0x${partnerDigest}`;
                    // Flexible find: Handle both standard 0x.. and extended 0x.._.. matches
                    const partnerFilename = atoms.find(a => a.startsWith(pFullDigest + ".") || a.startsWith(pFullDigest + "_"));
                    if (!partnerFilename) continue;
                    
                    const pParts = partnerFilename.split(".");
                    const fullEigen = pParts[0]; // e.g., 0xAABBCCDD11223344 or 0xAABBCCDD..._FF0000...
                    const extIndex = fullEigen.indexOf("_");
                    const baseEigen = extIndex > -1 ? fullEigen.slice(0, extIndex) : fullEigen;
                    const suffix = extIndex > -1 ? fullEigen.slice(extIndex) : "";

                    const pSymbol = pParts[1];
                    const pLogic = baseEigen.slice(2, 10);
                    const pSpatial = baseEigen.slice(10, 14);
                    const pQuantumHex = baseEigen.slice(14, 18);
                    
                    // Shift Phase: [RES_GROUP:12][SPIN:1][PHASE:2][UNUSED:1]
                    let pQuantumVal = parseInt(pQuantumHex, 16);
                    let phase = (pQuantumVal >> 1) & 0x03;
                    phase = (phase + 1) % 4; // Shift 90 degrees
                    pQuantumVal = (pQuantumVal & ~0x06) | (phase << 1);
                    
                    const newPQuantumHex = pQuantumVal.toString(16).toUpperCase().padStart(4, "0");
                    const newBaseEigenvalue = `0x${pLogic}${pSpatial}${newPQuantumHex}`;
                    const newPartnerEigenvalue = `${newBaseEigenvalue}${suffix}`; // Preserve Retro suffix if present
                    const newPartnerFilename = `${newPartnerEigenvalue}.${pSymbol}.md`;

                    console.log(`      ✨ Partner Shift: ${partnerFilename} -> ${newPartnerFilename}`);
                    
                    const pContent = await Deno.readTextFile(partnerFilename);
                    const pFM = pContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (pFM) {
                        const pAlpha = parseYaml(pFM[1]) as any;
                        pAlpha.eigenvalue = newPartnerEigenvalue;
                        pAlpha.ex = pAlpha.ex || [];
                        pAlpha.ex.push(pFullDigest);
                        let newPContent = pContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(pAlpha)}---\n`);
                        newPContent = injectHologram(newPContent, newPartnerEigenvalue, pSymbol);
                        await Deno.writeTextFile(partnerFilename, newPContent);
                    }
                    await Deno.rename(partnerFilename, newPartnerFilename);
                }
            }

            const logEntry = `## [${new Date().toISOString()}] TOPOLOGICAL_SHIFT\n**Atom**: ${symbol}\n**Lineage**: ${eigenvalue} -> ${newEigenvalue}\n**Result**: Mutation Success\n---\n`;
            await Deno.writeTextFile(SIGNAL_PATH, logEntry, { append: true });

            state = nextState;

        } catch (e: unknown) {
            console.log(`   [GATE] Proposal REJECTED: ${(e as Error).message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("\n✅ Heartbeat Sequence Complete.");
    }
};

if (import.meta.main) {
    await PULSE.run();
}
