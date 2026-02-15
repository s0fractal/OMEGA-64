// i.L99.core.IO_FLOW_HEALTH_SIGNAL_WRITE.ts
// @noncanonical
// OMEGA-64 | Emit IO flow health signal into UI file.

import { IO_FLOW_HEALTH_SIGNAL_RUN } from "./i.L99.core.IO_FLOW_HEALTH_SIGNAL_RUN.ts";

const DEFAULT_OUTPUT = "UI/health_signal.txt";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.IO_FLOW_HEALTH_SIGNAL_WRITE.ts --input <input.json> [--output <path>] [--drain]",
  ].join("\n");

export const IO_FLOW_HEALTH_SIGNAL_WRITE = async (args: string[]): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
    output: undefined as string | undefined,
    drain: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
      continue;
    }
    if (a === "--drain") {
      parsed.drain = true;
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
    throw new Error("IO_FLOW_HEALTH_SIGNAL_WRITE: --input is required");
  }

  const forward: string[] = ["--input", parsed.input];
  if (parsed.drain) forward.push("--drain");

  const output = await IO_FLOW_HEALTH_SIGNAL_RUN(forward);
  const outputPath = parsed.output ?? DEFAULT_OUTPUT;
  await Deno.writeTextFile(outputPath, `${output}\n`);

  await Deno.stdout.write(new TextEncoder().encode(`${outputPath}\n`));
};

if (import.meta.main) {
  IO_FLOW_HEALTH_SIGNAL_WRITE(Deno.args);
}
