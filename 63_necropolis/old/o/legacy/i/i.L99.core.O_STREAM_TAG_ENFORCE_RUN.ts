// i.L99.core.O_STREAM_TAG_ENFORCE_RUN.ts
// @noncanonical
// OMEGA-64 | Enforce tag policy on O stream proposals.

import { O_STREAM_TAG_POLICY } from "./i.L99.core.O_STREAM_TAG_POLICY.ts";
import { O_STREAM_TAG_ENFORCE } from "./i.L99.core.O_STREAM_TAG_ENFORCE.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_TAG_ENFORCE_RUN.ts --input <stream.jsonl|list.json> [--pretty]",
  ].join("\n");

const parseLines = (raw: string): DeltaProposal[] =>
  raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as DeltaProposal);

export const O_STREAM_TAG_ENFORCE_RUN = async (args: string[]): Promise<void> => {
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
    throw new Error("O_STREAM_TAG_ENFORCE_RUN: --input is required");
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

  const policy = O_STREAM_TAG_POLICY();
  const filtered = O_STREAM_TAG_ENFORCE(proposals, policy);
  const body = parsed.pretty
    ? `${JSON.stringify(filtered, null, 2)}\n`
    : `${JSON.stringify(filtered)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  O_STREAM_TAG_ENFORCE_RUN(Deno.args);
}
