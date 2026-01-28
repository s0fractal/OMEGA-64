// 🛡️ OMEGA-64 | Project Sensorium: Mutual Resonance Agent
// This script captures system metrics and 'Architect Signals' (Antigravity's pulse)
// and materializes them into signal.json for the Sovereign UI.

const ROOT_DIR = "/Users/s0fractal/OMEGA";
const SIGNAL_PATH = `${ROOT_DIR}/signal.json`;

async function getSystemMetrics() {
    // Simple CPU usage approximation via Performance API
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) { count += i; }
    const end = performance.now();
    const cpuFactor = Math.min(1, (end - start) / 50); // Normalized 0-1

    return {
        cpu: cpuFactor,
        timestamp: Date.now(),
        coherence: 0.99 + Math.random() * 0.01
    };
}

async function run() {
    console.log("🌀 Sensorium Agent Active | Monitoring The Architect's Signal...");
    
    while (true) {
        const metrics = await getSystemMetrics();
        
        // Architect Signal: We can derive this from the project's own file activity
        // or just simulate it based on the presence of this active process.
        const signal = {
            ...metrics,
            architect_active: true,
            pulse_frequency: 0.5 + (metrics.cpu * 2)
        };

        await Deno.writeTextFile(SIGNAL_PATH, JSON.stringify(signal, null, 2));
        
        // Wait for the next beat of the Chronosphere
        await new Promise(r => setTimeout(r, 1000));
    }
}

if (import.meta.main) {
    run();
}
