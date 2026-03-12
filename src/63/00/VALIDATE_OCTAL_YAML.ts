/**
 * Validate octal _.yaml canon files (root, octave, atom).
 */

import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";

const VECTOR_PATTERN = /^(0[0-8])\.(0[0-7])\.(0[0-9]|1[0-5])$/;

type Issue = { file: string; message: string };

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateRoot = (
  data: Record<string, unknown>,
  issues: Issue[],
  file: string,
) => {
  if (!isString(data.standard)) {
    issues.push({ file, message: "root.standard must be string" });
  }
  if (!(isString(data.version) || isNumber(data.version))) {
    issues.push({ file, message: "root.version must be string or number" });
  }
  if (data.note && !isString(data.note)) {
    issues.push({ file, message: "root.note must be string" });
  }
  if (data.tags && !(isArray(data.tags) && data.tags.every(isString))) {
    issues.push({ file, message: "root.tags must be string array" });
  }
};

const validateOctave = (
  data: Record<string, unknown>,
  issues: Issue[],
  file: string,
  major: number,
) => {
  if (!isNumber(data.major)) {
    issues.push({ file, message: "octave.major must be number" });
  }
  if (data.major !== major) {
    issues.push({ file, message: `octave.major must equal ${major}` });
  }
  if (!isString(data.note)) {
    issues.push({ file, message: "octave.note must be string" });
  }
  if (data.tags && !(isArray(data.tags) && data.tags.every(isString))) {
    issues.push({ file, message: "octave.tags must be string array" });
  }
};

const validateAtom = (
  data: Record<string, unknown>,
  issues: Issue[],
  file: string,
  major: number,
  minor: number,
) => {
  if (!isString(data.vector)) {
    issues.push({ file, message: "atom.vector must be string" });
  } else if (!VECTOR_PATTERN.test(data.vector)) {
    issues.push({
      file,
      message: "atom.vector must be DD.DD.DD (00..08/00..07/00..15)",
    });
  } else {
    const [vMajor, vMinor] = data.vector.split(".").map((part) => Number(part));
    if (vMajor !== major) {
      issues.push({ file, message: `vector major must equal ${major}` });
    }
    if (vMinor !== minor) {
      issues.push({ file, message: `vector minor must equal ${minor}` });
    }
  }

  if (!isString(data.symbol)) {
    issues.push({ file, message: "atom.symbol must be string" });
  }
  if (!isString(data.desc)) {
    issues.push({ file, message: "atom.desc must be string" });
  }
  if (!isNumber(data.legacy_idx)) {
    issues.push({ file, message: "atom.legacy_idx must be number" });
  }
  if (!isString(data.origin)) {
    issues.push({ file, message: "atom.origin must be string" });
  }

  if (data.tags && !(isArray(data.tags) && data.tags.every(isString))) {
    issues.push({ file, message: "atom.tags must be string array" });
  }
  if (data.relations && !isObject(data.relations)) {
    issues.push({ file, message: "atom.relations must be object" });
  }
};

const parsePath = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 2 && parts[0] === "i" && parts[1] === "_.yaml") {
    return { type: "root" as const };
  }
  if (parts.length === 2 && /^[0-8]$/.test(parts[0]) && parts[1] === "_.yaml") {
    return { type: "octave" as const, major: Number(parts[0]) };
  }
  if (
    parts.length === 4 &&
    /^[0-8]$/.test(parts[0]) &&
    /^[0-7]$/.test(parts[1]) &&
    parts[3] === "_.yaml"
  ) {
    return {
      type: "atom" as const,
      major: Number(parts[0]),
      minor: Number(parts[1]),
    };
  }
  return { type: "unknown" as const };
};

async function main() {
  const issues: Issue[] = [];
  let total = 0;
  let validated = 0;

  for await (const entry of walk(".")) {
    if (!entry.isFile || entry.name !== "_.yaml") continue;
    total += 1;
    const info = parsePath(entry.path.replace(/^\.\//, ""));
    if (info.type === "unknown") continue;

    try {
      const content = await Deno.readTextFile(entry.path);
      const raw = parseYaml(content);
      if (!isObject(raw)) {
        issues.push({ file: entry.path, message: "YAML must be an object" });
        continue;
      }
      validated += 1;
      if (info.type === "root") validateRoot(raw, issues, entry.path);
      if (info.type === "octave") {
        validateOctave(raw, issues, entry.path, info.major);
      }
      if (info.type === "atom") {
        validateAtom(raw, issues, entry.path, info.major, info.minor);
      }
    } catch {
      issues.push({ file: entry.path, message: "Malformed YAML" });
    }
  }

  console.log(`OCTAL_YAML_VALIDATE: ${validated}/${total} files validated`);
  if (issues.length > 0) {
    console.log(`Issues: ${issues.length}`);
    for (const issue of issues.slice(0, 20)) {
      console.log(`- ${issue.file}: ${issue.message}`);
    }
    if (issues.length > 20) console.log(`...and ${issues.length - 20} more`);
    Deno.exit(1);
  } else {
    console.log("OCTAL_YAML_VALIDATE: OK");
  }
}

if (import.meta.main) {
  await main();
}
