// @noncanonical
// OMEGA-64 | Canon Sigma Export
// Produces a single structured markdown (I.sigma.md) from 0..8 canonical atoms.

/// <reference lib="deno.ns" />

import { parse as parseYaml } from "jsr:@std/yaml@^1.0.5";
import { CRYSTAL } from "./CRYSTAL_DIGEST.ts";

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
    segment?: string;
    help: boolean;
  } = {
    root: DEFAULT_ROOT,
    output: DEFAULT_OUTPUT,
    mode: DEFAULT_MODE,
    includeQView: false,
    includeQLegacy: false,
    segment: undefined as string | undefined,
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
    if (arg === "--segment") {
      out.segment = args[i + 1];
      i += 1;
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
    "  --segment <SSOO>: Filter by sector and orbit (e.g. 82 for 8/2)",
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

const readYamlMeta = async (
  path: string,
): Promise<Record<string, unknown> | null> => {
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

const collectAtoms = async (
  root: string,
  segment?: string,
): Promise<AtomEntry[]> => {
  const entries: AtomEntry[] = [];
  const filterSector = segment ? Number.parseInt(segment[0], 10) : null;
  const filterOrbit = segment ? Number.parseInt(segment[1], 10) : null;

  // --- Phase 1: Scan Root for Flatland Crystalline Atoms ---
  try {
    for await (const entry of Deno.readDir(root)) {
      if (
        entry.isFile && /^0x[0-9A-F]{8,16}\.[A-Z0-9_]+\.md$/i.test(entry.name)
      ) {
        // ... (existing crystal logic)
        const path = `${root}/${entry.name}`;
        const content = await Deno.readTextFile(path);
        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        const alpha = frontmatterMatch
          ? parseYaml(frontmatterMatch[1]) as any
          : {};
        const symbol = entry.name.split(".")[1];
        const digest = entry.name.split(".")[0].slice(2);

        const projections: Projection[] = [{ path, label: "md", lang: "md" }];
        if (content.includes("## RED (R)")) {
          projections.push({ path, label: "rs", lang: "rs" });
        }
        if (content.includes("## BLUE (B)")) {
          projections.push({ path, label: "ts", lang: "ts" });
        }
        if (content.includes("---")) {
          projections.push({ path, label: "yaml", lang: "yaml" });
        }
      } else if (
        entry.isFile &&
        [
          "RIBOSOME.ts",
          "GATE.ts",
          "IMMUNE.ts",
          "RIBOSOME_TICK.ts",
          "PULSE.ts",
          "mod.ts",
          "SHIMS.ts",
          "STATE_SNAPSHOT.ts",
        ].includes(entry.name)
      ) {
        // --- Special Handling for Organs ---
        const path = `${root}/${entry.name}`;
        entries.push({
          sector: 8,
          orbit: 0,
          name: entry.name.replace(".ts", ""),
          vector: `0xFFFFFFFF${
            entry.name.length.toString(16).padStart(8, "0")
          }`, // Zone F: Meta (Synthetic)
          symbol: entry.name,
          desc: `Core System Organ: ${entry.name}`,
          level: 63,
          projections: [{ path, label: "ts", lang: "ts" }],
        });
      } else if (
        entry.isFile &&
        ["AGENTS.md", "OMEGA_GEOMETRY.md", "OMEGA_MANIFEST.md", "README.md"]
          .includes(entry.name)
      ) {
        // --- Special Handling for Protocols (Axioms) ---
        const path = `${root}/${entry.name}`;
        entries.push({
          sector: 0,
          orbit: 0,
          name: entry.name.replace(".md", ""),
          vector: `0x00000000${
            entry.name.length.toString(16).padStart(8, "0")
          }`, // Zone 0: Primordial
          symbol: entry.name,
          desc: `System Protocol: ${entry.name}`,
          level: 0,
          projections: [{ path, label: "md", lang: "md" }],
        });
      }
    }
    // Phase 1.1: Explicitly include key engine scripts from e/
    const engineScripts = [
      "e/CRYSTAL_DIGEST.ts",
      "e/EXPORT_SIGMA_CANON.ts",
      "e/GENERATE_MOD_TS.ts",
      "e/RIBOSOME_ZERO.ts",
    ];
    for (const script of engineScripts) {
      try {
        const info = await Deno.stat(script);
        if (info.isFile) {
          entries.push({
            sector: 8,
            orbit: 1,
            name: script.split("/").pop()!.replace(".ts", ""),
            vector: `0xEEEEEEEE${script.length.toString(16).padStart(8, "0")}`, // Zone E: Engine Logic
            symbol: script,
            desc: `System Engine Logic: ${script}`,
            level: 63,
            projections: [{ path: script, label: "ts", lang: "ts" }],
          });
        }
      } catch { /* ignore if missing */ }
    }
  } catch (e) {
    console.error(`Error scanning root for Flatland atoms: ${e}`);
  }

  // --- Phase 2: Scan Legacy Octal Structure ---
  for (let sector = 0; sector <= 8; sector++) {
    if (filterSector !== null && sector !== filterSector) continue;
    const sectorDir = `${root}/${sector}`;
    try {
      for await (const orbitEntry of Deno.readDir(sectorDir)) {
        if (!orbitEntry.isDirectory) continue;
        if (!/^\d$/.test(orbitEntry.name)) continue;
        const orbit = Number.parseInt(orbitEntry.name, 10);
        if (filterOrbit !== null && orbit !== filterOrbit) continue;
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

const levelToken = (level: number, eigenvalue?: string): string => {
  if (eigenvalue) {
    const zone = eigenvalue.slice(2, 3).toUpperCase();
    const mapping: Record<string, string> = {
      "0": "Zone 0: Primordial Potential (0)",
      "1": "Zone 1: Singularity & Origin (1)",
      "2": "Zone 2: Bilateral Symmetry (2)",
      "3": "Zone 3: Trinitary Flux (3)",
      "4": "Zone 4: Quaternary Structure (4)",
      "5": "Zone 5: Pentatonic Resonance (5)",
      "6": "Zone 6: Hexagonal Lattice (6)",
      "7": "Zone 7: Septenary Bridge (7)",
      "8": "Zone 8: Identity & Perception (I)",
      "9": "Zone 9: Constancy & State (K)",
      "A": "Zone A: Substitution & Action (S)",
      "B": "Zone B: Recursion & Life (Y)",
      "C": "Zone C: Rotation & Phase (ROT)",
      "D": "Zone D: Synchronization & Consensus (SYNC)",
      "E": "Zone E: Flow & Application (->)",
      "F": "Zone F: Meta & Escape (ESC)",
    };
    return mapping[zone] ?? `Zone ${zone}: Unknown Spectral Band`;
  }
  return `L${String(level).padStart(2, "0")}`;
};

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }

  const atoms = await collectAtoms(args.root, args.segment);

  // Sort by Zone (eigenvalue prefix) then by Symbol
  atoms.sort((a, b) => {
    const vA = a.vector ?? "";
    const vB = b.vector ?? "";
    return vA.localeCompare(vB) || a.name.localeCompare(b.name);
  });

  const byGroup = new Map<string, AtomEntry[]>();
  for (const atom of atoms) {
    const group = levelToken(
      atom.level,
      atom.vector?.startsWith("0x") ? atom.vector : undefined,
    );
    const list = byGroup.get(group) ?? [];
    list.push(atom);
    byGroup.set(group, list);
  }

  const lines: string[] = [];
  lines.push(header("OMEGA-64 | I.sigma.md | Spectral Canon Fold"));
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  if (args.segment) {
    lines.push(`Segment: ${args.segment[0]}/${args.segment[1]}`);
  }
  lines.push("");

  const mode = args.mode.toLowerCase();

  // Custom sorting for Spectral Zones
  const groups = Array.from(byGroup.keys()).sort((a, b) => {
    if (a.startsWith("Zone") && b.startsWith("Zone")) return a.localeCompare(b);
    if (a.startsWith("Zone")) return -1;
    if (b.startsWith("Zone")) return 1;
    return a.localeCompare(b);
  });

  for (const group of groups) {
    lines.push("");
    lines.push(subheader(group));
    const groupAtoms = byGroup.get(group) ?? [];

    if (mode === "level") {
      for (const atom of groupAtoms) {
        for (const proj of atom.projections) {
          const label = proj.path.startsWith("./")
            ? proj.path.slice(2)
            : proj.path;
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

    for (const atom of groupAtoms) {
      const vectorLabel = atom.vector ?? "0x0000000000000000";
      const entityLabel = `${vectorLabel} ${atom.symbol ?? atom.name}`;

      lines.push("");
      lines.push(fileHeader(entityLabel));

      const digest = vectorLabel.startsWith("0x")
        ? vectorLabel.slice(2)
        : vectorLabel;
      if (digest.length === 16) {
        const decoded = CRYSTAL.decode64(digest);
        const spatialStr = typeof decoded.spatial === "string"
          ? decoded.spatial
          : JSON.stringify(decoded.spatial);
        const quantumStr = typeof decoded.quantum === "string"
          ? decoded.quantum
          : JSON.stringify(decoded.quantum);
        lines.push(
          `> **Logic**: \`${decoded.logic}\` | **Spatial**: \`${spatialStr}\` | **Quantum**: \`${quantumStr}\``,
        );
      }

      if (atom.desc) {
        lines.push("");
        lines.push(atom.desc);
      }

      const projsByPath = new Map<string, string[]>();
      for (const proj of atom.projections) {
        const list = projsByPath.get(proj.path) ?? [];
        list.push(proj.label);
        projsByPath.set(proj.path, list);
      }

      for (const [path, labels] of projsByPath.entries()) {
        const content = await Deno.readTextFile(path);
        const lang = langFor(path);
        lines.push("");
        lines.push(projectionHeader(labels.join(", ")));
        lines.push("");
        lines.push(`\`\`\`${lang}`);
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
