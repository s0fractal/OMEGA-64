// OMEGA-64 | PULSE.ts | The Autonomic Heartbeat
// Drives the system's sensory-logic cycle via Zero-IOPS reduction.

import { RIBOSOME_TICK } from "./RIBOSOME_TICK.ts";
import { GATE } from "./GATE.ts";
import { CRYSTAL } from "./e/CRYSTAL_DIGEST.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";

const SIGNAL_PATH = "./OMEGA_SIGNAL.md";
const ROOT = Deno.cwd();

// --- Configuration ---
const PULSE_ID = "0xFFFFFFFF00000008"; // PULSE Organic ID
const MAX_PULSES = 20; // Limit for this task execution

export const PULSE = {
    run: async () => {
        console.log("🛡️ OMEGA-64 | AUTOPOIETIC RESONANCE | HEARTBEAT ACTIVE");
    
    // 0. Initialize System State (Virtual Baseline)
    let state = {
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
        const atoms = [];
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

        // 2. EVOLVE (Logic Reduction)
        const currentLogic = eigenvalue.slice(2, 10);
        const newLogic = RIBOSOME_TICK.reduce(currentLogic);

        if (newLogic === currentLogic) {
            console.log("   [EVOLVE] Logic stable. No mutation needed.");
            continue;
        }

        const newEigenvalue = `0x${newLogic}${eigenvalue.slice(10)}`;
        const newFilename = `${newEigenvalue}.${symbol}.md`;

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
            
            // Read content and update YAML metadata (Alpha Channel)
            const content = await Deno.readTextFile(targetFilename);
            const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
            
            let updatedContent = content;
            if (frontmatterMatch) {
                const alpha = parseYaml(frontmatterMatch[1]) as any;
                alpha.eigenvalue = newEigenvalue;
                alpha.ex = alpha.ex || [];
                alpha.ex.push(eigenvalue); // Record lineage
                
                updatedContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
            }

            await Deno.writeTextFile(targetFilename, updatedContent);
            await Deno.rename(targetFilename, newFilename);

            // 5. RESONATE (Spooky Action)
            const pool = atoms.map(a => a.split(".")[0].slice(2));
            const partners = CRYSTAL.findEntangledPartners(newEigenvalue.slice(2), pool)
                .filter(p => p !== eigenvalue.slice(2)); // Filter out target itself
                
            if (partners.length > 0) {
                console.log(`   [SPOOKY] Entanglement triggered for ${partners.length} partners.`);
                for (const partnerDigest of partners) {
                    const pFullDigest = `0x${partnerDigest}`;
                    const partnerFilename = atoms.find(a => a.startsWith(pFullDigest));
                    if (!partnerFilename) continue;
                    
                    const pParts = partnerFilename.split(".");
                    const pSymbol = pParts[1];
                    const pLogic = partnerDigest.slice(0, 8);
                    const pSpatial = partnerDigest.slice(8, 12);
                    const pQuantumHex = partnerDigest.slice(12, 16);
                    
                    // Shift Phase: [RES_GROUP:12][SPIN:1][PHASE:2][UNUSED:1]
                    let pQuantumVal = parseInt(pQuantumHex, 16);
                    let phase = (pQuantumVal >> 1) & 0x03;
                    phase = (phase + 1) % 4; // Shift 90 degrees
                    pQuantumVal = (pQuantumVal & ~0x06) | (phase << 1);
                    
                    const newPQuantumHex = pQuantumVal.toString(16).toUpperCase().padStart(4, "0");
                    const newPartnerEigenvalue = `0x${pLogic}${pSpatial}${newPQuantumHex}`;
                    const newPartnerFilename = `${newPartnerEigenvalue}.${pSymbol}.md`;

                    console.log(`      ✨ Partner Shift: ${partnerFilename} -> ${newPartnerFilename}`);
                    
                    const pContent = await Deno.readTextFile(partnerFilename);
                    const pFM = pContent.match(/^---\n([\s\S]+?)\n---\n/);
                    if (pFM) {
                        const pAlpha = parseYaml(pFM[1]) as any;
                        pAlpha.eigenvalue = newPartnerEigenvalue;
                        pAlpha.ex = pAlpha.ex || [];
                        pAlpha.ex.push(pFullDigest);
                        const newPContent = pContent.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(pAlpha)}---\n`);
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
