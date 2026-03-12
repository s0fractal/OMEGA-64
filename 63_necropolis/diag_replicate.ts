import { STATE_MATRIX } from "@00";
import { PULSE } from "@02";
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

console.log("BEFORE: opcode=0x" + STATE_MATRIX.getLogic(0)[0].toString(16));
const SPAWN_BASE = 1000000 + 37000000;
console.log(
  "BEFORE: spawn head=",
  new Int32Array(STATE_MATRIX.buffer, SPAWN_BASE, 1)[0],
);
await PULSE.tick();
console.log("AFTER: opcode=0x" + STATE_MATRIX.getLogic(0)[0].toString(16));
console.log(
  "AFTER: spawn head=",
  new Int32Array(STATE_MATRIX.buffer, SPAWN_BASE, 1)[0],
);
console.log("AFTER: energy=", STATE_MATRIX.getEnergy(0));
console.log("AFTER: resonance=", STATE_MATRIX.getResonance(0));
Deno.exit(0);
