// i.L99.core.O_STREAM_TAGS_SUMMARY.ts
// OMEGA-64 | O_STREAM_TAGS_SUMMARY (Diagnostics)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

export type OStreamTagsSummary = {
  total: number;
  tagged: number;
  untagged: number;
  by_tag: Record<string, number>;
};

const recordSorted = (entries: Array<[string, number]>): Record<string, number> => {
  const sorted = entries.slice().sort((a, b) => a[0].localeCompare(b[0]));
  return Object.fromEntries(sorted);
};

export const O_STREAM_TAGS_SUMMARY = (proposals: DeltaProposal[]): OStreamTagsSummary => {
  const byTag = new Map<string, number>();
  let tagged = 0;
  for (const proposal of proposals) {
    const tags = (proposal as DeltaProposal & { tags?: string[] }).tags ?? [];
    if (tags.length === 0) continue;
    tagged += 1;
    for (const tag of tags) {
      byTag.set(tag, (byTag.get(tag) ?? 0) + 1);
    }
  }

  return {
    total: proposals.length,
    tagged,
    untagged: proposals.length - tagged,
    by_tag: recordSorted([...byTag.entries()]),
  };
};
