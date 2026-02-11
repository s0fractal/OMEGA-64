// test_replay_crystallization.ts
// Smoke test for deterministic replay audit + crystallization coupling.

import { GATE } from "./i.L32.core.GATE.ts";
import { CRYSTALLIZATION } from "./i.L99.core.CRYSTALLIZATION.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { DeltaProposal, GateConfig, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { CRYSTALLIZATION_CONFIG } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";

export async function runTest() {
    console.log("🧪 TESTING: Replay Audit + Crystallization Coupling");

    const originalPath = LEDGER.STORAGE_PATH;
    const tempPath = await Deno.makeTempFile({
        prefix: "omega-ledger-replay-",
        suffix: ".jsonl"
    });
    LEDGER.STORAGE_PATH = tempPath;
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

    try {
        const genesisState: StateSnapshot = {
            tick: 1,
            state_i16: new Int16Array(64).fill(0),
            state_hash: "state_1"
        };

        const config: GateConfig = {
            max_abs_delta_per_level: 1000,
            max_total_abs_delta_per_tick: 5000,
            max_cost_per_agent: 10000,
            reliability_weight: new Map([["agent_sync", 1.0]]),
            dry_run: false
        };

        const p1: DeltaProposal = {
            proposal_id: "p1",
            tick: 1,
            base_state_hash: "state_1",
            agent_id: "agent_sync",
            intent: "seed",
            confidence: 1,
            delta: [{ level: 0, value: 6 }],
            cost_estimate: 100,
            artifact_hash: "a1",
            semantic_fingerprint: "s1"
        };

        const s2 = await GATE.process(genesisState, [p1], config);

        const p2: DeltaProposal = {
            proposal_id: "p2",
            tick: 2,
            base_state_hash: s2.state_hash,
            agent_id: "agent_sync",
            intent: "stabilize",
            confidence: 1,
            delta: [{ level: 0, value: -2 }],
            cost_estimate: 100,
            artifact_hash: "a1",
            semantic_fingerprint: "s1"
        };

        const s3 = await GATE.process(s2, [p2], config);

        const { crystallized, audit, projectionReport, driftReport, projectionDriftGatePass } = await CRYSTALLIZATION.evaluateWithAudit(
            2,
            "artifact_demo",
            s3.state_hash,
            {
                tick: 1,
                state_i16: genesisState.state_i16,
                state_hash: "state_1"
            },
            {
                requiredWindows: 1,
                windowSize: 2,
                replayRuns: 3,
                witness: "test"
            }
        );

        console.log(`✅ replayGreen: ${audit.replayGreen}`);
        console.log(`✅ checkedEvents: ${audit.checkedEvents}`);
        console.log(`✅ projectionPass: ${projectionReport.passCount}`);
        console.log(`✅ projectionDriftGatePass: ${projectionDriftGatePass}`);
        console.log(`✅ crystallized: ${crystallized}`);

        if (!audit.replayGreen) {
            throw new Error(`Replay audit failed: ${JSON.stringify(audit.failures)}`);
        }
        if (!crystallized) {
            throw new Error("Crystallization should pass in this controlled window.");
        }
        if (projectionReport.failCount !== 0) {
            throw new Error(`Projection replay report has failures: ${projectionReport.failures.join(",")}`);
        }
        if (!projectionDriftGatePass) {
            throw new Error(`Projection drift gate should pass: ${driftReport.failures.join(",")}`);
        }

        const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
        const lines = raw.split("\n").filter((x) => x.trim().length > 0);
        const canonLine = lines.find((line) => line.includes("\"event_type\":\"CANONIZATION_EVENT\""));
        if (!canonLine) {
            throw new Error("missing CANONIZATION_EVENT");
        }
        const canon = JSON.parse(canonLine);
        if (canon.policy_version !== CRYSTALLIZATION_CONFIG.policyVersion) {
            throw new Error(`unexpected canon policy_version: ${canon.policy_version}`);
        }
    } finally {
        try {
            await Deno.remove(LEDGER.STORAGE_PATH);
        } catch {
            // ignore cleanup errors
        }
        LEDGER.STORAGE_PATH = originalPath;
    }
}

export async function runProjectionHardGateTest() {
    console.log("🧪 TESTING: Crystallization Projection Hard Gate");

    const originalPath = LEDGER.STORAGE_PATH;
    const tempPath = await Deno.makeTempFile({
        prefix: "omega-ledger-replay-projection-gate-",
        suffix: ".jsonl"
    });
    LEDGER.STORAGE_PATH = tempPath;
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

    try {
        const genesisState: StateSnapshot = {
            tick: 1,
            state_i16: new Int16Array(64).fill(0),
            state_hash: "state_1"
        };

        const config: GateConfig = {
            max_abs_delta_per_level: 1000,
            max_total_abs_delta_per_tick: 5000,
            max_cost_per_agent: 10000,
            reliability_weight: new Map([["agent_sync", 1.0]]),
            dry_run: false
        };

        const p1: DeltaProposal = {
            proposal_id: "p1",
            tick: 1,
            base_state_hash: "state_1",
            agent_id: "agent_sync",
            intent: "seed",
            confidence: 1,
            delta: [{ level: 0, value: 6 }],
            cost_estimate: 100,
            artifact_hash: "a1",
            semantic_fingerprint: "s1"
        };
        const s2 = await GATE.process(genesisState, [p1], config);

        const p2: DeltaProposal = {
            proposal_id: "p2",
            tick: 2,
            base_state_hash: s2.state_hash,
            agent_id: "agent_sync",
            intent: "stabilize",
            confidence: 1,
            delta: [{ level: 0, value: -2 }],
            cost_estimate: 100,
            artifact_hash: "a1",
            semantic_fingerprint: "s1"
        };
        const s3 = await GATE.process(s2, [p2], config);

        // Tamper projection hash of first ledger event.
        const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
        const lines = raw.split("\n").filter((x) => x.trim().length > 0);
        if (lines.length < 2) {
            throw new Error(`expected at least 2 ledger events, got ${lines.length}`);
        }
        const e1 = JSON.parse(lines[0]);
        e1.projection_2d_hash = "f".repeat(64);
        lines[0] = JSON.stringify(e1);
        await Deno.writeTextFile(LEDGER.STORAGE_PATH, lines.join("\n") + "\n");

        const { crystallized, audit, projectionReport, projectionDriftGatePass } = await CRYSTALLIZATION.evaluateWithAudit(
            2,
            "artifact_demo",
            s3.state_hash,
            {
                tick: 1,
                state_i16: genesisState.state_i16,
                state_hash: "state_1"
            },
            {
                requiredWindows: 1,
                windowSize: 2,
                replayRuns: 1,
                witness: "test"
            }
        );

        if (crystallized) {
            throw new Error("Crystallization must be rejected when projection report contains failures.");
        }
        if (projectionReport.failCount < 1) {
            throw new Error("Projection report must contain at least one failure.");
        }
        if (audit.replayGreen) {
            throw new Error("Replay audit must not be green for tampered projection.");
        }
        if (projectionDriftGatePass) {
            throw new Error("Projection drift gate must not pass when replay is not green.");
        }
    } finally {
        try {
            await Deno.remove(LEDGER.STORAGE_PATH);
        } catch {
            // ignore cleanup errors
        }
        LEDGER.STORAGE_PATH = originalPath;
    }
}

export async function runProjectionDriftThresholdTest() {
    console.log("🧪 TESTING: Crystallization Projection Drift Threshold Gate");

    const originalPath = LEDGER.STORAGE_PATH;
    const tempPath = await Deno.makeTempFile({
        prefix: "omega-ledger-replay-projection-threshold-",
        suffix: ".jsonl"
    });
    LEDGER.STORAGE_PATH = tempPath;
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

    try {
        const genesisState: StateSnapshot = {
            tick: 1,
            state_i16: new Int16Array(64).fill(0),
            state_hash: "state_1"
        };

        const config: GateConfig = {
            max_abs_delta_per_level: 1000,
            max_total_abs_delta_per_tick: 5000,
            max_cost_per_agent: 10000,
            reliability_weight: new Map([["agent_sync", 1.0]]),
            dry_run: false
        };

        const p1: DeltaProposal = {
            proposal_id: "p1",
            tick: 1,
            base_state_hash: "state_1",
            agent_id: "agent_sync",
            intent: "seed",
            confidence: 1,
            delta: [{ level: 32, value: 100 }],
            cost_estimate: 100,
            artifact_hash: "a1",
            semantic_fingerprint: "s1"
        };
        const s2 = await GATE.process(genesisState, [p1], config);

        const p2: DeltaProposal = {
            proposal_id: "p2",
            tick: 2,
            base_state_hash: s2.state_hash,
            agent_id: "agent_sync",
            intent: "jump",
            confidence: 1,
            delta: [{ level: 32, value: -100 }],
            cost_estimate: 100,
            artifact_hash: "a1",
            semantic_fingerprint: "s1"
        };
        const s3 = await GATE.process(s2, [p2], config);

        // Use very strict drift threshold to force gate fail.
        const { crystallized, projectionDriftGatePass, audit } = await CRYSTALLIZATION.evaluateWithAudit(
            2,
            "artifact_demo",
            s3.state_hash,
            {
                tick: 1,
                state_i16: genesisState.state_i16,
                state_hash: "state_1"
            },
            {
                requiredWindows: 1,
                windowSize: 2,
                replayRuns: 1,
                projectionDriftMaxP95: 0,
                witness: "test"
            }
        );

        if (!audit.replayGreen) {
            throw new Error(`Replay should remain green for strict-threshold scenario: ${audit.failures.join(",")}`);
        }
        if (projectionDriftGatePass) {
            throw new Error("Projection drift gate should fail under zero threshold.");
        }
        if (crystallized) {
            throw new Error("Crystallization must be rejected when projection drift gate fails.");
        }
    } finally {
        try {
            await Deno.remove(LEDGER.STORAGE_PATH);
        } catch {
            // ignore cleanup errors
        }
        LEDGER.STORAGE_PATH = originalPath;
    }
}

Deno.test("replay audit and crystallization coupling", async () => {
    await runTest();
});

Deno.test("crystallization rejects when projection replay has failures", async () => {
    await runProjectionHardGateTest();
});

Deno.test("crystallization rejects when projection drift exceeds threshold", async () => {
    await runProjectionDriftThresholdTest();
});

if (import.meta.main) {
    await runTest();
}
