import { CHECKPOINT_CHECKPOINT as CHECKPOINT } from "@omega";

const checkpointState = (tick: number) => ({
  tick,
  state_hash: `state_${tick}`,
  state_i16: [tick, tick + 1, tick + 2],
});

async function main() {
  console.log("🧪 [TEST] Checkpoint hash-chain runtime");

  const originalPath = CHECKPOINT.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-checkpoint-chain-runtime-",
    suffix: ".jsonl",
  });
  CHECKPOINT.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");

  try {
    await CHECKPOINT.save(checkpointState(1), "AUTO_1");
    await CHECKPOINT.save(checkpointState(2), { source: "AUTO_2" });

    const raw = await Deno.readTextFile(tempPath);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    if (lines.length !== 2) {
      throw new Error(`expected 2 lines, got ${lines.length}`);
    }

    for (const [i, line] of lines.entries()) {
      const row = JSON.parse(line) as Record<string, unknown>;
      if (row.chain_version !== CHECKPOINT.CHAIN_VERSION) {
        throw new Error(`line ${i + 1} missing chain_version`);
      }
      if (
        typeof row.checkpoint_hash !== "string" ||
        row.checkpoint_hash.length !== 64
      ) {
        throw new Error(`line ${i + 1} missing checkpoint_hash`);
      }
      if (i === 0) {
        if (row.prev_checkpoint_hash !== null) {
          throw new Error("first line prev_checkpoint_hash must be null");
        }
      } else if (
        typeof row.prev_checkpoint_hash !== "string" ||
        row.prev_checkpoint_hash.length !== 64
      ) {
        throw new Error(`line ${i + 1} missing prev_checkpoint_hash`);
      }
    }

    const chain = await CHECKPOINT.verifyChainDetailed();
    if (!chain.ok) {
      throw new Error(`expected chain ok, got=${chain.failures.join(",")}`);
    }
    if (chain.chainAnchoredRows !== 2 || chain.legacyRows !== 0) {
      throw new Error(
        `unexpected chain stats anchored=${chain.chainAnchoredRows} legacy=${chain.legacyRows}`,
      );
    }

    const latest = await CHECKPOINT.loadLatest();
    if (Number(latest?.tick) !== 2) {
      throw new Error(`loadLatest mismatch, got tick=${String(latest?.tick)}`);
    }
    const exact = await CHECKPOINT.loadExact(1);
    if (Number(exact?.tick) !== 1) {
      throw new Error(`loadExact mismatch, got tick=${String(exact?.tick)}`);
    }
    const nearest = await CHECKPOINT.loadNearestAtOrBefore(99);
    if (Number(nearest?.tick) !== 2) {
      throw new Error(
        `loadNearestAtOrBefore mismatch, got tick=${String(nearest?.tick)}`,
      );
    }

    const first = JSON.parse(lines[0]) as Record<string, unknown>;
    first.context = "tampered";
    lines[0] = JSON.stringify(first);
    await Deno.writeTextFile(tempPath, `${lines.join("\n")}\n`);

    const tampered = await CHECKPOINT.verifyChainDetailed();
    if (tampered.ok) {
      throw new Error("tampered chain must fail");
    }
    if (
      !tampered.failures.some((x: string) =>
        x.includes("CHECKPOINT_CHAIN_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `expected CHECKPOINT_CHAIN_HASH_MISMATCH, got=${
          tampered.failures.join(",")
        }`,
      );
    }

    let blocked = false;
    try {
      await CHECKPOINT.save(checkpointState(3), "AUTO_3");
    } catch (err) {
      blocked = true;
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("CHECKPOINT_CHAIN_INVALID")) {
        throw new Error(`unexpected save failure: ${msg}`);
      }
    }
    if (!blocked) {
      throw new Error("save should fail on invalid chain");
    }

    console.log("✅ [TEST] Checkpoint hash-chain runtime verified.");
  } finally {
    CHECKPOINT.STORAGE_PATH = originalPath;
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
