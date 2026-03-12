// OMEGA-64 | RIBOSOME_ZERO.ts | Proof of Life simulation
// Demonstrates Zero-IOPS logic extraction and Spooky Action at a Distance.

import { CRYSTAL } from "./CRYSTAL_DIGEST.ts";

const ROOT = "./";

async function runZeroCycle() {
  console.log(
    "%c🛡️🧿 OMEGA-64 | RIBOSOME ZERO CYCLE: INITIATED 🧿🛡️",
    "color: cyan; font-weight: bold;",
  );
  console.log("--------------------------------------------------");

  const atoms: { name: string; digest: string }[] = [];

  // 1. SCAN PHASE (Zero-IOPS Perception)
  console.log("\n🌀 1. SCAN PHASE: Reading Flatland vectors...");
  for await (const entry of Deno.readDir(ROOT)) {
    if (entry.isFile && /^0x[0-9A-F]{16}\.[A-Z0-9_]+\.md$/i.test(entry.name)) {
      const digest = entry.name.split(".")[0].slice(2);
      atoms.push({ name: entry.name, digest });
      console.log(`   [FOUND] ${entry.name.padEnd(50)} 0x${digest}`);
    }
  }

  if (atoms.length === 0) {
    console.error("❌ No 64-bit atoms found in root! Run CRYSTALLIZE first.");
    return;
  }

  // 2. PERCEPTION PHASE (Logic Extraction from Address)
  console.log("\n🌀 2. PERCEPTION PHASE: Extracting logic from names...");
  atoms.forEach((atom) => {
    const decoded = CRYSTAL.decode64(atom.digest);
    console.log(`   [ID]   ${atom.name}`);
    console.log(`   [LOGIC] ${decoded.logic}`);
  });

  // 3. EVENT PHASE (Simulating a Phase Shift in KAIROS)
  const kairos = atoms.find((a) => a.name.includes("KAIROS"));
  if (!kairos) return;

  console.log(
    `\n🌀 3. EVENT PHASE: Triggering Phase Shift in ${kairos.name}...`,
  );
  console.log(
    "%c💥 KAIROS: CONTRACTION OBSERVED! 💥",
    "color: yellow; font-weight: bold;",
  );

  // 4. ENTANGLEMENT PHASE (Spooky Action at a Distance)
  console.log(
    "\n🌀 4. ENTANGLEMENT PHASE: Propagating resonance through quantum masks...",
  );

  // Extract quantum masks (last 4 chars)
  const knownMasks = atoms.map((a) => ({
    name: a.name,
    mask: a.digest.slice(-4),
  }));

  atoms.forEach((atom) => {
    const myMask = atom.digest.slice(-4);

    // Find partners that share the SAME mask
    // In a real system, these masks are assigned intentionally.
    // For simulation, we'll pretend STALKER and GENESIS share a resonance if we trigger one.
    const partners = atoms.filter((a) =>
      a.digest !== atom.digest && a.digest.endsWith(myMask)
    );

    // Artificial entanglement for demo purposes if no "natural" ones exist
    let demoPartners = [...partners];
    if (atom.name.includes("KAIROS")) {
      const stalker = atoms.find((a) => a.name.includes("STALKER"));
      if (stalker) demoPartners.push(stalker);
    }

    if (demoPartners.length > 0) {
      console.log(
        `\n   %c✨ SPOOKY ACTION: ${atom.name} ✨`,
        "color: magenta; font-weight: bold;",
      );
      demoPartners.forEach((p) => {
        console.log(
          `      -> Entangled partner detected: %c${p.name}`,
          "color: yellow;",
        );
        console.log(`         Address: 0x${p.digest}`);
        console.log(
          `      -> Synchronizing phase matrix... %c[DONE]`,
          "color: green;",
        );
      });
    }
  });

  console.log("\n--------------------------------------------------");
  console.log(
    "%c🛡️ OMEGA-64 | RESONANCE STABILIZED | ERA 3 ACTIVE 🛡️",
    "color: cyan; font-weight: bold;",
  );
}

await runZeroCycle();
