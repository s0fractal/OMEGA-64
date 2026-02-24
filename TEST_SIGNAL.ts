import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";

const target = "0x6666666600000008.PARASITE.md";
const content = await Deno.readTextFile(target);
const fm = content.match(/^---\n([\s\S]+?)\n---\n/);
if (fm) {
    const alpha = parseYaml(fm[1]) as any;
    alpha.signals = [{ type: "ENERGY", power: 100, origin: "TEST_RUNNER" }];
    const newContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
    await Deno.writeTextFile(target, newContent);
    console.log("✅ Injected test signal into " + target);
}

// Run PULSE.ts for 100 pulses (increased chance to hit the target)
const p = new Deno.Command("deno", { args: ["run", "--allow-all", "PULSE.ts"] });
const out = await p.output();
console.log(new TextDecoder().decode(out.stdout));

const logs = await Deno.readTextFile("AKASHA.log");
if (logs.includes("⚡ NEURO:")) {
    console.log("🚀 SUCCESS: NEURO log found!");
} else {
    console.log("❌ FAILURE: NEURO log not found.");
}
