// i.L99.core.O_STREAM_DRAIN_RUN.ts
// @noncanonical
// OMEGA-64 | Drain O stream by removing consumed proposal IDs.

import { O_STREAM_DRAIN } from "./i.L99.core.O_STREAM_DRAIN.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_DRAIN_RUN.ts --input <ids.json> [--stream <path>]",
  ].join("\n");

export const O_STREAM_DRAIN_RUN = async (args: string[]): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
    stream: undefined as string | undefined,
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
    if (a === "--stream") {
      parsed.stream = args[++i];
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  const raw = parsed.input
    ? await Deno.readTextFile(parsed.input)
    : await new Response(Deno.stdin.readable).text();

  if (!raw.trim()) {
    throw new Error("O_STREAM_DRAIN_RUN: empty input");
  }

  const ids = JSON.parse(raw);
  if (!Array.isArray(ids)) {
    throw new Error("O_STREAM_DRAIN_RUN: expected JSON array of proposal IDs");
  }

  const next = await O_STREAM_DRAIN(ids as string[], parsed.stream ?? O_STREAM_PATH());
  await Deno.stdout.write(new TextEncoder().encode(`${next.length}\n`));
};

if (import.meta.main) {
  O_STREAM_DRAIN_RUN(Deno.args);
}
