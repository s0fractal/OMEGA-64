// test_proposal_envelope_index.ts
// Verifies append-only proposal envelope replay index behavior.

import { PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as PROPOSAL_ENVELOPE_INDEX } from "@generated";
import type { STATE_SNAPSHOT_LedgerEvent as LedgerEvent } from "@generated";

const mkEvent = (
  eventId: string,
  tick: number,
  before: string,
  after: string,
  envelopes: Array<{ proposal_id: string; envelope_hash: string }>,
): LedgerEvent => ({
  event_id: eventId,
  tick,
  ts_unix_ms: 1700000000000 + tick,
  state_before_hash: before,
  state_after_hash: after,
  accepted_delta: [],
  proposal_digest: `digest_${tick}`,
  accepted_proposals: envelopes.map((x) => x.proposal_id),
  accepted_proposal_envelopes: envelopes,
  rejected_proposals: [],
  cost_total: 0,
  budget_used: 0,
  gate_config_version: "v0.2",
});

Deno.test("proposal envelope index append and recent query", async () => {
  const originalPath = PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-proposal-envelope-index-",
    suffix: ".jsonl",
  });
  PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH = tempPath;
  PROPOSAL_ENVELOPE_INDEX.resetCacheForTests();
  await Deno.writeTextFile(tempPath, "");

  try {
    await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
      mkEvent("evt_1", 10, "s9", "s10", [
        {
          proposal_id: "p1",
          envelope_hash:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      ]),
    );
    await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
      mkEvent("evt_2", 11, "s10", "s11", [
        {
          proposal_id: "p2",
          envelope_hash:
            "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        },
      ]),
    );

    const verify = await PROPOSAL_ENVELOPE_INDEX.verifyChainDetailed();
    if (!verify.ok) {
      throw new Error(
        `expected index chain ok, failures: ${verify.failures.join(",")}`,
      );
    }
    const recent = await PROPOSAL_ENVELOPE_INDEX.getRecentEnvelopeHashes(
      11,
      11,
    );
    if (
      !recent.has(
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      )
    ) {
      throw new Error("expected recent envelope hash for tick 11");
    }
    if (
      recent.has(
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      )
    ) {
      throw new Error("did not expect tick 10 hash in tick 11-only query");
    }
  } finally {
    PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH = originalPath;
    PROPOSAL_ENVELOPE_INDEX.resetCacheForTests();
    try {
      await Deno.remove(tempPath);
    } catch {
      // ignore
    }
  }
});

Deno.test("proposal envelope index chain detects tamper", async () => {
  const originalPath = PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-proposal-envelope-index-tamper-",
    suffix: ".jsonl",
  });
  PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH = tempPath;
  PROPOSAL_ENVELOPE_INDEX.resetCacheForTests();
  await Deno.writeTextFile(tempPath, "");

  try {
    await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
      mkEvent("evt_3", 20, "s19", "s20", [
        {
          proposal_id: "p3",
          envelope_hash:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        },
      ]),
    );

    const body = await Deno.readTextFile(tempPath);
    const lines = body.trim().split("\n");
    const first = JSON.parse(lines[0]) as Record<string, unknown>;
    first.envelope_hash =
      "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
    lines[0] = JSON.stringify(first);
    await Deno.writeTextFile(tempPath, `${lines.join("\n")}\n`);
    PROPOSAL_ENVELOPE_INDEX.resetCacheForTests();

    const verify = await PROPOSAL_ENVELOPE_INDEX.verifyChainDetailed();
    if (verify.ok) {
      throw new Error("expected tampered chain to fail");
    }
    if (
      !verify.failures.some((f: string) =>
        f.includes("ENVELOPE_INDEX_RECORD_HASH_MISMATCH")
      )
    ) {
      throw new Error(`unexpected failures: ${verify.failures.join(",")}`);
    }
  } finally {
    PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH = originalPath;
    PROPOSAL_ENVELOPE_INDEX.resetCacheForTests();
    try {
      await Deno.remove(tempPath);
    } catch {
      // ignore
    }
  }
});
