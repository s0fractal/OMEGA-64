// i.L48.core.NERVE.ts
// @noncanonical
// The Nervous System of OMEGA-64.
// Broadcasts State (Pulse) to the Interface (Mirror).

import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";
import { SIGNAL } from "./i.L64.core.SIGNAL.ts";

const S = new Set<WebSocket>();

export const NERVE = {
  // State management for UI preferences
  projectionMode: "CYLINDER" as "CYLINDER" | "TORUS" | "ORBIT",

  // Start the Synaptic Bridge
  wake: (port: number = 8080) => {
    TELEMETRY_SIGNAL(TELEMETRY("NERVE", `Awakening on ${port}...`), "INFO");
    Deno.serve({ port }, (req) => {
      const up = req.headers.get("upgrade") === "websocket";
      const { socket: s, response: r } = Deno.upgradeWebSocket(req);

      return up
        ? (
          s.onopen =
            () => (TELEMETRY_SIGNAL(TELEMETRY("NERVE", "OPEN."), "INFO"),
              S.add(s)),
            s.onclose =
              () => (TELEMETRY_SIGNAL(TELEMETRY("NERVE", "CLOSED."), "INFO"),
                S.delete(s)),
            s.onerror = (e) =>
              TELEMETRY_SIGNAL(
                TELEMETRY("NERVE", "ERR", { error: String(e) }),
                "ERROR",
              ),
            s.onmessage = async (e) => {
              try {
                const msg = JSON.parse(e.data);
                if (msg.type === "TOUCH") {
                  await TELEMETRY_SIGNAL(
                    TELEMETRY("NERVE", `TOUCH: Cell ${msg.payload.idx}`),
                    "INFO",
                  );
                  await SIGNAL.emit("REQUEST", {
                    source: "INTERFACE",
                    message:
                      `Operator touched Cell ${msg.payload.idx} [${msg.payload.x}, ${msg.payload.y}]`,
                    context: msg.payload,
                  });
                }
                if (msg.type === "SET_MODE") {
                  await TELEMETRY_SIGNAL(
                    TELEMETRY("NERVE", `LENS: Shifting to ${msg.payload}`),
                    "INFO",
                  );
                  NERVE.projectionMode = msg.payload;
                }
              } catch (err) {
                await TELEMETRY_SIGNAL(
                  TELEMETRY("NERVE", "Message Error", { error: String(err) }),
                  "ERROR",
                );
              }
            },
            r
        )
        : new Response("OMEGA-64 NERVE. WS ONLY.", { status: 200 });
    });
  },

  getProjectionMode: () => NERVE.projectionMode,

  // Broadcast Pulse
  pulse: (type: string, data: any) => {
    const msg = JSON.stringify({ type, data, t: Date.now() });
    S.forEach((s) => (s.readyState === WebSocket.OPEN) && s.send(msg));
  },
};
