// i.L99.core.IO_FLOW_HEALTH_SIGNAL_RUN.ts
// @noncanonical
// OMEGA-64 | Emit health signal from IO_FLOW_HEALTH.

import { IO_FLOW_HEALTH_RUN } from "./i.L99.core.IO_FLOW_HEALTH_RUN.ts";
import { IO_FLOW_HEALTH_SIGNAL } from "./i.L99.core.IO_FLOW_HEALTH_SIGNAL.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.IO_FLOW_HEALTH_SIGNAL_RUN.ts --input <input.json> [--drain]",
  ].join("\n");

export const IO_FLOW_HEALTH_SIGNAL_RUN = async (args: string[]): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
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
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  if (!parsed.input) {
    throw new Error("IO_FLOW_HEALTH_SIGNAL_RUN: --input is required");
  }

  const argsForward = ["--input", parsed.input];
  if (parsed.drain) argsForward.push("--drain");

  const output = await IO_FLOW_HEALTH_RUN(argsForward);
  const signal = IO_FLOW_HEALTH_SIGNAL(output.health);

  await Deno.stdout.write(new TextEncoder().encode(`${signal}\n`));
};

if (import.meta.main) {
  IO_FLOW_HEALTH_SIGNAL_RUN(Deno.args);
}
