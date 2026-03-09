import { PULSE } from "../PULSE.ts";
import { RISC, STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_LUT_ACCURACY_CAPTURE__";

type Snapshot = {
  val0: number;
  val1: number;
  val4: number;
  cost0: number;
  cost1: number;
  cost4: number;
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

  STATE_MATRIX.seedAtom(13999, 1n, 0, 0, 0, 0); // bypass bootstrap

  let c = 0;
  const code0 = new Uint8Array(64);
  code0[c++] = RISC.OP_SET;
  code0[c++] = 1;
  code0[c++] = 64; // angle in R1
  code0[c++] = RISC.OP_SET;
  code0[c++] = 2;
  code0[c++] = 0; // mode 0 (Direct)
  code0[c++] = RISC.OP_RESOLVE;
  code0[c++] = 0;
  code0[c++] = 1;
  code0[c++] = 2;

  c = 0;
  const code1 = new Uint8Array(64);
  code1[c++] = RISC.OP_SET;
  code1[c++] = 1;
  code1[c++] = 64; // angle in R1
  code1[c++] = RISC.OP_SET;
  code1[c++] = 2;
  code1[c++] = 1; // mode 1 (LERP)
  code1[c++] = RISC.OP_RESOLVE;
  code1[c++] = 0;
  code1[c++] = 1;
  code1[c++] = 2;

  c = 0;
  const code4 = new Uint8Array(64);
  code4[c++] = RISC.OP_SET;
  code4[c++] = 1;
  code4[c++] = 64; // angle in R1
  code4[c++] = RISC.OP_SET;
  code4[c++] = 2;
  code4[c++] = 4; // mode 4 (Taylor2)
  code4[c++] = RISC.OP_RESOLVE;
  code4[c++] = 0;
  code4[c++] = 1;
  code4[c++] = 2;

  // We place 3 atoms, seed them with exactly 1000 energy.
  STATE_MATRIX.seedAtom(100, 10n, 100, 100, 1000, 100, undefined, code0);
  STATE_MATRIX.seedAtom(101, 10n, 200, 200, 1000, 100, undefined, code1);
  STATE_MATRIX.seedAtom(102, 10n, 300, 300, 1000, 100, undefined, code4);

  await PULSE.initWorkers(1);
  await PULSE.tick();

  const contextData = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.CONTEXT_OFFSET,
    16 * 14000,
  );
  const cost0 = 1000 - STATE_MATRIX.getEnergy(100);
  const cost1 = 1000 - STATE_MATRIX.getEnergy(101);
  const cost4 = 1000 - STATE_MATRIX.getEnergy(102);

  const snapshot: Snapshot = {
    val0: contextData[100 * 16],
    val1: contextData[101 * 16],
    val4: contextData[102 * 16],
    cost0,
    cost1,
    cost4,
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

    if (
      !(payload.snapshot.cost0 < payload.snapshot.cost1 &&
        payload.snapshot.cost1 < payload.snapshot.cost4)
    ) {
      throw new Error(
        `[lut_accuracy_capture] Costs are not correctly graded! Cost0=${payload.snapshot.cost0}, Cost1=${payload.snapshot.cost1}, Cost4=${payload.snapshot.cost4}`,
      );
    }

    console.log(
      `[lut_accuracy_capture] ok hash=${payload.hash} cost0=${payload.snapshot.cost0} cost1=${payload.snapshot.cost1} cost4=${payload.snapshot.cost4}`,
    );
  } finally {
    PULSE.stopWorkers();
  }
};

await main();
