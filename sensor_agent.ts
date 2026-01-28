// 🛡️ OMEGA-64 | Project Akasha: Sovereign Server & Memory
// This agent serves as the 'Sovereign Server', providing CORS-compliant signals
// and maintaining the 'Akashic Record' (persistent history).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { auditIntegrity, initialize as initializeGuardians } from "./praxis_oracle.ts";

const ROOT_DIR = "/Users/s0fractal/OMEGA";
const AKASHA_LOG = `${ROOT_DIR}/akasha.log`;
const MAX_HISTORY = 100;

const history: State[] = [];
let alertLevel = 0;
let goldenMomentCounter = 0;

interface State {
    cpu: number;
    timestamp: number;
    coherence: number;
    architect_active: boolean;
    status: string;
    alert_level: number;
    pulse_frequency: number;
}

function getSystemMetrics(): { cpu: number; timestamp: number; coherence: number } {
    // Simulate real CPU load check (using performance.now for jitter)
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) { count += i; }
    const end = performance.now();
    const cpuFactor = Math.min(1, (end - start) / 50);

    return {
        cpu: cpuFactor,
        timestamp: Date.now(),
        coherence: 0.999 + Math.random() * 0.001 - (alertLevel * 0.1)
    };
}

// Background poller to maintain the Akashic Record
async function startPoller() {
    await initializeGuardians();
    while (true) {
        alertLevel = await auditIntegrity();
        const metrics = await getSystemMetrics();
        
        // Golden Moment Detection
        let status = "ACTIVE";
        if (metrics.coherence > 0.9995 && metrics.cpu < 0.2) {
            goldenMomentCounter++;
        } else {
            goldenMomentCounter = 0;
        }
        
        if (goldenMomentCounter > 5) {
            status = "GOLDEN_MOMENT";
        }

        const state = {
            ...metrics,
            architect_active: true,
            status: status,
            alert_level: alertLevel,
            pulse_frequency: (0.5 + (metrics.cpu * 2)) * (1 - alertLevel * 0.5)
        };

        history.push(state);
        if (history.length > MAX_HISTORY) history.shift();

        // Commit to Akasha Log
        try {
            await Deno.writeTextFile(AKASHA_LOG, JSON.stringify(state) + "\n", { append: true });
        } catch (e) {
            console.error("Failed to write to Akasha log:", e);
        }
        
        await new Promise(r => setTimeout(r, 2000));
    }
}

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
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

    if (url.pathname === "/align" && req.method === "POST") {
        console.log("🛡️ Praxis: Harmonization Triggered by Architect.");
        await initializeGuardians();
        return new Response(JSON.stringify({ status: "HARMONIZED", timestamp: Date.now() }), { headers });
    }

    return new Response("OMEGA-64 Sovereign Server Active", { status: 200 });
};

console.log("🛡️ Sovereign Server Ascended | Akasha Active | http://localhost:8080");
startPoller();
serve(handler, { port: 8080 });
