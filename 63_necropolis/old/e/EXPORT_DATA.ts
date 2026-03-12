// e/EXPORT_DATA.ts
// Exports the Q-Space state to JSON for 3D visualization.
// Canon-aware: reads relations + vectors from 0..8/**/_.yaml.

import { RIBOSOME } from "../4/0/RIBOSOME/_.ts";
import { Q_PHYSICS, QAtom } from "../4/0/Q_PHYSICS/_.ts";
import { parse } from "jsr:@std/yaml";

console.log("Scanning Real Q-Space Data (YAML Relations)...");

// 1. Lift Real Atoms
const lattice = await RIBOSOME.lift();
const atoms = new Map<string, QAtom>();
const edges: { source: string; target: string }[] = [];

// Helper for inline Q state (might still be in TS)
const RE_Q = /export\s+const\s+q\s+=\s+(\{[^;]+\})/;

const findByName = (name: string): string | null => {
  for (const key of lattice.keys()) {
    const parts = key.split("/");
    const tag = parts[parts.length - 1];
    if (tag === name) return key;
  }
  return null;
};

for (const [id, atom] of lattice) {
  let L = 0, D = 0, V = 0;
  let sector = 0, orbit = 0, variant = 0;
  let vector = "";
  let q = { hue: 0, phi: 0, evt: 0 };
  let forces: any = undefined;
  let deps: string[] = [];

  try {
    // Canon YAML sidecar: <sector>/<orbit>/<ATOM>/_.yaml
    const yamlPath = `./${id}/_.yaml`;
    let yamlContent = "";
    try {
      yamlContent = await Deno.readTextFile(yamlPath);
    } catch {}

    if (yamlContent) {
      try {
        const meta = parse(yamlContent) as any;

        // Parse Vector
        if (meta.vector) {
          vector = String(meta.vector);
          const parts = vector.split(".");
          if (parts.length === 3) {
            sector = parseInt(parts[0]);
            orbit = parseInt(parts[1]);
            variant = parseInt(parts[2]);
          }
        }

        // Parse Relations (Dependencies)
        if (
          meta.relations && meta.relations.use &&
          Array.isArray(meta.relations.use)
        ) {
          const uses = meta.relations.use;

          for (const targetName of uses) {
            const key = findByName(String(targetName));
            if (key) {
              deps.push(key);
              edges.push({ source: id, target: key });
            }
          }
        }

        // Inline Q state from YAML if present
        if (meta.q) {
          if (typeof meta.q.hue === "number") q.hue = meta.q.hue;
          if (typeof meta.q.phi === "number") q.phi = meta.q.phi;
          if (typeof meta.q.evt === "number") q.evt = meta.q.evt;
        }

        if (meta.forces) {
          forces = meta.forces;
        }
      } catch (e) {
        console.error(`Error parsing YAML for ${id}`, e);
      }
    }

    // Fallback L from canonical id if YAML missing
    if (!vector) {
      const parts = id.split("/");
      const s = parseInt(parts[0] ?? "0");
      const o = parseInt(parts[1] ?? "0");
      if (Number.isFinite(s) && Number.isFinite(o)) {
        sector = s;
        orbit = o;
        variant = 0;
      }
    }

    // Derive semantic level from octal sector/orbit
    L = sector === 8 ? 63 : (sector * 8 + orbit);
    D = orbit;
    V = variant;

    // 2. Read TS file ONLY for Q-State (Behavior) if needed
    let tsContent = "";
    try {
      tsContent = await Deno.readTextFile(`./${id}/_.ts`);
    } catch {}

    if (tsContent) {
      const qMatch = tsContent.match(RE_Q);
      if (qMatch) {
        try {
          const hueM = tsContent.match(/hue:\s*(-?\d+)/);
          const phiM = tsContent.match(/phi:\s*(-?\d+)/);
          const evtM = tsContent.match(/evt:\s*(-?\d+)/);
          if (hueM) q.hue = parseInt(hueM[1]);
          if (phiM) q.phi = parseInt(phiM[1]);
          if (evtM) q.evt = parseInt(evtM[1]);
        } catch (e) {}
      } else if (!yamlContent) {
        q.hue = L % 6;
      }
    }
  } catch (e) {
    console.error(`Error processing ${id}:`, e);
  }

  // Radial Inversion:
  // L (Level) 63 = Singularity (Center) = Radius 1
  // L (Level) 0 = Surface (Edge) = Radius 64
  // Physics operates on R (Radius).
  let R = 64 - L; // Inverted Radius for Physics
  if (R < 1) R = 1; // Singularity limit

  atoms.set(id, {
    id,
    L: R, // Physics uses L as Radius (Legacy name in QAtom, effectively R now)
    targetL: 64 - L, // Target Radius is also inverted

    // Custom Fields for Export/Debug
    level: L, // Semantic Level (0-63)

    D,
    V,
    sector,
    orbit,
    variant,
    vector,
    q,
    mass: deps.length,
    forces,
  } as any); // Cast to any to allow extra 'level' field
}

console.log(`Loaded ${atoms.size} atoms. Found ${edges.length} connections.`);
console.log("Simulating Physics with Structural Support...");

// 2. Run Physics
const finalText = Q_PHYSICS.simulate(atoms, edges, 150); // Increased iterations for settling

// 3. Write Back Mutation (The Quine Cycle)
console.log("Mutating YAML Vectors...");
let mutations = 0;

for (const [id, atom] of finalText) {
  if (atom.id.startsWith("mirror")) continue;

  // Compare against original LEVEL
  const oldL = (atoms.get(id) as any)?.level || 0;

  // Physics 'L' is actually Radius 'R'. Convert back to Level.
  const simR = atom.L;
  let newLevel = 64 - simR;
  if (newLevel < 0) newLevel = 0;
  if (newLevel > 63) newLevel = 63;

  const pad2 = (n: number) => String(Math.round(n)).padStart(2, "0");
  const newVector = `${pad2(newLevel)}.${pad2(atom.D)}.${pad2(atom.V)}`;

  const yamlPath = `./${id}/_.yaml`;
  try {
    const content = await Deno.readTextFile(yamlPath);
    const updated = content.replace(
      /vector:\s*['"]?[\d\.]+['"]?/,
      `vector: ${newVector}`,
    );
    if (content !== updated) {
      await Deno.writeTextFile(yamlPath, updated);
      mutations++;
    }
  } catch (e) {
    // ignore missing yaml
  }
}
console.log(`Mutated ${mutations} atoms in YAML.`);

// 4. Export
const exportData = {
  nodes: Array.from(finalText.values()).map((a: any) => ({
    id: a.id,
    L: a.L, // Visual Radius
    level: (a as any).level, // Semantic Level
    D: a.D,
    V: a.V,
    sector: (a as any).sector,
    orbit: (a as any).orbit,
    variant: (a as any).variant,
    vector: (a as any).vector,
    tension: (a.forces && typeof a.forces.tension === "number")
      ? a.forces.tension
      : (a.mass || 0),
    forces: a.forces,
    isMirror: a.id.startsWith("mirror"),
    debug: a.debug, // Force Vectors
  })),
  links: edges,
};

const json = JSON.stringify(exportData, null, 2);
await Deno.writeTextFile("e/q_data.json", json);
console.log(`Exported data to e/q_data.json`);
