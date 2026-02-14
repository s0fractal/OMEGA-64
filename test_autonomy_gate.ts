// test_autonomy_gate.ts
import { MUTATE } from "./i.L43.core.MUTATE.ts";
import { AUTONOMY_METRIC } from "./i.L99.core.AUTONOMY_METRIC.ts";

async function test() {
    console.log("⚛️ Testing Autonomy Sovereignty Gate...");
    
    // 1. Check Score
    const report = await AUTONOMY_METRIC.compute();
    console.log(`📊 Autonomy Score: ${report.score.toFixed(4)}`);
    console.log(`🧬 Levels:`, report.levels);

    // 2. Attempt Mutation (Window should be closed if audit fails or bridge is AMBER)
    console.log("\n🧪 Attempting disciplined mutation...");
    const result = await MUTATE.write({
        atomId: "v.TEST_ATOM.ts",
        content: "// Test mutation",
        reason: "TENSION",
        details: "Testing Safe Window logic.",
        dryRun: true
    });

    if (!result.ok) {
        console.log(`✅ TEST PASSED: Mutation correctly blocked. Reason: ${result.reason}`);
    } else {
        console.log(`⚠️ TEST UNCERTAIN: Mutation was permitted. Window might be open.`);
    }
}

test();
