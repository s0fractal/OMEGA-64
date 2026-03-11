import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { LOGGER } from "./LOGGER.ts";

const PORT = 8086; // Dedicated Panopticon Telemetry Port
const FPS = 30; // Desired telemetry tick rate

export const PANOPTICON_SERVER = {
  start: () => {
    const clients = new Set<WebSocket>();

    Deno.serve({ port: PORT }, (req) => {
      if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }

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
    });

    LOGGER.info(
      `👁️ [PANOPTICON] Global WebGL Observer Server listening on ws://localhost:${PORT}`,
    );

    // Broadcast Loop: Binary Telemetry
    setInterval(() => {
      if (clients.size === 0) return;

      const packet = STATE_MATRIX.packRenderFrame();
      const buffer = packet.buffer;

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
  },
};
