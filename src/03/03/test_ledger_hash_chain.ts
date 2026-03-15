// test_ledger_hash_chain.ts
// Verifies ledger hash-chain anchoring, detection, and replay integration.

import { GATE_GATE as GATE } from "@generated";
import { LEDGER__08_00_LEDGER as LEDGER } from "@generated";
import { REPLAY_AUDIT__08_00_REPLAY_AUDIT as REPLAY_AUDIT } from "@generated";
import type {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@generated";

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
});

const proposal = (
  id: string,
  tick: number,
  baseHash: string,
  value: number,
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "ledger_chain_test",
  confidence: 1,
  delta: [{ level: 6, value }],
  cost_estimate: 100,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
});

async function withTempLedger<T>(fn: () => Promise<T>): Promise<T> {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-chain-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");
  try {
    return await fn();
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
}

Deno.test("ledger append emits chain fields and verifies green", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };
    const s2 = await GATE.process(
      genesis,
      [proposal("p1", 1, "state_1", 5)],
      baseConfig(),
    );
    await GATE.process(
      s2,
      [proposal("p2", 2, s2.state_hash, -2)],
      baseConfig(),
    );

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    if (lines.length !== 4) {
      throw new Error(
        `expected 4 lines (bridge+event x2), got ${lines.length}`,
      );
    }

    for (const [i, line] of lines.entries()) {
      const evt = JSON.parse(line);
      if (evt.chain_version !== LEDGER.CHAIN_VERSION) {
        throw new Error(`line ${i + 1} missing chain_version`);
      }
      if (typeof evt.event_hash !== "string" || evt.event_hash.length !== 64) {
        throw new Error(`line ${i + 1} missing event_hash`);
      }
      if (i === 0) {
        if (evt.prev_event_hash !== null) {
          throw new Error("first line prev_event_hash must be null");
        }
      } else if (
        typeof evt.prev_event_hash !== "string" ||
        evt.prev_event_hash.length !== 64
      ) {
        throw new Error(`line ${i + 1} missing prev_event_hash`);
      }
    }

    const chain = await LEDGER.verifyChainDetailed();
    if (!chain.ok) {
      throw new Error(
        `expected green ledger chain: ${chain.failures.join(",")}`,
      );
    }
    if (chain.chainAnchoredEvents !== 4) {
      throw new Error(
        `expected 4 chain anchored events, got ${chain.chainAnchoredEvents}`,
      );
    }
    if (chain.legacyEvents !== 0) {
      throw new Error(`expected 0 legacy events, got ${chain.legacyEvents}`);
    }
  });
});

Deno.test("ledger chain detects tamper and blocks further append", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };
    const s2 = await GATE.process(
      genesis,
      [proposal("p1", 1, "state_1", 5)],
      baseConfig(),
    );

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const first = JSON.parse(lines[0]);
    first.reason = "tampered";
    lines[0] = JSON.stringify(first);
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, lines.join("\n") + "\n");

    const chain = await LEDGER.verifyChainDetailed();
    if (chain.ok) {
      throw new Error("ledger chain should fail after tamper");
    }
    if (!chain.failures.some((x) => x.includes("LEDGER_CHAIN_HASH_MISMATCH"))) {
      throw new Error(`unexpected chain failures: ${chain.failures.join(",")}`);
    }

    let failed = false;
    try {
      await GATE.process(
        s2,
        [proposal("p2", 2, s2.state_hash, -2)],
        baseConfig(),
      );
    } catch (e) {
      failed = true;
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("LEDGER_CHAIN_INVALID")) {
        throw new Error(`unexpected append failure: ${msg}`);
      }
    }
    if (!failed) {
      throw new Error("append should fail on invalid ledger chain");
    }
  });
});

Deno.test("replay audit can fail-fast on ledger chain when enabled", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };
    await GATE.process(
      genesis,
      [proposal("p1", 1, "state_1", 5)],
      baseConfig(),
    );

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const ledgerIdx = lines.findIndex((line) =>
      !line.includes('"event_type":')
    );
    if (ledgerIdx < 0) {
      throw new Error("missing ledger event line");
    }
    const evt = JSON.parse(lines[ledgerIdx]);
    evt.policy_hash = "f".repeat(64);
    lines[ledgerIdx] = JSON.stringify(evt);
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, lines.join("\n") + "\n");

    const audit = await REPLAY_AUDIT.audit(
      {
        tick: 1,
        state_i16: genesis.state_i16,
        state_hash: "state_1",
      },
      { runs: 1, startTick: 1, endTick: 1, verifyLedgerChain: true },
    );

    if (audit.replayGreen) {
      throw new Error(
        "replay must fail when ledger chain check is enabled and chain is broken",
      );
    }
    if (
      !audit.failures.some((f) =>
        f.includes("ledger_chain:LEDGER_CHAIN_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `missing expected ledger_chain failure: ${audit.failures.join(",")}`,
      );
    }
    if (
      !audit.invariantReport.ledger_chain_checked ||
      audit.invariantReport.ledger_chain_ok
    ) {
      throw new Error(
        "expected invariant report ledger_chain_checked=true and ledger_chain_ok=false",
      );
    }
  });
});
