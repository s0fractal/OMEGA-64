// i.L99.core.QUANTUM_VIEW.ts
// @noncanonical
// OMEGA-64 | QUANTUM VIEW (Derived Scalars)

/// <reference lib="deno.ns" />

import { QUANTUM_PACK } from "./i.L99.core.QUANTUM_PACK.ts";

type QState = { hue: number; phi: number; evt: number };

const LEVELS = Array.from({ length: 64 }, (_, idx) => idx);

const parseArgs = (args: string[]) => {
  const out: { clean: boolean } = { clean: false };
  for (const arg of args) {
    if (arg === "--clean") out.clean = true;
  }
  return out;
};

const levelId = (level: number): string =>
  `i.L${String(level).padStart(2, "0")}`;
const qPackedPath = (level: number): string => `${levelId(level)}.q`;
const qTsPath = (level: number): string => `${levelId(level)}.q.ts`;

const viewPaths = (level: number) => ({
  hue: `${levelId(level)}.q.hue`,
  phi: `${levelId(level)}.q.phi`,
  evt: `${levelId(level)}.q.evt`,
});

const parseLegacyQTs = (content: string, id: string): QState => {
  const hueMatch = content.match(/hue\s*:\s*(-?\d+)/);
  const phiMatch = content.match(/phi\s*:\s*(-?\d+)/);
  const evtMatch = content.match(/evt\s*:\s*(-?\d+)/);
  if (!hueMatch || !phiMatch || !evtMatch) {
    throw new Error(`QUANTUM_VIEW: failed to parse ${id}.`);
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

const readState = async (level: number): Promise<QState> => {
  const packedPath = qPackedPath(level);
  try {
    const packed = await readPacked(packedPath);
    return QUANTUM_PACK().unpack(packed);
  } catch {
    const legacy = await Deno.readTextFile(qTsPath(level));
    return parseLegacyQTs(legacy, levelId(level));
  }
};

const writeScalar = async (path: string, value: number) => {
  await Deno.writeTextFile(path, `${value}\n`);
};

const cleanView = async (level: number) => {
  const paths = viewPaths(level);
  for (const path of Object.values(paths)) {
    try {
      await Deno.remove(path);
    } catch {
      // ignore missing files
    }
  }
};

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.clean) {
    for (const level of LEVELS) {
      await cleanView(level);
    }
    return;
  }

  for (const level of LEVELS) {
    const state = await readState(level);
    const paths = viewPaths(level);
    await writeScalar(paths.hue, state.hue);
    await writeScalar(paths.phi, state.phi);
    await writeScalar(paths.evt, state.evt);
  }
};

if (import.meta.main) {
  await main();
}
