// test_io_flow_stream.ts
// @noncanonical
// Smoke test: append → read → collapse (dry_run)

import { O_STREAM_APPEND_O_STREAM_APPEND as O_STREAM_APPEND } from "@g";
import { O_STREAM_PATH_O_STREAM_PATH as O_STREAM_PATH } from "@g";
import { IO_FLOW_IO_FLOW as IO_FLOW } from "@g";
import { O_STREAM_STORE_O_STREAM_STORE as O_STREAM_STORE } from "@g";
import { O_STREAM_ADAPTER_O_STREAM_ADAPTER as O_STREAM_ADAPTER } from "@g";
import { LEDGER__08_00_LEDGER as LEDGER } from "@g";
import type {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@g";

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_smoke", 1.0]]),
  dry_run: true,
});

const tempStream = `${O_STREAM_PATH()}.test`;

const genesis: StateSnapshot = {
  tick: 1,
  state_i16: new Int16Array(64).fill(0),
  state_hash: "state_1",
};

const proposal = (tick: number, baseHash: string): DeltaProposal => ({
  proposal_id: "test-proposal",
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_smoke",
  intent: "smoke",
  confidence: 1,
  delta: [{ level: 0, value: 1 }],
  cost_estimate: 0,
  artifact_hash: "test-artifact",
  semantic_fingerprint: "test-fingerprint",
});

Deno.test("io flow reads O stream and collapses via gate", async () => {
  const originalLedgerPath = LEDGER.STORAGE_PATH;
  const tempLedger = await Deno.makeTempFile({
    prefix: "omega-ledger-io-flow-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempLedger;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  await Deno.remove(tempStream).catch(() => {});
  try {
    await O_STREAM_APPEND(
      proposal(genesis.tick, genesis.state_hash),
      tempStream,
    );
    const stream = await O_STREAM_STORE.read(tempStream);
    const output = await IO_FLOW({
      state: genesis,
      output_stream: O_STREAM_ADAPTER(stream),
      config: baseConfig(),
    });

    if (output.nextState.tick !== genesis.tick + 1) {
      throw new Error("expected tick to advance in dry_run mode");
    }
    if (output.nextState.state_hash !== genesis.state_hash) {
      throw new Error("dry_run should preserve state hash");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalLedgerPath;
    await Deno.remove(tempLedger).catch(() => {});
    await Deno.remove(tempStream).catch(() => {});
  }
});
