// i.L99.core.O_STREAM_ARCHIVE_INDEX.ts
// OMEGA-64 | O_STREAM_ARCHIVE_INDEX (Lookup)

export type OStreamArchiveIndex = {
  archive_path: string;
  index_path: string;
  total: number;
  by_proposal_id: Record<string, number[]>;
};

export const O_STREAM_ARCHIVE_INDEX = async (
  archivePath: string,
  indexPath: string,
): Promise<OStreamArchiveIndex> => {
  const raw = await Deno.readTextFile(archivePath).catch(() => "");
  const byId = new Map<string, number[]>();
  let line = 0;
  for (const entry of raw.split("\n")) {
    if (!entry.trim()) {
      line += 1;
      continue;
    }
    try {
      const parsed = JSON.parse(entry) as { proposal_id?: string };
      const id = parsed.proposal_id;
      if (id) {
        const existing = byId.get(id) ?? [];
        existing.push(line);
        byId.set(id, existing);
      }
    } catch {
      // ignore malformed lines
    }
    line += 1;
  }

  const index: OStreamArchiveIndex = {
    archive_path: archivePath,
    index_path: indexPath,
    total: Math.max(0, line - 1),
    by_proposal_id: Object.fromEntries([...byId.entries()]),
  };

  await Deno.writeTextFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  return index;
};
