import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
await PULSE.initWorkers();

STATE_MATRIX.setId(0, 1000n);
STATE_MATRIX.setX(0, 305);
STATE_MATRIX.setY(0, 400);
STATE_MATRIX.setEnergy(0, 3000);
STATE_MATRIX.setResonance(0, 400);
STATE_MATRIX.setLogic(
  0,
  new Uint8Array([0x4A, 0xDE, 0xAD, 0xBE, 0xEF, 0x01, 0x02, 0x03]),
);

// Read raw bytes directly from the SharedArrayBuffer at LOGIC_OFFSET + 0
const LOGIC_OFFSET = 1000000 + 2400000; // = 3400000
const raw = new Uint8Array(STATE_MATRIX.buffer, LOGIC_OFFSET, 8);
console.log(
  "Raw at 3400000:",
  Array.from(raw).map((b) => b.toString(16).padStart(2, "0")).join(" "),
);

// Read XS[0], YS[0]
const XS_OFF = 1000000 + 800000;
const YS_OFF = 1000000 + 1000000;
const xs0 = new Int16Array(STATE_MATRIX.buffer, XS_OFF, 1)[0];
const ys0 = new Int16Array(STATE_MATRIX.buffer, YS_OFF, 1)[0];
console.log(`XS[0]=${xs0} YS[0]=${ys0}`);

// Now what's at byte 3400000 + WHAT WASM thinks?
// WASM LOGIC_OFFSET = 3400000, atom 0: byte at offset 3400000
const byte_3400000 = new Uint8Array(STATE_MATRIX.buffer, 3400000, 1)[0];
console.log("Byte at absolute 3400000:", byte_3400000.toString(16));

Deno.exit(0);
