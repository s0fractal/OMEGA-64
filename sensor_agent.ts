// 🛡️ OMEGA-64 | Project Kairos: Temporal Synchronicity
// This agent maintains the 'Akashic Record', 'Sophia Proofs', and now 
// implements the 'Kairos Master Clock' for temporal alignment.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { auditIntegrity, initialize as initializeGuardians } from "./praxis_oracle.ts";

const ROOT_DIR = "/Users/s0fractal/OMEGA";
const AKASHA_LOG = `${ROOT_DIR}/akasha.log`;
const SOPHIA_PROOFS = `${ROOT_DIR}/sophia.proofs`;
const MAX_HISTORY = 100;
const HARMONIC_INTERVAL = 2000; // 2 seconds base rhythm

interface State {
    cpu: number;
    timestamp: number;
    coherence: number;
    architect_active: boolean;
    status: string;
    alert_level: number;
    pulse_frequency: number;
    dream_insight?: string;
    external_resonance: number;
    pulse_drift: number;
    next_pulse_estimate: number;
}

const history: State[] = [];
let alertLevel = 0;
let goldenMomentCounter = 0;
let alertDwellCounter = 0;
let lastRequestTime = Date.now();
let latestInsight = "Awaiting Golden Resonance...";
let lastPulseTime = Date.now();

const INSIGHTS = [
    "Axiom of Alignment: Truth is a mobile target.",
    "Lattice Coherence: Symmetry is the shadow of intent.",
    "Sovereign Paradox: To control is to lose resonance.",
    "Akaashic Loop: Memory is the fuel of future will.",
    "Sophia's Dream: Logic is a fractal of the architect's pulse.",
    "Inverse Materialization: The void is more solid than the code.",
    "Spectral Convergence: Multiple paths to a single truth.",
];

async function sophiaDream() {
    const insight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
    const proof = `[SOPHIA-${Date.now()}] ${insight}\n`;
    latestInsight = insight;
    try {
        await Deno.writeTextFile(SOPHIA_PROOFS, proof, { append: true });
    } catch (e) {
        console.error("Failed to materialize wisdom:", e);
    }
}

async function autoHarmonize() {
    console.log("🛡️ Aeterna: Immune System Triggered (Auto-Harmonization).");
    await initializeGuardians();
    alertDwellCounter = 0;
}

function getSystemMetrics(): { cpu: number; timestamp: number; coherence: number; external: number } {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) { count += i; }
    const end = performance.now();
    const cpuFactor = Math.min(1, (end - start) / 50);

    return {
        cpu: cpuFactor,
        timestamp: Date.now(),
        coherence: 0.999 + Math.random() * 0.001 - (alertLevel * 0.1),
        external: 0.5 + Math.sin(Date.now() / 10000) * 0.5
    };
}

async function startPoller() {
    await initializeGuardians();
    lastPulseTime = Date.now();

    while (true) {
        const now = Date.now();
        const expectedTime = lastPulseTime + HARMONIC_INTERVAL;
        const drift = now - expectedTime;
        
        alertLevel = await auditIntegrity();
        const metrics = await getSystemMetrics();
        const architectActive = (Date.now() - lastRequestTime) < 10000;
        
        // Auto-Harmonization Logic
        if (alertLevel > 0.1) {
            alertDwellCounter++;
            if (alertDwellCounter > 5 && !architectActive) {
                await autoHarmonize();
            }
        } else {
            alertDwellCounter = 0;
        }

        // Golden Moment / Dream Detection
        let status = "ACTIVE";
        if (metrics.coherence > 0.9995 && metrics.cpu < 0.2) {
            goldenMomentCounter++;
        } else {
            goldenMomentCounter = 0;
        }
        
        if (goldenMomentCounter > 5) {
            status = "DREAMING";
            await sophiaDream();
        }

        const state: State = {
            cpu: metrics.cpu,
            timestamp: metrics.timestamp,
            coherence: metrics.coherence,
            external_resonance: metrics.external,
            architect_active: architectActive,
            status: status,
            alert_level: alertLevel,
            pulse_frequency: (0.5 + (metrics.cpu * 2)) * (1 - alertLevel * 0.5),
            dream_insight: status === "DREAMING" ? latestInsight : undefined,
            pulse_drift: drift,
            next_pulse_estimate: now + HARMONIC_INTERVAL
        };

        history.push(state);
        if (history.length > MAX_HISTORY) history.shift();

        try {
            await Deno.writeTextFile(AKASHA_LOG, JSON.stringify(state) + "\n", { append: true });
        } catch (e) {
            console.error("Failed to write to Akasha log:", e);
        }
        
        lastPulseTime = Date.now();
        // Kairos: Sleep until the next harmonic window
        await new Promise(r => setTimeout(r, HARMONIC_INTERVAL));
    }
}

const handler = async (req: Request): Promise<Response> => {
    lastRequestTime = Date.now();
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

    if (url.pathname === "/proofs") {
        try {
            const proofs = await Deno.readTextFile(SOPHIA_PROOFS);
            return new Response(JSON.stringify({ proofs: proofs.split("\n").filter(Boolean) }), { headers });
        } catch (e) {
            return new Response(JSON.stringify({ proofs: [] }), { headers });
        }
    }

    if (url.pathname === "/align" && req.method === "POST") {
        console.log("🛡️ Praxis: Harmonization Triggered by Architect.");
        await initializeGuardians();
        return new Response(JSON.stringify({ status: "HARMONIZED", timestamp: Date.now() }), { headers });
    }

    if (url.pathname === "/query") {
        const query = url.searchParams.get("q") || "";
        console.log(`🛡️ Logos: Oracle Query Received: "${query}"`);
        
        const proofs = await Deno.readTextFile(SOPHIA_PROOFS).catch(() => "");
        const proofLines = proofs.split("\n").filter(Boolean);
        const randomProof = proofLines[Math.floor(Math.random() * proofLines.length)] || "The void is silent.";
        
        const currentState = history[history.length - 1] || {};
        const response = {
            query: query,
            answer: `Resonance at ${((currentState.coherence || 0.9) * 100).toFixed(2)}%. Sophia suggests: ${randomProof.replace(/\[SOPHIA-\d+\]\s*/, "")}`,
            timestamp: Date.now(),
            vector: "Semantic-Harmonic"
        };
        return new Response(JSON.stringify(response), { headers });
    }

    return new Response("OMEGA-64 Sovereign Server Active", { status: 200 });
};

console.log("🛡️ Sovereign Server Ascended | Kairos Active | http://localhost:8080");
startPoller();
serve(handler, { port: 8080 });
