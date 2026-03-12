// i.L99.core.O_STREAM_HEALTH_SIGNAL_WRITE.ts
// @noncanonical
// OMEGA-64 | Emit O stream health signal into UI file.

import { O_STREAM_READ } from "./i.L99.core.O_STREAM_READ.ts";
import { O_STREAM_HEALTH } from "./i.L99.core.O_STREAM_HEALTH.ts";
import { O_STREAM_HEALTH_SIGNAL } from "./i.L99.core.O_STREAM_HEALTH_SIGNAL.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";

const DEFAULT_OUTPUT = "UI/health_signal.txt";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_HEALTH_SIGNAL_WRITE.ts [--input <stream.jsonl>] [--output <path>]",
  ].join("\n");

export const O_STREAM_HEALTH_SIGNAL_WRITE = async (
  args: string[],
): Promise<void> => {
  const parsed = {
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

  const streamPath = parsed.input ?? O_STREAM_PATH();
  const outputPath = parsed.output ?? DEFAULT_OUTPUT;

  const proposals = await O_STREAM_READ(streamPath);
  const health = await O_STREAM_HEALTH(proposals);
  const signal = O_STREAM_HEALTH_SIGNAL(health);

  await Deno.writeTextFile(outputPath, `${signal}\n`);
  await Deno.stdout.write(new TextEncoder().encode(`${outputPath}\n`));
};

if (import.meta.main) {
  O_STREAM_HEALTH_SIGNAL_WRITE(Deno.args);
}
