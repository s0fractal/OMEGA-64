/**
 * [e/TEST_PURE_RIBOSOME.ts]
 * Tests the Real Ribosome (2.0) with Octal Scanning and Injection.
 */

import { RIBOSOME } from "../4/0/RIBOSOME/_.ts";

console.log("--- Booting Ribosome 2.0 ---");

// 1. Lift the Lattice (from Root)
const lattice = await RIBOSOME.lift();
console.log(`Lattice Assembly Complete. Atoms: ${lattice.size}`);

// Verify PURE_TEST (Moved to Highest Octave for Visibility)
const targetID = "7/7/PURE_TEST";
if (lattice.has(targetID)) {
  console.log(`✅ Found Octal Atom: ${targetID}`);
  const atom = lattice.get(targetID)!;
  console.log(`   Level: ${atom.level}`);
} else {
  console.error(`❌ Failed to find ${targetID} in Lattice!`);
  await Deno.writeTextFile(
    "lattice_keys.txt",
    JSON.stringify(Array.from(lattice.keys()), null, 2),
  );
  console.error("Lattice Keys written to lattice_keys.txt");
  Deno.exit(1);
}

// 2. Inject Context
console.log("\n--- Injecting Context ---");
const ctx = await RIBOSOME.inject(targetID, lattice);

if (!ctx) {
  console.error("❌ Injection Returned Null!");
  Deno.exit(1);
}

console.log("✅ Context Created with Siblings:", Object.keys(ctx.siblings));

// 3. Execute
console.log("\n--- Executing Logic ---");
const atom = lattice.get(targetID)!;

// The module might be { ATOM: fn } or default export.
// In PURE_TEST.ts we used: export const ATOM = ...
const logic = atom.module.ATOM || atom.module.default;

if (typeof logic === "function") {
  const result = logic(ctx);
  console.log("✅ Result:", result);
} else {
  console.error("❌ Module does not export a function!", atom.module);
}
