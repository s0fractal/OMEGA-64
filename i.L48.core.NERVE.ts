
// i.L48.core.NERVE.ts
// @noncanonical
// The Nervous System of OMEGA-64.
// Broadcasts State (Pulse) to the Interface (Mirror).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SIGNAL } from "./i.L64.core.SIGNAL.ts";

const S = new Set<WebSocket>();

export const NERVE = {
    // State management for UI preferences
    projectionMode: "CYLINDER" as "CYLINDER" | "TORUS" | "ORBIT",

    // Start the Synaptic Bridge
    wake: (port: number = 8080) => {
        console.log(`🔌 NERVE: Awakening on ${port}...`);
        serve((req) => {
            const up = req.headers.get("upgrade") === "websocket";
            const { socket: s, response: r } = Deno.upgradeWebSocket(req);

            return up ? (
                s.onopen = () => (console.log("👁️ OPEN."), S.add(s)),
                s.onclose = () => (console.log("😑 CLOSED."), S.delete(s)),
                s.onerror = (e) => console.error("⚠️ ERR:", e),
                s.onmessage = async (e) => {
                    try {
                        const msg = JSON.parse(e.data);
                        if (msg.type === "TOUCH") {
                            console.log(`👆 TOUCH: Cell ${msg.payload.idx}`);
                            await SIGNAL.emit("REQUEST", {
                                source: "INTERFACE",
                                message: `Operator touched Cell ${msg.payload.idx} [${msg.payload.x}, ${msg.payload.y}]`,
                                context: msg.payload
                            });
                        }
                        if (msg.type === "SET_MODE") {
                            console.log(`🌐 LENS: Shifting to ${msg.payload}`);
                            NERVE.projectionMode = msg.payload;
                        }
                    } catch (err) {
                        console.error("Message Error:", err);
                    }
                },
                r
            ) : new Response("OMEGA-64 NERVE. WS ONLY.", { status: 200 });
        }, { port });
    },

    getProjectionMode: () => NERVE.projectionMode,

    // Broadcast Pulse
    pulse: (type: string, data: any) => {
        const msg = JSON.stringify({ type, data, t: Date.now() });
        S.forEach(s => (s.readyState === WebSocket.OPEN) && s.send(msg));
    }
};
