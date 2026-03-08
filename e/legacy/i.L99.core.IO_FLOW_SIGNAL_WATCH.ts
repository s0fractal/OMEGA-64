// i.L99.core.IO_FLOW_SIGNAL_WATCH.ts
// @noncanonical
// OMEGA-64 | Periodic refresh for IO flow health signal.

import { IO_FLOW_HEALTH_SIGNAL_WRITE } from "./i.L99.core.IO_FLOW_HEALTH_SIGNAL_WRITE.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.IO_FLOW_SIGNAL_WATCH.ts --input <input.json> [--interval <ms>] [--output <path>] [--drain]",
  ].join("\n");

export const IO_FLOW_SIGNAL_WATCH = async (args: string[]): Promise<void> => {
  const parsed = {
    interval: 3000,
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
    if (a === "--interval") {
      parsed.interval = Number.parseInt(args[++i] ?? "3000", 10);
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
    if (a === "--drain") {
      parsed.drain = true;
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  if (!parsed.input) {
    throw new Error("IO_FLOW_SIGNAL_WATCH: --input is required");
  }

  const runOnce = async () => {
    const argsNext: string[] = ["--input", parsed.input!];
    if (parsed.output) argsNext.push("--output", parsed.output);
    if (parsed.drain) argsNext.push("--drain");
    await IO_FLOW_HEALTH_SIGNAL_WRITE(argsNext);
  };

  await runOnce();
  setInterval(
    runOnce,
    Number.isFinite(parsed.interval) ? parsed.interval : 3000,
  );
};

if (import.meta.main) {
  IO_FLOW_SIGNAL_WATCH(Deno.args);
}
