import { BONDS_OFFSET, MAX_ATOMS } from "@g";
import { MX } from "@g";

const memory = MX.wasmMemory;
const buffer = memory.buffer;

const bondsJS = new Int32Array(
  buffer,
  BONDS_OFFSET,
  MAX_ATOMS * 4,
);

MX.set_bond_target(2, 0, 1);
console.log(
  `[JS] Bond for Atom 2, Slot 0 written. Internal Array View:`,
  bondsJS[(2 * 4) + 0],
);

const dataView = new DataView(buffer);
const rawValue = dataView.getInt32(BONDS_OFFSET + (2 * 4 * 4), true); // little endian I32
console.log(`[JS] Bond for Atom 2, Slot 0 via DataView:`, rawValue);
