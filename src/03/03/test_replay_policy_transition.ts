// test_replay_policy_transition.ts
// Validates policy hash chain and explicit POLICY_TRANSITION_EVENT behavior.

import { GATE_PIPELINE_GATE_PIPELINE as GATE_PIPELINE } from "@generated";
import { LEDGER__08_00_LEDGER as LEDGER } from "@generated";
import { REPLAY_AUDIT__08_00_REPLAY_AUDIT as REPLAY_AUDIT } from "@generated";
import { POLICY_TRANSITION_POLICY_TRANSITION as POLICY_TRANSITION } from "@generated";
import {
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG as CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY as CRYSTALLIZATION_POLICY,
} from "@generated";
import {
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

const processLocal = async (
  state: StateSnapshot,
  proposals: DeltaProposal[],
  config: GateConfig,
): Promise<StateSnapshot> =>
  (await GATE_PIPELINE.processWithInvariantContext(state, proposals, config))
    .nextState;

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const stripChainFields = (
  event: Record<string, unknown>,
): Record<string, unknown> => {
  const clone = { ...event };
  delete clone.chain_version;
  delete clone.prev_event_hash;
  delete clone.event_hash;
  return clone;
};

const rechainLines = async (lines: string[]): Promise<string[]> => {
  let prevHash: string | null = null;
  const out: string[] = [];
  for (const line of lines) {
    const evt = JSON.parse(line) as Record<string, unknown>;
    const body = stripChainFields(evt);
    const payload = {
      chain_version: LEDGER.CHAIN_VERSION,
      prev_event_hash: prevHash,
      body,
    };
    const eventHash = await sha256Hex(stableStringify(payload));
    const chained = {
      ...body,
      chain_version: LEDGER.CHAIN_VERSION,
      prev_event_hash: prevHash,
      event_hash: eventHash,
    };
    out.push(JSON.stringify(chained));
    prevHash = eventHash;
  }
  return out;
};

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
  intent: "policy_chain_test",
  confidence: 1,
  delta: [{ level: 32, value }],
  cost_estimate: 100,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  causal_refs: ["7".repeat(64)],
});

async function withTempLedger<T>(fn: () => Promise<T>): Promise<T> {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-policy-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");
  try {
    return await fn();
  } finally {
    try {
      await Deno.remove(LEDGER.STORAGE_PATH);
    } catch {
      // ignore cleanup failures
    }
    LEDGER.STORAGE_PATH = originalPath;
  }
}

async function buildTwoTicks() {
  const genesis: StateSnapshot = {
    tick: 1,
    state_i16: new Int16Array(64).fill(0),
    state_hash: "state_1",
  };
  const s2 = await processLocal(
    genesis,
    [proposal("p1", 1, "state_1", 10)],
    baseConfig(),
  );
  await processLocal(
    { tick: 2, state_i16: s2.state_i16, state_hash: s2.state_hash },
    [proposal("p2", 2, s2.state_hash, -3)],
    baseConfig(),
  );
  return genesis;
}

Deno.test("replay fails on local policy hash mismatch", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };
    await processLocal(
      genesis,
      [proposal("p1", 1, "state_1", 10)],
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
    evt.policy_hash = "f".repeat(64); // keep current version, break hash
    lines[ledgerIdx] = JSON.stringify(evt);
    const rechained = await rechainLines(lines);
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, rechained.join("\n") + "\n");

    const audit = await REPLAY_AUDIT.audit(
      {
        tick: 1,
        state_i16: genesis.state_i16,
        state_hash: "state_1",
      },
      { runs: 1, startTick: 1, endTick: 1 },
    );

    if (audit.replayGreen) {
      throw new Error("replay must fail on local policy hash mismatch");
    }
    if (
      !audit.failures.some((f) =>
        f.includes("policy hash mismatch with local config")
      )
    ) {
      throw new Error(
        `missing expected failure, got: ${audit.failures.join(",")}`,
      );
    }
  });
});

Deno.test("replay fails when policy changes without transition event", async () => {
  await withTempLedger(async () => {
    const genesis = await buildTwoTicks();
    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const ledgerIndices = lines
      .map((line, idx) => ({ line, idx }))
      .filter((x) => !x.line.includes('"event_type":'))
      .map((x) => x.idx);
    if (ledgerIndices.length < 2) {
      throw new Error(
        `expected at least 2 ledger events, got ${ledgerIndices.length}`,
      );
    }
    const secondLedgerIdx = ledgerIndices[1];
    const e2 = JSON.parse(lines[secondLedgerIdx]);
    e2.policy_version = "crystallization/v2";
    e2.policy_hash = "2".repeat(64);
    lines[secondLedgerIdx] = JSON.stringify(e2);
    const rechained = await rechainLines(lines);
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, rechained.join("\n") + "\n");

    const audit = await REPLAY_AUDIT.audit(
      {
        tick: 1,
        state_i16: genesis.state_i16,
        state_hash: "state_1",
      },
      { runs: 1, startTick: 1, endTick: 2 },
    );

    if (audit.replayGreen) {
      throw new Error(
        "replay must fail on policy change without transition event",
      );
    }
    if (
      !audit.failures.some((f) =>
        f.includes("policy change without transition")
      )
    ) {
      throw new Error(
        `missing expected failure, got: ${audit.failures.join(",")}`,
      );
    }
  });
});

Deno.test("replay accepts policy transition when explicit event is present", async () => {
  await withTempLedger(async () => {
    const genesis = await buildTwoTicks();
    const currentHash = await CRYSTALLIZATION_POLICY.hash();

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const ledgerIndices = lines
      .map((line, idx) => ({ line, idx }))
      .filter((x) => !x.line.includes('"event_type":'))
      .map((x) => x.idx);
    if (ledgerIndices.length < 2) {
      throw new Error(
        `expected at least 2 ledger events, got ${ledgerIndices.length}`,
      );
    }
    const secondLedgerIdx = ledgerIndices[1];
    const e2 = JSON.parse(lines[secondLedgerIdx]);
    e2.policy_version = "crystallization/v2";
    e2.policy_hash = "2".repeat(64);
    lines[secondLedgerIdx] = JSON.stringify(e2);
    const rechained = await rechainLines(lines);
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, rechained.join("\n") + "\n");

    const transition = await POLICY_TRANSITION.emit({
      tick: 2,
      to_policy_version: "crystallization/v2",
      to_policy_hash: "2".repeat(64),
      reason: "test transition",
      witness: "test",
    });

    if (
      transition.from_policy_version !== CRYSTALLIZATION_CONFIG.policyVersion
    ) {
      throw new Error(
        `unexpected from_policy_version: ${transition.from_policy_version}`,
      );
    }
    if (transition.from_policy_hash !== currentHash) {
      throw new Error(
        `unexpected from_policy_hash: ${transition.from_policy_hash}`,
      );
    }

    const audit = await REPLAY_AUDIT.audit(
      {
        tick: 1,
        state_i16: genesis.state_i16,
        state_hash: "state_1",
      },
      { runs: 1, startTick: 1, endTick: 2 },
    );

    if (!audit.replayGreen) {
      throw new Error(
        `replay should pass with explicit transition: ${
          audit.failures.join(",")
        }`,
      );
    }
  });
});
