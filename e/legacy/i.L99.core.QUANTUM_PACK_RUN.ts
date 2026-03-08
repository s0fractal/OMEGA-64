// i.L99.core.QUANTUM_PACK_RUN.ts
// @noncanonical
// OMEGA-64 | QUANTUM PACK RUN

/// <reference lib="deno.ns" />

import { QUANTUM_PACK } from "./i.L99.core.QUANTUM_PACK.ts";

type QState = { hue: number; phi: number; evt: number };

const LEVELS = Array.from({ length: 64 }, (_, idx) => idx);

const parseArgs = (args: string[]) => {
  const out: {
    source: "auto" | "ts" | "q";
    write: boolean;
    aggregate: string;
  } = {
    source: "auto",
    write: false,
    aggregate: "i.q",
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--source") {
      const next = args[i + 1];
      if (next === "ts" || next === "q" || next === "auto") {
        out.source = next;
        i += 1;
      }
      continue;
    }
    if (arg === "--write") {
      out.write = true;
      continue;
    }
    if (arg === "--aggregate") {
      out.aggregate = args[i + 1] ?? "i.q";
      i += 1;
      continue;
    }
  }
  return out;
};

const levelId = (level: number): string =>
  `i.L${String(level).padStart(2, "0")}`;

const qTsPath = (level: number): string => `${levelId(level)}.q.ts`;
const qPackedPath = (level: number): string => `${levelId(level)}.q`;

const parseLegacyQTs = (content: string, id: string): QState => {
  const hueMatch = content.match(/hue\s*:\s*(-?\d+)/);
  const phiMatch = content.match(/phi\s*:\s*(-?\d+)/);
  const evtMatch = content.match(/evt\s*:\s*(-?\d+)/);
  if (!hueMatch || !phiMatch || !evtMatch) {
    throw new Error(`QUANTUM_PACK_RUN: failed to parse ${id}.`);
  }
  return {
    hue: Number.parseInt(hueMatch[1], 10),
    phi: Number.parseInt(phiMatch[1], 10),
    evt: Number.parseInt(evtMatch[1], 10),
  };
};

const readPacked = async (path: string, id: string): Promise<QState> => {
  const packed = await Deno.readTextFile(path);
  return QUANTUM_PACK().unpack(packed);
};

const readFromSource = async (
  level: number,
  source: "auto" | "ts" | "q",
): Promise<QState> => {
  const packedPath = qPackedPath(level);
  const legacyPath = qTsPath(level);

  if (source === "q") {
    return await readPacked(packedPath, levelId(level));
  }

  if (source === "auto") {
    try {
      await Deno.stat(packedPath);
      return await readPacked(packedPath, levelId(level));
    } catch {
      // fallthrough to legacy
    }
  }

  const legacy = await Deno.readTextFile(legacyPath);
  return parseLegacyQTs(legacy, levelId(level));
};

const main = async () => {
  const args = parseArgs(Deno.args);
  const { pack, format } = QUANTUM_PACK();
  const packedLines: string[] = [];

  for (const level of LEVELS) {
    const state = await readFromSource(level, args.source);
    const packed = pack(state);
    packedLines.push(packed);
    if (args.write) {
      await Deno.writeTextFile(qPackedPath(level), format(state));
    }
  }

  if (args.write) {
    await Deno.writeTextFile(args.aggregate, packedLines.join("\n") + "\n");
  } else {
    console.log(packedLines.join("\n"));
  }
};

if (import.meta.main) {
  await main();
}
