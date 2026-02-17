// i.L99.core.O_STREAM_APPEND_RUN.ts
// @noncanonical
// OMEGA-64 | Minimal CLI runner for O_STREAM_APPEND.

import { O_STREAM_APPEND } from "./i.L99.core.O_STREAM_APPEND.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";
import { O_STREAM_SCHEMA } from "./i.L99.core.O_STREAM_SCHEMA.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_APPEND_RUN.ts --input <proposal.json> [--stream <path>]",
    "  deno run -A i.L99.core.O_STREAM_APPEND_RUN.ts < proposal.json",
  ].join("\n");

export const O_STREAM_APPEND_RUN = async (args: string[]): Promise<void> => {
  const parsed = { input: undefined as string | undefined, stream: undefined as string | undefined, help: false };
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
    throw new Error("O_STREAM_APPEND_RUN: empty input");
  }

  const proposal = JSON.parse(raw) as DeltaProposal;
  if (!O_STREAM_SCHEMA(proposal)) {
    throw new Error("O_STREAM_APPEND_RUN: proposal failed schema validation");
  }

  const stream = parsed.stream ?? O_STREAM_PATH();
  await O_STREAM_APPEND(proposal, stream);

  await Deno.stdout.write(new TextEncoder().encode(`${stream}\n`));
};

if (import.meta.main) {
  O_STREAM_APPEND_RUN(Deno.args);
}
