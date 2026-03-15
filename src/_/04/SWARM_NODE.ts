/** SSoT: {@link ../../ontology/swarm/swarm_node.md} */

import { LOGGER } from "@generated";

export type SwarmHeartbeat = {
  nodeId: string;
  currentTick: number;
  epochHash: string;
  phase: number;
};

export type MetaKuramotoNode = {
  nodeId: string;
  heartbeatInterval: number;
  evaluateHeartbeat: (
    currentTick: number,
    epochHash: string,
    avgPhase: number,
    egressCount: number,
  ) => void;
};

export const createMetaKuramotoNode = (
  nodeId: string = crypto.randomUUID(),
  heartbeatInterval: number = 1000,
): MetaKuramotoNode => {
  return {
    nodeId,
    heartbeatInterval,
    evaluateHeartbeat: (currentTick, epochHash, avgPhase, egressCount) => {
      if (currentTick > 0 && currentTick % heartbeatInterval === 0) {
        const heartbeat: SwarmHeartbeat = {
          nodeId,
          currentTick,
          epochHash,
          phase: avgPhase,
        };

        LOGGER.info(
          `[SWARM] Heartbeat Broadcast => ${JSON.stringify(heartbeat)}`,
        );

        if (egressCount > 0) {
          LOGGER.info(
            `[SWARM] Broadcasting ${egressCount} egress atoms from membrane buffer to mesh...`,
          );
        }
      }
    },
  };
};

export const SWARM_NODE = createMetaKuramotoNode();
