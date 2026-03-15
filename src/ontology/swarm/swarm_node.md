---
id: SWARM_NODE
type: module
description: "Implementation of SWARM_NODE"
tags: []
min_level: 4
---

### TypeScript
```typescript
import { LOGGER, Li } from "@generated";

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

        Li(
          `[SWARM] Heartbeat Broadcast => ${JSON.stringify(heartbeat)}`,
        );

        if (egressCount > 0) {
          Li(
            `[SWARM] Broadcasting ${egressCount} egress atoms from membrane buffer to mesh...`,
          );
        }
      }
    },
  };
};

export const SWARM_NODE = createMetaKuramotoNode();

```
