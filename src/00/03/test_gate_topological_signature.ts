// test_gate_topological_signature.ts
// Verifies that GATE emits deterministic projection anchors into ledger events.

import { GATE_GATE as GATE } from "@generated";
import { LEDGER__08_00_LEDGER as LEDGER } from "@generated";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@generated";
import {
  TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE as TOPOLOGICAL_SIGNATURE,
  TOPOLOGICAL_SIGNATURE__08_00_TopologicalSignature as TopologicalSignature,
} from "@generated";
import {
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG as CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY as CRYSTALLIZATION_POLICY,
} from "@generated";

const HEX_64 = /^[a-f0-9]{64}$/;

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
});

const baseProposal = (tick: number, baseHash: string): DeltaProposal => ({
  proposal_id: "sig_p1",
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "signature_emit",
  confidence: 1,
  delta: [{ level: 32, value: 42 }, { level: 13, value: 7 }],
  cost_estimate: 300,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  causal_refs: ["f".repeat(64)],
});

async function collectLedgerEvents() {
  const out = [];
  for await (const evt of LEDGER.readAll()) {
    out.push(evt);
  }
  return out;
}

Deno.test("gate emits topological signature fields in ledger", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-toposig-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  try {
    const expectedPolicyHash = await CRYSTALLIZATION_POLICY.hash();
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };

    const next = await GATE.process(
      genesis,
      [baseProposal(1, "state_1")],
      baseConfig(),
    );
    const events = await collectLedgerEvents();
    if (events.length !== 1) {
      throw new Error(`expected 1 event, got ${events.length}`);
    }

    const evt = events[0];
    if (!evt.projection_2d_hash || !HEX_64.test(evt.projection_2d_hash)) {
      throw new Error("missing or invalid projection_2d_hash");
    }
    if (!evt.thread_1d_hash || !HEX_64.test(evt.thread_1d_hash)) {
      throw new Error("missing or invalid thread_1d_hash");
    }
    if (evt.projection_version !== TOPOLOGICAL_SIGNATURE.PROJECTION_VERSION) {
      throw new Error(
        `unexpected projection_version: ${evt.projection_version}`,
      );
    }
    if (evt.signature_artifact_hash !== evt.proposal_digest) {
      throw new Error("signature_artifact_hash must match proposal_digest");
    }
    if (evt.signature_tick !== next.tick) {
      throw new Error(
        `signature_tick mismatch: got ${evt.signature_tick}, expected ${next.tick}`,
      );
    }
    if (evt.policy_version !== CRYSTALLIZATION_CONFIG.policyVersion) {
      throw new Error(`unexpected policy_version: ${evt.policy_version}`);
    }
    if (evt.policy_hash !== expectedPolicyHash) {
      throw new Error(`unexpected policy_hash: ${evt.policy_hash}`);
    }

    const signature: TopologicalSignature = {
      artifact_hash: evt.signature_artifact_hash!,
      state_hash: next.state_hash,
      tick: evt.signature_tick!,
      causal_refs: evt.signature_causal_refs ?? [],
      projection_2d_hash: evt.projection_2d_hash!,
      thread_1d_hash: evt.thread_1d_hash!,
      projection_version: evt.projection_version!,
    };

    const verify = await TOPOLOGICAL_SIGNATURE.verify(
      signature,
      TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
        state_hash: next.state_hash,
        state_i16: next.state_i16,
      }),
    );

    if (!verify.ok) {
      throw new Error(
        `topological signature verify failed: ${verify.reasons.join(",")}`,
      );
    }
  } finally {
    try {
      await Deno.remove(LEDGER.STORAGE_PATH);
    } catch {
      // ignore cleanup failures
    }
    LEDGER.STORAGE_PATH = originalPath;
  }
});

Deno.test("gate does not emit topological signature fields in dry run", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-toposig-dry-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  try {
    const expectedPolicyHash = await CRYSTALLIZATION_POLICY.hash();
    const genesis: StateSnapshot = {
      tick: 3,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_3",
    };
    const config = baseConfig();
    config.dry_run = true;

    await GATE.process(genesis, [baseProposal(3, "state_3")], config);
    const events = await collectLedgerEvents();
    if (events.length !== 1) {
      throw new Error(`expected 1 event, got ${events.length}`);
    }
    const evt = events[0];
    if (
      evt.projection_2d_hash || evt.thread_1d_hash || evt.projection_version
    ) {
      throw new Error("dry run must not emit projection hashes");
    }
    if (evt.policy_version !== CRYSTALLIZATION_CONFIG.policyVersion) {
      throw new Error(
        `unexpected policy_version in dry run: ${evt.policy_version}`,
      );
    }
    if (evt.policy_hash !== expectedPolicyHash) {
      throw new Error(`unexpected policy_hash in dry run: ${evt.policy_hash}`);
    }
  } finally {
    try {
      await Deno.remove(LEDGER.STORAGE_PATH);
    } catch {
      // ignore cleanup failures
    }
    LEDGER.STORAGE_PATH = originalPath;
  }
});
