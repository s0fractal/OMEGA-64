// OMEGA-64 | BOOTSTRAP_HUB.ts | Mainnet Signaling Server
// A lightweight public directory for OMEGA-64 nodes to discover each other.

import { parseArgs } from "https://deno.land/std@0.208.0/cli/parse_args.ts";

const args = parseArgs(Deno.args, {
  string: ["port", "host"],
  default: {
    port: "9999",
    host: "0.0.0.0",
  },
});

const PORT = parseInt(args.port, 10);
const HOST = args.host;

// Registry of active nodes.
// Key: Node UUID
// Value: { socket, url }
type NodeRecord = {
  socket: WebSocket;
  url: string;
};
const activeNodes = new Map<string, NodeRecord>();

function log(msg: string) {
  const ts = new Date().toISOString().substring(11, 19);
  console.log(`[BOOTSTRAP ${ts}] ${msg}`);
}

function broadcastPeerStats() {
  log(`Active Swarm Nodes: ${activeNodes.size}`);
}

if (import.meta.main) {
  Deno.serve({ port: PORT, hostname: HOST }, (req) => {
    if (req.headers.get("upgrade") !== "websocket") {
      // Health check endpoint
      return new Response(
        JSON.stringify({
          status: "OMEGA_BOOTSTRAP_HUB_ONLINE",
          active_nodes: activeNodes.size,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    let localNodeId: string | null = null;

    socket.onopen = () => {
      // Wait for the client to send a REGISTER json message
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.op === "REGISTER") {
          if (!data.nodeId || !data.url) {
            socket.send(
              JSON.stringify({ op: "ERROR", message: "Missing nodeId or url" }),
            );
            return;
          }

          localNodeId = data.nodeId;

          // Remove old connection for same ID if exists (reconnection)
          const old = activeNodes.get(localNodeId!);
          if (old && old.socket !== socket) {
            try {
              old.socket.close();
            } catch {}
          }

          activeNodes.set(localNodeId!, { socket, url: data.url });
          log(`Node Registered: ${localNodeId} at ${data.url}`);

          // Pick up to 5 random peers to send back
          const peerUrls: string[] = [];
          const allPeerIds = Array.from(activeNodes.keys()).filter((id) =>
            id !== localNodeId
          );

          // Shuffle and take 5
          allPeerIds.sort(() => Math.random() - 0.5);
          const selectedIds = allPeerIds.slice(0, 5);

          for (const id of selectedIds) {
            const record = activeNodes.get(id);
            if (record) {
              peerUrls.push(record.url);
            }
          }

          socket.send(JSON.stringify({
            op: "PEER_LIST",
            peers: peerUrls,
          }));

          broadcastPeerStats();
        }
      } catch (e) {
        log(`Malformed message received: ${e}`);
      }
    };

    socket.onclose = () => {
      if (localNodeId && activeNodes.get(localNodeId)?.socket === socket) {
        activeNodes.delete(localNodeId);
        log(`Node Disconnected: ${localNodeId}`);
        broadcastPeerStats();
      }
    };

    socket.onerror = (e) => {
      if (localNodeId) {
        activeNodes.delete(localNodeId);
      }
    };

    return response;
  });

  log(`BOOTSTRAP HUB Initialized on ws://${HOST}:${PORT}`);
}
