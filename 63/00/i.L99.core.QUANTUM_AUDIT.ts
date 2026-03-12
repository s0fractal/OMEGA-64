// i.L99.core.QUANTUM_AUDIT.ts
// @noncanonical
// OMEGA-64 | QUANTUM AUDIT

/// <reference lib="deno.ns" />

import { QUANTUM_PACK } from "./i.L99.core.QUANTUM_PACK.ts";

type QState = { hue: number; phi: number; evt: number };

const LEVELS = Array.from({ length: 64 }, (_, idx) => idx);

const levelId = (level: number): string =>
  `i.L${String(level).padStart(2, "0")}`;
const qTsPath = (level: number): string => `${levelId(level)}.q.ts`;
const qPackedPath = (level: number): string => `${levelId(level)}.q`;

const parseLegacyQTs = (content: string, id: string): QState => {
  const hueMatch = content.match(/hue\s*:\s*(-?\d+)/);
  const phiMatch = content.match(/phi\s*:\s*(-?\d+)/);
  const evtMatch = content.match(/evt\s*:\s*(-?\d+)/);
  if (!hueMatch || !phiMatch || !evtMatch) {
    throw new Error(`QUANTUM_AUDIT: failed to parse ${id}.`);
  }
  return {
    hue: Number.parseInt(hueMatch[1], 10),
    phi: Number.parseInt(phiMatch[1], 10),
    evt: Number.parseInt(evtMatch[1], 10),
  };
};

const readPacked = async (path: string): Promise<string> => {
  const text = await Deno.readTextFile(path);
  return text.trim().toLowerCase();
};

const main = async () => {
  const { pack, unpack } = QUANTUM_PACK();
  const errors: string[] = [];
  const packedLines: string[] = [];

  for (const level of LEVELS) {
    const id = levelId(level);
    const packedPath = qPackedPath(level);
    const legacyPath = qTsPath(level);
    let packed: string | null = null;

    try {
      packed = await readPacked(packedPath);
      packedLines.push(packed);
      unpack(packed);
    } catch (error) {
      errors.push(`${id}: missing or invalid packed q (${String(error)}).`);
    }

    try {
      const legacy = await Deno.readTextFile(legacyPath);
      const state = parseLegacyQTs(legacy, id);
      const expected = pack(state);
      if (packed && packed !== expected) {
        errors.push(
          `${id}: packed q mismatch (expected ${expected}, got ${packed}).`,
        );
      }
    } catch (error) {
      errors.push(`${id}: missing or invalid legacy q.ts (${String(error)}).`);
    }
  }

  try {
    const aggregate = await readPacked("i.q");
    const expected = packedLines.join("");
    if (aggregate.replace(/\s+/g, "") !== expected) {
      errors.push(
        "i.q aggregate mismatch (expected concatenation of L00..L63).",
      );
    }
  } catch (error) {
    errors.push(`i.q missing or invalid (${String(error)}).`);
  }

  if (errors.length > 0) {
    console.error("QUANTUM_AUDIT: FAILED");
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    Deno.exit(1);
  }

  console.log("QUANTUM_AUDIT: OK");
};

if (import.meta.main) {
  await main();
}
