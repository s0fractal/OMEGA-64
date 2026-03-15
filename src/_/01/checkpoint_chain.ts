/** SSoT: {@link ../../ontology/l32_gate/checkpoint_chain.md} */
import { append_jsonl, read_jsonl, read_jsonl_lines } from "../00/mod.ts";

// OMEGA-64 | checkpoint_chain.ts
// Replay Invariant State Hash Checkpointing

// Replay Invariant State Hash Checkpointing
import { normalize_hex64, sha256_hex, stable_stringify } from "../mod.ts";

const CHECKPOINT_CHAIN_VERSION = "checkpoint-hash-chain/v1";

const stripCheckpointChainFields = (entry: Record<string, unknown>) => {
  const body = { ...entry };
  delete body.chain_version;
  delete body.prev_checkpoint_hash;
  delete body.checkpoint_hash;
  return body;
};

const checkpointRecordHash = async (
  body: Record<string, unknown>,
  prevCheckpointHash: string | null,
): Promise<string> =>
  await sha256_hex(
    stable_stringify({
      chain_version: CHECKPOINT_CHAIN_VERSION,
      prev_checkpoint_hash: prevCheckpointHash,
      body,
    }),
  );

type CheckpointChainReportInternal = {
  ok: boolean;
  checkedRows: number;
  chainAnchoredRows: number;
  legacyRows: number;
  failures: string[];
  tailCheckpointHash: string | null;
};

const verifyCheckpointChainDetailedInternal = async (
  path: string,
): Promise<CheckpointChainReportInternal> => {
  const lines = await read_jsonl_lines(path);
  const failures: string[] = [];
  let chainAnchoredRows = 0;
  let legacyRows = 0;
  let prevAnchoredHash: string | null = null;
  let tailCheckpointHash: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    let row: Record<string, unknown>;
    try {
      row = JSON.parse(lines[i]) as Record<string, unknown>;
    } catch {
      failures.push(`CHECKPOINT_CHAIN_JSON_PARSE_FAIL_AT_LINE_${lineNo}`);
      continue;
    }

    const hasChainVersion = row.chain_version !== undefined;
    const hasPrev = row.prev_checkpoint_hash !== undefined;
    const hasHash = row.checkpoint_hash !== undefined;
    const hasAnyChain = hasChainVersion || hasPrev || hasHash;
    const hasAllChain = hasChainVersion && hasPrev && hasHash;

    if (!hasAnyChain) {
      legacyRows++;
      continue;
    }
    if (!hasAllChain) {
      failures.push(`CHECKPOINT_CHAIN_PARTIAL_FIELDS_AT_LINE_${lineNo}`);
      continue;
    }

    chainAnchoredRows++;
    if (row.chain_version !== CHECKPOINT_CHAIN_VERSION) {
      failures.push(`CHECKPOINT_CHAIN_VERSION_UNSUPPORTED_AT_LINE_${lineNo}`);
    }

    const body = stripCheckpointChainFields(row);
    const expectedHash = await checkpointRecordHash(body, prevAnchoredHash);

    const recordedPrev = row.prev_checkpoint_hash === null
      ? null
      : normalize_hex64(row.prev_checkpoint_hash);
    if (
      row.prev_checkpoint_hash !== null &&
      typeof row.prev_checkpoint_hash !== "string"
    ) {
      failures.push(`CHECKPOINT_CHAIN_PREV_HASH_INVALID_AT_LINE_${lineNo}`);
    }
    if (recordedPrev !== prevAnchoredHash) {
      failures.push(`CHECKPOINT_CHAIN_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    const recordedHash = normalize_hex64(row.checkpoint_hash);
    if (!recordedHash) {
      failures.push(`CHECKPOINT_CHAIN_HASH_INVALID_AT_LINE_${lineNo}`);
      prevAnchoredHash = expectedHash;
      tailCheckpointHash = expectedHash;
      continue;
    }
    if (recordedHash !== expectedHash) {
      failures.push(`CHECKPOINT_CHAIN_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    prevAnchoredHash = recordedHash;
    tailCheckpointHash = recordedHash;
  }

  return {
    ok: failures.length === 0,
    checkedRows: lines.length,
    chainAnchoredRows,
    legacyRows,
    failures,
    tailCheckpointHash,
  };
};

export const CHECKPOINT_CHECKPOINT = {
  STORAGE_PATH: "OMEGA_CHECKPOINT.jsonl",
  CHAIN_VERSION: CHECKPOINT_CHAIN_VERSION,
  save: async (state: any, context?: any): Promise<void> => {
    const chain = await verifyCheckpointChainDetailedInternal(
      CHECKPOINT_CHECKPOINT.STORAGE_PATH,
    );
    if (!chain.ok) {
      throw new Error(`CHECKPOINT_CHAIN_INVALID:${chain.failures.join(",")}`);
    }

    const body = {
      tick: state?.tick ?? 0,
      state_hash: state?.state_hash ?? "",
      state_i16: Array.from((state?.state_i16 ?? []) as number[]),
      context: context ?? null,
      ts: Date.now(),
    } as Record<string, unknown>;

    const prevCheckpointHash = chain.tailCheckpointHash;
    const checkpointHash = await checkpointRecordHash(body, prevCheckpointHash);
    await append_jsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH, {
      ...body,
      chain_version: CHECKPOINT_CHAIN_VERSION,
      prev_checkpoint_hash: prevCheckpointHash,
      checkpoint_hash: checkpointHash,
    });
  },
  loadLatest: async (): Promise<any | null> => {
    let latest: any | null = null;
    for await (const row of read_jsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      latest = row;
    }
    return latest;
  },
  loadExact: async (tick: number): Promise<any | null> => {
    let exact: any | null = null;
    for await (const row of read_jsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      if (Number(row?.tick) === tick) {
        exact = row;
      }
    }
    return exact;
  },
  loadNearestAtOrBefore: async (tick: number): Promise<any | null> => {
    let nearest: any | null = null;
    let nearestTick = Number.NEGATIVE_INFINITY;
    for await (const row of read_jsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      const rowTick = Number(row?.tick);
      if (
        !Number.isFinite(rowTick) || rowTick > tick || rowTick < nearestTick
      ) {
        continue;
      }
      nearest = row;
      nearestTick = rowTick;
    }
    return nearest;
  },
  verifyChainDetailed: async (path?: string) => {
    const report = await verifyCheckpointChainDetailedInternal(
      path ?? CHECKPOINT_CHECKPOINT.STORAGE_PATH,
    );
    return {
      ok: report.ok,
      checkedRows: report.checkedRows,
      chainAnchoredRows: report.chainAnchoredRows,
      legacyRows: report.legacyRows,
      failures: report.failures,
      tailCheckpointHash: report.tailCheckpointHash,
    };
  },
};
