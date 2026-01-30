
// OMEGA-64: Force Test (L10)
// Active Entropy Repulsion Simulation

async function runForceTest() {
    console.log("🛡️ INITIATING FORCE TEST (L10)...");
    
    // Simulating a massive entropy spike
    const entropySignal = "CRITICAL_ENTROPY_SPIKE_5000"; 
    
    const cmd = new Deno.Command("./omega_rust_core", {
        args: ["--level", "10", "--intent", entropySignal],
    });
    const { stdout } = await cmd.output();
    const result = new TextDecoder().decode(stdout).trim();
    
    console.log(result);
}

runForceTest();
