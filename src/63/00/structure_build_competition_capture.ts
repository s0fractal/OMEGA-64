import { GRID_W } from "../../00/OFFSETS.ts";
import { PULSE } from "../PULSE.ts";
import { STATE_MATRIX, STRUCTURE } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_STRUCTURE_BUILD_COMPETITION_CAPTURE__";
const OP_ROLE = 0xA7;
const OP_BUILD = 0xA8;
const LOWER_STATE = 17;
const HIGHER_STATE = 91;

type Snapshot = {
  targetCellIdx: number;
  targetResolvedType: number;
  targetResolvedCharge: number;
  targetResolvedState: number;
  ownerIntentAfterTick: number;
  valueIntentAfterTick: number;
  chargeIntentAfterTick: number;
  lowerOwnerAtomIdx: number;
  lowerOwnerState: number;
  higherOwnerAtomIdx: number;
  higherOwnerState: number;
  lowerAtomPc: number;
  higherAtomPc: number;
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

const buildSourceScript = (state: number): Uint8Array => {
  const script = new Uint8Array(64);
  script[0] = OP_ROLE;
  script[1] = 0;
  script[2] = STATE_MATRIX.ROLE_ARCHITECT;
  script[3] = OP_BUILD;
  script[4] = STRUCTURE.SOURCE;
  script[5] = state & 0xFF;
  return script;
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const workerCount = Number(Deno.env.get("OMEGA_PULSE_WORKERS") ?? "1");
  const strictDeterminism =
    (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1";

  const x = 35;
  const y = 35;
  const gx = Math.floor(x / 10);
  const gy = Math.floor(y / 10);
  const targetCellIdx = gy * GRID_W + gx;

  STATE_MATRIX.seedAtom(
    2,
    2n,
    x,
    y,
    1000,
    1,
    undefined,
    buildSourceScript(LOWER_STATE),
  );
  STATE_MATRIX.seedAtom(
    3,
    3n,
    x,
    y,
    1000,
    1,
    undefined,
    buildSourceScript(HIGHER_STATE),
  );

  await PULSE.initWorkers(1);
  await PULSE.tick();

  const structureGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_GRID_OFFSET,
    GRID_W * 80,
  );
  const ownerIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET,
    GRID_W * 80,
  );
  const valueIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET,
    GRID_W * 80,
  );
  const chargeIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET,
    GRID_W * 80,
  );

  const targetCell = structureGrid[targetCellIdx];
  const snapshot: Snapshot = {
    targetCellIdx,
    targetResolvedType: targetCell & 0xFF,
    targetResolvedCharge: (targetCell >> 16) & 0xFF,
    targetResolvedState: (targetCell >> 24) & 0xFF,
    ownerIntentAfterTick: ownerIntents[targetCellIdx],
    valueIntentAfterTick: valueIntents[targetCellIdx],
    chargeIntentAfterTick: chargeIntents[targetCellIdx],
    lowerOwnerAtomIdx: 2,
    lowerOwnerState: LOWER_STATE,
    higherOwnerAtomIdx: 3,
    higherOwnerState: HIGHER_STATE,
    lowerAtomPc: STATE_MATRIX.getPC(2),
    higherAtomPc: STATE_MATRIX.getPC(3),
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

    if (payload.snapshot.targetResolvedType !== STRUCTURE.SOURCE) {
      throw new Error(
        `[structure_build_competition_capture] target type mismatch: ${payload.snapshot.targetResolvedType}`,
      );
    }
    if (payload.snapshot.targetResolvedCharge !== 255) {
      throw new Error(
        `[structure_build_competition_capture] target charge mismatch: ${payload.snapshot.targetResolvedCharge}`,
      );
    }
    if (payload.snapshot.targetResolvedState !== HIGHER_STATE) {
      throw new Error(
        `[structure_build_competition_capture] winner state mismatch: ${payload.snapshot.targetResolvedState}`,
      );
    }
    if (payload.snapshot.ownerIntentAfterTick !== 0) {
      throw new Error(
        `[structure_build_competition_capture] owner intent not cleared: ${payload.snapshot.ownerIntentAfterTick}`,
      );
    }
    if (payload.snapshot.valueIntentAfterTick !== 0) {
      throw new Error(
        `[structure_build_competition_capture] value intent not cleared: ${payload.snapshot.valueIntentAfterTick}`,
      );
    }
    if (payload.snapshot.chargeIntentAfterTick !== 0) {
      throw new Error(
        `[structure_build_competition_capture] charge intent not cleared: ${payload.snapshot.chargeIntentAfterTick}`,
      );
    }

    console.log(
      `[structure_build_competition_capture] ok hash=${payload.hash} targetType=${payload.snapshot.targetResolvedType} targetCharge=${payload.snapshot.targetResolvedCharge} targetState=${payload.snapshot.targetResolvedState}`,
    );
  } finally {
    PULSE.stopWorkers();
  }
};

await main();
