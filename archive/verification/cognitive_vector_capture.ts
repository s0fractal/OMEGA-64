import { PULSE } from "../PULSE.ts";
import { RISC, STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_COGNITIVE_VECTOR_CAPTURE__";

type Snapshot = {
  fastMathValue: number;
  preciseMathValue: number;
  fastMathEnergy: number;
  preciseMathEnergy: number;
  atom200PhaseBefore: number;
  atom201PhaseBefore: number;
  atom200PhaseAfter: number;
  atom201PhaseAfter: number;
  atomPcFast: number;
  atomPcPrecise: number;
};

type CapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: Snapshot;
};

const hashHex = async (payload: string): Promise<string> => {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const workerCount = Number(Deno.env.get("OMEGA_PULSE_WORKERS") ?? "1");
  const strictDeterminism =
    (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1";

  // Boilerplate setup
  STATE_MATRIX.seedAtom(13999, 1n, 0, 0, 0, 0); // bypass bootstrap

  // Atom 100: tests OP_RESOLVE (Sin Fast - Mode 0)
  let c = 0;
  const code1 = new Uint8Array(64);
  code1[c++] = RISC.OP_SET;
  code1[c++] = 1;
  code1[c++] = 64; // angle in R1
  code1[c++] = RISC.OP_SET;
  code1[c++] = 2;
  code1[c++] = 0; // mode in R2 (0: Sin Direct)
  code1[c++] = RISC.OP_RESOLVE;
  code1[c++] = 0;
  code1[c++] = 1;
  code1[c++] = 2; // R0 = resolve(R1, R2)
  STATE_MATRIX.seedAtom(100, 10n, 10, 10, 1000, 100, undefined, code1);

  // Atom 101: tests OP_RESOLVE (Sin Precise - Mode 1)
  c = 0;
  const code2 = new Uint8Array(64);
  // 64 passed as Q8.8 means index 0, fraction 64/256 (0.25). Sin(0.25 index) ≈ 201
  code2[c++] = RISC.OP_SET;
  code2[c++] = 1;
  code2[c++] = 64; // angle in R1
  code2[c++] = RISC.OP_SET;
  code2[c++] = 2;
  code2[c++] = 1; // mode in R2 (1: Sin LERP)
  code2[c++] = RISC.OP_RESOLVE;
  code2[c++] = 0;
  code2[c++] = 1;
  code2[c++] = 2; // R0 = resolve(R1, R2)
  STATE_MATRIX.seedAtom(101, 10n, 20, 20, 1000, 100, undefined, code2);

  // Test OP_RESONATE_KURAMOTO
  // Atom 200 and 201 are put at the same location to form a quorum
  c = 0;
  const codeRes = new Uint8Array(64);
  codeRes[c++] = RISC.OP_RESONATE_KURAMOTO;
  codeRes[c++] = RISC.OP_JMP;
  codeRes[c++] = 0; // loop

  STATE_MATRIX.seedAtom(200, 10n, 10000, 10000, 1000, 100, undefined, codeRes);
  STATE_MATRIX.setPhase(200, 10);
  STATE_MATRIX.seedAtom(201, 10n, 10000, 10000, 1000, 100, undefined, codeRes);
  STATE_MATRIX.setPhase(201, 50);

  const phase200Before = STATE_MATRIX.getPhase(200);
  const phase201Before = STATE_MATRIX.getPhase(201);

  await PULSE.initWorkers(1);
  // Trigger exactly 1 tick
  await PULSE.tick();

  const e1 = STATE_MATRIX.getEnergy(100);
  const e2 = STATE_MATRIX.getEnergy(101);

  const contextData = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.CONTEXT_OFFSET,
    16 * 14000,
  );
  const r0_1 = contextData[100 * 16]; // R0 of atom 100
  const r0_2 = contextData[101 * 16]; // R0 of atom 101

  const snapshot: Snapshot = {
    fastMathValue: r0_1,
    preciseMathValue: r0_2,
    fastMathEnergy: e1,
    preciseMathEnergy: e2,
    atom200PhaseBefore: phase200Before,
    atom201PhaseBefore: phase201Before,
    atom200PhaseAfter: STATE_MATRIX.getPhase(200),
    atom201PhaseAfter: STATE_MATRIX.getPhase(201),
    atomPcFast: STATE_MATRIX.getPC(100),
    atomPcPrecise: STATE_MATRIX.getPC(101),
  };

  const hash = await hashHex(JSON.stringify(snapshot));
  return {
    workerCount,
    strictDeterminism,
    hash,
    snapshot,
  };
};

const main = async () => {
  try {
    const payload = await runCapture();
    if (Deno.args.includes("--capture")) {
      console.log(`${CAPTURE_MARKER}${JSON.stringify(payload)}`);
      return;
    }

    if (payload.snapshot.fastMathEnergy <= payload.snapshot.preciseMathEnergy) {
      throw new Error(
        `[cognitive_vector_capture] Fast math cost should be strictly less executing than precise math cost. ${payload.snapshot.fastMathEnergy} <= ${payload.snapshot.preciseMathEnergy}`,
      );
    }
    if (payload.snapshot.fastMathValue !== 32767) {
      throw new Error(
        `[cognitive_vector_capture] Fast math sin(PI/2) expected 32767, got ${payload.snapshot.fastMathValue}`,
      );
    }
    if (payload.snapshot.preciseMathValue !== 201) {
      throw new Error(
        `[cognitive_vector_capture] Precise math expected 201, got ${payload.snapshot.preciseMathValue}`,
      );
    }
    if (
      payload.snapshot.atom200PhaseAfter <= payload.snapshot.atom200PhaseBefore
    ) {
      throw new Error(
        "[cognitive_vector_capture] atom200 phase did not increase towards 50",
      );
    }
    if (
      payload.snapshot.atom201PhaseAfter >= payload.snapshot.atom201PhaseBefore
    ) {
      throw new Error(
        "[cognitive_vector_capture] atom201 phase did not decrease towards 10",
      );
    }

    console.log(
      `[cognitive_vector_capture] ok hash=${payload.hash} fastCost=${
        1000 - payload.snapshot.fastMathEnergy
      } preciseCost=${
        1000 - payload.snapshot.preciseMathEnergy
      } p1=${payload.snapshot.atom200PhaseAfter} p2=${payload.snapshot.atom201PhaseAfter}`,
    );
  } finally {
    PULSE.stopWorkers();
  }
};

await main();
