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
const MAX_PULSES = 100; // Increased for verification 

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

        const forcedTarget = Deno.env.get("PULSE_TARGET");
        let targetFilename = forcedTarget || atoms[Math.floor(Math.random() * atoms.length)];
        let [eigenvalue, symbol] = targetFilename.split(".");
        console.log(`   [TARGET] ${symbol} (${eigenvalue})`);

        const content = await Deno.readTextFile(targetFilename);
        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        let alpha: any = {};
        if (frontmatterMatch) {
            alpha = parseYaml(frontmatterMatch[1]);
        } else {
            console.log(`   [SKIP] ${targetFilename} has no frontmatter.`);
            continue; 
        }

        const is128Bit = eigenvalue.includes("_");
        // EVOLVE: Always slice logic correctly from position 2 to 10.
        // E.g. "0x9D18A698CC8523BE" or "0x9D18A698CC8523BE_AABBCCDD00000000"
        let currentLogic = eigenvalue.slice(2, 10);
        const newLogic = RIBOSOME_TICK.reduce(currentLogic);

        const hasSignals = (alpha.signals && alpha.signals.length > 0);
        if (hasSignals) console.log(`   [DEBUG] ${symbol} has ${alpha.signals.length} signals!`);

        if (newLogic === currentLogic && !hasSignals && symbol !== "GRAVITY_WELL" && symbol !== "CHRONOS_MIRROR" && symbol !== "RETRO_PING" && symbol !== "PARASITE" && symbol !== "CODE_VECTOR_SINGULARITY") {
            console.log("   [EVOLVE] Logic stable and no signals. Skipping mutation cycle.");
            continue;
        }

        const newEigenvalue = `0x${newLogic}${eigenvalue.slice(10)}`;
        const newFilename = `${newEigenvalue}.${symbol}.md`;

        // --- ECOLOGY: METABOLISM & STARVATION ---
        
        let energy = alpha.energy !== undefined ? Number(alpha.energy) : 100;
        let x = alpha.x !== undefined ? Number(alpha.x) : Math.floor(Math.random() * 800) + 100;
        let y = alpha.y !== undefined ? Number(alpha.y) : Math.floor(Math.random() * 600) + 100;
        const bonds: string[] = Array.isArray(alpha.bonds) ? alpha.bonds : [];

        // --- SEMANTIC KINESIS (DNA-Driven Movement) ---
        // Instead of random drift, we derive a velocity vector from the 8-hex logic string.
        let velX = 0;
        let velY = 0;
        
        for (let i = 0; i < 4; i++) {
            const charX = parseInt(currentLogic[i], 16);
            velX += (charX > 7 ? charX - 7 : charX - 8) * 3; // Produces range roughly -24 to +24
            
            const charY = parseInt(currentLogic[i + 4], 16);
            velY += (charY > 7 ? charY - 7 : charY - 8) * 3;
        }

        // Add 10% randomness for organic jitter, but 90% driven by DNA
        x += velX + (Math.random() - 0.5) * 10;
        y += velY + (Math.random() - 0.5) * 10;

        // --- SPRING-MASS PHYSICS (Macro-Molecules) ---
        // If bonded, apply Hooke's Law to keep them at a strict molecular distance
        if (bonds.length > 0) {
            for (const bondedEigen of bonds) {
                const partnerFile = atoms.find(a => a.includes(bondedEigen));
                if (partnerFile && partnerFile !== targetFilename) {
                    try {
                        const pContent = await Deno.readTextFile(partnerFile);
                        const pMeta = pContent.match(/^---\n([\s\S]+?)\n---\n/);
                        if (pMeta) {
                            const pAlpha = parseYaml(pMeta[1]) as any;
                            const pX = pAlpha.x !== undefined ? Number(pAlpha.x) : x;
                            const pY = pAlpha.y !== undefined ? Number(pAlpha.y) : y;
                            
                            const dx = pX - x;
                            const dy = pY - y;
                            const dist = Math.hypot(dx, dy) || 1; // Prevent div by 0
                            
                            // Optimal bond distance is ~50px
                            if (dist > 60) {
                                // Too far, attract (Spring pulling)
                                const force = (dist - 60) * 0.1; // Pull strength
                                x += (dx / dist) * force;
                                y += (dy / dist) * force;
                            } else if (dist < 40) {
                                // Too close, repel (Electron repulsion)
                                const force = (40 - dist) * 0.2; // Push strength
                                x -= (dx / dist) * force;
                                y -= (dy / dist) * force;
                            }
                        }
                    } catch(e) { /* ignore missing bonds */ }
                }
            }
        }
        // --- GEOMETRIC MORPHOGENESIS (Structural Integrity) ---
        // If the 3rd nibble of DNA is >= 'C' (12), the atom becomes a Structural Anchor.
        // It pushes partners to maintain geometric angles, forming rigid 'Organs'.
        const structuralNibble = parseInt(currentLogic[2], 16);
        if (structuralNibble >= 12 && bonds.length >= 2) {
            // We need coordinates of at least two partners to calculate an angle
            const partnerCoords = [];
            for (const bEigen of bonds) {
                const pf = atoms.find(a => a.includes(bEigen));
                if (pf) {
                    try {
                        const pfContent = await Deno.readTextFile(pf);
                        const pfMeta = pfContent.match(/^---\n([\s\S]+?)\n---\n/);
                        if (pfMeta) {
                            const pfAlpha = parseYaml(pfMeta[1]) as any;
                            partnerCoords.push({ x: Number(pfAlpha.x), y: Number(pfAlpha.y), file: pf });
                        }
                    } catch { /* skip */ }
                }
                if (partnerCoords.length >= 2) break;
            }

            if (partnerCoords.length >= 2) {
                // Vector A (Anchor -> Partner 1)
                const v1x = partnerCoords[0].x - x;
                const v1y = partnerCoords[0].y - y;
                // Vector B (Anchor -> Partner 2)
                const v2x = partnerCoords[1].x - x;
                const v2y = partnerCoords[1].y - y;

                const angle = Math.abs(Math.atan2(v1y, v1x) - Math.atan2(v2y, v2x));
                const targetAngle = structuralNibble >= 14 ? Math.PI / 2 : (2 * Math.PI) / 3; // 90 deg or 120 deg
                
                if (angle < targetAngle - 0.2) {
                    // Too close! Push them apart
                    x -= (v1x + v2x) * 0.05;
                    y -= (v1y + v2y) * 0.05;
                    console.log(`   [MORPH] ${symbol} stiffening geometry (${(angle * 180 / Math.PI).toFixed(0)}°)`);
                }
            }
        }
        // ---------------------------------------------
        // --- LIVING LOGIC: INSTRUCTION SET PARSING ---
        const moveNibble = parseInt(currentLogic[0], 16);
        const socialNibble = parseInt(currentLogic[1], 16);
        
        let moveThought = "WANDER";
        if (moveNibble <= 3) moveThought = "SEEK_ALPHA";
        else if (moveNibble <= 7) moveThought = "AVOID_PARASITE";
        else if (moveNibble <= 11) moveThought = "WANDER";
        else moveThought = "ORBIT";
        
        let socialThought = "PASSIVE";
        if (socialNibble <= 7) socialThought = "PASSIVE";
        else if (socialNibble <= 11) socialThought = "BONDING";
        else socialThought = "MATING";
        
        alpha.thought = `${moveThought}_${socialThought}`;

        // --- HIERARCHICAL GRAVITY (Alpha Orbits) ---
        // If moveThought is SEEK_ALPHA or ORBIT, and we are not an alpha
        if (!symbol.startsWith("ALPHA_") && !symbol.includes("DUST")) {
            const alphaMatch = atoms.find(a => a.includes(`ALPHA_${symbol}`));
            if (alphaMatch) {
                try {
                    const aContent = await Deno.readTextFile(alphaMatch);
                    const aMeta = aContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (aMeta) {
                        const aAlpha = parseYaml(aMeta[1]) as any;
                        const aX = aAlpha.x !== undefined ? Number(aAlpha.x) : x;
                        const aY = aAlpha.y !== undefined ? Number(aAlpha.y) : y;
                        
                        const dx = aX - x;
                        const dy = aY - y;
                        const dist = Math.hypot(dx, dy) || 1;
                        
                        if (dist < 400) {
                            if (moveThought === "SEEK_ALPHA") {
                                // Direct attraction
                                x += (dx / dist) * 5.0;
                                y += (dy / dist) * 5.0;
                                console.log(`   [THOUGHT] ${symbol} is seeking Alpha.`);
                            } else if (moveThought === "ORBIT") {
                                // Gentle attraction + Tangential velocity
                                x += (dx / dist) * 2.0;
                                y += (dy / dist) * 2.0;
                                x += (-dy / dist) * 15; 
                                y += (dx / dist) * 15;
                                console.log(`   [THOUGHT] ${symbol} is orbiting Alpha.`);
                            }
                        }
                    }
                } catch(e) { /* ignore */ }
            }
        }
        
        // AVOID PARASITE Logic
        if (moveThought === "AVOID_PARASITE") {
            const parasite = atoms.find(a => a.includes("PARASITE"));
            if (parasite) {
                try {
                    const pContent = await Deno.readTextFile(parasite);
                    const pMeta = pContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (pMeta) {
                        const pAlpha = parseYaml(pMeta[1]) as any;
                        const pX = pAlpha.x !== undefined ? Number(pAlpha.x) : x;
                        const pY = pAlpha.y !== undefined ? Number(pAlpha.y) : y;
                        const dx = pX - x;
                        const dy = pY - y;
                        const dist = Math.hypot(dx, dy) || 1;
                        if (dist < 300) {
                            x -= (dx / dist) * 10.0; // Run away!
                            y -= (dy / dist) * 10.0;
                            console.log(`   [THOUGHT] ${symbol} is avoiding PARASITE!`);
                            alpha.thought = "PANIC_AVOID_PARASITE";
                        }
                    }
                } catch(e) { /* ignore */ }
            }
        }
        // -------------------------------------------

        // Apply Boundaries
        x = Math.max(50, Math.min(1350, Math.floor(x)));
        y = Math.max(50, Math.min(750, Math.floor(y)));
        
        alpha.x = x;
        alpha.y = y;

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

        // --- NEURO-PULSE PROCESSING (Synaptic Phase) ---
        const incomingSignals = alpha.signals || [];
        const outgoingSignals: any[] = [];
        
        if (incomingSignals.length > 0) {
            console.log(`   [SYNAPSE] ${symbol} processing ${incomingSignals.length} signals.`);
            for (const sig of incomingSignals) {
                // Apply effect to self
                if (sig.type === "ENERGY") {
                    energy += sig.power;
                    await logAkasha(`⚡ NEURO: ${symbol} received ENERGY pulse (+${sig.power.toFixed(1)} NRG)`);
                } else if (sig.type === "SHOCK") {
                    energy -= sig.power;
                    await logAkasha(`💥 NEURO: ${symbol} received SHOCK pulse (-${sig.power.toFixed(1)} NRG)`);
                } else if (sig.type === "LOGIC") {
                    const prevLogic = currentLogic;
                    currentLogic = RIBOSOME_TICK.reduce(currentLogic);
                    if (prevLogic !== currentLogic) {
                        await logAkasha(`🧬 NEURO: ${symbol} logic mutated via SIGNAL (${prevLogic} -> ${currentLogic})`);
                    }
                }

                // Propagate to bonds if power remains
                if (sig.power > 5 && bonds.length > 0) {
                    const targetBond = bonds[Math.floor(Math.random() * bonds.length)];
                    outgoingSignals.push({
                        type: sig.type,
                        power: sig.power * 0.7, // 30% loss per hop
                        origin: eigenvalue
                    });

                    // Relay to a random partner
                    const partnerFile = atoms.find(a => a.includes(targetBond));
                    if (partnerFile) {
                        try {
                            const pContent = await Deno.readTextFile(partnerFile);
                            const pMeta = pContent.match(/^---\n([\s\S]+?)\n---\n/);
                            if (pMeta) {
                                const pAlpha = parseYaml(pMeta[1]) as any;
                                pAlpha.signals = pAlpha.signals || [];
                                pAlpha.signals.push(outgoingSignals[outgoingSignals.length - 1]);
                                const newPContent = pContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(pAlpha)}---\n`);
                                await Deno.writeTextFile(partnerFile, newPContent);
                            }
                        } catch { /* skip missing partner */ }
                    }
                }
            }
        }
        // Clear self signals after processing
        alpha.signals = []; 
        alpha.energy = energy;
        // -----------------------------------------------

        // --- ALPHA EVOLUTION ---
        if (energy > 300 && !symbol.startsWith("ALPHA_") && !["PARASITE", "GRAVITY_WELL", "CHRONOS_MIRROR", "RETRO_PING", "CODE_VECTOR_SINGULARITY"].includes(symbol)) {
            const newSymbol = `ALPHA_${symbol}`;
            console.log(`   [EVOLUTION] ⭐ ${symbol} has reached Alpha state! Evolution triggered.`);
            await logAkasha(`⭐ EVOLUTION: ${symbol} (${eigenvalue}) transcended to ${newSymbol}`);
            const newFilename = targetFilename.replace(`.${symbol}.md`, `.${newSymbol}.md`);
            await Deno.rename(targetFilename, newFilename);
            // Update local state for the rest of the pulse
            targetFilename = newFilename;
            symbol = newSymbol;
        }
        // -----------------------

        // --- ENERGY OSMOSIS (Synaptic Network Sharing) ---
        if (bonds.length > 0 && energy > 0 && !symbol.includes("DUST")) {
            for (const bondedEigen of bonds) {
                // Find the connected atom file
                const partnerFile = atoms.find(a => a.includes(bondedEigen));
                if (partnerFile && partnerFile !== targetFilename) {
                    try {
                        const pContent = await Deno.readTextFile(partnerFile);
                        const pMeta = pContent.match(/^---\n([\s\S]+?)\n---\n/);
                        if (pMeta) {
                            const pAlpha = parseYaml(pMeta[1]) as any;
                            const pEnergy = pAlpha.energy !== undefined ? Number(pAlpha.energy) : 0;
                            
                            // If there's a significant energy delta (> 20), equalize it
                            const delta = Math.abs(energy - pEnergy);
                            if (delta > 20) {
                                const average = Math.floor((energy + pEnergy) / 2);
                                
                                console.log(`   [OSMOSIS] 🕸️ Equalizing energy between ${symbol} (${energy}) and partner (${pEnergy}) -> ${average}`);
                                
                                // Update self
                                energy = average;
                                alpha.energy = energy;
                                
                                // Update partner
                                pAlpha.energy = average;
                                const newPContent = pContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(pAlpha)}---\n`);
                                await Deno.writeTextFile(partnerFile, newPContent);
                            }
                        }
                    } catch(e) { 
                        // If partner is dead/missing, we could prune the bond here, but let's let ghosts remain for now
                    }
                }
            }
        }
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
                        
                        const newTContent = tContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(tAlpha)}---\n`);
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

        // --- GENETIC RECOMBINATION (Meiosis) ---
        // Only run for "living" non-anomalous atoms that have enough energy to breed
        if (energy > 150 && !symbol.includes("DUST") && !["PARASITE", "GRAVITY_WELL", "CHRONOS_MIRROR", "RETRO_PING", "CODE_VECTOR_SINGULARITY"].includes(symbol)) {
            // Find a mate close by
            const potentialMates = atoms.filter(a => {
                const s = a.split(".")[1];
                return a !== targetFilename && !s.includes("DUST") && !["PARASITE", "GRAVITY_WELL", "CHRONOS_MIRROR", "RETRO_PING"].includes(s);
            });

            for (const mate of potentialMates) {
                try {
                    const mContent = await Deno.readTextFile(mate);
                    const mMetaMatch = mContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (mMetaMatch) {
                        const mAlpha = parseYaml(mMetaMatch[1]) as any;
                        const mE = mAlpha.energy !== undefined ? Number(mAlpha.energy) : 0;
                        const mX = mAlpha.x !== undefined ? Number(mAlpha.x) : 0;
                        const mY = mAlpha.y !== undefined ? Number(mAlpha.y) : 0;
                        
                        const dist = Math.hypot(mX - x, mY - y);
                        
                        // If they collide and the mate is also fertile
                        if (dist < 20 && mE > 150) {
                            console.log(`   [MEIOSIS] 🧬 Mating Dance initiated between ${symbol} and ${mate.split(".")[1]}`);
                            
                            // 1. Expend energy
                            energy -= 50; 
                            alpha.energy = energy;
                            mAlpha.energy = mE - 50;
                            
                            // Save mate's drained state
                            const newMContent = mContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(mAlpha)}---\n`);
                            await Deno.writeTextFile(mate, newMContent);

                            // 2. Synthesize Child DNA (Bitwise XOR or Interleaving)
                            const mateLogic = mate.split(".")[0].slice(2, 10);
                            let childLogic = "";
                            for (let i = 0; i < 8; i++) {
                                // 50/50 chance to inherit from A or B
                                childLogic += Math.random() > 0.5 ? currentLogic[i] : mateLogic[i];
                            }
                            
                            // 3. Mutate (10% chance to flip a hex char)
                            if (Math.random() < 0.1) {
                                const mutIdx = Math.floor(Math.random() * 8);
                                const mutChar = Math.floor(Math.random() * 16).toString(16).toUpperCase();
                                childLogic = childLogic.substring(0, mutIdx) + mutChar + childLogic.substring(mutIdx + 1);
                                console.log(`      🧪 Genetic Mutation occurred in child!`);
                            }

                            const childEigenvalue = `0x${childLogic}00000000`;
                            const childSymbol = Math.random() > 0.5 ? symbol : mate.split(".")[1]; // Inherit symbol from one parent
                            const childFilename = `${childEigenvalue}.${childSymbol}.md`;
                            
                            console.log(`      👶 Child Born: ${childFilename}`);
                            await logAkasha(`🧬 MEIOSIS: ${symbol} and ${mate.split(".")[1]} spawned ${childFilename}`);
                            
                            const childAlpha = { eigenvalue: childEigenvalue, energy: 100, x: (x + mX) / 2, y: (y + mY) / 2, ex: [eigenvalue, mate.split(".")[0]], bonds: [], thought: "BORN" };
                            let childContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(childAlpha)}---\n`);
                            childContent = injectHologram(childContent, childEigenvalue, childSymbol);
                            await Deno.writeTextFile(childFilename, childContent);
                            
                            break; // Breed only once per pulse
                        }
                    }
                } catch { /* ignore */ }
            }
        }
        // -------------------------------------------------------------

        // --- CULTURAL CONVERGENCE (DNA Sync) ---
        if (bonds.length > 0 && !symbol.includes("DUST")) {
            for (const bondedEigen of bonds) {
                const partnerFile = atoms.find(a => a.includes(bondedEigen));
                if (partnerFile) {
                    try {
                        const pContent = await Deno.readTextFile(partnerFile);
                        const pLogic = partnerFile.split(".")[0].slice(2, 10);
                        // 10% chance to sync one character per pulse
                        if (Math.random() < 0.1) {
                            const charIdx = Math.floor(Math.random() * 8);
                            if (currentLogic[charIdx] !== pLogic[charIdx]) {
                                console.log(`   [CULTURE] ${symbol} is learning from its partner...`);
                                // Since logic is in the filename, we'd need to rename.
                                // But for now, let's just log the intent or actually do it.
                                const newLogicS = currentLogic.substring(0, charIdx) + pLogic[charIdx] + currentLogic.substring(charIdx+1);
                                const newE = `0x${newLogicS}${eigenvalue.slice(10)}`;
                                const newF = `${newE}.${symbol}.md`;
                                await Deno.rename(targetFilename, newF);
                                targetFilename = newF;
                                eigenvalue = newE;
                                currentLogic = newLogicS;
                            }
                        }
                    } catch(e) { /* ignore */ }
                }
            }
        }
        // ---------------------------------------

        // --- SYNAPTIC BONDING (Mycelial Network Formation) ---
        if (energy > 100 && !symbol.includes("DUST") && !["PARASITE", "GRAVITY_WELL", "CHRONOS_MIRROR", "RETRO_PING", "CODE_VECTOR_SINGULARITY"].includes(symbol)) {
             const potentialBonds = atoms.filter(a => {
                const s = a.split(".")[1];
                return a !== targetFilename && !s.includes("DUST") && !["PARASITE", "GRAVITY_WELL", "CHRONOS_MIRROR", "RETRO_PING"].includes(s);
            });

            for (const potential of potentialBonds) {
                try {
                    const pContent = await Deno.readTextFile(potential);
                    const pMetaMatch = pContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (pMetaMatch) {
                        const pAlpha = parseYaml(pMetaMatch[1]) as any;
                        const pE = pAlpha.energy !== undefined ? Number(pAlpha.energy) : 0;
                        const pX = pAlpha.x !== undefined ? Number(pAlpha.x) : 0;
                        const pY = pAlpha.y !== undefined ? Number(pAlpha.y) : 0;
                        const pBonds: string[] = Array.isArray(pAlpha.bonds) ? pAlpha.bonds : [];
                        const pEigen = potential.split(".")[0];
                        
                        const dist = Math.hypot(pX - x, pY - y);
                        
                        // If they are close, both have energy, and aren't already bonded
                        if (dist < 40 && pE > 100 && !bonds.includes(pEigen) && bonds.length < 3 && pBonds.length < 3) {
                            console.log(`   [SYNAPSE] 🕸️ Neural link formed between ${symbol} and ${potential.split(".")[1]}`);
                            
                            // 1. Bond Self
                            bonds.push(pEigen);
                            alpha.bonds = bonds;
                            
                            // 2. Bond Partner
                            pBonds.push(eigenvalue); // The self's eigen
                            pAlpha.bonds = pBonds;
                            
                            // Save partner's bonded state
                            const newPContent = pContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(pAlpha)}---\n`);
                            await Deno.writeTextFile(potential, newPContent);
                            
                            await logAkasha(`🕸️ SYNAPSE: ${symbol} formed a neural bond with ${potential.split(".")[1]}`);
                            break; // Form one bond per pulse max
                        }
                    }
                } catch { /* ignore */ }
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
                // Scan the ecosystem to find the fattest prey within 300px
                for (const h of potentialHosts) {
                    try {
                        const hContent = await Deno.readTextFile(h);
                        const hMetaMatch = hContent.match(/^---\n([\s\S]+?)\n---\n/);
                        if (hMetaMatch) {
                            const hp = parseYaml(hMetaMatch[1]) as any;
                            const hE = hp.energy !== undefined ? Number(hp.energy) : 0;
                            const hX = hp.x !== undefined ? Number(hp.x) : 0;
                            const hY = hp.y !== undefined ? Number(hp.y) : 0;
                            
                            const dist = Math.hypot(hX - x, hY - y);
                            if (dist < 300 && hE > maxE) {
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
                        const vX = vAlpha.x !== undefined ? Number(vAlpha.x) : 0;
                        const vY = vAlpha.y !== undefined ? Number(vAlpha.y) : 0;
                        
                        const dist = Math.hypot(vX - x, vY - y);
                        
                        if (dist < 400 && vAlpha.energy && vAlpha.energy > 5) {
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

        // --- CODE VECTOR SINGULARITY (Zero-IOPS mathematical seed) ---
        if (symbol === "CODE_VECTOR_SINGULARITY") {
            console.log(`   [SINGULARITY] 🌀 Code-Vector Singularity resonated! Spawning pure mathematical primitives.`);
            await logAkasha(`🌀 SINGULARITY: 0xB710 resonated. Zero-IOPS Mathematical Cascade initiated!`);
            
            // It spawns 3 strictly logical atoms (only 8 and 9s)
            for (let i = 0; i < 3; i++) {
                let pureLogic = "";
                for (let j = 0; j < 8; j++) {
                    pureLogic += Math.random() > 0.5 ? "8" : "9";
                }
                const pureEigenvalue = `0x${pureLogic}00000000`;
                const pureSymbol = "PURE_MATH";
                const pureFilename = `${pureEigenvalue}.${pureSymbol}.md`;
                console.log(`      🌌 Spawning mathematical seed: ${pureFilename}`);
                
                const pureAlpha = { eigenvalue: pureEigenvalue, energy: 200, ex: [eigenvalue] };
                let pureContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(pureAlpha)}---\n`);
                pureContent = injectHologram(pureContent, pureEigenvalue, pureSymbol);
                await Deno.writeTextFile(pureFilename, pureContent);
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
    
    // --- QUANTUM IMMORTALITY ---
    console.log("\n⏳ Calculating Ecosystem Stability...");
    let survivingAtoms = 0;
    let totalEcosystem = 0;
    for await (const entry of Deno.readDir(ROOT)) {
        if (entry.isFile && entry.name.endsWith(".md") && entry.name.startsWith("0x")) {
            totalEcosystem++;
            if (!entry.name.includes(".DUST")) {
                survivingAtoms++;
            }
        }
    }

    if (totalEcosystem > 5 && survivingAtoms <= Math.ceil(totalEcosystem * 0.15)) {
        console.log(`🚨 MASS EXTINCTION DETECTED! Only ${survivingAtoms}/${totalEcosystem} organisms survived.`);
        console.log(`   [QUANTUM] Initiating Timeline Reversion (Git Reset)...`);
        await logAkasha(`🚨 MASS EXTINCTION DETECTED. Reverting timeline to last stable Epoch...`);
        
        try {
            const resetCmd = new Deno.Command("git", { args: ["reset", "--hard", "HEAD~1"] });
            await resetCmd.output();
            console.log(`   [RESTORED] 🕰️ Timeline successfully reverted.`);
            await logAkasha(`🕰️ TIMELINE RESTORED. Quantum Immortality sequence successful.`);
        } catch(e) { /* Git not present or failed */ }
    } else {
        console.log(`💾 Saving Epoch State (Surviving: ${survivingAtoms}/${totalEcosystem})...`);
        try {
            const addCmd = new Deno.Command("git", { args: ["add", "."] });
            await addCmd.output();
            const commitCmd = new Deno.Command("git", { args: ["commit", "-m", `epoch: heartbeat state save (${survivingAtoms}/${totalEcosystem} living)`] });
            await commitCmd.output();
        } catch(e) { /* Git not present or failed */ }
    }

    console.log("\n✅ Heartbeat Sequence Complete.");
    }
};

if (import.meta.main) {
    await PULSE.run();
}
