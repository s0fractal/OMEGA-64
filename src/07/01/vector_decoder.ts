// OMEGA-64 | vector_decoder.ts | The Memory Management Unit (Phase 55)

const configText = await Deno.readTextFile(
  new URL("../../../deno.jsonc", import.meta.url)
);
const config = JSON.parse(configText);

/**
 * Перетворює векторний імпорт на реальний шлях ФС.
 * resolveVector("@00") -> "./00/mod.ts"
 * resolveVector("@01/03/test.ts") -> "./01/03/test.ts"
 */
export function resolveVector(vector: string): string {
  if (config.imports[vector]) {
    return config.imports[vector];
  }

  // Check prefix mapping (e.g. @01/path -> ./01/path)
  for (const [key, value] of Object.entries(config.imports)) {
    if (key.endsWith("/") && vector.startsWith(key)) {
      const remainder = vector.slice(key.length);
      return `${value}${remainder}`;
    }
  }

  throw new Error(`Quantum breach: Vector ${vector} is unmapped.`);
}

/**
 * Перетворює реальний шлях на вектор (для лінтера).
 * extractVector("./02/PULSE.ts") -> "@02"
 */
export function extractVector(realPath: string): string {
  // Витягуємо перші дві цифри папки
  const match = realPath.match(/(?:^|\/)0?(\d)_/);
  if (match) {
    return `@0${match[1]}`;
  }
  const matchTwoDigits = realPath.match(/(?:^|\/)(\d{2})_/);
  return matchTwoDigits ? `@${matchTwoDigits[1]}` : "@unknown";
}

/**
 * Dynamic File System Vector Resolution (Phase 55+).
 * Translates abstract structural vectors into physical paths without hardcoding text labels.
 * Examples:
 * resolveFsVectorSync("@00") -> "00_substrate"
 * resolveFsVectorSync("@00") -> "00/08_artifacts"
 * resolveFsVectorSync("@00/release.wasm") -> "src/00/release.wasm"
 */
export function resolveFsVectorSync(vector: string): string {
  const match = vector.match(/^@(\d{2}(?:_\d{2})*)(.*)$/);
  if (!match) return vector;

  const parts = match[1].split("_").filter(Boolean);
  const remainder = match[2];

  let currentPath = "src";
  let resolvedPath = "";

  for (const prefix of parts) {
    let found = false;
    for (const entry of Deno.readDirSync(currentPath)) {
      if (entry.isDirectory && (entry.name === prefix || entry.name.startsWith(`${prefix}_`))) {
        currentPath = currentPath === "." ? entry.name : `${currentPath}/${entry.name}`;
        resolvedPath = currentPath;
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`Quantum breach: Physical layer for vector prefix '${prefix}' not found in '${currentPath}'`);
    }
  }

  return remainder ? `${resolvedPath}${remainder}` : resolvedPath;
}
