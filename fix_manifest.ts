const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";
const raw = await Deno.readTextFile(MANIFEST_PATH);
const manifest = JSON.parse(raw);

const LAYERS = [
  "00_substrate", "01_physics", "02_metabolism", "03_governance",
  "04_noosphere", "05_exocortex", "06_akasha", "63_necropolis", "tests"
];

const findNewPath = async (filename: string) => {
  // if it already has a layer prefix, return it
  if (LAYERS.some(l => filename.startsWith(l + "/"))) return filename;
  // check root
  try {
    if ((await Deno.stat(filename)).isFile) return filename;
  } catch {}
  
  // check layers
  const base = filename.includes("/") ? filename.split("/").pop()! : filename;
  for (const l of LAYERS) {
    try {
      const p = `${l}/${base}`;
      if ((await Deno.stat(p)).isFile) return p;
    } catch {}
  }
  return filename; // keep original if not found (maybe it's a doc or external)
};

for (const key of Object.keys(manifest)) {
  if (Array.isArray(manifest[key])) {
    const updated = [];
    for (const file of manifest[key]) {
      updated.push(await findNewPath(file));
    }
    manifest[key] = updated;
  }
}

await Deno.writeTextFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
console.log("Updated CORE_ARCH_MANIFEST.json");
