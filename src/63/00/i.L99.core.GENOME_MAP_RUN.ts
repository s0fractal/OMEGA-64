// i.L99.core.GENOME_MAP_RUN.ts
// @noncanonical
// OMEGA-64 | Output genome map as JSON.

import { GENOME_MAP } from "./i.L99.core.GENOME_MAP.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.GENOME_MAP_RUN.ts [--pretty]",
  ].join("\n");

export const GENOME_MAP_RUN = async (args: string[]): Promise<void> => {
  const parsed = { pretty: false, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
      continue;
    }
    if (a === "--pretty") {
      parsed.pretty = true;
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  const map = GENOME_MAP();
  const body = parsed.pretty
    ? `${JSON.stringify(map, null, 2)}\n`
    : `${JSON.stringify(map)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  GENOME_MAP_RUN(Deno.args);
}
