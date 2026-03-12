// i.L99.core.O_STREAM_FILTER_TAGS_RUN.ts
// @noncanonical
// OMEGA-64 | Filter O stream proposals by tags.

import { O_STREAM_FILTER_TAGS } from "./i.L99.core.O_STREAM_FILTER_TAGS.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_FILTER_TAGS_RUN.ts --input <stream.jsonl|list.json> --tags tagA,tagB [--pretty]",
  ].join("\n");

const parseLines = (raw: string): DeltaProposal[] =>
  raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as DeltaProposal);

export const O_STREAM_FILTER_TAGS_RUN = async (
  args: string[],
): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
    tags: [] as string[],
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
    if (a === "--tags") {
      const raw = args[++i] ?? "";
      parsed.tags = raw.split(",").map((tag) => tag.trim()).filter(Boolean);
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  if (!parsed.input) {
    throw new Error("O_STREAM_FILTER_TAGS_RUN: --input is required");
  }

  const raw = await Deno.readTextFile(parsed.input);
  let proposals: DeltaProposal[] = [];
  try {
    const parsedJson = JSON.parse(raw);
    if (Array.isArray(parsedJson)) {
      proposals = parsedJson as DeltaProposal[];
    } else {
      proposals = parseLines(raw);
    }
  } catch {
    proposals = parseLines(raw);
  }

  const filtered = O_STREAM_FILTER_TAGS(proposals, parsed.tags);
  const body = parsed.pretty
    ? `${JSON.stringify(filtered, null, 2)}\n`
    : `${JSON.stringify(filtered)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  O_STREAM_FILTER_TAGS_RUN(Deno.args);
}
