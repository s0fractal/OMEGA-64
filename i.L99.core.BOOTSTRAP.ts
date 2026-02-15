// i.L99.core.BOOTSTRAP.ts
// @noncanonical
// OMEGA-64 | BOOTSTRAP (Dry-Boot Manifest)
// Read I.sigma.md, extract executable cells, emit manifest JSON.

/// <reference lib="deno.ns" />

const DEFAULT_INPUT = "I.sigma.md";
const DEFAULT_OUTPUT = "I.sigma.manifest.json";

type Cell = {
  id: string;
  lang: string;
  hash: string;
  bytes: number;
  lines: number;
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
    "  deno run -A i.L99.core.BOOTSTRAP.ts [--input <file>] [--output <file>]",
    "",
    "Defaults:",
    `  input: ${DEFAULT_INPUT}`,
    `  output: ${DEFAULT_OUTPUT}`,
  ].join("\n");

const isEntityHeader = (line: string): boolean => line.startsWith("### ");

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const extractCells = async (lines: string[]): Promise<Cell[]> => {
  const cells: Cell[] = [];
  let currentId = "";
  let currentLang = "";
  let capture = false;
  let buffer: string[] = [];

  const flush = async () => {
    if (!currentId || !currentLang) return;
    const payload = buffer.join("\n").trimEnd();
    const hash = await sha256Hex(payload);
    const bytes = new TextEncoder().encode(payload).byteLength;
    const linesCount = payload.length === 0 ? 0 : payload.split("\n").length;
    cells.push({
      id: currentId,
      lang: currentLang,
      hash,
      bytes,
      lines: linesCount,
    });
  };

  for (const line of lines) {
    if (isEntityHeader(line)) {
      currentId = line.replace("### ", "").trim();
      continue;
    }
    if (line.trim().startsWith("```")) {
      if (!capture) {
        capture = true;
        currentLang = line.trim().slice(3).trim();
        buffer = [];
      } else {
        capture = false;
        await flush();
        currentLang = "";
        buffer = [];
      }
      continue;
    }
    if (capture) {
      buffer.push(line);
    }
  }

  return cells;
};

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }
  const input = await Deno.readTextFile(args.input);
  const cells = await extractCells(input.split("\n"));
  const output = {
    generated_at: new Date().toISOString(),
    source: args.input,
    cells,
  };
  await Deno.writeTextFile(args.output, JSON.stringify(output, null, 2));
  console.log(`Bootstrap manifest written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
