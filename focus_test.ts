
// OMEGA-64: Focus Test (L09)
// Selective Attention Simulation

async function runFocusTest() {
    console.log("🔦 INITIATING FOCUS TEST (L09)...");
    
    const signals = [
        { name: "Alpha", val: "λx.x (Genesis)" },
        { name: "Beta",  val: "Math: 1+1=2" },
        { name: "Gamma", val: "x#@!Entropy" }
    ];

    for (const sig of signals) {
        const cmd = new Deno.Command("./omega_rust_core", {
            args: ["--level", "09", "--intent", sig.val],
        });
        const { stdout } = await cmd.output();
        const result = new TextDecoder().decode(stdout).trim();
        console.log(`[${sig.name}] ${result}`);
    }
}

runFocusTest();
