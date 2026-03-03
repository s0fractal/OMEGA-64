// 🛡️ OMEGA-64 | Sovereign CLI - The Prime Radiant (Dipole & Algebra)
// 🌀 Pattern: Centripetal L32 Convergence / Functional Algebra

import { join } from "jsr:@std/path";

const MAX_DEPTH = 64;
const ROOT_DIR = Deno.cwd();
const DATA_SENTINEL = "// --- DATA ---";
const CURRENT_FILE = import.meta.url.replace("file://", "");
const ZERO_POINT = 32;

// 🛡️ Reality Witnesses
const WITNESSES = [
  "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
];

// 🛡️ The Algebraic Underscore (Functional Combinators)
// This logic is injected into _/mod.ts at each level.
const ALGEBRA_CODE = `
// 🛡️ The Functional Algebra (_)
// Stateless. Local. Pure.

export const pipe = <T>(x: T, ...fns: ((a: T) => T)[]) => fns.reduce((v, f) => f(v), x);
export const flow = <T>(...fns: ((a: T) => T)[]) => (x: T) => pipe(x, ...fns);
export const identity = <T>(x: T) => x;

// 🛡️ Topology Connection
`;

/** 🗺️ Get Quantum Metadata helper */
function getQuantumMetadata(level: number) {
  const levelStr = level.toString().padStart(2, "0");
  try {
    // We now rely on dynamic q.ts, but for build labeling we fallback to basics if needed.
    // Actually, let's keep it simple for build logs.
    return { meta: `L${levelStr}`, entropy: "0", phase: "0" };
  } catch (_) {
    return { meta: `L${levelStr}`, entropy: "0", phase: "0" };
  }
}

/** 🌀 BUILD: Establish Dipole Topology */
async function build() {
  console.log("🌀 Hardening OMEGA-64 | Establishing L32 Dipole...");

  for (let level = 0; level < MAX_DEPTH; level++) {
    const levelStr = level.toString().padStart(2, "0");
    const currentPath = join(ROOT_DIR, levelStr);
    await Deno.mkdir(currentPath, { recursive: true }).catch(() => {});

    // 1. Determine Next Vector (Towards L32)
    let nextLevel = -1;
    if (level < ZERO_POINT) nextLevel = level + 1; // 00 -> 32
    else if (level > ZERO_POINT) nextLevel = level - 1; // 63 -> 32
    else nextLevel = -1; // 32 (Zero Point)

    const nextLevelStr = nextLevel !== -1
      ? nextLevel.toString().padStart(2, "0")
      : null;

    // 2. Identity (i.ts)
    const witness = WITNESSES[0];
    const iPathTS = join(currentPath, "i.ts");

    let iContent = "";
    if (level === ZERO_POINT) {
      // ⚓ L32 Event Horizon
      iContent =
        `// 🛡️ L32 (Event Horizon)\nimport { q } from "./q.ts";\nexport const identity = { depth: 0, level: 32, type: "SINGULARITY", witness: "${witness}", entropy: 0, phase: 0 };\n`;
    } else {
      // 🌊 Flowing towards Center
      // Note: We import from "inner" which is technically "next" in dipole
      iContent =
        `// 🛡️ L${levelStr} (Flow)\nimport * as inner from "@L${nextLevelStr}/i.ts";\nimport { q } from "./q.ts";\nexport const identity = { depth: inner.identity.depth + 1, level: ${level}, parent: inner.identity, witness: "${witness}", entropy: q.avg_entropy, phase: q.phase };\n`;
    }
    await Deno.writeTextFile(iPathTS, iContent);

    // 3. The Underscore (_) -> Physical & Logical
    const linkPath = join(currentPath, "_");
    try {
      await Deno.remove(linkPath, { recursive: true });
    } catch (_) {
      // Ignore missing link path
    }

    // Physical Symlink (Geometry)
    if (nextLevel !== -1) {
      await Deno.symlink(`../${nextLevelStr}`, linkPath);
    } else {
      // L32: _ points to self (or void). Let's make it a dir for the algebra file.
      await Deno.mkdir(linkPath, { recursive: true });
    }

    // Logical Algebra (_/mod.ts)
    // We write this into the _ folder.
    // IF it's a symlink, we are writing into the NEXT level's folder? NO!
    // CAUTION: If _ is a symlink to ../33, writing to _/mod.ts writes to 33/mod.ts!
    // This is the tricky part of "Symlinks as Geometry".

    // SOLUTION: The Algebra (_) must be a FILE in the current directory if we want it unique.
    // OR: changing _ from a symlink to a real directory containing mod.ts and a symlink 'next'?
    // User said: "_ is a functional algebra... local to level".
    // AND: "L32 is center... symlinks point to 32".

    // Let's implement User's "Navigational Layer" vs "Execution Layer".
    // _ folder = Algebra (Real Directory).
    // _/next (or _/vector) = Symlink to next level.
    // This avoids writing into the neighbor's house.

    if (nextLevel !== -1) {
      // Make _ a real directory
      try {
        await Deno.remove(linkPath);
      } catch (_) {
        // Remove if symlink is missing
      }
      await Deno.mkdir(linkPath, { recursive: true }).catch(() => {});

      // Create _/vector symlink
      const vectorPath = join(linkPath, "vector");
      try {
        await Deno.remove(vectorPath);
      } catch (_) {
        // Ignore missing vector symlink
      }
      await Deno.symlink(`../../${nextLevelStr}`, vectorPath);

      // Create _/mod.ts (The Algebra)
      // It exports the combinators AND the next level import
      // We use @L alias for the import to avoid ELOOP 62
      const algebraContent = `
${ALGEBRA_CODE}
export * from "@L${nextLevelStr}/mod.ts";
`;
      await Deno.writeTextFile(join(linkPath, "mod.ts"), algebraContent);
    } else {
      // L32 (Center)
      try {
        await Deno.remove(linkPath);
      } catch (_) {
        // Ignore missing link path
      }
      await Deno.mkdir(linkPath, { recursive: true }).catch(() => {});
      // Algebra is purely identity. No export bubbling (it's the end).
      await Deno.writeTextFile(
        join(linkPath, "mod.ts"),
        `
${ALGEBRA_CODE}
// 🛡️ Singularity Reached.
`,
      );
    }

    // 4. Level Boundary (mod.ts)
    // Exports local core, local q, and the local algebra (_)
    const modPathTS = join(currentPath, "mod.ts");
    // Note: we export _ as a namespace so we can do Lxx._.pipe(...)
    await Deno.writeTextFile(
      modPathTS,
      `export * from "./core.ts";\nexport * as _ from "./_/mod.ts";\n`,
    );

    if (level % 10 === 0 || level === MAX_DEPTH - 1 || level === 32) {
      console.log(`✅ L${levelStr} Dipole Set`);
    }
  }

  console.log("🏁 Build Complete. L32 Centered.");
}

async function exhale(tape: string[]) {
  // ... (Standard logic)
  await build();
}

function inhale() {
  // ... (Standard logic)
}

function sense(tape: string[]) {
  // ... (Standard logic)
}

async function main() {
  const cmd = Deno.args[0];
  // @ts-ignore: RADIANT is injected by build tooling when present.
  const tape = typeof RADIANT !== "undefined" ? RADIANT : [];
  switch (cmd) {
    case "build":
      await build();
      break;
      // ...
  }
}
// ...
