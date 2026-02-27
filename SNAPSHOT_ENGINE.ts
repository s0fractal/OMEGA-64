// OMEGA-64 | SNAPSHOT_ENGINE.ts | Era 19: The Genesis Checkpoint
// Rapid Binary Dumps of the volatile Memory Matrix (STATE_MATRIX.buffer)

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { ensureDir } from "jsr:@std/fs@0.224.0/ensure-dir";

const SNAPSHOT_DIR = ".omega/snapshots";

export const SNAPSHOT_ENGINE = {
    /**
     * Dumps the entire 6.4MB Memory Matrix + Akashic History to disk instantly.
     */
    exportSnapshot: async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        await ensureDir(SNAPSHOT_DIR);

        const matrixPath = `${SNAPSHOT_DIR}/matrix_${timestamp}.bin`;
        const akashicPath = `${SNAPSHOT_DIR}/akashic_${timestamp}.json`;
        const physicsPath = `${SNAPSHOT_DIR}/physics_${timestamp}.bin`;

        try {
            // 1. Binary dump of ALL Agent States (ID, Pos, Logic, Code, Memory)
            await Deno.writeFile(matrixPath, new Uint8Array(STATE_MATRIX.buffer));

            // 2. Binary dump of the Thermodynamics Grid (Nutrients)
            await Deno.writeFile(physicsPath, new Uint8Array(PHYSICS_ENGINE.envBuffer));

            // 3. JSON dump of the LLM Knowledge / Thoughts
            const akashicData = Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive);
            await Deno.writeTextFile(akashicPath, JSON.stringify(akashicData, null, 2));

            console.log(`💾 [SNAPSHOT] Genesis Saved: ${matrixPath} (${(STATE_MATRIX.buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
            return { timestamp, success: true };
        } catch (e) {
            console.error(`❌ [SNAPSHOT] Export Failed:`, e);
            return { success: false, error: String(e) };
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
                new Uint8Array(PHYSICS_ENGINE.envBuffer).set(physicsData);
            } catch {
                console.warn(`⚠️ [SNAPSHOT] No physics dump found for ${timestamp}. Falling back to default noise.`);
            }

            // 3. Restore Akashic Records
            try {
                const akashicText = await Deno.readTextFile(akashicPath);
                const akashicData = JSON.parse(akashicText);
                SEMANTIC_MEMBRANE.thoughtArchive.clear();
                for (const [hash, thought] of Object.entries(akashicData)) {
                    SEMANTIC_MEMBRANE.thoughtArchive.set(hash, thought as string);
                }
            } catch {
                console.warn(`⚠️ [SNAPSHOT] No Akashic History found for ${timestamp}. Thoughts lost in time.`);
            }

            console.log(`💾 [SNAPSHOT] Genesis Restored from: ${timestamp}`);
            return { success: true };
        } catch (e) {
            console.error(`❌ [SNAPSHOT] Import Failed:`, e);
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
                if (entry.isFile && entry.name.startsWith("matrix_") && entry.name.endsWith(".bin")) {
                    const ts = entry.name.replace("matrix_", "").replace(".bin", "");
                    timestamps.push(ts);
                }
            }
            return timestamps.sort().reverse();
        } catch {
            return [];
        }
    }
};
