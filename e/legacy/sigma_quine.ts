// @noncanonical
// OMEGA-64 | Sigma Quine (Roundtrip)
// Parse I.sigma.md structure and reassemble without mutation.

/// <reference lib="deno.ns" />

const DEFAULT_INPUT = "I.sigma.md";
const DEFAULT_OUTPUT = "I.sigma.reassembled.md";

type Projection = {
  label: string;
  fenceLang: string;
  prefaceLines: string[];
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
  const out: { input: string; output: string; verify: boolean; help: boolean } =
    {
      input: DEFAULT_INPUT,
      output: DEFAULT_OUTPUT,
      verify: false,
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
    if (arg === "--verify") {
      out.verify = true;
      continue;
    }
  }
  return out;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A sigma_quine.ts [--input <file>] [--output <file>] [--verify]",
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

const parseSigma = (
  lines: string[],
): { preamble: string[]; levels: Level[] } => {
  const preamble: string[] = [];
  const levels: Level[] = [];
  let i = 0;
  while (i < lines.length && !isLevelHeader(lines[i])) {
    preamble.push(lines[i]);
    i += 1;
  }

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
      const prefaceLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        if (
          isProjectionHeader(lines[i]) || isEntityHeader(lines[i]) ||
          isLevelHeader(lines[i])
        ) break;
        prefaceLines.push(lines[i]);
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
      currentEntity.projections.push({
        label,
        fenceLang,
        prefaceLines,
        codeLines,
      });
      continue;
    }

    if (currentEntity) {
      currentEntity.contentLines.push(line);
    } else if (currentLevel) {
      preamble.push(line);
    } else {
      preamble.push(line);
    }
    i += 1;
  }

  pushLevel();
  return { preamble, levels };
};

const assembleSigma = (preamble: string[], levels: Level[]): string => {
  const output: string[] = [];
  output.push(...preamble);

  const ensureBlank = () => {
    if (output.length === 0) return;
    if (output[output.length - 1].trim() !== "") output.push("");
  };

  for (const level of levels) {
    ensureBlank();
    output.push(`## ${level.id}`);
    for (const entity of level.entities) {
      output.push("");
      output.push(`### ${entity.id}`);
      if (entity.contentLines.length > 0) {
        output.push("");
        output.push(...entity.contentLines);
      }
      for (const projection of entity.projections) {
        output.push("");
        output.push(`#### ${projection.label}`);
        if (projection.prefaceLines.length > 0) {
          output.push("");
          output.push(...projection.prefaceLines);
        }
        const fence = projection.fenceLang ?? "";
        output.push("");
        output.push(`\`\`\`${fence}`);
        output.push(...projection.codeLines);
        output.push("```");
      }
    }
  }
  return output.join("\n");
};

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }

  const input = await Deno.readTextFile(args.input);
  const lines = input.split("\n");
  const { preamble, levels } = parseSigma(lines);
  const reassembled = assembleSigma(preamble, levels);

  await Deno.writeTextFile(args.output, reassembled);

  if (args.verify) {
    const ok = input === reassembled;
    console.log(ok ? "SIGMA_ROUNDTRIP_OK" : "SIGMA_ROUNDTRIP_DIFF");
    if (!ok) Deno.exit(1);
    return;
  }

  console.log(`Sigma roundtrip written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
