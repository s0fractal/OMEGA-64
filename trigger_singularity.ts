import { parse, stringify } from "jsr:@std/yaml";

async function boostAtom() {
    for await (const entry of Deno.readDir("./")) {
        if (entry.isFile && entry.name.endsWith(".STREAM.md") && entry.name.startsWith("0x")) {
            const content = await Deno.readTextFile(entry.name);
            const metaMatch = content.match(/^---\n([\s\S]+?)\n---/);
            if (metaMatch) {
                const alpha = parse(metaMatch[1]) as any;
                alpha.energy = 800; // Boost energy > 500
                alpha.resonance = 100; // Boost resonance > 80
                const newMeta = stringify(alpha);
                const newContent = `---\n${newMeta}---\n\n${content.split('---')[2]}`;
                await Deno.writeTextFile(entry.name, newContent);
                console.log(`Boosted ${entry.name} to critical mass!`);
                break; // Just boost one
            }
        }
    }
}
boostAtom();
