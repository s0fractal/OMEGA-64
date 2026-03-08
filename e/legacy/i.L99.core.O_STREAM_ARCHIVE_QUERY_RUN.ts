// i.L99.core.O_STREAM_ARCHIVE_QUERY_RUN.ts
// @noncanonical
// OMEGA-64 | Query archived proposals by proposal_id.

import { O_STREAM_ARCHIVE_QUERY } from "./i.L99.core.O_STREAM_ARCHIVE_QUERY.ts";
import { O_STREAM_ARCHIVE_PATH } from "./i.L99.core.O_STREAM_ARCHIVE_PATH.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_ARCHIVE_QUERY_RUN.ts --archive <archive.jsonl> --index <index.json> --id <proposal_id> [--pretty]",
  ].join("\n");

export const O_STREAM_ARCHIVE_QUERY_RUN = async (
  args: string[],
): Promise<void> => {
  const parsed = {
    archive: undefined as string | undefined,
    index: undefined as string | undefined,
    id: undefined as string | undefined,
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
    if (a === "--archive") {
      parsed.archive = args[++i];
      continue;
    }
    if (a === "--index") {
      parsed.index = args[++i];
      continue;
    }
    if (a === "--id") {
      parsed.id = args[++i];
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  if (!parsed.id) {
    throw new Error("O_STREAM_ARCHIVE_QUERY_RUN: --id is required");
  }

  const archive = parsed.archive ?? O_STREAM_ARCHIVE_PATH();
  const indexPath = parsed.index ?? `${archive}.index.json`;
  const indexRaw = await Deno.readTextFile(indexPath);
  const index = JSON.parse(indexRaw) as {
    archive_path: string;
    index_path: string;
    total: number;
    by_proposal_id: Record<string, number[]>;
  };

  const proposals = await O_STREAM_ARCHIVE_QUERY(parsed.id, archive, index);
  const body = parsed.pretty
    ? `${JSON.stringify(proposals, null, 2)}\n`
    : `${JSON.stringify(proposals)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  O_STREAM_ARCHIVE_QUERY_RUN(Deno.args);
}
