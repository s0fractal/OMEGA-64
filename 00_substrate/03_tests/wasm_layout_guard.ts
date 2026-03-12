import * as OFFSETS from "../mod.ts";

const ASM_SOURCE_PATH = "./assembly/index.ts";

const CONST_DEF_RE = /^\s*const\s+([A-Z0-9_]+)\s*:\s*[^=]+\s*=\s*([^;]+);/gm;

const parseLiteral = (token: string): number | null => {
  if (/^0x[0-9a-f]+$/i.test(token)) return Number.parseInt(token, 16);
  if (/^\d+$/.test(token)) return Number.parseInt(token, 10);
  return null;
};

const normalizeExpr = (expr: string): string =>
  expr
    .replace(/\bas\s+[A-Za-z0-9_<>]+/g, "")
    .replace(/[()]/g, "")
    .trim();

const evalExpr = (
  name: string,
  expressions: ReadonlyMap<string, string>,
  memo: Map<string, number>,
  stack: Set<string>,
): number => {
  const cached = memo.get(name);
  if (cached !== undefined) return cached;

  const raw = expressions.get(name);
  if (!raw) {
    throw new Error(`[wasm:layout] Missing constant in assembly: ${name}`);
  }
  if (stack.has(name)) {
    throw new Error(`[wasm:layout] Cyclic constant reference: ${name}`);
  }

  stack.add(name);
  const expr = normalizeExpr(raw);
  const parts = expr.split(/([+-])/).map((p) => p.trim()).filter(Boolean);

  let sign = 1;
  let total = 0;
  for (const part of parts) {
    if (part === "+") {
      sign = 1;
      continue;
    }
    if (part === "-") {
      sign = -1;
      continue;
    }

    const literal = parseLiteral(part);
    if (literal !== null) {
      total += sign * literal;
      continue;
    }

    if (!/^[A-Z0-9_]+$/.test(part)) {
      throw new Error(
        `[wasm:layout] Unsupported expression token "${part}" in ${name}=${raw}`,
      );
    }

    const ref = evalExpr(part, expressions, memo, stack);
    total += sign * ref;
  }

  stack.delete(name);
  memo.set(name, total);
  return total;
};

const readAssemblyConsts = async (): Promise<Map<string, string>> => {
  const src = await Deno.readTextFile(ASM_SOURCE_PATH);
  const out = new Map<string, string>();
  for (const match of src.matchAll(CONST_DEF_RE)) {
    const [, name, expr] = match;
    out.set(name, expr.trim());
  }
  return out;
};

export const assertWasmLayout = async (): Promise<void> => {
  const asmExpressions = await readAssemblyConsts();
  const memo = new Map<string, number>();

  const expected: Array<{ asm: string; value: number }> = [
    { asm: "MAX_ATOMS", value: OFFSETS.MAX_ATOMS },
    { asm: "SAFETY_BUFFER", value: OFFSETS.SAFETY_BUFFER },
    { asm: "IDS_OFFSET", value: OFFSETS.IDS_OFFSET },
    { asm: "XS_OFFSET", value: OFFSETS.XS_OFFSET },
    { asm: "YS_OFFSET", value: OFFSETS.YS_OFFSET },
    { asm: "ENERGY_OFFSET", value: OFFSETS.ENERGY_OFFSET },
    { asm: "RESONANCE_OFFSET", value: OFFSETS.RESONANCE_OFFSET },
    { asm: "PHASE_OFFSET", value: OFFSETS.PHASE_OFFSET },
    { asm: "LOGIC_OFFSET", value: OFFSETS.LOGIC_OFFSET },
    { asm: "BONDS_OFFSET", value: OFFSETS.BONDS_OFFSET },
    { asm: "STIFFNESS_OFFSET", value: OFFSETS.STIFFNESS_OFFSET },
    { asm: "INSTRUCTIONS_OFFSET", value: OFFSETS.INSTRUCTIONS_OFFSET },
    { asm: "CONTEXT_OFFSET", value: OFFSETS.CONTEXT_OFFSET },
    { asm: "BOND_REQUESTS_OFFSET", value: OFFSETS.BOND_REQUESTS_OFFSET },
    { asm: "SPATIAL_GRID_OFFSET", value: OFFSETS.SPATIAL_GRID_OFFSET },
    { asm: "ROLES_OFFSET", value: OFFSETS.ROLES_OFFSET },
    { asm: "STRUCTURE_GRID_OFF", value: OFFSETS.STRUCTURE_GRID_OFFSET },
    { asm: "SIGNAL_GRID_OFF", value: OFFSETS.SIGNAL_GRID_OFFSET },
    { asm: "MEMORY_GRID_OFF", value: OFFSETS.MEMORY_GRID_OFFSET },
    { asm: "ASCENSION_STATS_OFF", value: OFFSETS.ASCENSION_STATS_OFFSET },
    { asm: "BOND_DIST_OFF", value: OFFSETS.BOND_DISTANCES_OFFSET },
    { asm: "DAMPING_OFF", value: OFFSETS.DAMPING_OFFSET },
    { asm: "HIVE_MEMORY_OFF", value: OFFSETS.HIVE_MEMORY_OFFSET },
    { asm: "HIVE_BALANCE_OFF", value: OFFSETS.HIVE_BALANCE_OFFSET },
    { asm: "QUORUM_OFFSET", value: OFFSETS.QUORUM_OFFSET },
    { asm: "SPAWN_GRID_OFF", value: OFFSETS.SPAWN_REQUESTS_OFFSET },
    { asm: "NEURAL_COHERENCE_OFF", value: OFFSETS.NEURAL_COHERENCE_OFFSET },
    { asm: "PHYSICS_READ_XS_OFF", value: OFFSETS.PHYSICS_READ_XS_OFFSET },
    { asm: "PHYSICS_READ_YS_OFF", value: OFFSETS.PHYSICS_READ_YS_OFFSET },
    {
      asm: "PHYSICS_READ_ENERGY_OFF",
      value: OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
    },
    {
      asm: "PHYSICS_READ_RESONANCE_OFF",
      value: OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
    },
    { asm: "ENERGY_DELTA_OFF", value: OFFSETS.ENERGY_DELTA_OFFSET },
    { asm: "RESONANCE_DELTA_OFF", value: OFFSETS.RESONANCE_DELTA_OFFSET },
    {
      asm: "STRUCTURE_BUILD_OWNER_OFF",
      value: OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET,
    },
    {
      asm: "STRUCTURE_BUILD_VALUE_OFF",
      value: OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET,
    },
    {
      asm: "STRUCTURE_CHARGE_INTENT_OFF",
      value: OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET,
    },
    { asm: "ATTENTION_FIELD_OFF", value: OFFSETS.ATTENTION_FIELD_OFFSET },
    { asm: "HIVE_ENERGY_POOL_OFF", value: OFFSETS.HIVE_ENERGY_POOL_OFFSET },
  ];

  const mismatches: string[] = [];
  for (const item of expected) {
    const actual = evalExpr(item.asm, asmExpressions, memo, new Set<string>());
    if (actual !== item.value) {
      mismatches.push(`${item.asm}: asm=${actual}, offsets=${item.value}`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(
      `[wasm:layout] Constant drift detected:\n${
        mismatches.map((m) => `- ${m}`).join("\n")
      }`,
    );
  }
};

if (import.meta.main) {
  await assertWasmLayout();
  console.log("[wasm:layout] assembly/index.ts and OFFSETS.ts are coherent.");
}
