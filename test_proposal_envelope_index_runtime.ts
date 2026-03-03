import {
  PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as INDEX,
} from "@omega";

const mkEvent = (
  eventId: string,
  tick: number,
  envelopes: Array<{ proposal_id: string; envelope_hash: string }>,
) => ({
  event_id: eventId,
  tick,
  accepted_proposal_envelopes: envelopes,
});

async function main() {
  console.log("🧪 [TEST] Proposal envelope index runtime");

  const originalPath = INDEX.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-proposal-envelope-index-runtime-",
    suffix: ".jsonl",
  });
  INDEX.STORAGE_PATH = tempPath;
  INDEX.resetCacheForTests();
  await Deno.writeTextFile(tempPath, "");

  try {
    await INDEX.appendFromLedgerEvent(
      mkEvent("evt_1", 10, [{
        proposal_id: "p1",
        envelope_hash: "a".repeat(64),
      }]),
    );
    await INDEX.appendFromLedgerEvent(
      mkEvent("evt_2", 11, [{
        proposal_id: "p2",
        envelope_hash: "b".repeat(64),
      }]),
    );

    const verifyOk = await INDEX.verifyChainDetailed();
    if (!verifyOk.ok) {
      throw new Error(
        `expected index chain ok, got=${verifyOk.failures.join(",")}`,
      );
    }
    const recent = await INDEX.getRecentEnvelopeHashes(11, 11);
    if (!recent.has("b".repeat(64))) {
      throw new Error("expected tick-11 envelope hash");
    }
    if (recent.has("a".repeat(64))) {
      throw new Error("did not expect tick-10 envelope hash in tick-11 query");
    }

    const body = await Deno.readTextFile(tempPath);
    const lines = body.trim().split("\n");
    const first = JSON.parse(lines[0]) as Record<string, unknown>;
    first.envelope_hash = "d".repeat(64);
    lines[0] = JSON.stringify(first);
    await Deno.writeTextFile(tempPath, `${lines.join("\n")}\n`);
    INDEX.resetCacheForTests();

    const verifyTampered = await INDEX.verifyChainDetailed();
    if (verifyTampered.ok) {
      throw new Error("expected tampered chain to fail");
    }
    if (
      !verifyTampered.failures.some((x) =>
        x.includes("ENVELOPE_INDEX_RECORD_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `expected RECORD_HASH_MISMATCH, got=${
          verifyTampered.failures.join(",")
        }`,
      );
    }

    console.log("✅ [TEST] Proposal envelope index runtime verified.");
  } finally {
    INDEX.STORAGE_PATH = originalPath;
    INDEX.resetCacheForTests();
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
