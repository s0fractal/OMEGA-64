import { Q_PHYSICS, Q_PHYSICS_QAtom as QAtom } from "@generated";

const atoms = new Map<string, QAtom>();

// Seed atoms
atoms.set("i.L00.core.VOID.ts", {
  id: "i.L00.core.VOID.ts",
  L: 0,
  D: 0,
  V: 0,
  q: { hue: 0, phi: 0, evt: 0 },
  anchor: true,
});

atoms.set("i.L02.core.PLANETARY.ts", {
  id: "i.L02.core.PLANETARY.ts",
  L: 10,
  D: 23,
  V: 2,
  q: { hue: 2, phi: 348, evt: 30686 },
});

atoms.set("i.L32.core.RIBOSOME.ts", {
  id: "i.L32.core.RIBOSOME.ts",
  L: 32,
  D: 0,
  V: 1,
  q: { hue: 4, phi: 90, evt: 1000 },
});

console.log("--- Initial State ---");
console.log(atoms);

console.log("\n--- Running Simulation ---");
const endState = Q_PHYSICS.simulate(atoms, 50);

console.log("\n--- Final State (Spinal Gravity Active) ---");
for (const [id, atom] of endState) {
  const tension = atom.mass || 0; // Stored in mass
  const drift = tension > 5 ? "⚠️ HIGH TENSION" : "✅ ALIGNED";

  if (id.startsWith("mirror")) {
    console.log(
      `[MIRROR] ${
        id.padEnd(30)
      }: L=${atom.L} D=${atom.D} T=${tension} ${drift}`,
    );
  } else {
    console.log(
      `[REAL]   ${
        id.padEnd(30)
      }: L=${atom.L} D=${atom.D} T=${tension} ${drift}`,
    );
  }
}
