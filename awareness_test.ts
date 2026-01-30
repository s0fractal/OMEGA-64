
// OMEGA-64: Awareness Test (L05)
// Testing Semantic Filters

async function runAwarenessTest() {
    console.log("👁️ INITIATING AWARENESS TEST (L05)...");
    
    // Scenario A: NOISE
    console.log("\n--- SCENARIO A: ENTROPY NOISE ---");
    const noiseInput = "x8F9s#dK29!00"; 
    console.log(`📡 Input: "${noiseInput}"`);
    
    const cmdNoise = new Deno.Command("./omega_rust_core", {
        args: ["--level", "05", "--intent", noiseInput],
    });
    const { stdout: outNoise } = await cmdNoise.output();
    const resNoise = new TextDecoder().decode(outNoise).trim();
    console.log(`🧠 L05 Perception: ${resNoise}`);

    // Scenario B: SIGNAL
    console.log("\n--- SCENARIO B: STRUCTURED INTENT ---");
    const signalInput = "λx.x (Identity)";
    console.log(`📡 Input: "${signalInput}"`);

    const cmdSignal = new Deno.Command("./omega_rust_core", {
        args: ["--level", "05", "--intent", signalInput],
    });
    const { stdout: outSignal } = await cmdSignal.output();
    const resSignal = new TextDecoder().decode(outSignal).trim();
    console.log(`🧠 L05 Perception: ${resSignal}`);

    console.log("\n-------------------------------------------");
    if (resNoise.includes("NOISE") && resSignal.includes("SIGNAL")) {
        console.log("✅ AWARENESS CONFIRMED: The System Sees.");
    } else {
        console.log("⚠️ BLINDNESS DETECTED: Filter Malfunction.");
    }
}

runAwarenessTest();
