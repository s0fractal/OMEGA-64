// i.L99.core.O_STREAM_ARCHIVE_RUN.ts
// @noncanonical
// OMEGA-64 | Archive proposals into append-only archive.

import { O_STREAM_ARCHIVE } from "./i.L99.core.O_STREAM_ARCHIVE.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_ARCHIVE_RUN.ts --input <list.json|stream.jsonl> --output <archive.jsonl>",
  ].join("\n");

const parseLines = (raw: string): DeltaProposal[] =>
  raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as DeltaProposal);

export const O_STREAM_ARCHIVE_RUN = async (args: string[]): Promise<void> => {
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

  if (!parsed.input || !parsed.output) {
    throw new Error("O_STREAM_ARCHIVE_RUN: --input and --output are required");
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

  await O_STREAM_ARCHIVE(proposals, parsed.output);
  await Deno.stdout.write(new TextEncoder().encode(`${parsed.output}\n`));
};

if (import.meta.main) {
  O_STREAM_ARCHIVE_RUN(Deno.args);
}
