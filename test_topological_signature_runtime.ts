import { TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE as TOPO } from "@omega";

const STATE_BASE = {
  identity: "organism_anchor_001",
  wave: {
    center: -1024,
    width: 1200,
    phase: 22345,
    amplitude: 42000,
  },
  chrono: {
    tau: 0.61,
    depth: -1024,
    flowRate: 0.83,
    curvature: 0.12,
  },
  metabolism: 0.74,
  coherence: 0.88,
};

const ARTIFACT_HASH = "a".repeat(64);
const STATE_HASH = "b".repeat(64);

async function main() {
  console.log("🧪 [TEST] Topological signature runtime");

  const sigA = await TOPO.build({
    artifact_hash: ARTIFACT_HASH,
    state_hash: STATE_HASH,
    tick: 42,
    state: STATE_BASE,
    causal_refs: ["f".repeat(64), "0".repeat(64)],
  });
  const sigB = await TOPO.build({
    artifact_hash: ARTIFACT_HASH,
    state_hash: STATE_HASH,
    tick: 42,
    state: STATE_BASE,
    causal_refs: ["0".repeat(64), "f".repeat(64)],
  });

  if (sigA.projection_2d_hash !== sigB.projection_2d_hash) {
    throw new Error("projection_2d_hash is not deterministic");
  }
  if (sigA.thread_1d_hash !== sigB.thread_1d_hash) {
    throw new Error("thread_1d_hash is not deterministic");
  }
  if (sigA.causal_refs.join("|") !== sigB.causal_refs.join("|")) {
    throw new Error("causal_refs canonical sorting failed");
  }

  const verifyOk = await TOPO.verify(sigA, STATE_BASE);
  if (!verifyOk.ok) {
    throw new Error(
      `verify should pass, got=${verifyOk.reasons.join(",")}`,
    );
  }

  const drifted = {
    ...STATE_BASE,
    wave: {
      ...STATE_BASE.wave,
      phase: STATE_BASE.wave.phase + 123,
    },
  };
  const verifyDrift = await TOPO.verify(sigA, drifted);
  if (verifyDrift.ok) {
    throw new Error("verify should fail for drifted state");
  }
  if (verifyDrift.reasons.length === 0) {
    throw new Error("verify should emit mismatch reasons");
  }

  const mapped = TOPO.snapshotToOrganismState({
    state_hash: STATE_HASH,
    state_i16: new Int16Array(64).fill(7),
  });
  const rgba = TOPO.project2D(mapped, {
    resolution: 256,
    deterministic: true,
  });
  const thread = TOPO.projectThread1D(rgba, 256);
  if (thread.length !== 64 * 256) {
    throw new Error(`unexpected thread length: ${thread.length}`);
  }

  console.log("✅ [TEST] Topological signature runtime verified.");
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
