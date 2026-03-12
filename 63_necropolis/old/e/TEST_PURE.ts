/**
 * [e/TEST_PURE.ts]
 * Simulates the Ribosome injecting dependencies into a Pure Atom.
 */

import { parse } from "jsr:@std/yaml";

// 1. Define the Universe (Available Atoms)
const UNIVERSE = {
  // L0 Utility
  LOG: (msg: string) => console.log(`[LOG] ${msg}`),

  // L1 Math
  ADD: (a: number, b: number) => a + b,
  // L2 ... etc
};

// 2. Load the Atom
const ATOM_PATH = "i/0/0/PURE_TEST/_.ts";
const YAML_PATH = "i/0/0/PURE_TEST/_.yaml";

console.log(`Loading Atom: ${ATOM_PATH}`);

// 2a. Read Metadata
const yamlText = await Deno.readTextFile(YAML_PATH);
const meta = parse(yamlText) as any;
console.log(`Dependencies needed:`, meta.relations.use);

// 2b. Import the Logic (Dynamic Import)
const module = await import(`../${ATOM_PATH}`);
const atomLogic = module.ATOM;

// 3. Construct Context (Injection)
const CTX = {
  siblings: {} as any,
};

// Resolve Dependencies
for (const dep of meta.relations.use) {
  if ((UNIVERSE as any)[dep]) {
    CTX.siblings[dep] = (UNIVERSE as any)[dep];
  } else {
    console.error(`Missing Dependency: ${dep}`);
  }
}

// 4. Execute
console.log("--- Executing Atom ---");
const result = atomLogic(CTX);
console.log("--- Result ---");
console.log(result);
