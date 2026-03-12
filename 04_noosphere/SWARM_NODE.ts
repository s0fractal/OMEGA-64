import { LOGGER } from "@00";

export type SwarmHeartbeat = {
  nodeId: string;
  currentTick: number;
  epochHash: string;
  phase: number;
};

export class MetaKuramotoNode {
  public readonly nodeId: string;
  public readonly heartbeatInterval: number;

  constructor(
    nodeId: string = crypto.randomUUID(),
    heartbeatInterval: number = 1000,
  ) {
    this.nodeId = nodeId;
    this.heartbeatInterval = heartbeatInterval;
  }

  public evaluateHeartbeat(
    currentTick: number,
    epochHash: string,
    avgPhase: number,
    egressCount: number,
  ): void {
    if (currentTick > 0 && currentTick % this.heartbeatInterval === 0) {
      const heartbeat: SwarmHeartbeat = {
        nodeId: this.nodeId,
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
  }
}

export const SWARM_NODE = new MetaKuramotoNode();
