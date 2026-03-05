// OMEGA-64 | REFLECTION_ENGINE.ts | Era 17: The True Quine
// Bridges RAM state back to Flatland source code.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./ATOM_INDEX.ts";
import { LOGGER } from "./LOGGER.ts";

const decodeCodeWords = (instructions: Uint8Array): Uint32Array => {
  const out = new Uint32Array(16);
  const view = new DataView(
    instructions.buffer,
    instructions.byteOffset,
    instructions.byteLength,
  );
  for (let i = 0; i < out.length; i++) {
    out[i] = view.getUint32(i * 4, true);
  }
  return out;
};

export const REFLECTION_ENGINE = {
  /**
   * Reflects the current atom state from RAM back to its Disk source file.
   * This is the bridge that makes OMEGA-64 a true Quine.
   */
  reflect: async (idx: number): Promise<boolean> => {
    const fullPath = IDX_TO_ID.get(idx);
    if (!fullPath) return false;

    try {
      // 1. Capture current runtime metrics
      const energy = STATE_MATRIX.getEnergy(idx);
      const resonance = STATE_MATRIX.getResonance(idx);
      const x = STATE_MATRIX.getX(idx);
      const y = STATE_MATRIX.getY(idx);

      // 2. Capture and hex-encode current genome & bytecode
      const genome = Array.from(STATE_MATRIX.getLogic(idx))
        .map((b) => b.toString(16).padStart(2, "0")).join("");

      const instructions = STATE_MATRIX.getInstructions(idx);
      const codeWords = decodeCodeWords(instructions);
      const codeHex = Array.from(codeWords)
        .map((u) => u.toString(16).padStart(8, "0")).join("");

      // 3. Read current file content to preserve non-frontmatter data
      const content = await Deno.readTextFile(fullPath);
      const body = content.replace(/^---\n[\s\S]+?\n---\n/, "");

      // 4. Construct the reflected source (The Quine Output)
      const symbol = fullPath.split(".").slice(-3, -2)[0] || "ATOM";
      const reflectedSource = `---
symbol: ${symbol}
genome: ${genome}
code: ${codeHex}
energy: ${energy.toFixed(3)}
resonance: ${resonance.toFixed(3)}
x: ${x}
y: ${y}
reflected_at: ${new Date().toISOString()}
---

${body.trim()}

// --- DECOMPILED BYTECODE ---
/*
${REFLECTION_ENGINE.decompile(instructions)}
*/
`;

      // 5. Transactional Atomic Write
      const tmpPath = `${fullPath}.tmp`;
      await Deno.writeTextFile(tmpPath, reflectedSource);
      await Deno.rename(tmpPath, fullPath);

      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      LOGGER.error(`🪞 [REFLECTION] Failed to reflect Atom[${idx}]:`, msg);
      return false;
    }
  },

  /**
   * Decompiles binary bytecode into human-readable pseudo-code for documentation.
   */
  decompile: (instructions: Uint8Array): string => {
    const code = decodeCodeWords(instructions);
    const ops: string[] = [];
    for (let i = 0; i < code.length; i++) {
      const inst = code[i];
      if (inst === 0) continue;

      const op = inst & 0xFF;
      const p1 = (inst >> 8) & 0xFF;
      const p2 = (inst >> 16) & 0xFF;
      const p3 = (inst >> 24) & 0xFF;

      switch (op) {
        case 0x10:
          ops.push(
            `${i.toString().padStart(2, "0")}: MOVE  dx:${(p1 - 128) / 10} dy:${
              (p2 - 128) / 10
            }`,
          );
          break;
        case 0x20:
          ops.push(`${i.toString().padStart(2, "0")}: FEED  amt:${p1 / 10}`);
          break;
        case 0x30:
          ops.push(`${i.toString().padStart(2, "0")}: JMP   tgt:${p1 % 16}`);
          break;
        case 0x31:
          ops.push(`${i.toString().padStart(2, "0")}: JZ    tgt:${p1 % 16}`);
          break;
        case 0x50:
          ops.push(
            `${i.toString().padStart(2, "0")}: SENSE target:${p1 / 10}`,
          );
          break;
        case 0x99:
          ops.push(
            `${i.toString().padStart(2, "0")}: SELF_MODIFY slot:${p1 % 16}`,
          );
          break;
        default:
          ops.push(
            `${i.toString().padStart(2, "0")}: OP_${
              op.toString(16).toUpperCase()
            } ${p1} ${p2} ${p3}`,
          );
      }
    }
    return ops.join("\n");
  },

  /**
   * Crystallization: Reflects all high-resonance atoms to disk.
   */
  crystallize: async (threshold: number = 100) => {
    const active = STATE_MATRIX.getActiveIndices();
    let counts = 0;
    for (const idx of active) {
      if (STATE_MATRIX.getResonance(idx) > threshold) {
        if (await REFLECTION_ENGINE.reflect(idx)) counts++;
      }
    }
    if (counts > 0) {
      LOGGER.info(
        `💎 [CRYSTALLIZATION] ${counts} resonant atoms reflected to Flatland.`,
      );
    }
  },
};
