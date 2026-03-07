import { COLDSTART_BOOTSTRAP } from "./COLDSTART_BOOTSTRAP.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { rolesView } from "./PULSE.ts";

console.log("Starting forced bootstrap...");

const activeBefore = STATE_MATRIX.getActiveIndices().length;
console.log(`Active atoms before: ${activeBefore}`);

const result = COLDSTART_BOOTSTRAP.seed({
  ...RUNTIME_POLICY.coldstart,
  enabled: true, // Force it
});

console.log("Bootstrap result:", result);

const activeAfter = STATE_MATRIX.getActiveIndices();
console.log(`Active atoms after: ${activeAfter.length}`);

let guardians = 0;
for (const idx of activeAfter) {
  if (rolesView[idx] === STATE_MATRIX.ROLE_GUARDIAN) guardians++;
}
console.log(`Guardians seeded: ${guardians}`);
