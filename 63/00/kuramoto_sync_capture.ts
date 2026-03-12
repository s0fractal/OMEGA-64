import { PULSE } from "../PULSE.ts";
import { RISC, STATE_MATRIX } from "../STATE_MATRIX.ts";

const CAPTURE_MARKER = "__OMEGA_KURAMOTO_SYNC_CAPTURE__";

type Snapshot = {
  diffLowK: number;
  diffHighK: number;
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
  const codeRes = new Uint8Array(64);
  codeRes[c++] = RISC.OP_RESONATE_KURAMOTO;
  codeRes[c++] = RISC.OP_JMP;
  codeRes[c++] = 0; // loop

  // Low K Pair
  STATE_MATRIX.seedAtom(100, 10n, 10000, 10000, 1000, 100, undefined, codeRes);
  STATE_MATRIX.setPhase(100, 10);
  STATE_MATRIX.seedAtom(101, 10n, 10000, 10000, 1000, 100, undefined, codeRes);
  STATE_MATRIX.setPhase(101, 90);

  // High K Pair
  STATE_MATRIX.seedAtom(102, 10n, 30000, 30000, 1000, 100, undefined, codeRes);
  STATE_MATRIX.setPhase(102, 10);
  STATE_MATRIX.seedAtom(103, 10n, 30000, 30000, 1000, 100, undefined, codeRes);
  STATE_MATRIX.setPhase(103, 90);

  await PULSE.initWorkers(1);

  // Test Low K (Coherence = 0)
  for (let i = 0; i < 1; i++) {
    await PULSE.tick();
  }
  const diffLowK = Math.abs(
    STATE_MATRIX.getPhase(100) - STATE_MATRIX.getPhase(101),
  );

  // Reset and test High K (Coherence = 12000)
  const atomicBuffer = new Int32Array(STATE_MATRIX.buffer);
  atomicBuffer[40700104 / 4] = 12000; // NEURAL_COHERENCE_OFF

  for (let i = 0; i < 1; i++) {
    await PULSE.tick();
  }
  const diffHighK = Math.abs(
    STATE_MATRIX.getPhase(102) - STATE_MATRIX.getPhase(103),
  );

  const snapshot: Snapshot = {
    diffLowK,
    diffHighK,
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

    if (payload.snapshot.diffHighK >= payload.snapshot.diffLowK) {
      throw new Error(
        `[kuramoto_sync_capture] High K did not synchronize faster! HighK Diff: ${payload.snapshot.diffHighK}, LowK Diff: ${payload.snapshot.diffLowK}`,
      );
    }

    console.log(
      `[kuramoto_sync_capture] ok hash=${payload.hash} diffLowK=${payload.snapshot.diffLowK} diffHighK=${payload.snapshot.diffHighK}`,
    );
  } finally {
    PULSE.stopWorkers();
  }
};

await main();
