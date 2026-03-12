// test_topological_signature.ts
// Smoke tests for deterministic topological signature runtime.

import { TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE as TOPOLOGICAL_SIGNATURE } from "@omega";

type OrganismState = {
  identity: string;
  wave: {
    center: number;
    width: number;
    phase: number;
    amplitude: number;
  };
  chrono: {
    tau: number;
    depth: number;
    flowRate: number;
    curvature?: number;
  };
  metabolism: number;
  coherence: number;
};

const STATE_BASE: OrganismState = {
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

Deno.test("topological signature build is deterministic", async () => {
  const artifactHash = "a".repeat(64);
  const stateHash = "b".repeat(64);

  const s1 = await TOPOLOGICAL_SIGNATURE.build({
    artifact_hash: artifactHash,
    state_hash: stateHash,
    tick: 42,
    state: STATE_BASE,
    causal_refs: ["f".repeat(64), "0".repeat(64)],
  });

  const s2 = await TOPOLOGICAL_SIGNATURE.build({
    artifact_hash: artifactHash,
    state_hash: stateHash,
    tick: 42,
    state: STATE_BASE,
    causal_refs: ["0".repeat(64), "f".repeat(64)],
  });

  if (s1.projection_2d_hash !== s2.projection_2d_hash) {
    throw new Error("projection_2d_hash is not deterministic");
  }
  if (s1.thread_1d_hash !== s2.thread_1d_hash) {
    throw new Error("thread_1d_hash is not deterministic");
  }
  if (s1.causal_refs.join("|") !== s2.causal_refs.join("|")) {
    throw new Error("causal_refs canonical sorting failed");
  }
});

Deno.test("topological signature verify detects drift", async () => {
  const signature = await TOPOLOGICAL_SIGNATURE.build({
    artifact_hash: "c".repeat(64),
    state_hash: "d".repeat(64),
    tick: 7,
    state: STATE_BASE,
  });

  const okResult = await TOPOLOGICAL_SIGNATURE.verify(signature, STATE_BASE);
  if (!okResult.ok) {
    throw new Error(`verify should pass, got: ${okResult.reasons.join(",")}`);
  }

  const driftedState: OrganismState = {
    ...STATE_BASE,
    wave: {
      ...STATE_BASE.wave,
      phase: STATE_BASE.wave.phase + 123,
    },
  };

  const driftResult = await TOPOLOGICAL_SIGNATURE.verify(
    signature,
    driftedState,
  );
  if (driftResult.ok) {
    throw new Error("verify should fail for drifted state");
  }
  if (driftResult.reasons.length === 0) {
    throw new Error("verify should return mismatch reasons");
  }
});

Deno.test("thread projection has canonical size", () => {
  const rgba = TOPOLOGICAL_SIGNATURE.project2D(STATE_BASE, {
    resolution: 256,
    deterministic: true,
  });
  const thread = TOPOLOGICAL_SIGNATURE.projectThread1D(rgba, 256);
  if (thread.length !== 64 * 256) {
    throw new Error(`unexpected thread length: ${thread.length}`);
  }
});
