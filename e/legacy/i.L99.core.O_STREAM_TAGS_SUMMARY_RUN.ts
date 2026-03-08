// i.L99.core.O_STREAM_TAGS_SUMMARY_RUN.ts
// @noncanonical
// OMEGA-64 | Summarize tag frequencies from O stream.

import { O_STREAM_READ } from "./i.L99.core.O_STREAM_READ.ts";
import { O_STREAM_TAGS_SUMMARY } from "./i.L99.core.O_STREAM_TAGS_SUMMARY.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_TAGS_SUMMARY_RUN.ts --input <stream.jsonl> [--pretty]",
  ].join("\n");

export const O_STREAM_TAGS_SUMMARY_RUN = async (
  args: string[],
): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
    pretty: false,
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
    throw new Error("O_STREAM_TAGS_SUMMARY_RUN: --input is required");
  }

  const proposals = await O_STREAM_READ(parsed.input);
  const summary = O_STREAM_TAGS_SUMMARY(proposals);
  const body = parsed.pretty
    ? `${JSON.stringify(summary, null, 2)}\n`
    : `${JSON.stringify(summary)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  O_STREAM_TAGS_SUMMARY_RUN(Deno.args);
}
