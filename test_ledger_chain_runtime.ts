import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";

const bridgeEvent = (tick: number) => ({
  event_type: "BRIDGE_MODE_EVENT",
  tick,
  state_hash: `state_${tick}`,
  mode: "GREEN",
  index_chain_checked: true,
  index_chain_ok: true,
  index_chain_checked_records: 1,
  index_chain_failures: [],
  canon_bound_proposals: [],
  blocked_canon_proposals: [],
  reason: "test",
});

const ledgerEvent = (tick: number) => ({
  event_id: `evt_${tick}`,
  tick,
  ts_unix_ms: 1_700_000_000_000 + tick,
  state_before_hash: `state_${tick}`,
  state_after_hash: `state_${tick + 1}`,
  accepted_delta: [],
  proposal_digest: `digest_${tick}`,
  accepted_proposals: [],
  rejected_proposals: [],
  cost_total: 0,
  budget_used: 0,
  gate_config_version: "v0.runtime-test",
});

async function main() {
  console.log("🧪 [TEST] Ledger hash-chain runtime");

  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-chain-runtime-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");

  try {
    await LEDGER.append(bridgeEvent(1));
    await LEDGER.append(ledgerEvent(1));
    await LEDGER.append(bridgeEvent(2));
    await LEDGER.append(ledgerEvent(2));

    const raw = await Deno.readTextFile(tempPath);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    if (lines.length !== 4) {
      throw new Error(`expected 4 lines, got ${lines.length}`);
    }
    for (const [i, line] of lines.entries()) {
      const evt = JSON.parse(line) as Record<string, unknown>;
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
      throw new Error(`expected chain ok, got=${chain.failures.join(",")}`);
    }
    if (chain.chainAnchoredEvents !== 4 || chain.legacyEvents !== 0) {
      throw new Error(
        `unexpected chain stats anchored=${chain.chainAnchoredEvents} legacy=${chain.legacyEvents}`,
      );
    }

    const first = JSON.parse(lines[0]) as Record<string, unknown>;
    first.reason = "tampered";
    lines[0] = JSON.stringify(first);
    await Deno.writeTextFile(tempPath, `${lines.join("\n")}\n`);

    const tampered = await LEDGER.verifyChainDetailed();
    if (tampered.ok) {
      throw new Error("tampered chain must fail");
    }
    if (
      !tampered.failures.some((x: string) =>
        x.includes("LEDGER_CHAIN_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `expected LEDGER_CHAIN_HASH_MISMATCH, got=${
          tampered.failures.join(",")
        }`,
      );
    }

    let blocked = false;
    try {
      await LEDGER.append(bridgeEvent(3));
    } catch (err) {
      blocked = true;
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("LEDGER_CHAIN_INVALID")) {
        throw new Error(`unexpected append failure: ${msg}`);
      }
    }
    if (!blocked) {
      throw new Error("append should fail on invalid chain");
    }

    console.log("✅ [TEST] Ledger hash-chain runtime verified.");
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch {
      // ignore cleanup errors
    }
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
