import { parse as parseYaml, stringify as stringifyYaml } from "https://deno.land/std@0.207.0/yaml/mod.ts";
import { PULSE } from "./PULSE.ts";

const target = "0x6666666600000008.PARASITE.md";

async function testHebbian() {
    console.log(`🚀 Starting Stage 15 Verification...`);
    
    // 1. Inject ENERGY Signal
    const content = await Deno.readTextFile(target);
    const metaMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
    if (!metaMatch) throw new Error("Metadata not found");
    
    const alpha = parseYaml(metaMatch[1]) as any;
    alpha.signals = alpha.signals || [];
    alpha.signals.push({
        type: "ENERGY",
        power: 50,
        origin: "EXTERNAL"
    });
    
    const newContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
    await Deno.writeTextFile(target, newContent);
    console.log(`✅ Injected Stimulus into ${target}`);
    
    // 2. Run Forced Pulse
    Deno.env.set("PULSE_TARGET", target);
    await PULSE.run();
    
    // 3. Verify Metadata
    const updatedContent = await Deno.readTextFile(target);
    const updatedMeta = parseYaml(updatedContent.match(/^---\n([\s\S]+?)\n---\n/)![1]) as any;
    
    console.log(`\n--- Verification Results ---`);
    console.log(`Resonance: ${updatedMeta.resonance}`);
    console.log(`Bond Strengths:`, updatedMeta.bond_strengths);
    
    if (updatedMeta.resonance > 0) {
        console.log(`✅ SUCCESS: Resonance memory active!`);
    } else {
        console.log(`❌ FAIL: Resonance not updated.`);
    }
}

testHebbian();
