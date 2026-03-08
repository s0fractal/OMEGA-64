/**
 * [e/TEST_INHERITANCE.ts]
 * Simulates the Metadata Resolution Protocol (Root -> Major -> Minor).
 * Mocks the behavior of the future Ribosome reading _.yaml files.
 */

import { parse } from "jsr:@std/yaml";

const ROOT = "i";

async function loadMeta(path: string): Promise<any> {
  try {
    const text = await Deno.readTextFile(path);
    return parse(text);
  } catch {
    return {};
  }
}

async function resolveMetadata(M: number, m: number) {
  console.log(`Resolving Metadata for Octave ${M}, Note ${m}...`);

  const rootMeta = await loadMeta(`${ROOT}/_.yaml`);
  const majorMeta = await loadMeta(`${ROOT}/${M}/_.yaml`);
  const minorMeta = await loadMeta(`${ROOT}/${M}/${m}/_.yaml`);

  // Merge Logic:
  // 1. Objects merge
  // 2. Arrays concatenate (for tags)
  // 3. Primitives override

  const merged = { ...rootMeta, ...majorMeta, ...minorMeta };

  // Special handling for tags (Concatenate unique)
  const tags = new Set<string>();
  if (rootMeta.tags) rootMeta.tags.forEach((t: string) => tags.add(t));
  if (majorMeta.tags) majorMeta.tags.forEach((t: string) => tags.add(t));
  if (minorMeta.tags) minorMeta.tags.forEach((t: string) => tags.add(t));

  merged.tags = Array.from(tags);

  return merged;
}

// Test Case: L32 (Ribosome) -> 4/0
const meta32 = await resolveMetadata(4, 0);
console.log("\n--- Resolved Metadata for L32 (i/4/0) ---");
console.log(JSON.stringify(meta32, null, 2));

// Test Case: L63 (Genesis) -> 7/7
const meta63 = await resolveMetadata(7, 7);
console.log("\n--- Resolved Metadata for L63 (i/7/7) ---");
console.log(JSON.stringify(meta63, null, 2));
