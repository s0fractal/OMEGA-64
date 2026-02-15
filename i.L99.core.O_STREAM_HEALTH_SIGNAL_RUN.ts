// i.L99.core.O_STREAM_HEALTH_SIGNAL_RUN.ts
// @noncanonical
// OMEGA-64 | Emit UI health signal from O stream.

import { O_STREAM_READ } from "./i.L99.core.O_STREAM_READ.ts";
import { O_STREAM_HEALTH } from "./i.L99.core.O_STREAM_HEALTH.ts";
import { O_STREAM_HEALTH_SIGNAL } from "./i.L99.core.O_STREAM_HEALTH_SIGNAL.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_HEALTH_SIGNAL_RUN.ts --input <stream.jsonl>",
  ].join("\n");

export const O_STREAM_HEALTH_SIGNAL_RUN = async (args: string[]): Promise<void> => {
  const parsed = { input: undefined as string | undefined, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
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
    throw new Error("O_STREAM_HEALTH_SIGNAL_RUN: --input is required");
  }

  const proposals = await O_STREAM_READ(parsed.input);
  const health = await O_STREAM_HEALTH(proposals);
  const signal = O_STREAM_HEALTH_SIGNAL(health);
  await Deno.stdout.write(new TextEncoder().encode(`${signal}\n`));
};

if (import.meta.main) {
  O_STREAM_HEALTH_SIGNAL_RUN(Deno.args);
}
