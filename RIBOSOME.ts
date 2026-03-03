/// <reference lib="deno.window" />
// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "./IMMUNE.ts";
import { parse as parseYaml } from "@std/yaml";
import { ATOM_SIZE, STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { decodeHex } from "@std/encoding/hex";
import { LOGGER } from "./LOGGER.ts";

export interface Atom {
  id: string; // The Filename (Address)
  level: number;
  module: any; // The Exported Logic
  symbol: string;
  topo?: { r: number; theta: number; op: string };
}

export type Lattice = Map<string, Atom>;

// Mapping for Matrix Lookups
export const ID_TO_IDX = new Map<string, number>();
export const IDX_TO_ID = new Map<number, string>();

function idToBigInt(id: string): bigint {
  const hex = id.split(".")[0].replace("0x", "");
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, "0").padEnd(16, "0");
  try {
    return BigInt(`0x${cleanHex.substring(0, 16)}`);
  } catch {
    return 0n;
  }
}

export const RIBOSOME = {
  // Scan and Lift all Atoms in Flatland and Vacuum
  lift: async (root: string = Deno.cwd()): Promise<Map<string, Atom>> => {
    LOGGER.info("   [RIBOSOME] lift started on root: ", root);

    // --- ERA 39: Hybrid Storage (Snapshot Hydration) ---
    const snapshots = await SNAPSHOT_ENGINE.listSnapshots();
    if (snapshots.length > 0) {
      const latest = snapshots[0];
      LOGGER.info(
        `   [RIBOSOME] Found Snapshot [${latest}]. Attempting Fast Hydration...`,
      );
      const status = await SNAPSHOT_ENGINE.importSnapshot(latest);
      if (status.success) {
        LOGGER.info(
          "   [RIBOSOME] Fast Hydration Successful. Bypassing Flatland Sweep. ⚡🧊",
        );
        // Reconstruct a mock lattice from active indices for compatibility
        const lattice = new Map<string, Atom>();
        const activeIndices = STATE_MATRIX.getActiveIndices();
        for (const idx of activeIndices) {
          const idHex = STATE_MATRIX.getId(idx).toString(16).padStart(16, "0")
            .toUpperCase();
          // We don't have the full AST/logic string here perfectly, but
          // the core arrays are populated. We supply a dummy atom object just to satisfy return type.
          ID_TO_IDX.set(idHex, idx);
          IDX_TO_ID.set(idx, idHex);
          lattice.set(idHex, {
            id: idHex,
            level: 0,
            module: {},
            symbol: "HYDRATED",
          });
        }
        // Return immediately, bypassing filesystem parsing
        return lattice;
      } else {
        LOGGER.warn(
          "   [RIBOSOME] Fast Hydration Failed. Falling back to Flatland Sweep.",
        );
        STATE_MATRIX.clear(); // Reset before fallback
      }
    }

    const lattice = new Map<string, Atom>();
    let idx = 0;

    const scanDirs = [root, `${root}/SINGULARITY/V`];
    for (const dir of scanDirs) {
      LOGGER.info(`   [RIBOSOME] scanning dir: ${dir}`);
      try {
        for await (const entry of Deno.readDir(dir)) {
          if (
            entry.isFile && entry.name.startsWith("0x") &&
            entry.name.endsWith(".md")
          ) {
            const fullPath = dir === root
              ? entry.name
              : `SINGULARITY/V/${entry.name}`;
            const content = await Deno.readTextFile(fullPath);
            const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
            if (!frontmatterMatch) continue;

            const alpha = parseYaml(frontmatterMatch[1]) as any;
            const symbol = alpha.symbol ?? entry.name.split(".")[1] ??
              "UNKNOWN";
            const level = alpha.level ??
              (alpha.vector ? parseInt(alpha.vector.split(".")[0]) : 0);

            // 🧬 ERA 8: SERIALIZE INTO SoA STATE_MATRIX
            const atomBigId = idToBigInt(entry.name);
            STATE_MATRIX.setId(idx, atomBigId);
            STATE_MATRIX.setX(idx, Number(alpha.x) || 0);
            STATE_MATRIX.setY(idx, Number(alpha.y) || 0);
            STATE_MATRIX.setEnergy(idx, Number(alpha.energy) || 100);
            STATE_MATRIX.setResonance(idx, Number(alpha.resonance) || 0);
            STATE_MATRIX.setPhase(idx, Number(alpha.phase) || 0);

            // Logic (Hex to Bytes)
            const logic = (alpha.logic || "00000000").replace(
              /[^0-9a-fA-F]/g,
              "",
            ).padEnd(16, "0");
            try {
              STATE_MATRIX.setLogic(idx, decodeHex(logic.substring(0, 16)));
            } catch { /* skip corrupted logic binary lift */ }

            ID_TO_IDX.set(fullPath, idx);
            IDX_TO_ID.set(idx, fullPath);

            lattice.set(fullPath, {
              id: entry.name,
              level: level,
              symbol: symbol,
              module: null,
            });

            idx++;
          }
        }
      } catch (err) {
        LOGGER.error(`   [RIBOSOME] Error reading dir ${dir}:`, err);
      }
    }

    LOGGER.info(`   [RIBOSOME] Phase 1 done, found atoms:`, ID_TO_IDX.size);

    // 🧬 PASS 2: BOND RESOLUTION
    const bondKeyMap = new Map<string, string>();
    for (const k of ID_TO_IDX.keys()) {
      const basename = k.split("/").pop() || k;
      const bondIdStr = basename.split(".")[0];
      bondKeyMap.set(bondIdStr, k);
    }

    for (const [fullPath, atomIdx] of ID_TO_IDX.entries()) {
      try {
        const content = await Deno.readTextFile(fullPath);
        const alphaMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        if (alphaMatch) {
          const alpha = parseYaml(alphaMatch[1]) as any;
          const bondIds: string[] = alpha.bonds || [];
          const bondIndices = new Uint32Array(4);
          for (let i = 0; i < Math.min(bondIds.length, 4); i++) {
            const partnerId = bondKeyMap.get(bondIds[i]);
            if (partnerId) {
              bondIndices[i] = ID_TO_IDX.get(partnerId) || 0;
            }
          }
          STATE_MATRIX.setBonds(atomIdx, bondIndices);
        }
      } catch (err) { /* ignore */ }
    }

    LOGGER.info(
      `   [MEMORY_MATRIX] ${idx} atoms serialized into SoA Structure.`,
    );

    // 🛡️ IMMUNE SYSTEM CHECK
    LOGGER.info("   [RIBOSOME] Running IMMUNE check");
    const out = IMMUNE.inspect(lattice);
    LOGGER.info("   [RIBOSOME] IMMUNE check complete");
    return out;
  },

  // Inject Dependencies into a Pure Atom (Adapted for Flatland)
  inject: (id: string, lattice: Map<string, Atom>) => {
    const target = lattice.get(id);
    if (!target) return null;

    // Implementation for Flatland injection...
    return null;
  },
};

if (import.meta.main) {
  const lattice = await RIBOSOME.lift();
  LOGGER.info(`[RIBOSOME] Flatland Lifted: ${lattice.size} atoms.`);
}
