// @noncanonical
// OMEGA-64 | Canon Sigma Export
// Produces a single structured markdown (I.sigma.md) from 0..8 canonical atoms.

/// <reference lib="deno.ns" />

import { parse as parseYaml } from "jsr:@std/yaml";

const DEFAULT_OUTPUT = "I.sigma.md";
const DEFAULT_ROOT = ".";
const DEFAULT_MODE = "entity";

const parseArgs = (args: string[]) => {
  const out: {
    root: string;
    output: string;
    mode: string;
    includeQView: boolean;
    includeQLegacy: boolean;
    help: boolean;
  } = {
    root: DEFAULT_ROOT,
    output: DEFAULT_OUTPUT,
    mode: DEFAULT_MODE,
    includeQView: false,
    includeQLegacy: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--root") {
      out.root = args[i + 1] ?? DEFAULT_ROOT;
      i += 1;
      continue;
    }
    if (arg === "--output") {
      out.output = args[i + 1] ?? DEFAULT_OUTPUT;
      i += 1;
      continue;
    }
    if (arg === "--mode") {
      out.mode = args[i + 1] ?? DEFAULT_MODE;
      i += 1;
      continue;
    }
    if (arg === "--include-q-view") {
      out.includeQView = true; // legacy no-op
      continue;
    }
    if (arg === "--include-q-legacy") {
      out.includeQLegacy = true; // legacy no-op
      continue;
    }
  }
  return out;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A e/EXPORT_SIGMA_CANON.ts [--root <dir>] [--output <file>] [--mode entity|level]",
    "",
    "Defaults:",
    `  root: ${DEFAULT_ROOT}`,
    `  output: ${DEFAULT_OUTPUT}`,
    `  mode: ${DEFAULT_MODE}`,
  ].join("\n");

const header = (title: string): string => `# ${title}`;
const subheader = (title: string): string => `## ${title}`;
const fileHeader = (title: string): string => `### ${title}`;
const projectionHeader = (title: string): string => `#### ${title}`;

const langFor = (path: string): string => {
  const ext = path.split(".").pop() ?? "";
  switch (ext) {
    case "ts":
      return "ts";
    case "rs":
      return "rs";
    case "md":
      return "md";
    case "json":
      return "json";
    case "html":
      return "html";
    case "svg":
      return "svg";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "";
  }
};

const levelFromSectorOrbit = (sector: number, orbit: number): number => {
  if (sector === 8) return 63;
  return (sector * 8) + orbit;
};

type Projection = {
  path: string;
  label: string;
  lang: string;
};

type AtomEntry = {
  sector: number;
  orbit: number;
  name: string;
  vector?: string;
  symbol?: string;
  desc?: string;
  level: number;
  projections: Projection[];
};

const readYamlMeta = async (path: string): Promise<Record<string, unknown> | null> => {
  try {
    const content = await Deno.readTextFile(path);
    const raw = parseYaml(content) as Record<string, unknown>;
    return raw ?? null;
  } catch {
    return null;
  }
};

const projectionSort = (a: Projection, b: Projection): number => {
  const order = (label: string): number => {
    if (label === "yaml") return 0;
    if (label === "ts") return 1;
    if (label === "rs") return 2;
    if (label === "md") return 3;
    return 9;
  };
  const by = order(a.label) - order(b.label);
  if (by !== 0) return by;
  return a.path.localeCompare(b.path);
};

const collectAtoms = async (root: string): Promise<AtomEntry[]> => {
  const entries: AtomEntry[] = [];
  for (let sector = 0; sector <= 8; sector++) {
    const sectorDir = `${root}/${sector}`;
    try {
      for await (const orbitEntry of Deno.readDir(sectorDir)) {
        if (!orbitEntry.isDirectory) continue;
        if (!/^\d$/.test(orbitEntry.name)) continue;
        const orbit = Number.parseInt(orbitEntry.name, 10);
        const orbitDir = `${sectorDir}/${orbitEntry.name}`;
        for await (const atomEntry of Deno.readDir(orbitDir)) {
          if (!atomEntry.isDirectory) continue;
          const atomName = atomEntry.name;
          const atomDir = `${orbitDir}/${atomName}`;
          const projections: Projection[] = [];
          let vector: string | undefined;
          let symbol: string | undefined;
          let desc: string | undefined;

          for await (const fileEntry of Deno.readDir(atomDir)) {
            if (!fileEntry.isFile) continue;
            if (!fileEntry.name.startsWith("_.")) continue;
            const path = `${atomDir}/${fileEntry.name}`;
            const ext = fileEntry.name.split(".").pop() ?? "";
            projections.push({
              path,
              label: ext,
              lang: langFor(path),
            });
            if (ext === "yaml" || ext === "yml") {
              const meta = await readYamlMeta(path);
              if (meta) {
                if (typeof meta.vector === "string") vector = meta.vector;
                if (typeof meta.symbol === "string") symbol = meta.symbol;
                if (typeof meta.desc === "string") desc = meta.desc;
              }
            }
          }

          const fallbackLevel = levelFromSectorOrbit(sector, orbit);
          let level = fallbackLevel;
          if (vector) {
            const part = Number.parseInt(vector.split(".")[0] ?? "", 10);
            if (Number.isFinite(part)) level = part;
          }

          entries.push({
            sector,
            orbit,
            name: atomName,
            vector,
            symbol,
            desc,
            level,
            projections: projections.sort(projectionSort),
          });
        }
      }
    } catch {
      // sector may not exist
    }
  }
  return entries;
};

const levelToken = (level: number): string => `L${String(level).padStart(2, "0")}`;

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }

  const atoms = await collectAtoms(args.root);
  atoms.sort((a, b) =>
    a.level - b.level ||
    (a.vector ?? "").localeCompare(b.vector ?? "") ||
    a.name.localeCompare(b.name)
  );

  const byLevel = new Map<string, AtomEntry[]>();
  for (const atom of atoms) {
    const token = levelToken(atom.level);
    const list = byLevel.get(token) ?? [];
    list.push(atom);
    byLevel.set(token, list);
  }

  const lines: string[] = [];
  lines.push(header("OMEGA-64 | I.sigma.md | Canon Fold"));
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  const mode = args.mode.toLowerCase();
  const levelKeys = Array.from(byLevel.keys()).sort((a, b) => {
    const na = Number.parseInt(a.replace("L", ""), 10);
    const nb = Number.parseInt(b.replace("L", ""), 10);
    return (na - nb) || a.localeCompare(b);
  });

  for (const level of levelKeys) {
    lines.push("");
    lines.push(subheader(level));
    const levelAtoms = byLevel.get(level) ?? [];

    if (mode === "level") {
      for (const atom of levelAtoms) {
        for (const proj of atom.projections) {
          const label = proj.path.startsWith("./") ? proj.path.slice(2) : proj.path;
          const content = await Deno.readTextFile(proj.path);
          lines.push("");
          lines.push(fileHeader(label));
          lines.push("");
          lines.push(`\`\`\`${proj.lang}`);
          lines.push(content.replace(/\s+$/, ""));
          lines.push("```");
        }
      }
      continue;
    }

    for (const atom of levelAtoms) {
      const vectorLabel = atom.vector ? `${atom.vector}` : `${String(atom.level).padStart(2, "0")}.${String(atom.sector).padStart(2, "0")}.${String(atom.orbit).padStart(2, "0")}`;
      const entityLabel = atom.symbol
        ? `${vectorLabel} ${atom.symbol}`
        : `${vectorLabel} ${atom.name}`;

      lines.push("");
      lines.push(fileHeader(entityLabel));
      if (atom.desc) {
        lines.push("");
        lines.push(atom.desc);
      }

      for (const proj of atom.projections) {
        const ext = proj.label;
        const content = await Deno.readTextFile(proj.path);
        lines.push("");
        lines.push(projectionHeader(ext));
        lines.push("");
        lines.push(`\`\`\`${proj.lang}`);
        lines.push(content.replace(/\s+$/, ""));
        lines.push("```");
      }
    }
  }

  await Deno.writeTextFile(args.output, lines.join("\n"));
  console.log(`Sigma fold written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
