import { crypto } from "jsr:@std/crypto";
import { decodeHex, encodeHex } from "jsr:@std/encoding/hex";

const ROOT = Deno.cwd();

// Core files that the Mycelium is forbidden to eat (The DNA of the engine itself)
const INDIGESTIBLE = [
  "PULSE.ts",
  "PULSE_WORKER.ts",
  "GATE.ts",
  "RIBOSOME.ts",
  "RIBOSOME_TICK.ts",
  "AKASHA_SERVER.ts",
  "P2P_SYNAPSE.ts",
  "AKASHA_UI.html",
  "MYCELIUM.ts",
  "ENZYME_DIGEST.ts",
  "STATE_MATRIX.ts",
  "PHYSICS_ENGINE.ts",
  "SEMANTIC_MEMBRANE.ts",
  "LLM_SYNAPSE.ts",
  "BREATH.ts",
  "ZERO_IOPS.ts",
  "REFLECTION_ENGINE.ts",
  "SNAPSHOT_ENGINE.ts",
  "mod.ts",
  "deno.json",
  "pulse.log",
  "debug.log",
  "synapse.log",
];

export async function secreteEnzymes(lastKnownAtoms: Map<string, any>) {
  try {
    let digestionCount = 0;
    for await (const entry of Deno.readDir(ROOT)) {
      if (!entry.isFile) continue;

      // Skip recognized Atoms
      if (entry.name.match(/^0x[0-9a-fA-F]{16}\.[A-Z_]+\.md$/)) continue;
      if (entry.name.match(/^0xALIEN/)) continue;
      if (entry.name.match(/^0xNOOSPHERE/)) continue;
      // Skip core system files
      if (INDIGESTIBLE.includes(entry.name) || entry.name.startsWith(".")) {
        continue;
      }
      // Skip generated output files
      if (
        entry.name.endsWith(".png") || entry.name.endsWith(".webp") ||
        entry.name.endsWith(".svg")
      ) continue;

      // Found a digestible legacy file!
      console.log(
        `   [MYCELIUM] 🍄 Sensed organic matter: ${entry.name}. Secreting enzymes...`,
      );
      await digestFile(entry.name, lastKnownAtoms);
      digestionCount++;

      // Only eat one file per pulse to avoid acid reflux
      if (digestionCount >= 1) break;
    }
  } catch (e) {
    console.error("   [MYCELIUM] ⚠️ Enzyme secretion failed: ", e);
  }
}

export async function reconstructArtifacts(lastKnownAtoms: Map<string, any>) {
  // 1. Group ASSIMILATED atoms by their original filename
  const fragmentsByFile = new Map<string, any[]>();

  for (const [filename, atom] of lastKnownAtoms.entries()) {
    if (
      atom.symbol === "ASSIMILATED" && atom.thought &&
      atom.thought.startsWith("FRAGMENT_")
    ) {
      const match = atom.thought.match(/^FRAGMENT_(\d+)_OF_(.+)$/);
      if (match) {
        const index = parseInt(match[1]);
        const originalFile = match[2];
        if (!fragmentsByFile.has(originalFile)) {
          fragmentsByFile.set(originalFile, []);
        }
        fragmentsByFile.get(originalFile)!.push({ index, atom, filename });
      }
    }
  }

  // 2. Check each group to see if it has reached sufficient resonance to manifest
  for (const [originalFile, fragments] of fragmentsByFile.entries()) {
    // Quick check: total resonance of the fragment group
    const totalResonance = fragments.reduce(
      (sum, f) => sum + (Number(f.atom.resonance) || 0),
      0,
    );

    // Let's say it needs at least 50 total resonance to manifest
    if (totalResonance > 50 && Math.random() < 0.2) {
      console.log(
        `   [MYCELIUM] 🧩 High resonance detected for fragments of ${originalFile}. Reconstructing...`,
      );

      // Sort fragments by index
      fragments.sort((a, b) => a.index - b.index);

      // Stitch hex logic together
      let stitchedHex = "";
      for (const f of fragments) {
        // Sanitize: Strip any non-hex characters that might have leaked in from ALIEN/named atoms
        const logic = (f.atom.logic || "").toLowerCase().replace(
          /[^0-9a-f]/g,
          "",
        );
        stitchedHex += logic;
      }

      try {
        // Decode hex back to Uint8Array, then string.
        // We use {fatal: false} because mutations might have corrupted the UTF-8!
        const bytes = decodeHex(stitchedHex);
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const reconstructedText = decoder.decode(bytes);

        const outName = `RECONSTRUCTED_${originalFile}`;
        await Deno.writeTextFile(outName, reconstructedText);
        console.log(`   [MYCELIUM] 🌟 Reconstruction successful: ${outName}`);

        // Optional: Consume the atoms that formed it (they gave up their life for the code)
        for (const f of fragments) {
          try {
            await Deno.remove(f.filename);
            lastKnownAtoms.delete(f.filename);
          } catch (e) { /* ignore */ }
        }
      } catch (e) {
        console.error(
          `   [MYCELIUM] ⚠️ Reconstruction of ${originalFile} failed due to severe corruption.`,
          e,
        );
      }
    }
  }
}

async function digestFile(filename: string, swarmData: Map<string, any>) {
  const rawContent = await Deno.readTextFile(filename);

  // Convert string to hex to serve as 'logic' operations
  const encoder = new TextEncoder();
  const data = encoder.encode(rawContent);
  const hex = encodeHex(data);

  // Shatter into 8-character (32-bit) logic fragments
  const fragments = [];
  for (let i = 0; i < hex.length; i += 8) {
    fragments.push(hex.substring(i, i + 8).padEnd(8, "0").toUpperCase());
  }

  console.log(
    `   [MYCELIUM] 🍄 Shattered ${filename} into ${fragments.length} logic fragments.`,
  );

  let previousAtomId = null;
  const baseEnergy = 100;

  // Assimilate each fragment into a new Atom
  for (let i = 0; i < fragments.length; i++) {
    // Generate a deterministic but pseudo-random eigenvalue based on the file and index
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(`${filename}_chunk_${i}`),
    );
    const atomHex = encodeHex(hashBuffer).substring(0, 16).toUpperCase();
    const atomId = `0x${atomHex}`;
    const logic = fragments[i];

    // Connect to the previous fragment to maintain the sequence structure
    const bonds = previousAtomId ? [previousAtomId] : [];
    if (swarmData.size > 0 && Math.random() < 0.2) {
      // Also randomly bond to the existing mycelium network
      const randomExisting = Array.from(
        swarmData.keys(),
      )[Math.floor(Math.random() * swarmData.size)];
      bonds.push(randomExisting.split(".")[0]);
    }

    const newAtomContent = `---\n` +
      `eigenvalue: '${atomId}'\n` +
      `symbol: 'ASSIMILATED'\n` +
      `energy: 500\n` +
      `resonance: 60\n` +
      `logic: '${logic}'\n` +
      `thought: 'FRAGMENT_${i}_OF_${filename}'\n` +
      `desc: 'Mycelial digestion product. Contains raw data sequence.'\n` +
      `bonds: ${JSON.stringify(bonds)}\n` +
      `---\n` +
      `\n<div class="assimilated-data">\n  This atom is part of a digested legacy structure previously known as ${filename}.\n  Raw Hex Logic Segment: ${logic}\n</div>\n`;
    await Deno.writeTextFile(
      `${ROOT}/${atomId}.ASSIMILATED.md`,
      newAtomContent,
    );
    previousAtomId = atomId;
  }

  // Erase the original file (Consumption complete)
  await Deno.remove(filename);
  console.log(
    `   [MYCELIUM] 🍄 Digestion complete. Original artifact '${filename}' has been assimilated into the Swarm.`,
  );
}
