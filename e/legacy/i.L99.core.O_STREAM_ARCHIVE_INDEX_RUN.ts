// i.L99.core.O_STREAM_ARCHIVE_INDEX_RUN.ts
// @noncanonical
// OMEGA-64 | Build archive index.

import { O_STREAM_ARCHIVE_INDEX } from "./i.L99.core.O_STREAM_ARCHIVE_INDEX.ts";
import { O_STREAM_ARCHIVE_PATH } from "./i.L99.core.O_STREAM_ARCHIVE_PATH.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.O_STREAM_ARCHIVE_INDEX_RUN.ts --archive <archive.jsonl> --output <index.json>",
  ].join("\n");

export const O_STREAM_ARCHIVE_INDEX_RUN = async (
  args: string[],
): Promise<void> => {
  const parsed = {
    archive: undefined as string | undefined,
    output: undefined as string | undefined,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
      continue;
    }
    if (a === "--archive") {
      parsed.archive = args[++i];
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

  const archive = parsed.archive ?? O_STREAM_ARCHIVE_PATH();
  const output = parsed.output ?? `${archive}.index.json`;
  await O_STREAM_ARCHIVE_INDEX(archive, output);

  await Deno.stdout.write(new TextEncoder().encode(`${output}\n`));
};

if (import.meta.main) {
  O_STREAM_ARCHIVE_INDEX_RUN(Deno.args);
}
