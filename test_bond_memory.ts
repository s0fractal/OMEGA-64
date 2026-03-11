import * as OFFSETS from "./OFFSETS.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const memory = STATE_MATRIX.wasmMemory;
const buffer = memory.buffer;

const bondsJS = new Int32Array(
  buffer,
  OFFSETS.BONDS_OFFSET,
  OFFSETS.MAX_ATOMS * 4,
);

STATE_MATRIX.setBondTarget(2, 0, 1);
console.log(
  `[JS] Bond for Atom 2, Slot 0 written. Internal Array View:`,
  bondsJS[(2 * 4) + 0],
);

const dataView = new DataView(buffer);
const rawValue = dataView.getInt32(OFFSETS.BONDS_OFFSET + (2 * 4 * 4), true); // little endian I32
console.log(`[JS] Bond for Atom 2, Slot 0 via DataView:`, rawValue);
