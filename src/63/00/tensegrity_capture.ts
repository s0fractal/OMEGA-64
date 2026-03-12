import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_TENSEGRITY_CAPTURE__";

type Snapshot = {
  initialDistance: number;
  finalDistance: number;
  finalDamping: number;
  atom0X: number;
  atom0Y: number;
  atom1X: number;
  atom1Y: number;
};

type CapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: Snapshot;
};

type WasmExports = {
  execute_atom: (idx: number) => void;
};

const hashHex = async (payload: string): Promise<string> => {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const loadWasm = async (): Promise<WasmExports> => {
  const wasmBytes = await Deno.readFile("src/00/release.wasm");
  const trace_atom = (
    _idx: number,
    _op: number,
    _gx: number,
    _gy: number,
    _target: number,
  ) => {};
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      trace_atom,
      abort: () => {},
    },
  });
  return instance.exports as unknown as WasmExports;
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const wasm = await loadWasm();

  // OP_TENSEGRITY mode=0 (SET_BOND_DIST), slot=0, dist=100
  const script = new Uint8Array(64);
  script[0] = 0xA5;
  script[1] = 0;
  script[2] = 0;
  script[3] = 100;
  script[4] = 0xA5;
  script[5] = 1;
  script[6] = 255;
  script[7] = 0; // SET_DAMPING 255

  STATE_MATRIX.seedAtom(0, 1n, 100, 100, 5000, 100, undefined, script);
  STATE_MATRIX.seedAtom(1, 2n, 110, 110, 5000, 100);

  STATE_MATRIX.setBondTarget(0, 0, 1);
  STATE_MATRIX.setBondStiffness(0, 0, 0.9);

  const initialDistance = Math.hypot(
    STATE_MATRIX.getX(1) - STATE_MATRIX.getX(0),
    STATE_MATRIX.getY(1) - STATE_MATRIX.getY(0),
  );

  for (let t = 0; t < 100; t++) {
    wasm.execute_atom(0);
    wasm.execute_atom(1);

    const x0 = STATE_MATRIX.getX(0);
    const y0 = STATE_MATRIX.getY(0);
    const x1 = STATE_MATRIX.getX(1);
    const y1 = STATE_MATRIX.getY(1);

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy) || 1;
    const targetDist = STATE_MATRIX.getBondDistance(0, 0) || 50;
    const stiffness = STATE_MATRIX.getBondStiffness(0, 0);

    if (stiffness > 0.8) {
      const force = (dist - targetDist) * 0.5;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      const d0 = 1 - (STATE_MATRIX.getDamping(0) / 255);
      const d1 = 1 - (STATE_MATRIX.getDamping(1) / 255);

      STATE_MATRIX.setX(0, x0 + fx * d0);
      STATE_MATRIX.setY(0, y0 + fy * d0);
      STATE_MATRIX.setX(1, x1 - fx * d1);
      STATE_MATRIX.setY(1, y1 - fy * d1);
    }
  }

  const finalDistance = Math.hypot(
    STATE_MATRIX.getX(1) - STATE_MATRIX.getX(0),
    STATE_MATRIX.getY(1) - STATE_MATRIX.getY(0),
  );

  const snapshot: Snapshot = {
    initialDistance,
    finalDistance,
    finalDamping: STATE_MATRIX.getDamping(0),
    atom0X: STATE_MATRIX.getX(0),
    atom0Y: STATE_MATRIX.getY(0),
    atom1X: STATE_MATRIX.getX(1),
    atom1Y: STATE_MATRIX.getY(1),
  };

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

  console.log(
    `[tensegrity_capture] ok hash=${payload.hash} initDist=${
      payload.snapshot.initialDistance.toFixed(2)
    } finalDist=${
      payload.snapshot.finalDistance.toFixed(2)
    } damping=${payload.snapshot.finalDamping}`,
  );
};

await main();
