// OMEGA-64 | SYSTEM_START.ts | Era 13: ALEPH - Multiverse & Federation
// Orchestrates the Pulse, Breath, and Observer UI in a single memory space.

import { PULSE } from "./PULSE.ts";
import { BREATH } from "./BREATH.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { TIMELINE_FORK } from "./TIMELINE_FORK.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";

const UI_PORT = Number(Deno.env.get("PORT")) || 8000;
const UI_PATH = "./ui/index.html";

console.log("🛡️ OMEGA-64 | UNIFIED START | ERA 13: ALEPH");

// 1. Initialize Observer UI Server
Deno.serve({ port: UI_PORT }, async (req) => {
    const url = new URL(req.url);
    
    if (url.pathname === "/state") {
        const id = url.searchParams.get("id") || "ALPHA";
        const timeline = TIMELINE_FORK.timelines.get(id);
        const buffer = timeline ? timeline.buffer : STATE_MATRIX.buffer;
        
        const bufferCopy = new Uint8Array(buffer.byteLength);
        bufferCopy.set(new Uint8Array(buffer));
        return new Response(bufferCopy, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    if (url.pathname === "/fork" && req.method === "POST") {
        try {
            const { name } = await req.json();
            TIMELINE_FORK.branch(name);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Fork Failed", { status: 400 });
        }
    }

    if (url.pathname === "/federate" && req.method === "POST") {
        try {
            const packet = await req.json();
            console.log(`🛸 [FEDERATION] Incoming migration from ${packet.sourceNode}: ${packet.id}`);
            
            const idx = STATE_MATRIX.findEmptySlot();
            if (idx !== -1) {
                STATE_MATRIX.setId(idx, BigInt(Math.floor(Math.random() * 1000000))); // Dynamic ID for now
                STATE_MATRIX.setEnergy(idx, packet.energy);
                STATE_MATRIX.setResonance(idx, packet.resonance);
                // logic: Uint8Array from hex string
                const logicBytes = new Uint8Array(8);
                for (let i = 0; i < 8; i++) {
                    logicBytes[i] = parseInt(packet.logic.substr(i * 2, 2), 16);
                }
                STATE_MATRIX.setLogic(idx, logicBytes);
                // Position randomly in the center
                STATE_MATRIX.setX(idx, 700 + (Math.random() - 0.5) * 100);
                STATE_MATRIX.setY(idx, 400 + (Math.random() - 0.5) * 100);
                
                return new Response("OK", { status: 200 });
            } else {
                return new Response("Matrix Full", { status: 507 });
            }
        } catch (e) {
            return new Response("Federation Failed", { status: 400 });
        }
    }

    if (url.pathname === "/peers") {
        return new Response(JSON.stringify(Array.from(P2P_FEDERATION.peers)), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/vox") {
        return new Response(SEMANTIC_MEMBRANE.readVoxPopuli(), {
            headers: { "Content-Type": "text/plain" }
        });
    }

    // 3. Direct Thought Injection (POST)
    if (url.pathname === "/inject" && req.method === "POST") {
        try {
            const { text, energy } = await req.json();
            console.log(`💉 [GOD_MODE] Injecting: "${text}" (Energy: ${energy})`);
            await SEMANTIC_MEMBRANE.injectThought(text, energy || 100);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Injection Failed", { status: 400 });
        }
    }

    // 4. Spatial Mutation (POST)
    if (url.pathname === "/mutate" && req.method === "POST") {
        try {
            const { x, y, deltaEnergy, radius } = await req.json();
            console.log(`⚡ [GOD_MODE] Mutation at (${x}, ${y}) | Delta: ${deltaEnergy} | Radius: ${radius}`);
            
            const r2 = radius * radius;
            for (let i = 0; i < STATE_MATRIX.MAX_ATOMS; i++) {
                if (STATE_MATRIX.getId(i) === 0n) continue;
                const dx = STATE_MATRIX.getX(i) - x;
                const dy = STATE_MATRIX.getY(i) - y;
                if (dx*dx + dy*dy < r2) {
                    const current = STATE_MATRIX.getEnergy(i);
                    STATE_MATRIX.setEnergy(i, Math.max(0, current + deltaEnergy));
                }
            }
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Mutation Failed", { status: 400 });
        }
    }

    // 5. Avatar Cursor Sync (POST)
    if (url.pathname === "/avatar" && req.method === "POST") {
        try {
            const { x, y } = await req.json();
            STATE_MATRIX.setX(0, x);
            STATE_MATRIX.setY(0, y);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Avatar Sync Failed", { status: 400 });
        }
    }

    try {
        const html = await Deno.readTextFile(UI_PATH);
        return new Response(html, { headers: { "Content-Type": "text/html" } });
    } catch (e) {
        return new Response("UI not found.", { status: 404 });
    }
});

// 2. Start Simulation Pulse Loop (Background)
(async () => {
    console.log("💓 [SYSTEM] Pulse Engine Ignited.");
    await PULSE.run();
})();

// 3. Start Cognitive Breathing Loop (Background)
(async () => {
    console.log("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
    await new Promise(r => setTimeout(r, 5000));
    await BREATH.inhale();
})();
