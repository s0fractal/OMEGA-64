/// <reference lib="deno.window" />
import { walk } from "jsr:@std/fs";

const ROOT = Deno.cwd();
const CANON_ROOTS = Array.from({ length: 9 }, (_, i) => `${ROOT}/${i}`);
const TS_TARGET = `${ROOT}/mod.ts`;
const RS_TARGET = `${ROOT}/omega.rs`;

type Atom = {
  rel: string;
  baseName: string;
  coord: string;
  exportName: string;
  exports: Set<string>;
  hasAtom: boolean;
};

function pad2(input: string): string {
  const n = Number(input);
  if (Number.isFinite(n)) return String(n).padStart(2, "0");
  return input;
}

function toIdentifier(raw: string): string {
  let out = raw.replace(/[^A-Za-z0-9_]/g, "_");
  if (/^[0-9]/.test(out)) out = `_${out}`;
  return out;
}

const EXPORT_DECL = /\bexport\s+(?:const|function|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g;
const EXPORT_LIST = /\bexport\s*(?:type\s*)?\{([^}]+)\}/g;

function parseExports(source: string): { names: Set<string>; hasAtom: boolean } {
  const names = new Set<string>();
  let hasAtom = false;

  for (const match of source.matchAll(EXPORT_DECL)) {
    const name = match[1];
    if (!name) continue;
    names.add(name);
    if (name === "ATOM") hasAtom = true;
  }

  for (const match of source.matchAll(EXPORT_LIST)) {
    const list = match[1] ?? "";
    for (const raw of list.split(",")) {
      const part = raw.trim();
      if (!part) continue;
      const [left, right] = part.split(/\s+as\s+/i).map((s) => s.trim());
      const exported = (right || left || "").trim();
      if (!exported) continue;
      names.add(exported);
      if (exported === "ATOM") hasAtom = true;
    }
  }

  return { names, hasAtom };
}

async function collectAtoms(ext: string): Promise<Atom[]> {
  const atoms: Atom[] = [];
  for (const root of CANON_ROOTS) {
    try {
      for await (const entry of walk(root, { includeDirs: false })) {
        if (entry.name !== `_.${ext}`) continue;
        const rel = entry.path.replace(`${ROOT}/`, "").replaceAll("\\", "/");
        const parts = rel.split("/");
        if (parts.length < 3) continue;
        const baseName = parts[parts.length - 2];
        const coord = `${pad2(parts[0] ?? "??")}_${pad2(parts[1] ?? "??")}`;
        const source = await Deno.readTextFile(entry.path);
        const parsed = parseExports(source);
        atoms.push({
          rel,
          baseName,
          coord,
          exportName: "",
          exports: parsed.names,
          hasAtom: parsed.hasAtom,
        });
      }
    } catch {
      // root may not exist
    }
  }
  return atoms;
}

function assignExportNames(atoms: Atom[]): { collisions: string[] } {
  const byName = new Map<string, Atom[]>();
  for (const atom of atoms) {
    const key = toIdentifier(atom.baseName);
    atom.baseName = key;
    const list = byName.get(key) ?? [];
    list.push(atom);
    byName.set(key, list);
  }

  const collisions: string[] = [];
  for (const [name, group] of byName) {
    if (group.length === 1) {
      group[0].exportName = name;
      continue;
    }
    collisions.push(name);
    for (const atom of group) {
      atom.exportName = toIdentifier(`${name}__${atom.coord}`);
    }
  }

  return { collisions };
}

async function writeTsModule(atoms: Atom[], collisions: string[]): Promise<void> {
  const header: string[] = [
    "// AUTO-GENERATED. DO NOT EDIT.",
    "// Source: canon atoms (0..8/**/_.ts).",
  ];
  if (collisions.length > 0) {
    header.push(
      `// COLLISIONS: ${collisions.sort().join(", ")}`,
      "// NOTE: collided names are suffixed with __SS_OO (sector/orbit).",
    );
  }

  const lines: string[] = [];
  const sorted = atoms
    .slice()
    .sort((a, b) => a.exportName.localeCompare(b.exportName));

  for (const atom of sorted) {
    if (atom.hasAtom) {
      lines.push(`export { ATOM as ${atom.exportName} } from "./${atom.rel}";`);
    }
    const extras = Array.from(atom.exports)
      .filter((name) => name !== "ATOM")
      .sort();
    for (const name of extras) {
      lines.push(
        `export { ${name} as ${atom.exportName}_${name} } from "./${atom.rel}";`,
      );
    }
  }

  const content = `${header.join("\n")}\n\n${lines.join("\n")}\n`;
  await Deno.writeTextFile(TS_TARGET, content);
}

async function writeRsModule(atoms: Atom[]): Promise<void> {
  const header: string[] = [
    "// AUTO-GENERATED. DO NOT EDIT.",
    "// Source: canon atoms (0..8/**/_.rs).",
    "// NOTE: Rust atoms are not yet present in canon; this file is a stub.",
  ];

  const content = `${header.join("\n")}\n`;
  await Deno.writeTextFile(RS_TARGET, content);
}

const tsAtoms = await collectAtoms("ts");
const { collisions } = assignExportNames(tsAtoms);
await writeTsModule(tsAtoms, collisions);

const rsAtoms = await collectAtoms("rs");
await writeRsModule(rsAtoms);

console.log(
  `[OMEGA] mod.ts generated with ${tsAtoms.length} exports. ` +
    `collisions=${collisions.length}.`,
);
console.log(
  `[OMEGA] omega.rs generated (${rsAtoms.length} rust atoms found).`,
);
