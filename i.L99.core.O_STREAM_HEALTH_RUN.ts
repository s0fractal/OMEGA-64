// i.L99.core.O_STREAM_HEALTH_RUN.ts
// @noncanonical
// OMEGA-64 | Aggregate O stream health signals.

import { O_STREAM_READ } from "./i.L99.core.O_STREAM_READ.ts";
import { O_STREAM_HEALTH } from "./i.L99.core.O_STREAM_HEALTH.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_HEALTH_RUN.ts --input <stream.jsonl> [--pretty] [--safe-window]",
  ].join("\n");

export const O_STREAM_HEALTH_RUN = async (args: string[]): Promise<void> => {
  const parsed = { input: undefined as string | undefined, pretty: false, safeWindow: false, help: false };
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
    if (a === "--safe-window") {
      parsed.safeWindow = true;
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
    throw new Error("O_STREAM_HEALTH_RUN: --input is required");
  }

  const proposals = await O_STREAM_READ(parsed.input);
  const health = await O_STREAM_HEALTH(proposals, undefined, { include_safe_window: parsed.safeWindow });
  const body = parsed.pretty
    ? `${JSON.stringify(health, null, 2)}\n`
    : `${JSON.stringify(health)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  O_STREAM_HEALTH_RUN(Deno.args);
}
