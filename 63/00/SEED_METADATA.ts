import { ensureDir } from "jsr:@std/fs";

const SOURCE_PATH = "./OMEGA_SOURCE(old).txt";

async function seed() {
  console.log("--- Seeding Metadata (Inversion) ---");

  const source = await Deno.readTextFile(SOURCE_PATH);
  const lines = source.split("\n");

  let inMetadata = false;
  let metadataBlock = "";

  // Line-by-line extraction
  for (const line of lines) {
    if (line.includes("const METADATA: Record")) {
      inMetadata = true;
      continue;
    }
    if (inMetadata) {
      if (line.trim() === "};") {
        inMetadata = false;
        break;
      }
      metadataBlock += line + "\n";
    }
  }

  if (!metadataBlock) {
    console.error("❌ Could not find METADATA block!");
    Deno.exit(1);
  }

  // Parse Entries manually from block lines
  const metadata: Record<number, any> = {};
  const entryLines = metadataBlock.split("\n");

  for (const line of entryLines) {
    // Match: 63: { name: "AX: Genesis", status: "✅", desc: "..." },
    const m = line.match(
      /(\d+):\s*\{\s*name:\s*"(.*?)",\s*status:.*desc:\s*"(.*?)"/,
    );
    if (m) {
      const idx = parseInt(m[1]);
      metadata[idx] = { name: m[2], desc: m[3] };
    }
  }

  console.log(`Parsed ${Object.keys(metadata).length} legacy entries.`);

  // Invert and Write
  for (let legacyIdx = 0; legacyIdx < 64; legacyIdx++) {
    if (!metadata[legacyIdx]) continue;

    const { name, desc } = metadata[legacyIdx];

    // Inversion: New = 63 - Old
    const newIdx = 63 - legacyIdx;

    const M = Math.floor(newIdx / 8);
    const m = newIdx % 8;
    const dirPath = `${M}/${m}`;
    const vector = `${M}.${m}.0`;

    await ensureDir(dirPath);

    const yamlContent = `vector: ${vector}
tag: "${name}"
desc: "${desc}"
legacy_idx: ${legacyIdx}
`;

    const yamlPath = `${dirPath}/_.yaml`;

    // Write (Overwrite or Skip?)
    // If file exists and has content other than what we write, skip?
    // But for "Seeding", forcing overwrites of metadata is usually desired to fix definitions.
    // EXCEPT for Atoms that already have custom _.yaml.
    // Let's check if file exists.

    try {
      const existing = await Deno.readTextFile(yamlPath);
      if (existing.includes("origin:")) {
        // This is a Real Atom YAML (with origin/implementation). Do not overwrite fully.
        // Maybe append legacy info?
        // For now, let's NOT overwrite if it has "origin:".
        // console.log(`Skipping ${yamlPath} (Active Atom)`);
        continue;
      }
    } catch {
      // File doesn't exist, proceed to write.
    }

    await Deno.writeTextFile(yamlPath, yamlContent);
  }

  console.log("✅ Seeding Complete.");
}

await seed();
