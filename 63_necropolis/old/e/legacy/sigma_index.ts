// @noncanonical
// OMEGA-64 | Sigma Index
// Build a compact index from I.sigma.md: entities, projections, hashes, gaps.

/// <reference lib="deno.ns" />

const DEFAULT_INPUT = "I.sigma.md";
const DEFAULT_OUTPUT = "I.sigma.index.json";

type Projection = {
  label: string;
  fenceLang: string;
  codeLines: string[];
};

type Entity = {
  id: string;
  contentLines: string[];
  projections: Projection[];
};

type Level = {
  id: string;
  entities: Entity[];
};

const parseArgs = (args: string[]) => {
  const out: { input: string; output: string; help: boolean } = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--input") {
      out.input = args[i + 1] ?? DEFAULT_INPUT;
      i += 1;
      continue;
    }
    if (arg === "--output") {
      out.output = args[i + 1] ?? DEFAULT_OUTPUT;
      i += 1;
      continue;
    }
  }
  return out;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A sigma_index.ts [--input <file>] [--output <file>]",
    "",
    "Defaults:",
    `  input: ${DEFAULT_INPUT}`,
    `  output: ${DEFAULT_OUTPUT}`,
  ].join("\n");

const isLevelHeader = (line: string): boolean => line.startsWith("## ");
const isEntityHeader = (line: string): boolean => line.startsWith("### ");
const isProjectionHeader = (line: string): boolean => line.startsWith("#### ");
const stripPrefix = (line: string, prefix: string): string =>
  line.slice(prefix.length).trim();

const parseSigma = (lines: string[]): Level[] => {
  const levels: Level[] = [];
  let i = 0;
  while (i < lines.length && !isLevelHeader(lines[i])) i += 1;

  let currentLevel: Level | null = null;
  let currentEntity: Entity | null = null;

  const pushEntity = () => {
    if (currentLevel && currentEntity) {
      currentLevel.entities.push(currentEntity);
      currentEntity = null;
    }
  };

  const pushLevel = () => {
    if (currentLevel) {
      pushEntity();
      levels.push(currentLevel);
      currentLevel = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    if (isLevelHeader(line)) {
      pushLevel();
      currentLevel = { id: stripPrefix(line, "## "), entities: [] };
      i += 1;
      continue;
    }
    if (isEntityHeader(line)) {
      pushEntity();
      currentEntity = {
        id: stripPrefix(line, "### "),
        contentLines: [],
        projections: [],
      };
      i += 1;
      continue;
    }
    if (isProjectionHeader(line)) {
      if (!currentEntity) {
        i += 1;
        continue;
      }
      const label = stripPrefix(line, "#### ");
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        if (
          isProjectionHeader(lines[i]) || isEntityHeader(lines[i]) ||
          isLevelHeader(lines[i])
        ) break;
        i += 1;
      }
      let fenceLang = "";
      if (i < lines.length && lines[i].startsWith("```")) {
        fenceLang = lines[i].slice(3).trim();
        i += 1;
      }
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && lines[i].startsWith("```")) {
        i += 1;
      }
      currentEntity.projections.push({ label, fenceLang, codeLines });
      continue;
    }

    if (currentEntity) {
      currentEntity.contentLines.push(line);
    }
    i += 1;
  }

  pushLevel();
  return levels;
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const hueFor = (label: string): number => {
  const table: Record<string, number> = {
    md: 120,
    ts: 210,
    rs: 20,
    sh: 60,
    q: 280,
    i: 190,
    json: 240,
    html: 330,
    svg: 300,
    lean: 200,
    txt: 0,
  };
  if (label in table) return table[label];
  let hash = 0;
  for (const ch of label) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return hash;
};

const mixHue = (
  hues: Array<{ hue: number; weight: number }>,
): number | null => {
  let x = 0;
  let y = 0;
  let total = 0;
  for (const { hue, weight } of hues) {
    if (weight <= 0) continue;
    const radians = (hue / 360) * Math.PI * 2;
    x += Math.cos(radians) * weight;
    y += Math.sin(radians) * weight;
    total += weight;
  }
  if (total === 0) return null;
  const angle = Math.atan2(y, x);
  const degrees = (angle / (Math.PI * 2)) * 360;
  return (degrees + 360) % 360;
};

const entropyFromWeights = (weights: number[]): number => {
  const sum = weights.reduce((acc, v) => acc + v, 0);
  if (sum <= 0) return 0;
  const probs = weights.map((w) => w / sum).filter((p) => p > 0);
  if (probs.length <= 1) return 0;
  const entropy = -probs.reduce((acc, p) => acc + p * Math.log2(p), 0);
  return clamp(entropy / Math.log2(probs.length), 0, 1);
};

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }

  const input = await Deno.readTextFile(args.input);
  const levels = parseSigma(input.split("\n"));

  const output: Record<string, unknown> = {
    generated_at: new Date().toISOString(),
    source: args.input,
    levels: {} as Record<string, unknown>,
  };

  for (const level of levels) {
    const projectionSet = new Set<string>();
    for (const entity of level.entities) {
      for (const proj of entity.projections) {
        projectionSet.add(proj.label);
      }
    }
    const projectionList = Array.from(projectionSet.values()).sort((a, b) =>
      a.localeCompare(b)
    );

    const entities: Record<string, unknown> = {};
    for (const entity of level.entities) {
      const projectionMap: Record<string, unknown> = {};
      const present = new Set<string>();
      const spectralWeights: Array<
        { label: string; weight: number; hue: number }
      > = [];
      for (const proj of entity.projections) {
        present.add(proj.label);
        const payload = proj.codeLines.join("\n").trimEnd();
        const hash = await sha256Hex(payload);
        const lines = payload.length === 0 ? 0 : payload.split("\n").length;
        const bytes = new TextEncoder().encode(payload).byteLength;
        const weight = Math.log2(lines + 1);
        spectralWeights.push({
          label: proj.label,
          weight,
          hue: hueFor(proj.label),
        });
        projectionMap[proj.label] = {
          hash,
          bytes,
          lines,
        };
      }
      const missing = projectionList.filter((label) => !present.has(label));
      const coverage = projectionList.length === 0
        ? 0
        : present.size / projectionList.length;
      const hue = mixHue(
        spectralWeights.map(({ hue, weight }) => ({ hue, weight })),
      );
      const entropy = entropyFromWeights(
        spectralWeights.map((entry) => entry.weight),
      );
      const saturation = Math.round(clamp(100 - entropy * 50, 0, 100));
      const lightness = Math.round(clamp(30 + coverage * 40, 0, 100));
      const spectralMix = hue === null ? null : {
        hue: Math.round(hue),
        saturation,
        lightness,
        hsl: `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`,
        coverage,
        entropy,
        weights: spectralWeights,
      };
      entities[entity.id] = {
        projections: projectionMap,
        missing,
        spectral_mix: spectralMix,
      };
    }

    (output.levels as Record<string, unknown>)[level.id] = {
      projection_set: projectionList,
      entities,
    };
  }

  await Deno.writeTextFile(args.output, JSON.stringify(output, null, 2));
  console.log(`Sigma index written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
