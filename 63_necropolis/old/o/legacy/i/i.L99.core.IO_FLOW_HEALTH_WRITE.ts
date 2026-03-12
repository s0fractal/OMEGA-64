// i.L99.core.IO_FLOW_HEALTH_WRITE.ts
// @noncanonical
// OMEGA-64 | Write IO flow health report to file.

import { IO_FLOW_HEALTH_RUN } from "./i.L99.core.IO_FLOW_HEALTH_RUN.ts";

const DEFAULT_OUTPUT = "UI/health_io.json";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.IO_FLOW_HEALTH_WRITE.ts --input <input.json> [--output <path>] [--drain] [--pretty] [--safe-window]",
  ].join("\n");

export const IO_FLOW_HEALTH_WRITE = async (args: string[]): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
    output: undefined as string | undefined,
    pretty: false,
    drain: false,
    safeWindow: false,
    help: false,
  };
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
    if (a === "--drain") {
      parsed.drain = true;
      continue;
    }
    if (a === "--safe-window") {
      parsed.safeWindow = true;
      continue;
    }
    if (a === "--input") {
      parsed.input = args[++i];
      continue;
    }
    if (a === "--output") {
      parsed.output = args[++i];
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  if (!parsed.input) {
    throw new Error("IO_FLOW_HEALTH_WRITE: --input is required");
  }

  const forward: string[] = ["--input", parsed.input];
  if (parsed.pretty) forward.push("--pretty");
  if (parsed.drain) forward.push("--drain");
  if (parsed.safeWindow) forward.push("--safe-window");

  const payload = await IO_FLOW_HEALTH_RUN(forward);
  const outputPath = parsed.output ?? DEFAULT_OUTPUT;
  const body = parsed.pretty
    ? `${JSON.stringify(payload, null, 2)}\n`
    : `${JSON.stringify(payload)}\n`;

  await Deno.writeTextFile(outputPath, body);
  await Deno.stdout.write(new TextEncoder().encode(`${outputPath}\n`));
};

if (import.meta.main) {
  IO_FLOW_HEALTH_WRITE(Deno.args);
}
