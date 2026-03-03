// OMEGA-64 | P2P_FEDERATION.ts | Era 15: The Stabilized Monad
// Reliable inter-system atom migration.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";
import { PRNG } from "./PRNG.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";

export interface AtomPacket {
  id: string;
  logic: string;
  energy: number;
  resonance: number;
  sourceNode: string;
  pulseId: number;
}

const CURRENT_PORT = Number(Deno.env.get("PORT")) || 8000;
const migrationQueue: number[] = [];
let isProcessingMigration = false;
const parseBool = (raw: string | undefined, fallback: boolean): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};
const parseBoundedInt = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};
const FEDERATION_ENABLED = parseBool(
  Deno.env.get("OMEGA_FEDERATION_ENABLE"),
  false,
);
const CONTROL_TOKEN = (Deno.env.get("OMEGA_SYSTEM_CONTROL_TOKEN") ?? "").trim();
const REQUEST_TIMEOUT_MS = parseBoundedInt(
  Deno.env.get("OMEGA_FEDERATION_TIMEOUT_MS"),
  2000,
  50,
  120_000,
);

export const P2P_FEDERATION = {
  peers: new Set<string>(
    CURRENT_PORT === 8000
      ? ["http://localhost:8001"]
      : ["http://localhost:8000"],
  ),
  nodeId: `OMEGA-${CURRENT_PORT}`,
  enabled: FEDERATION_ENABLED,

  serialize: (idx: number, pulseId: number = 0): AtomPacket | null => {
    const id = IDX_TO_ID.get(idx);
    if (!id) return null;

    const logicBytes = STATE_MATRIX.getLogic(idx);
    let logicStr = "";
    for (let i = 0; i < 8; i++) {
      logicStr += logicBytes[i].toString(16).padStart(2, "0");
    }

    return {
      id,
      logic: logicStr,
      energy: STATE_MATRIX.getEnergy(idx),
      resonance: STATE_MATRIX.getResonance(idx),
      sourceNode: P2P_FEDERATION.nodeId,
      pulseId,
    };
  },

  migrate: (idx: number, pulseId: number) => {
    if (!FEDERATION_ENABLED) return;
    if (migrationQueue.length > 100) return;
    migrationQueue.push(idx);
    P2P_FEDERATION.processQueue(pulseId);
  },

  processQueue: async (pulseId: number) => {
    if (!FEDERATION_ENABLED) return;
    if (isProcessingMigration || migrationQueue.length === 0) return;
    isProcessingMigration = true;

    const idx = migrationQueue.shift()!;
    const atomIdAtStart = STATE_MATRIX.getId(idx);
    const packet = P2P_FEDERATION.serialize(idx, pulseId);

    if (packet && atomIdAtStart !== 0n) {
      const prng = new PRNG(PRNG.seedFrom(pulseId, packet.id));
      const { value: pSelector } = prng.next();
      const peerList = Array.from(P2P_FEDERATION.peers);
      if (peerList.length === 0) {
        isProcessingMigration = false;
        return;
      }
      const targetPeer = peerList[Math.floor(pSelector * peerList.length)];
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (CONTROL_TOKEN.length > 0) {
        headers["x-omega-control-token"] = CONTROL_TOKEN;
      }

      try {
        const res = await fetch(`${targetPeer}/federate`, {
          method: "POST",
          headers,
          body: JSON.stringify(packet),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (res.ok) {
          // Only clear if the atom hasn't changed locally during transit
          if (STATE_MATRIX.getId(idx) === atomIdAtStart) {
            STATE_MATRIX.setId(idx, 0n); // Clear physically
            MUTATION_TELEMETRY.record({
              lane: "external_ingress",
              kind: "federation_migration_clear",
              count: 1,
            });
            LOGGER.info(
              `🛸 [FEDERATION] ${packet.id} migrated to ${targetPeer}`,
            );
          } else {
            LOGGER.warn(
              `🛸 [FEDERATION] Transit collision for ${packet.id}. Local mutation kept.`,
            );
          }
        } else {
          LOGGER.warn(
            `🛸 [FEDERATION] Migration rejected for ${packet.id}: status=${res.status}`,
          );
        }
      } catch (e: any) {
        LOGGER.error(
          `🛸 [FEDERATION] Migration failed for ${packet.id}: ${
            e?.message ?? String(e)
          }`,
        );
      }
    }

    isProcessingMigration = false;
    if (migrationQueue.length > 0) {
      setTimeout(() => P2P_FEDERATION.processQueue(pulseId), 50);
    }
  },

  checkWanderlust: (idx: number, pulseId: number): boolean => {
    if (!FEDERATION_ENABLED) return false;
    const id = STATE_MATRIX.getId(idx);
    if (id === 0n) return false;

    const energy = STATE_MATRIX.getEnergy(idx);
    const resonance = STATE_MATRIX.getResonance(idx);

    // Atoms only migrate if they have high potential but are in a low resonance environment
    if (resonance < 5 && energy > 150) {
      const prng = new PRNG(PRNG.seedFrom(pulseId, id.toString()));
      const { value: v1 } = prng.next();
      return v1 < 0.005;
    }
    return false;
  },
};
