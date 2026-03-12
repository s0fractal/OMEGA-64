import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_SHARE_TRANSFER_CAPTURE__";
const OP_SHARE = 0x83;
const SHARE_PERCENT = 50;
const ENERGY_EPSILON = 0.0011;
const EXPECTED_SUCCESSFUL_SENDER_ENERGY = 499.999;
const EXPECTED_SUCCESSFUL_RECEIVER_ENERGY = 600;
const EXPECTED_FAILED_SENDER_ENERGY = 999.999;
const EXPECTED_FAILED_RECEIVER_ENERGY = 100;

type AtomSnapshot = {
  idx: number;
  energy: number;
  pc: number;
  role: number;
};

type Snapshot = {
  successfulSenderEnergy: number;
  successfulReceiverEnergy: number;
  failedSenderEnergy: number;
  failedReceiverEnergy: number;
  senderBondTarget: number;
  failedBondTarget: number;
  atoms: AtomSnapshot[];
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
  return Array.from(new Uint8Array(digest)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
};

const assertApproxEnergy = (
  label: string,
  actual: number,
  expected: number,
): void => {
  if (Math.abs(actual - expected) > ENERGY_EPSILON) {
    throw new Error(
      `[share_transfer_capture] ${label} mismatch: actual=${actual} expected=${expected}`,
    );
  }
};

const shareScript = (slot: number, percentage: number): Uint8Array => {
  const script = new Uint8Array(64);
  script[0] = OP_SHARE;
  script[1] = slot & 0xFF;
  script[2] = percentage & 0xFF;
  return script;
};

const buildSnapshot = (): Snapshot => ({
  successfulSenderEnergy: STATE_MATRIX.getEnergy(0),
  successfulReceiverEnergy: STATE_MATRIX.getEnergy(1),
  failedSenderEnergy: STATE_MATRIX.getEnergy(2),
  failedReceiverEnergy: STATE_MATRIX.getEnergy(3),
  senderBondTarget: STATE_MATRIX.getBondTarget(0, 0),
  failedBondTarget: STATE_MATRIX.getBondTarget(2, 0),
  atoms: [0, 1, 2, 3].map((idx) => ({
    idx,
    energy: STATE_MATRIX.getEnergy(idx),
    pc: STATE_MATRIX.getPC(idx),
    role: STATE_MATRIX.getRole(idx),
  })),
});

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const wasmBytes = await Deno.readFile("src/00/release.wasm");
  const trace_atom = (
    _idx: number,
    _op: number,
    _p1: number,
    _p2: number,
    _p3: number,
  ) => {};
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      trace_atom,
      abort: () => {},
    },
  });
  const execute_atom = instance.exports.execute_atom as (idx: number) => void;
  const reduce_atom_deltas = instance.exports.reduce_atom_deltas as (
    startIdx: number,
    endIdx: number,
  ) => void;

  const readXs = new Int16Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_XS_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );
  const readYs = new Int16Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_YS_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );
  const readEnergies = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );
  const readResonances = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );
  const xs = new Int16Array(
    STATE_MATRIX.buffer,
    OFFSETS.XS_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );
  const ys = new Int16Array(
    STATE_MATRIX.buffer,
    OFFSETS.YS_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );
  const energies = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.ENERGY_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );
  const resonances = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.RESONANCE_OFFSET,
    STATE_MATRIX.MAX_ATOMS,
  );

  STATE_MATRIX.seedAtom(
    0,
    1n,
    100,
    100,
    1000,
    0,
    undefined,
    shareScript(0, SHARE_PERCENT),
  );
  STATE_MATRIX.seedAtom(1, 2n, 110, 100, 100, 0, undefined, new Uint8Array(64));
  STATE_MATRIX.setBondTarget(0, 0, 1);

  STATE_MATRIX.seedAtom(
    2,
    3n,
    120,
    100,
    1000,
    0,
    undefined,
    shareScript(0, SHARE_PERCENT),
  );
  STATE_MATRIX.seedAtom(3, 4n, 130, 100, 100, 0, undefined, new Uint8Array(64));

  readXs.set(xs);
  readYs.set(ys);
  readEnergies.set(energies);
  readResonances.set(resonances);

  execute_atom(0);
  execute_atom(2);
  reduce_atom_deltas(0, 4);

  const snapshot = buildSnapshot();
  const hash = await hashHex(JSON.stringify(snapshot));
  return {
    workerCount: Number(Deno.env.get("OMEGA_PULSE_WORKERS") ?? "1"),
    strictDeterminism: (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1",
    hash,
    snapshot,
  };
};

const main = async () => {
  const payload = await runCapture();
  if (Deno.args.includes("--capture")) {
    console.log(`${CAPTURE_MARKER}${JSON.stringify(payload)}`);
    return;
  }

  assertApproxEnergy(
    "successful sender",
    payload.snapshot.successfulSenderEnergy,
    EXPECTED_SUCCESSFUL_SENDER_ENERGY,
  );
  assertApproxEnergy(
    "successful receiver",
    payload.snapshot.successfulReceiverEnergy,
    EXPECTED_SUCCESSFUL_RECEIVER_ENERGY,
  );
  assertApproxEnergy(
    "failed sender",
    payload.snapshot.failedSenderEnergy,
    EXPECTED_FAILED_SENDER_ENERGY,
  );
  assertApproxEnergy(
    "failed receiver",
    payload.snapshot.failedReceiverEnergy,
    EXPECTED_FAILED_RECEIVER_ENERGY,
  );
  console.log(
    `[share_transfer_capture] ok hash=${payload.hash} sender0=${payload.snapshot.successfulSenderEnergy} receiver1=${payload.snapshot.successfulReceiverEnergy} sender2=${payload.snapshot.failedSenderEnergy}`,
  );
};

await main();
