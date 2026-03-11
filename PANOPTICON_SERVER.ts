import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { LOGGER } from "./LOGGER.ts";
import { AKASHA_CODEX } from "./AKASHA_CODEX.ts";

const PORT = 8086; // Dedicated Panopticon Telemetry Port
const FPS = 20; // Lower FPS for dense binary payload

export const PANOPTICON_SERVER = {
  start: () => {
    const clients = new Set<WebSocket>();

    Deno.serve({ port: PORT }, async (req) => {
      const url = new URL(req.url);

      // Handle WebSocket upgrade
      if (req.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(req);

        socket.onopen = () => {
          LOGGER.info(`👁️ [PANOPTICON] Observer Client Connected.`);
          clients.add(socket);
        };

        socket.onclose = () => {
          LOGGER.info(`👁️ [PANOPTICON] Observer Client Disconnected.`);
          clients.delete(socket);
        };

        socket.onerror = (e) => {
          LOGGER.warn(`👁️ [PANOPTICON] WebSocket Error: ${e}`);
        };

        return response;
      }

      // Serve static assets
      if (req.method === "GET") {
        let filePath = "./public" + url.pathname;
        if (url.pathname === "/") {
          filePath = "./public/index.html";
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

    LOGGER.info(
      `👁️ [PANOPTICON] Global WebGL Observer Server listening on http://localhost:${PORT}`,
    );

    // Broadcast Loop: Binary Telemetry
    setInterval(() => {
      if (clients.size === 0) return;

      const buffer = STATE_MATRIX.packPanopticonFrame();

      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(buffer);
          } catch (e) {
            // Let close handler deal with this
          }
        }
      }
    }, 1000 / FPS);

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
};
