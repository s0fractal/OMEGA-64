---
id: SWARM_NEXUS
type: module
description: >-
  RESTORED | Swarm Membrane for WebSocket-based peer backbone and heartbeat
  synchronization.
tags:
  - membrane
  - host
min_level: 6
vars:
  - NexusConfig
deps:
  - LOGGER
  - TYPES
---

### TypeScript

```typescript




export const createSwarmNexus = (config: NexusConfig) => new SwarmNexus(config);

export const OP_NEXUS_HANDSHAKE = 0x00;
export const OP_NEXUS_ATOM_TRANSIT = 0x01;
export const OP_NEXUS_HEARTBEAT = 0x02;
export const OP_NEXUS_EPOCH_CONSENSUS = 0x03;
export const OP_NEXUS_SYNC_REQUEST = 0x04;
export const OP_NEXUS_EPOCH_PAYLOAD = 0x05;

export class SwarmNexus {
  public nodeId: string;
  public instanceId: number;
  public port: number;
  public seedNodes: string[];
  public mainnetEnabled: boolean;
  public bootstrapHubUrl: string;

  // Peer registry
  public connectedPeers: Map<string, WebSocket> = new Map();
  // Server handle
  private serverAbortController: AbortController = new AbortController();

  // Heartbeat tracking
  public peerHeartbeats: Map<
    string,
    { tick: number; tps: number; lastSeen: number }
  > = new Map();
  private heartbeatInterval?: number;

  // Local TPS tracking support
  public localCurrentTick: number = 0;
  public localTps: number = 0;

  // Callback Hooks
  public onAtomTransit?: (payload: Uint8Array) => void;
  public onSyncRequest?: (peerId: string) => void;
  public onEpochPayload?: (payload: Uint8Array) => void;

  constructor(config: NexusConfig) {
    this.nodeId = crypto.randomUUID();
    this.instanceId = config.instanceId;
    this.port = 8080 + config.instanceId;
    this.seedNodes = config.seedNodes;
    this.mainnetEnabled = config.mainnetEnabled ?? false;
    this.bootstrapHubUrl = config.bootstrapHubUrl ?? "";
  }

  public start() {
    LOGGER.info(`[NEXUS] Booting Swarm Membrane on port ${this.port} (Node: ${this.nodeId})`);

    // 1. Start listening for incoming WebSocket connections
    const server = Deno.serve({
      port: this.port,
      hostname: "127.0.0.1",
      signal: this.serverAbortController.signal,
      onListen: ({ port, hostname }) => {
        LOGGER.info(`[NEXUS] Listening for peers on ws://${hostname}:${port}`);
      },
    }, (req) => {
      if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }

      const { socket, response } = Deno.upgradeWebSocket(req);
      this.handleConnection(socket, "INBOUND");
      return response;
    });

    server.finished.catch((err: any) => {
      LOGGER.error(`[NEXUS] FATAL SERVER CRASH: ${err}`);
    });

    // 2. Connect to known seed nodes
    for (const seedUrl of this.seedNodes) {
      if (
        seedUrl === `ws://127.0.0.1:${this.port}` ||
        seedUrl === `ws://localhost:${this.port}`
      ) {
        continue; // Don't connect to self
      }
      this.connectToPeer(seedUrl);
    }

    // 2.5 Connect to Bootstrap Hub if requested
    if (this.mainnetEnabled && this.bootstrapHubUrl) {
      this.connectToHub();
    }

    // 3. Start Heartbeat Broadcast
    this.heartbeatInterval = setInterval(() => {
      this.broadcastHeartbeat();
    }, 100);
  }

  public stop() {
    LOGGER.info(`[NEXUS] Shutting down Node ${this.nodeId}`);
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    this.serverAbortController.abort();
    for (const [, ws] of this.connectedPeers) {
      ws.close();
    }
    this.connectedPeers.clear();
    this.peerHeartbeats.clear();
  }

  private connectToPeer(url: string) {
    try {
      LOGGER.info(`[NEXUS] Attempting connection to seed: ${url}`);
      const socket = new WebSocket(url);
      this.handleConnection(socket, "OUTBOUND");
    } catch (e) {
      LOGGER.error(`[NEXUS] Failed to connect to seed ${url}: ${e}`);
    }
  }

  private connectToHub() {
    try {
      LOGGER.info(`[NEXUS] Connecting to Bootstrap Hub: ${this.bootstrapHubUrl}`);
      const hubSocket = new WebSocket(this.bootstrapHubUrl);

      hubSocket.onopen = () => {
        LOGGER.info(`[NEXUS] Connected to Hub.`);
        hubSocket.send(JSON.stringify({
          op: "REGISTER",
          nodeId: this.nodeId,
          url: `ws://127.0.0.1:${this.port}`,
        }));
      };

      hubSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.op === "PEER_LIST" && Array.isArray(data.peers)) {
            LOGGER.info(`[NEXUS] Received ${data.peers.length} peers from Hub.`);
            for (const peerUrl of data.peers) {
              if (peerUrl !== `ws://127.0.0.1:${this.port}`) {
                this.connectToPeer(peerUrl);
              }
            }
          }
        } catch (e) {
          LOGGER.warn(`[NEXUS] Failed to parse PEER_LIST from Hub.`, e);
        }
      };

      hubSocket.onclose = () => {
        LOGGER.warn(`[NEXUS] Disconnected from Hub.`);
      };
    } catch (e) {
      LOGGER.error(`[NEXUS] Failed to connect to Hub: ${e}`);
    }
  }

  private handleConnection(
    socket: WebSocket,
    direction: "INBOUND" | "OUTBOUND",
  ) {
    socket.binaryType = "arraybuffer";
    let remoteNodeId: string | null = null;

    socket.onopen = () => {
      LOGGER.info(`[NEXUS] ${direction} Socket Opened.`);
      this.sendHandshake(socket);
    };

    socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const payload = new Uint8Array(event.data);
        const op = payload[0];

        switch (op) {
          case OP_NEXUS_HANDSHAKE:
            remoteNodeId = this.handleHandshake(socket, payload);
            break;
          case OP_NEXUS_ATOM_TRANSIT:
            this.handleAtomTransit(payload);
            break;
          case OP_NEXUS_HEARTBEAT:
            if (remoteNodeId) this.handleHeartbeat(remoteNodeId, payload);
            break;
          case OP_NEXUS_EPOCH_CONSENSUS:
            if (remoteNodeId) this.handleEpochConsensus(remoteNodeId, payload);
            break;
          case OP_NEXUS_SYNC_REQUEST:
            if (remoteNodeId) this.handleSyncRequest(remoteNodeId);
            break;
          case OP_NEXUS_EPOCH_PAYLOAD:
            this.handleEpochPayload(payload);
            break;
          default:
            LOGGER.warn(`[NEXUS] Unknown binary OP code: ${op}`);
        }
      } else {
        LOGGER.warn(`[NEXUS] Received non-binary message, discarding.`);
      }
    };

    socket.onclose = () => {
      if (remoteNodeId) {
        LOGGER.info(`[NEXUS] Peer disconnected: ${remoteNodeId}`);
        this.connectedPeers.delete(remoteNodeId);
        this.peerHeartbeats.delete(remoteNodeId);
      }
    };

    socket.onerror = (e) => {
      LOGGER.error(`[NEXUS] Socket Error on ${remoteNodeId || "unknown peer"}:`, e);
    };
  }

  private sendHandshake(socket: WebSocket) {
    const encoder = new TextEncoder();
    const idBytes = encoder.encode(this.nodeId);
    if (idBytes.length !== 36) return;

    const payload = new Uint8Array(1 + 36);
    payload[0] = OP_NEXUS_HANDSHAKE;
    payload.set(idBytes, 1);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload.buffer);
    }
  }

  private handleHandshake(socket: WebSocket, payload: Uint8Array): string {
    const decoder = new TextDecoder();
    const remoteId = decoder.decode(payload.slice(1, 37));
    LOGGER.info(`[NEXUS] Handshake complete with Node: ${remoteId}`);
    this.connectedPeers.set(remoteId, socket);
    return remoteId;
  }

  public routeAtom(egressEvent: Uint8Array) {
    if (this.connectedPeers.size === 0) return;

    const peers = Array.from(this.connectedPeers.values());
    const targetPeer = peers[Math.floor(Math.random() * peers.length)];

    const payload = new Uint8Array(1 + egressEvent.length);
    payload[0] = OP_NEXUS_ATOM_TRANSIT;
    payload.set(egressEvent, 1);

    if (targetPeer.readyState === WebSocket.OPEN) {
      targetPeer.send(payload.buffer);
      LOGGER.info(`[NEXUS] Atom dispatched to peer.`);
    }
  }

  private handleAtomTransit(payload: Uint8Array) {
    const atomData = payload.slice(1);
    LOGGER.info(`[NEXUS] Ingress Atom Materializing...`);
    if (this.onAtomTransit) this.onAtomTransit(atomData);
  }

  private broadcastHeartbeat() {
    if (this.connectedPeers.size === 0) return;
    const payload = new Uint8Array(17);
    payload[0] = OP_NEXUS_HEARTBEAT;
    const view = new DataView(payload.buffer);
    view.setFloat64(1, this.localCurrentTick, true);
    view.setFloat64(9, this.localTps, true);

    for (const peer of this.connectedPeers.values()) {
      if (peer.readyState === WebSocket.OPEN) peer.send(payload.buffer);
    }
  }

  private handleHeartbeat(remoteId: string, payload: Uint8Array) {
    if (payload.length !== 17) return;
    const view = new DataView(payload.buffer);
    const tick = view.getFloat64(1, true);
    const tps = view.getFloat64(9, true);
    this.peerHeartbeats.set(remoteId, { tick, tps, lastSeen: performance.now() });
  }

  public getMedianSwarmTick(localTickFallback: number): number {
    const now = performance.now();
    const ticks: number[] = [localTickFallback];
    for (const [peerId, hb] of this.peerHeartbeats.entries()) {
      if (now - hb.lastSeen > 2000) {
        this.peerHeartbeats.delete(peerId);
        continue;
      }
      ticks.push(hb.tick);
    }
    if (ticks.length === 1) return localTickFallback;
    ticks.sort((a, b) => a - b);
    const mid = Math.floor(ticks.length / 2);
    return ticks.length % 2 === 0 ? (ticks[mid - 1] + ticks[mid]) / 2 : ticks[mid];
  }

  public broadcastEpochConsensus(epochTick: number, hash: bigint) {
    if (this.connectedPeers.size === 0) return;
    const payload = new Uint8Array(17);
    payload[0] = OP_NEXUS_EPOCH_CONSENSUS;
    const view = new DataView(payload.buffer);
    view.setFloat64(1, epochTick, true);
    view.setBigUint64(9, hash, true);
    for (const peer of this.connectedPeers.values()) {
      if (peer.readyState === WebSocket.OPEN) peer.send(payload.buffer);
    }
  }

  private handleEpochConsensus(remoteId: string, payload: Uint8Array) {
    if (payload.length !== 17) return;
    const view = new DataView(payload.buffer);
    const epochTick = view.getFloat64(1, true);
    const peerHash = view.getBigUint64(9, true);
    LOGGER.warn(`[CONSENSUS WARNING] Received Epoch ${epochTick} Hash ${peerHash} from ${remoteId}.`);
  }

  public broadcastSyncRequest() {
    if (this.connectedPeers.size === 0) return;
    const payload = new Uint8Array([OP_NEXUS_SYNC_REQUEST]);
    for (const peer of this.connectedPeers.values()) {
      if (peer.readyState === WebSocket.OPEN) peer.send(payload.buffer);
    }
  }

  private handleSyncRequest(remoteId: string) {
    if (this.onSyncRequest) this.onSyncRequest(remoteId);
  }

  public sendEpochPayload(targetNodeId: string, epochData: Uint8Array) {
    const peer = this.connectedPeers.get(targetNodeId);
    if (!peer || peer.readyState !== WebSocket.OPEN) return;
    const payload = new Uint8Array(1 + epochData.length);
    payload[0] = OP_NEXUS_EPOCH_PAYLOAD;
    payload.set(epochData, 1);
    peer.send(payload.buffer);
  }

  private handleEpochPayload(payload: Uint8Array) {
    const epochData = payload.slice(1);
    if (this.onEpochPayload) this.onEpochPayload(epochData);
  }
}
```
