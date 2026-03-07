import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { rolesView } from "./PULSE.ts";

const active = STATE_MATRIX.getActiveIndices();
let producers = 0;
let architects = 0;
let guardians = 0;
let others = 0;

for (const idx of active) {
  const role = rolesView[idx];
  if (role === STATE_MATRIX.ROLE_PRODUCER) producers++;
  else if (role === STATE_MATRIX.ROLE_ARCHITECT) architects++;
  else if (role === STATE_MATRIX.ROLE_GUARDIAN) guardians++;
  else others++;
}

console.log(`Total active: ${active.length}`);
console.log(`Producers: ${producers}`);
console.log(`Architects: ${architects}`);
console.log(`Guardians: ${guardians}`);
console.log(`Others: ${others}`);
