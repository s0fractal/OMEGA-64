import { PULSE } from "../PULSE.ts";
import { RISC, STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_RESOLUTION_PHASE_CAPTURE__";

type Snapshot = {
  survivalCount: number;
  finalPhaseAvg: number;
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

  // High K - Cluster of atoms
  const atomicBuffer = new Int32Array(STATE_MATRIX.buffer);
  atomicBuffer[40700104 / 4] = 15000; // NEURAL_COHERENCE_OFF drives K > Kc

  for (let i = 0; i < 10; i++) {
    STATE_MATRIX.seedAtom(
      100 + i,
      10n,
      500,
      500,
      2000,
      100,
      undefined,
      codeRes,
    );
    STATE_MATRIX.setPhase(100 + i, i * 20); // Distributed phases
  }

  await PULSE.initWorkers(1);

  for (let i = 0; i < 10; i++) {
    await PULSE.tick();
  }

  let survivalCount = 0;
  let finalPhaseSum = 0;
  for (let i = 0; i < 10; i++) {
    if (STATE_MATRIX.getEnergy(100 + i) > 0) {
      survivalCount++;
      finalPhaseSum += STATE_MATRIX.getPhase(100 + i);
    }
  }

  const snapshot: Snapshot = {
    survivalCount,
    finalPhaseAvg: survivalCount > 0
      ? Math.floor(finalPhaseSum / survivalCount)
      : 0,
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

    if (payload.snapshot.survivalCount === 0) {
      throw new Error(`[resolution_phase_capture] No atoms survived!`);
    }

    console.log(
      `[resolution_phase_capture] ok hash=${payload.hash} survivalCount=${payload.snapshot.survivalCount} finalPhaseAvg=${payload.snapshot.finalPhaseAvg}`,
    );
  } finally {
    PULSE.stopWorkers();
  }
};

await main();
