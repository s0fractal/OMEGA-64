/// <reference lib="deno.window" />
import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";

const ROOT = Deno.cwd();
const TS_TARGET = `${ROOT}/mod.ts`;

type Atom = {
  rel: string;
  symbol: string;
  digest: string;
  level: number;
};

async function collectAtoms(): Promise<Atom[]> {
  const atoms: Atom[] = [];
  for await (const entry of Deno.readDir(ROOT)) {
    if (
      entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")
    ) {
      try {
        const content = await Deno.readTextFile(entry.name);
        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        if (!frontmatterMatch) continue;

        const alpha = parseYaml(frontmatterMatch[1]) as any;
        const symbol = alpha.symbol ?? entry.name.split(".")[1] ?? "UNKNOWN";
        const level = alpha.level ??
          (alpha.vector ? parseInt(alpha.vector.split(".")[0]) : 0);

        atoms.push({
          rel: entry.name,
          symbol: symbol,
          digest: entry.name.split(".")[0],
          level: level,
        });
      } catch (e) {
        console.error(`Failed to parse ${entry.name}:`, e);
      }
    }
  }
  return atoms;
}

async function writeTsModule(atoms: Atom[]): Promise<void> {
  const header: string[] = [
    "// AUTO-GENERATED (PHASE: FLATLAND). DO NOT EDIT.",
    "// Source: Flatland root (0x*.md).",
  ];

  const lines: string[] = [];
  const exported = new Set<string>();

  const sorted = atoms
    .slice()
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  for (const atom of sorted) {
    let exportName = atom.symbol;
    if (exported.has(exportName)) {
      // Collision! Append short logic hash (last 4 chars of logic)
      const logicHash = atom.digest.slice(6, 10); // Take a slice of the logic part
      exportName = `${atom.symbol}_${logicHash}`;
    }

    lines.push(
      `export const ${exportName} = { id: "${atom.rel}", level: ${atom.level}, digest: "${atom.digest}" };`,
    );
    exported.add(exportName);
  }

  // Also include the core Organs
  const rootOrgans = ["RIBOSOME", "GATE", "IMMUNE", "RIBOSOME_TICK", "PULSE"];
  for (const organ of rootOrgans) {
    lines.push(`export { ${organ} } from "./${organ}.ts";`);
  }

  const content = `${header.join("\n")}\n\n${lines.join("\n")}\n`;
  await Deno.writeTextFile(TS_TARGET, content);
}

const atoms = await collectAtoms();
await writeTsModule(atoms);

console.log(
  `[OMEGA] mod.ts generated with ${atoms.length} flat atoms and core organs.`,
);
