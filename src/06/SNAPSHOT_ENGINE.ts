// OMEGA-64 | SNAPSHOT_ENGINE.ts | Era 19: The Genesis Checkpoint
// Rapid Binary Dumps of the volatile Memory Matrix (STATE_MATRIX.buffer)

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { SEMANTIC_MEMBRANE } from "@05";
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

const SNAPSHOT_DIR = ".omega/snapshots";
const normalizeRetention = (value: number | undefined): number => {
  if (!Number.isFinite(value)) return 8;
  return Math.max(1, Math.min(512, Math.floor(value as number)));
};

type SnapshotExportOptions = {
  tick?: number;
  reason?: string;
  prune?: boolean;
  retention?: number;
};

export const SNAPSHOT_ENGINE = {
  /**
   * Dumps the entire 6.4MB Memory Matrix + Akashic History to disk instantly.
   */
  exportSnapshot: async (options: SnapshotExportOptions = {}) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const tick = Number.isFinite(options.tick)
      ? Number(options.tick)
      : undefined;
    const reason =
      typeof options.reason === "string" && options.reason.trim().length > 0
        ? options.reason.trim().slice(0, 96)
        : "manual";
    const shouldPrune = Boolean(options.prune);
    const retention = normalizeRetention(options.retention);
    await Deno.mkdir(SNAPSHOT_DIR, { recursive: true });

    const matrixPath = `${SNAPSHOT_DIR}/matrix_${timestamp}.bin`;
    const akashicPath = `${SNAPSHOT_DIR}/akashic_${timestamp}.json`;
    const physicsPath = `${SNAPSHOT_DIR}/physics_${timestamp}.bin`;
    try {
      // 1. Binary dump of ALL Agent States (ID, Pos, Logic, Code, Memory)
      const matrixData = new Uint8Array(STATE_MATRIX.buffer);
      await Deno.writeFile(matrixPath, matrixData);

      // 2. Binary dump of the Thermodynamics Grid (Nutrients)
      await Deno.writeFile(
        physicsPath,
        new Uint8Array(STATE_MATRIX.attentionField.buffer, STATE_MATRIX.attentionField.byteOffset, STATE_MATRIX.attentionField.byteLength),
      );

      // 3. JSON dump of the LLM Knowledge / Thoughts
      const akashicData = Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive);

      // --- ERA 68: CHECKSUM FOOTER ---
      const checksum = matrixData.reduce(
        (acc, val) => (acc + val) % 0xFFFFFFFF,
        0,
      );
      (akashicData as any)._checksum = checksum;

      await Deno.writeTextFile(
        akashicPath,
        JSON.stringify(akashicData, null, 2),
      );

      let pruned = 0;
      if (shouldPrune) {
        pruned = await SNAPSHOT_ENGINE.pruneSnapshots(retention);
      }

      LOGGER.info(
        `💾 [SNAPSHOT] Genesis Saved: ${matrixPath} (Checksum: ${
          checksum.toString(16).toUpperCase()
        }) reason=${reason} tick=${tick ?? "n/a"} pruned=${pruned}`,
      );
      return {
        timestamp,
        success: true,
        tick,
        reason,
        pruned,
        retention,
      };
    } catch (e) {
      LOGGER.error(`❌ [SNAPSHOT] Export Failed:`, e);
      return { success: false, error: String(e), tick, reason };
    }
  },

  /**
   * Instantly overwrites the RAM Matrix with a historical `.bin` state.
   */
  importSnapshot: async (timestamp: string) => {
    const matrixPath = `${SNAPSHOT_DIR}/matrix_${timestamp}.bin`;
    const akashicPath = `${SNAPSHOT_DIR}/akashic_${timestamp}.json`;
    const physicsPath = `${SNAPSHOT_DIR}/physics_${timestamp}.bin`;

    try {
      // 1. Restore Matrix Memory Buffer
      const matrixData = await Deno.readFile(matrixPath);
      if (matrixData.length === STATE_MATRIX.buffer.byteLength) {
        new Uint8Array(STATE_MATRIX.buffer).set(matrixData);
      } else {
        throw new Error("Matrix Payload Size Mismatch");
      }

      // 2. Restore Thermodynamics Grid
      try {
        const physicsData = await Deno.readFile(physicsPath);
        new Uint8Array(STATE_MATRIX.attentionField.buffer, STATE_MATRIX.attentionField.byteOffset, STATE_MATRIX.attentionField.byteLength).set(physicsData);
      } catch {
        LOGGER.warn(
          `⚠️ [SNAPSHOT] No physics dump found for ${timestamp}. Falling back to default noise.`,
        );
      }

      // 3. Restore Akashic Records & Verify Checksum
      try {
        const akashicText = await Deno.readTextFile(akashicPath);
        const akashicData = JSON.parse(akashicText);

        // --- ERA 68: INTEGRITY VERIFICATION ---
        const expectedChecksum = akashicData._checksum;
        if (expectedChecksum !== undefined) {
          const actualChecksum = matrixData.reduce(
            (acc, val) => (acc + val) % 0xFFFFFFFF,
            0,
          );
          if (actualChecksum !== expectedChecksum) {
            throw new Error(
              `Integrity Violation: Predicted ${
                expectedChecksum.toString(16)
              }, Found ${actualChecksum.toString(16)}`,
            );
          }
          LOGGER.info(
            `🛡️ [SNAPSHOT] Integrity Verified: Checksum ${
              actualChecksum.toString(16).toUpperCase()
            }`,
          );
        }

        SEMANTIC_MEMBRANE.thoughtArchive.clear();
        for (const [hash, thought] of Object.entries(akashicData)) {
          if (hash === "_checksum") continue;
          SEMANTIC_MEMBRANE.thoughtArchive.set(hash, thought as string);
        }
      } catch (e: any) {
        if (e.message?.includes("Integrity Violation")) throw e;
        LOGGER.warn(
          `⚠️ [SNAPSHOT] No history or metadata for ${timestamp}:`,
          e,
        );
      }

      LOGGER.info(`💾 [SNAPSHOT] Genesis Restored from: ${timestamp}`);
      return { success: true };
    } catch (e) {
      LOGGER.error(`❌ [SNAPSHOT] Import Failed:`, e);
      return { success: false, error: String(e) };
    }
  },

  /**
   * Lists all available Genesis Checkpoints sorted by newest first.
   */
  listSnapshots: async () => {
    try {
      const timestamps: string[] = [];
      // @ts-ignore: Deno.readDir is valid in Deno
      for await (const entry of Deno.readDir(SNAPSHOT_DIR)) {
        if (
          entry.isFile && entry.name.startsWith("matrix_") &&
          entry.name.endsWith(".bin")
        ) {
          const ts = entry.name.replace("matrix_", "").replace(".bin", "");
          timestamps.push(ts);
        }
      }
      return timestamps.sort().reverse();
    } catch {
      return [];
    }
  },
  pruneSnapshots: async (keepLatest: number = 8) => {
    const keep = normalizeRetention(keepLatest);
    const snapshots = await SNAPSHOT_ENGINE.listSnapshots();
    const stale = snapshots.slice(keep);
    if (stale.length === 0) return 0;

    for (const timestamp of stale) {
      for (const prefix of ["matrix", "akashic", "physics"]) {
        const path = `${SNAPSHOT_DIR}/${prefix}_${timestamp}.${
          prefix === "akashic" ? "json" : "bin"
        }`;
        try {
          await Deno.remove(path);
        } catch {
          // Ignore partial snapshot file-set gaps.
        }
      }
    }

    LOGGER.info(
      `🧹 [SNAPSHOT] Pruned stale snapshots: removed=${stale.length} keep=${keep}`,
    );
    return stale.length;
  },
};
