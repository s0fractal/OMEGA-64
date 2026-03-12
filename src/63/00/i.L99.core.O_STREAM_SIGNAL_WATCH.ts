// i.L99.core.O_STREAM_SIGNAL_WATCH.ts
// @noncanonical
// OMEGA-64 | Periodic refresh for O stream health signal.

import { O_STREAM_HEALTH_SIGNAL_WRITE } from "./i.L99.core.O_STREAM_HEALTH_SIGNAL_WRITE.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_SIGNAL_WATCH.ts [--interval <ms>] [--input <stream.jsonl>] [--output <path>]",
  ].join("\n");

export const O_STREAM_SIGNAL_WATCH = async (args: string[]): Promise<void> => {
  const parsed = {
    interval: 3000,
    input: undefined as string | undefined,
    output: undefined as string | undefined,
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
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  const runOnce = async () => {
    const argsNext: string[] = [];
    if (parsed.input) argsNext.push("--input", parsed.input);
    if (parsed.output) argsNext.push("--output", parsed.output);
    await O_STREAM_HEALTH_SIGNAL_WRITE(argsNext);
  };

  await runOnce();
  setInterval(
    runOnce,
    Number.isFinite(parsed.interval) ? parsed.interval : 3000,
  );
};

if (import.meta.main) {
  O_STREAM_SIGNAL_WATCH(Deno.args);
}
