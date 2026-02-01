
// i.L48.core.NERVE.ts
// The Nervous System of OMEGA-64.
// Broadcasts State (Pulse) to the Interface (Mirror).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const S = new Set<WebSocket>();

export const NERVE = {
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
                r
            ) : new Response("OMEGA-64 NERVE. WS ONLY.", { status: 200 });
        }, { port });
    },

    // Broadcast Pulse
    pulse: (type: string, data: any) => {
        const msg = JSON.stringify({ type, data, t: Date.now() });
        S.forEach(s => (s.readyState === WebSocket.OPEN) && s.send(msg));
    }
};
