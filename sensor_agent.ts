// 🛡️ OMEGA-64 | Project Akasha: Sovereign Server & Memory
// This agent serves as the 'Sovereign Server', providing CORS-compliant signals
// and maintaining the 'Akashic Record' (persistent history).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ROOT_DIR = "/Users/s0fractal/OMEGA";
const LOG_PATH = `${ROOT_DIR}/memories.log`;
const MAX_HISTORY = 100;

let history: any[] = [];

async function getSystemMetrics() {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) { count += i; }
    const end = performance.now();
    const cpuFactor = Math.min(1, (end - start) / 50);

    return {
        cpu: cpuFactor,
        timestamp: Date.now(),
        coherence: 0.999 + Math.random() * 0.001
    };
}

// Background poller to maintain the Akashic Record
async function startPoller() {
    while (true) {
        const metrics = await getSystemMetrics();
        const state = {
            ...metrics,
            architect_active: true,
            pulse_frequency: 0.5 + (metrics.cpu * 2)
        };

        history.push(state);
        if (history.length > MAX_HISTORY) history.shift();

        // Persist to disk as a stream
        await Deno.writeTextFile(LOG_PATH, JSON.stringify(state) + "\n", { append: true });
        
        await new Promise(r => setTimeout(r, 1000));
    }
}

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    
    // Set CORS headers for the Sovereign UI
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    };

    if (url.pathname === "/signal") {
        const currentState = history[history.length - 1] || {};
        return new Response(JSON.stringify(currentState), { headers });
    }

    if (url.pathname === "/history") {
        return new Response(JSON.stringify(history), { headers });
    }

    return new Response("OMEGA-64 Sovereign Server Active", { status: 200 });
};

console.log("🛡️ Sovereign Server Ascended | Listening on http://localhost:8080");
startPoller();
serve(handler, { port: 8080 });
