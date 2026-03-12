// i.L99.core.O_STREAM_HEALTH.ts
// OMEGA-64 | O_STREAM_HEALTH (Diagnostics)

import { O_STREAM_SUMMARY } from "./i.L99.core.O_STREAM_SUMMARY.ts";
import { O_STREAM_TAGS_SUMMARY } from "./i.L99.core.O_STREAM_TAGS_SUMMARY.ts";
import { O_STREAM_ARCHIVE_PATH } from "./i.L99.core.O_STREAM_ARCHIVE_PATH.ts";
import { SAFE_WINDOW_STATUS, type SafeWindowStatus } from "./i.L99.core.SAFE_WINDOW_STATUS.ts";

export type OStreamHealth = {
  summary: ReturnType<typeof O_STREAM_SUMMARY>;
  tags_summary: ReturnType<typeof O_STREAM_TAGS_SUMMARY>;
  archive_path: string;
  archive_index_path: string;
  archive_index_exists: boolean;
  archive_index_mtime_ms: number | null;
  safe_window?: SafeWindowStatus;
};

export type OStreamHealthOptions = {
  include_safe_window?: boolean;
  safe_window?: SafeWindowStatus;
};

export const O_STREAM_HEALTH = async (
  proposals: Parameters<typeof O_STREAM_SUMMARY>[0],
  archivePath: string = O_STREAM_ARCHIVE_PATH(),
  options: OStreamHealthOptions = {},
): Promise<OStreamHealth> => {
  const archiveIndexPath = `${archivePath}.index.json`;
  const stat = await Deno.stat(archiveIndexPath).catch(() => null);
  const safeWindow = options.safe_window ??
    (options.include_safe_window ? await SAFE_WINDOW_STATUS() : undefined);
  return {
    summary: O_STREAM_SUMMARY(proposals),
    tags_summary: O_STREAM_TAGS_SUMMARY(proposals),
    archive_path: archivePath,
    archive_index_path: archiveIndexPath,
    archive_index_exists: Boolean(stat),
    archive_index_mtime_ms: stat?.mtime?.getTime() ?? null,
    safe_window: safeWindow,
  };
};
