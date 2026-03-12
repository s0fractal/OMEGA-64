import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_COLLECTIVE_BANKING_CAPTURE__";

const OP_COLLECTIVE = 0xA6;
const CELL_X = 105;
const CELL_Y = 105;
const INITIAL_HIVE_BALANCE = 250;
const DEPOSIT_VALUE = 80;
const WITHDRAW_CAP = 100;

type AtomSnapshot = {
  idx: number;
  energy: number;
  pc: number;
  role: number;
  reg0: number;
};

type Snapshot = {
  initialHiveBalance: number;
  finalHiveBalance: number;
  depositValueRaw: number;
  withdrawCapRaw: number;
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

const collectiveScript = (
  mode: number,
  p2: number,
  p3: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  script[0] = OP_COLLECTIVE;
  script[1] = mode & 0xFF;
  script[2] = p2 & 0xFF;
  script[3] = p3 & 0xFF;
  return script;
};

const buildSnapshot = (): Snapshot => ({
  initialHiveBalance: INITIAL_HIVE_BALANCE,
  finalHiveBalance: STATE_MATRIX.getHiveBalance(),
  depositValueRaw: DEPOSIT_VALUE,
  withdrawCapRaw: WITHDRAW_CAP,
  atoms: [0, 1].map((idx) => ({
    idx,
    energy: STATE_MATRIX.getEnergy(idx),
    pc: STATE_MATRIX.getPC(idx),
    role: STATE_MATRIX.getRole(idx),
    reg0: STATE_MATRIX.getReg(idx, 0),
  })),
});

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();
  STATE_MATRIX.setHiveBalance(INITIAL_HIVE_BALANCE);

  const wasmBytes = await Deno.readFile("../../00/release.wasm");
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
    CELL_X,
    CELL_Y,
    5000,
    100,
    undefined,
    collectiveScript(3, DEPOSIT_VALUE, 0),
  );
  STATE_MATRIX.seedAtom(
    1,
    2n,
    CELL_X,
    CELL_Y,
    5000,
    100,
    undefined,
    collectiveScript(4, 0, 0),
  );

  readXs.set(xs);
  readYs.set(ys);
  readEnergies.set(energies);
  readResonances.set(resonances);

  execute_atom(0);
  execute_atom(1);

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

  const depositor = payload.snapshot.atoms[0];
  const withdrawer = payload.snapshot.atoms[1];
  if (payload.snapshot.finalHiveBalance !== 230) {
    throw new Error(
      `[collective_banking_capture] finalHiveBalance mismatch: ${payload.snapshot.finalHiveBalance}`,
    );
  }
  if (Math.abs((depositor?.energy ?? 0) - 4999.92) > 0.0011) {
    throw new Error(
      `[collective_banking_capture] depositor energy mismatch: ${
        depositor?.energy ?? -1
      }`,
    );
  }
  if (Math.abs((withdrawer?.energy ?? 0) - 5000.1) > 0.0011) {
    throw new Error(
      `[collective_banking_capture] withdrawer energy mismatch: ${
        withdrawer?.energy ?? -1
      }`,
    );
  }
  if ((withdrawer?.reg0 ?? -1) !== WITHDRAW_CAP) {
    throw new Error(
      `[collective_banking_capture] withdraw reg0 mismatch: ${
        withdrawer?.reg0 ?? -1
      }`,
    );
  }
  console.log(
    `[collective_banking_capture] ok hash=${payload.hash} hive=${payload.snapshot.finalHiveBalance} deposit_energy=${
      depositor?.energy ?? -1
    } withdraw_energy=${withdrawer?.energy ?? -1} reg0=${
      withdrawer?.reg0 ?? -1
    }`,
  );
};

await main();
