import { REPLAY_AUDIT } from "./i.L99.core.REPLAY_AUDIT.ts";

async function auditLedger(port: number) {
    const path = `./OMEGA_LEDGER_${port}.jsonl`;
    console.log(`🔍 Auditing Ledger: ${path}`);
    
    // We need a genesis state. For this test, we can peek at the first event to get the base.
    const text = await Deno.readTextFile(path);
    const lines = text.trim().split("\n");
    if (lines.length === 0) return;
    
    const firstEvent = JSON.parse(lines[0]);
    
    const genesis = {
        tick: firstEvent.tick,
        state_i16: new Int16Array(64).fill(0), // Assuming starting from zero for this test
        state_hash: firstEvent.state_before_hash
    };

    const result = await REPLAY_AUDIT.audit(genesis, {
        verifyTopologicalSignatures: true,
        verifyLedgerChain: true
    });

    console.log(`📊 Audit Result [${port}]:`, result.replayGreen ? "✅ GREEN" : "❌ RED");
    if (!result.replayGreen) {
        console.error("Failures:", result.failures);
        Deno.exit(1);
    }
}

await auditLedger(8081);
await auditLedger(8082);
console.log("🌌 QUINE STABILITY VERIFIED");
