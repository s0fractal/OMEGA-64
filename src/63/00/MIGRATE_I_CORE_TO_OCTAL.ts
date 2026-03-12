/// <reference lib="deno.window" />
import { ensureDir, walk } from "jsr:@std/fs";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml";

const ROOT = Deno.cwd();
const I_DIR = `${ROOT}/i`;
const LEGACY_DIR = `${ROOT}/o/legacy/ts`;

const pad2 = (n: number): string => n.toString().padStart(2, "0");

const minorForSymbol = (symbol: string): number => {
  let acc = 0;
  for (let i = 0; i < symbol.length; i++) {
    acc = (acc + symbol.charCodeAt(i)) % 8;
  }
  return acc;
};

const usedVariants = new Map<string, Set<number>>();
const symbolLocations = new Map<string, { major: number; minor: number }>();

const registerVariant = (major: number, minor: number, variant: number) => {
  const key = `${major}.${minor}`;
  let set = usedVariants.get(key);
  if (!set) {
    set = new Set();
    usedVariants.set(key, set);
  }
  set.add(variant);
};

const nextVariant = (major: number, minor: number): number => {
  const key = `${major}.${minor}`;
  const set = usedVariants.get(key) ?? new Set<number>();
  for (let v = 0; v <= 15; v++) {
    if (!set.has(v)) return v;
  }
  return -1;
};

// 1) Load existing vectors + symbol locations from octal YAML
for await (
  const entry of walk(ROOT, { includeDirs: false, match: [/\/_.yaml$/] })
) {
  const rel = entry.path.replace(`${ROOT}/`, "");
  const match = rel.match(/^(\d)\/(\d)\/([^/]+)\/_.yaml$/);
  if (!match) continue;
  const pathMajor = Number(match[1]);
  const pathMinor = Number(match[2]);
  const pathSymbol = match[3];
  if (!Number.isNaN(pathMajor) && !Number.isNaN(pathMinor) && pathSymbol) {
    if (!symbolLocations.has(pathSymbol)) {
      symbolLocations.set(pathSymbol, { major: pathMajor, minor: pathMinor });
    }
  }
  try {
    const raw = parseYaml(await Deno.readTextFile(entry.path)) as Record<
      string,
      unknown
    >;
    const vector = typeof raw?.vector === "string" ? raw.vector : "";
    const parts = vector.split(".");
    if (parts.length !== 3) continue;
    const major = Number(parts[0]);
    const minor = Number(parts[1]);
    const variant = Number(parts[2]);
    if (
      Number.isFinite(major) && Number.isFinite(minor) &&
      Number.isFinite(variant)
    ) {
      registerVariant(major, minor, variant);
    }
  } catch {
    // ignore malformed YAML
  }
}

let migrated = 0;
let skipped = 0;
let backedUp = 0;
let createdMeta = 0;

const pattern = /^i\.L(\d{2})\.core\.([A-Z0-9_]+)\.ts$/;

for await (const entry of walk(I_DIR, { includeDirs: false, maxDepth: 1 })) {
  const name = entry.name;
  const match = name.match(pattern);
  if (!match) continue;
  const level = Number(match[1]);
  const symbol = match[2];

  let major = 0;
  let minor = 0;
  const existingLoc = symbolLocations.get(symbol);
  if (existingLoc) {
    major = existingLoc.major;
    minor = existingLoc.minor;
  } else {
    if (level <= 63) {
      major = Math.floor(level / 8);
    } else {
      major = 8;
    }
    minor = minorForSymbol(symbol);
  }

  const targetDir = `${ROOT}/${major}/${minor}/${symbol}`;
  const targetTs = `${targetDir}/_.ts`;
  const targetYaml = `${targetDir}/_.yaml`;

  await ensureDir(targetDir);

  // YAML (meta)
  let hasYaml = false;
  try {
    await Deno.stat(targetYaml);
    hasYaml = true;
  } catch {
    hasYaml = false;
  }

  if (!hasYaml) {
    let variant = nextVariant(major, minor);
    if (variant === -1) {
      for (let m = 0; m < 8; m++) {
        variant = nextVariant(major, m);
        if (variant !== -1) {
          minor = m;
          break;
        }
      }
    }
    if (variant === -1) {
      throw new Error(
        `No free variants left for major ${major} (all minors exhausted)`,
      );
    }
    registerVariant(major, minor, variant);
    const meta = {
      vector: `${pad2(major)}.${pad2(minor)}.${pad2(variant)}`,
      symbol,
      desc: `Legacy import from i.L${pad2(level)}.core.${symbol}.ts`,
      legacy_idx: level,
      origin: `i.L${pad2(level)}.core.${symbol}.ts`,
    };
    await Deno.writeTextFile(targetYaml, stringifyYaml(meta));
    createdMeta++;
  }

  // TS (logic)
  const incoming = await Deno.readTextFile(`${I_DIR}/${name}`);
  let existing: string | null = null;
  try {
    existing = await Deno.readTextFile(targetTs);
  } catch {
    existing = null;
  }

  if (existing !== null && existing !== incoming) {
    await ensureDir(LEGACY_DIR);
    const backupPath = `${LEGACY_DIR}/${symbol}_L${pad2(level)}.ts`;
    await Deno.writeTextFile(backupPath, existing);
    backedUp++;
  }

  if (existing === null || existing !== incoming) {
    await Deno.writeTextFile(targetTs, incoming);
    migrated++;
  } else {
    skipped++;
  }
}

console.log(
  `[MIGRATE] migrated=${migrated} skipped=${skipped} meta_created=${createdMeta} backups=${backedUp}`,
);
