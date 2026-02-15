// @noncanonical
// OMEGA-64 | Sigma Colorize
// Annotate I.sigma.md with spectral dots from I.sigma.index.json.

/// <reference lib="deno.ns" />

const DEFAULT_INPUT = "I.sigma.md";
const DEFAULT_INDEX = "I.sigma.index.json";
const DEFAULT_OUTPUT = "I.sigma.colored.md";

type SpectralMix = {
  hsl?: string;
};

type SigmaIndex = {
  levels: Record<
    string,
    {
      entities: Record<
        string,
        {
          spectral_mix?: SpectralMix | null;
        }
      >;
    }
  >;
};

const parseArgs = (args: string[]) => {
  const out: { input: string; index: string; output: string; help: boolean } = {
    input: DEFAULT_INPUT,
    index: DEFAULT_INDEX,
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
    if (arg === "--index") {
      out.index = args[i + 1] ?? DEFAULT_INDEX;
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
    "  deno run -A sigma_colorize.ts [--input <file>] [--index <file>] [--output <file>]",
    "",
    "Defaults:",
    `  input: ${DEFAULT_INPUT}`,
    `  index: ${DEFAULT_INDEX}`,
    `  output: ${DEFAULT_OUTPUT}`,
  ].join("\n");

const buildSpectralMap = (index: SigmaIndex): Map<string, string> => {
  const map = new Map<string, string>();
  for (const level of Object.values(index.levels ?? {})) {
    for (const [entityId, data] of Object.entries(level.entities ?? {})) {
      const hsl = data.spectral_mix?.hsl;
      if (hsl) map.set(entityId, hsl);
    }
  }
  return map;
};

const hasDot = (line: string): boolean =>
  line.includes("●") || line.includes("<span") || line.includes("</span>");

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }

  const [inputText, indexText] = await Promise.all([
    Deno.readTextFile(args.input),
    Deno.readTextFile(args.index),
  ]);
  const index = JSON.parse(indexText) as SigmaIndex;
  const spectralMap = buildSpectralMap(index);

  const lines = inputText.split("\n");
  const output: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      const label = line.slice(4).trim();
      const hsl = spectralMap.get(label);
      if (hsl && !hasDot(line)) {
        output.push(`${line} <span style="color: ${hsl}">●</span>`);
        continue;
      }
    }
    output.push(line);
  }

  await Deno.writeTextFile(args.output, output.join("\n"));
  console.log(`Sigma colorized output written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
