// OMEGA-64: Growth Phase (L06)
// Feeding the Lattice with Logic

async function runGrowthPhase() {
  console.log("🌱 INITIATING GROWTH PHASE (L06)...");
  console.log("Feeding Protocol: 5 Cycles of Pure Logic (λx.x)");

  const nutrient = "λx.x";

  const cmd = new Deno.Command("./omega_rust_core", {
    args: ["--level", "06", "--intent", nutrient],
  });
  const { stdout } = await cmd.output();
  const result = new TextDecoder().decode(stdout).trim();

  console.log("\n" + result);

  if (
    result.includes("FINAL ENERGY: 0.9") ||
    result.includes("FINAL ENERGY: 1.00")
  ) {
    console.log("\n✅ SATIATION CONFIRMED. System is Hyper-Resonant.");
  } else {
    console.log("\n⚠️ STARVATION WARNING. Metabolism Inefficient.");
  }
}

runGrowthPhase();
