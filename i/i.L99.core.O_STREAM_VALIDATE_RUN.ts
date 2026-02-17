// i.L99.core.O_STREAM_VALIDATE_RUN.ts
// @noncanonical
// OMEGA-64 | Validate O stream or proposal list.

import { O_STREAM_VALIDATE } from "./i.L99.core.O_STREAM_VALIDATE.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_VALIDATE_RUN.ts --input <stream.jsonl|list.json> [--output <output.json>] [--pretty]",
  ].join("\n");

const parseLines = (raw: string): DeltaProposal[] =>
  raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as DeltaProposal);

export const O_STREAM_VALIDATE_RUN = async (args: string[]): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
    output: undefined as string | undefined,
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

  const raw = parsed.input
    ? await Deno.readTextFile(parsed.input)
    : await new Response(Deno.stdin.readable).text();

  if (!raw.trim()) {
    throw new Error("O_STREAM_VALIDATE_RUN: empty input");
  }

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

  const filtered = O_STREAM_VALIDATE(proposals);
  const body = parsed.pretty
    ? `${JSON.stringify(filtered, null, 2)}\n`
    : `${JSON.stringify(filtered)}\n`;

  if (parsed.output) {
    await Deno.writeTextFile(parsed.output, body);
    return;
  }

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  O_STREAM_VALIDATE_RUN(Deno.args);
}
