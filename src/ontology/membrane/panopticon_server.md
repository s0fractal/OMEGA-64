---
id: PANOPTICON_SERVER
type: module
description: Migrated from src/06/PANOPTICON_SERVER.ts
tags:
  - standalone
  - server
deps:
  - AKASHA_CODEX
  - LOGGER
min_level: 9
entry: true
vars:
  - AKASHA_CODEX
  - LOGGER
  - Li
  - Lw
  - STATE_MATRIX
extra_symbols:
  - PANOPTICON_SERVER
---

### TypeScript

```typescript


const PORT = 8086; // Dedicated Panopticon Telemetry Port
const FPS = 20; // Lower FPS for dense binary payload

const clients = new Set<WebSocket>();

export const PANOPTICON_SERVER = {
  start: () => {

    Deno.serve({ port: PORT }, async (req) => {
      const url = new URL(req.url);

      // Handle WebSocket upgrade
      if (req.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(req);

        socket.onopen = () => {
          Li(`👁️ [PANOPTICON] Observer Client Connected.`);
          clients.add(socket);
        };

        socket.onclose = () => {
          Li(`👁️ [PANOPTICON] Observer Client Disconnected.`);
          clients.delete(socket);
        };

        socket.onerror = (e) => {
          Lw(`👁️ [PANOPTICON] WebSocket Error: ${e}`);
        };

        return response;
      }

      // Serve static assets
      if (req.method === "GET") {
        let filePath = "./public" + url.pathname;
        if (url.pathname === "/") {
          filePath = "./63/old/ui/public/index.html";
        }

        try {
          const file = await Deno.readFile(filePath);
          const contentType = filePath.endsWith(".js")
            ? "text/javascript"
            : filePath.endsWith(".css")
            ? "text/css"
            : filePath.endsWith(".html")
            ? "text/html"
            : "application/octet-stream";

          return new Response(file, {
            headers: { "Content-Type": contentType },
          });
        } catch {
          return new Response("Not Found", { status: 404 });
        }
      }

      return new Response(null, { status: 405 });
    });

    Li(
      `👁️ [PANOPTICON] Global WebGL Observer Server listening on http://localhost:${PORT}`,
    );

    // Heartbeat Loop: JSON Analytics (1Hz)
    setInterval(() => {
      if (clients.size === 0) return;

      const activeAtoms = STATE_MATRIX.getActiveIndices().length;
      const energy = STATE_MATRIX.getMatrixResonance();
      
      const latestCommentary = AKASHA_CODEX._getChronicleIndex()
        .filter((entry: any) => entry.type === "observer_commentary")
        .sort((a: any, b: any) => b.tick - a.tick) // Most recent first
        .map((entry: any) => entry.body)[0] || "Awaiting observation...";

      const heartbeat = JSON.stringify({
        type: "HEARTBEAT",
        atoms: activeAtoms,
        energy: energy,
        mood: latestCommentary
      });

      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(heartbeat);
          } catch (e) {
            // Let close handler deal with this
          }
        }
      }
    }, 1000);
  },

  broadcastBinaryFrame: (buffer: ArrayBuffer) => {
    if (clients.size === 0) return;

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(buffer);
        } catch (e) {
          // Let close handler deal with this
        }
      }
    }
  },
};
```
