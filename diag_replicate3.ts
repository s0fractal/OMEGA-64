import { STATE_MATRIX } from './STATE_MATRIX.ts';
import { PULSE } from './PULSE.ts';
await PULSE.initWorkers();

// Try using a VERY HIGH atom ID (>10n isolation check)
STATE_MATRIX.setId(0, 9999n);
STATE_MATRIX.setX(0, 305); STATE_MATRIX.setY(0, 400);
STATE_MATRIX.setEnergy(0, 5000); STATE_MATRIX.setResonance(0, 800);
STATE_MATRIX.setLogic(0, new Uint8Array([0x4A, 0xDE, 0xAD, 0xBE, 0xEF, 0x01, 0x02, 0x03]));

const SPAWN_BASE = 1000000 + 37000000;
const spawnView = new Int32Array(STATE_MATRIX.buffer, SPAWN_BASE, 1);
const en0 = STATE_MATRIX.getEnergy(0);
const re0 = STATE_MATRIX.getResonance(0);

await PULSE.tick();

const en1 = STATE_MATRIX.getEnergy(0);
const re1 = STATE_MATRIX.getResonance(0);
const spawnHead = spawnView[0];
const opAfter = STATE_MATRIX.getLogic(0)[0];

console.log(`en: ${en0} -> ${en1} (halved=${en1 < en0/2+100})`);
console.log(`re: ${re0} -> ${re1} (boosted=${re1 > re0})`);
console.log(`spawn_head: ${spawnHead} (should be >0 if ISA_REPLICATE fired)`);
console.log(`opcode_after: 0x${opAfter.toString(16)}`);
Deno.exit(0);
