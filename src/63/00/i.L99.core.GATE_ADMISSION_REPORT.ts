// i.L99.core.GATE_ADMISSION_REPORT.ts
// OMEGA-64 | Gate Admission Report
// Aggregates proposal admission metrics emitted by L32 gate.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import type { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface GateAdmissionReportOptions {
  startTick?: number;
  endTick?: number;
  topAgents?: number;
}

export interface GateAdmissionTimelinePoint {
  tick: number;
  proposals: number;
  mean_weight: number;
  mean_reliability_effective: number;
  mean_phase_coherence?: number;
  mean_physical_cost: number;
}

export interface GateAdmissionAgentStats {
  agent_id: string;
  proposals: number;
  mean_weight: number;
  p95_weight: number;
  mean_reliability_effective: number;
  mean_phase_coherence?: number;
  mean_physical_cost: number;
}

export interface GateAdmissionReport {
  version: string;
  ok: boolean;
  startTick?: number;
  endTick?: number;
  eventsAnalyzed: number;
  eventsWithMetrics: number;
  proposalsAnalyzed: number;
  coherenceCoverage: number;
  weightMean: number;
  weightP95: number;
  reliabilityEffectiveMean: number;
  phaseCoherenceMean?: number;
  phaseCoherenceP95?: number;
  outOfPhasePressureMean?: number;
  topAgents: GateAdmissionAgentStats[];
  timeline: GateAdmissionTimelinePoint[];
  failures: string[];
}

export interface GateAdmissionReportMaterializeMeta {
  tick_anchor: number;
  witness?: string;
}

export interface GateAdmissionReportIndexRecord {
  report_hash: string;
  report_version: string;
  report_path: string;
  tick_anchor: number;
  start_tick: number | null;
  end_tick: number | null;
  events_analyzed: number;
  proposals_analyzed: number;
  ts_unix_ms: number;
  prev_record_hash: string | null;
  record_hash: string;
  witness?: string;
}

const REPORT_VERSION = "gate-admission-report/v1";
const HEX_64_RE = /^[0-9a-f]{64}$/;

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(p * sorted.length) - 1),
  );
  return sorted[idx];
};

const mean = (values: number[]): number =>
  values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : 0;

const inWindow = (
  tick: number,
  startTick?: number,
  endTick?: number,
): boolean => {
  const inStart = startTick === undefined || tick >= startTick;
  const inEnd = endTick === undefined || tick <= endTick;
  return inStart && inEnd;
};

const isMutationEvent = (evt: LedgerEvent): boolean =>
  evt.state_after_hash !== evt.state_before_hash;

const parseIndexRecord = (
  line: string,
  lineNumber: number,
): { ok: true; record: GateAdmissionReportIndexRecord } | {
  ok: false;
  error: string;
} => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return { ok: false, error: `INDEX_LINE_PARSE_FAIL_AT_LINE_${lineNumber}` };
  }
  const rec = parsed as Partial<GateAdmissionReportIndexRecord>;
  const shapeOk = typeof rec.report_hash === "string" &&
    HEX_64_RE.test(rec.report_hash) &&
    typeof rec.report_version === "string" &&
    typeof rec.report_path === "string" &&
    typeof rec.tick_anchor === "number" &&
    Number.isSafeInteger(rec.tick_anchor) &&
    rec.tick_anchor >= 0 &&
    (typeof rec.start_tick === "number" || rec.start_tick === null) &&
    (typeof rec.end_tick === "number" || rec.end_tick === null) &&
    typeof rec.events_analyzed === "number" &&
    Number.isSafeInteger(rec.events_analyzed) &&
    rec.events_analyzed >= 0 &&
    typeof rec.proposals_analyzed === "number" &&
    Number.isSafeInteger(rec.proposals_analyzed) &&
    rec.proposals_analyzed >= 0 &&
    typeof rec.ts_unix_ms === "number" &&
    Number.isSafeInteger(rec.ts_unix_ms) &&
    rec.ts_unix_ms >= 0 &&
    (typeof rec.prev_record_hash === "string" ||
      rec.prev_record_hash === null) &&
    typeof rec.record_hash === "string" &&
    HEX_64_RE.test(rec.record_hash) &&
    (rec.witness === undefined || typeof rec.witness === "string");
  if (!shapeOk) {
    return {
      ok: false,
      error: `INDEX_LINE_SCHEMA_INVALID_AT_LINE_${lineNumber}`,
    };
  }
  return { ok: true, record: rec as GateAdmissionReportIndexRecord };
};

export const GATE_ADMISSION_REPORT = {
  VERSION: REPORT_VERSION,
  STORAGE_DIR: "./OMEGA_GATE_ADMISSION_REPORTS",
  INDEX_PATH: "./OMEGA_GATE_ADMISSION_REPORTS/index.jsonl",

  generate: async (
    options: GateAdmissionReportOptions = {},
  ): Promise<GateAdmissionReport> => {
    const failures: string[] = [];
    const timeline: GateAdmissionTimelinePoint[] = [];
    const weightSeries: number[] = [];
    const reliabilitySeries: number[] = [];
    const coherenceSeries: number[] = [];
    const outOfPhaseSeries: number[] = [];
    const agentMap = new Map<
      string,
      Array<{
        weight: number;
        reliability_effective: number;
        phase_coherence?: number;
        physical_cost: number;
      }>
    >();

    let eventsAnalyzed = 0;
    let eventsWithMetrics = 0;
    let proposalsAnalyzed = 0;

    for await (const evt of LEDGER.readAll()) {
      if (!inWindow(evt.tick, options.startTick, options.endTick)) continue;
      if (!isMutationEvent(evt)) continue;
      eventsAnalyzed++;

      const metrics = evt.accepted_proposal_metrics ?? [];
      if (metrics.length === 0) {
        continue;
      }
      eventsWithMetrics++;
      proposalsAnalyzed += metrics.length;

      const tickWeights: number[] = [];
      const tickReliability: number[] = [];
      const tickCoherence: number[] = [];
      const tickCosts: number[] = [];

      for (const m of metrics) {
        if (typeof m.agent_id !== "string" || m.agent_id.length === 0) {
          failures.push(`INVALID_AGENT_ID_AT_TICK_${evt.tick}`);
          continue;
        }
        if (
          !Number.isFinite(m.weight) ||
          !Number.isFinite(m.reliability_effective)
        ) {
          failures.push(`INVALID_METRIC_NUMERIC_FIELD_AT_TICK_${evt.tick}`);
          continue;
        }
        tickWeights.push(m.weight);
        tickReliability.push(m.reliability_effective);
        tickCosts.push(m.physical_cost);
        weightSeries.push(m.weight);
        reliabilitySeries.push(m.reliability_effective);
        if (
          m.phase_coherence !== undefined && Number.isFinite(m.phase_coherence)
        ) {
          tickCoherence.push(m.phase_coherence);
          coherenceSeries.push(m.phase_coherence);
          outOfPhaseSeries.push(1 - m.phase_coherence);
        }

        const current = agentMap.get(m.agent_id) ?? [];
        current.push({
          weight: m.weight,
          reliability_effective: m.reliability_effective,
          phase_coherence: m.phase_coherence,
          physical_cost: m.physical_cost,
        });
        agentMap.set(m.agent_id, current);
      }

      timeline.push({
        tick: evt.tick,
        proposals: tickWeights.length,
        mean_weight: mean(tickWeights),
        mean_reliability_effective: mean(tickReliability),
        mean_phase_coherence: tickCoherence.length > 0
          ? mean(tickCoherence)
          : undefined,
        mean_physical_cost: mean(tickCosts),
      });
    }

    const topN = Math.max(1, options.topAgents ?? 8);
    const topAgents: GateAdmissionAgentStats[] = Array.from(agentMap.entries())
      .map(([agent_id, values]) => {
        const weights = values.map((v) => v.weight);
        const rel = values.map((v) => v.reliability_effective);
        const coh = values
          .map((v) => v.phase_coherence)
          .filter((v): v is number =>
            typeof v === "number" && Number.isFinite(v)
          );
        const costs = values.map((v) => v.physical_cost);
        return {
          agent_id,
          proposals: values.length,
          mean_weight: mean(weights),
          p95_weight: percentile(weights, 0.95),
          mean_reliability_effective: mean(rel),
          mean_phase_coherence: coh.length > 0 ? mean(coh) : undefined,
          mean_physical_cost: mean(costs),
        };
      })
      .sort((a, b) => {
        if (b.proposals !== a.proposals) return b.proposals - a.proposals;
        if (b.mean_weight !== a.mean_weight) {
          return b.mean_weight - a.mean_weight;
        }
        return a.agent_id.localeCompare(b.agent_id);
      })
      .slice(0, topN);

    const coherenceCoverage = proposalsAnalyzed > 0
      ? coherenceSeries.length / proposalsAnalyzed
      : 0;

    return {
      version: REPORT_VERSION,
      ok: failures.length === 0,
      startTick: options.startTick,
      endTick: options.endTick,
      eventsAnalyzed,
      eventsWithMetrics,
      proposalsAnalyzed,
      coherenceCoverage,
      weightMean: mean(weightSeries),
      weightP95: percentile(weightSeries, 0.95),
      reliabilityEffectiveMean: mean(reliabilitySeries),
      phaseCoherenceMean: coherenceSeries.length > 0
        ? mean(coherenceSeries)
        : undefined,
      phaseCoherenceP95: coherenceSeries.length > 0
        ? percentile(coherenceSeries, 0.95)
        : undefined,
      outOfPhasePressureMean: outOfPhaseSeries.length > 0
        ? mean(outOfPhaseSeries)
        : undefined,
      topAgents,
      timeline,
      failures,
    };
  },

  hash: async (report: GateAdmissionReport): Promise<string> =>
    await sha256Hex(stableStringify(report)),

  generateWithHash: async (
    options: GateAdmissionReportOptions = {},
  ): Promise<{ report: GateAdmissionReport; reportHash: string }> => {
    const report = await GATE_ADMISSION_REPORT.generate(options);
    const reportHash = await GATE_ADMISSION_REPORT.hash(report);
    return { report, reportHash };
  },

  reportPath: (reportHash: string): string =>
    `${GATE_ADMISSION_REPORT.STORAGE_DIR}/${reportHash}.json`,

  indexRecordHash: async (
    record: Omit<GateAdmissionReportIndexRecord, "record_hash">,
  ): Promise<string> => await sha256Hex(stableStringify(record)),

  readIndex: async function* (): AsyncGenerator<
    GateAdmissionReportIndexRecord
  > {
    try {
      const content = await Deno.readTextFile(GATE_ADMISSION_REPORT.INDEX_PATH);
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().length === 0) continue;
        const parsed = parseIndexRecord(line, i + 1);
        if (parsed.ok) {
          yield parsed.record;
        }
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
    }
  },

  findIndexRecord: async (
    reportHash: string,
    reportPath?: string,
  ): Promise<GateAdmissionReportIndexRecord | null> => {
    let found: GateAdmissionReportIndexRecord | null = null;
    for await (const rec of GATE_ADMISSION_REPORT.readIndex()) {
      if (rec.report_hash !== reportHash) continue;
      if (reportPath && rec.report_path !== reportPath) continue;
      found = rec;
    }
    return found;
  },

  verifyIndexChain: async (
    verifyReportFiles: boolean = true,
  ): Promise<{ ok: boolean; failures: string[]; checkedRecords: number }> => {
    const failures: string[] = [];
    const records: GateAdmissionReportIndexRecord[] = [];
    try {
      const content = await Deno.readTextFile(GATE_ADMISSION_REPORT.INDEX_PATH);
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().length === 0) continue;
        const parsed = parseIndexRecord(line, i + 1);
        if (!parsed.ok) {
          return {
            ok: false,
            failures: [parsed.error],
            checkedRecords: records.length,
          };
        }
        records.push(parsed.record);
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
    }

    let prev: string | null = null;
    let prevTick = -1;
    let prevTs = -1;
    const seenReportHashes = new Set<string>();
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (rec.prev_record_hash !== prev) {
        failures.push(`INDEX_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
        break;
      }
      if (rec.tick_anchor < prevTick) {
        failures.push(`INDEX_TICK_NON_MONOTONIC_AT_LINE_${i + 1}`);
        break;
      }
      if (rec.ts_unix_ms < prevTs) {
        failures.push(`INDEX_TS_NON_MONOTONIC_AT_LINE_${i + 1}`);
        break;
      }
      if (seenReportHashes.has(rec.report_hash)) {
        failures.push(`INDEX_DUPLICATE_REPORT_HASH_AT_LINE_${i + 1}`);
        break;
      }
      const expected = await GATE_ADMISSION_REPORT.indexRecordHash({
        report_hash: rec.report_hash,
        report_version: rec.report_version,
        report_path: rec.report_path,
        tick_anchor: rec.tick_anchor,
        start_tick: rec.start_tick,
        end_tick: rec.end_tick,
        events_analyzed: rec.events_analyzed,
        proposals_analyzed: rec.proposals_analyzed,
        ts_unix_ms: rec.ts_unix_ms,
        prev_record_hash: rec.prev_record_hash,
        witness: rec.witness,
      });
      if (expected !== rec.record_hash) {
        failures.push(`INDEX_RECORD_HASH_MISMATCH_AT_LINE_${i + 1}`);
        break;
      }

      if (verifyReportFiles) {
        try {
          const body = await Deno.readTextFile(rec.report_path);
          const parsed = JSON.parse(body) as GateAdmissionReport;
          const computed = await GATE_ADMISSION_REPORT.hash(parsed);
          if (computed !== rec.report_hash) {
            failures.push(`INDEX_REPORT_HASH_MISMATCH_AT_LINE_${i + 1}`);
            break;
          }
        } catch {
          failures.push(`INDEX_REPORT_READ_FAIL_AT_LINE_${i + 1}`);
          break;
        }
      }

      prev = rec.record_hash;
      prevTick = rec.tick_anchor;
      prevTs = rec.ts_unix_ms;
      seenReportHashes.add(rec.report_hash);
    }

    return {
      ok: failures.length === 0,
      failures,
      checkedRecords: records.length,
    };
  },

  materialize: async (
    report: GateAdmissionReport,
    reportHash: string,
    meta: GateAdmissionReportMaterializeMeta,
  ): Promise<
    {
      path: string;
      created: boolean;
      indexRecord?: GateAdmissionReportIndexRecord;
    }
  > => {
    await Deno.mkdir(GATE_ADMISSION_REPORT.STORAGE_DIR, { recursive: true });
    const path = GATE_ADMISSION_REPORT.reportPath(reportHash);
    const payload = JSON.stringify(report, null, 2);

    try {
      await Deno.writeTextFile(path, payload, { createNew: true });
      let prevRecordHash: string | null = null;
      for await (const rec of GATE_ADMISSION_REPORT.readIndex()) {
        prevRecordHash = rec.record_hash;
      }
      const indexRecordWithoutHash: Omit<
        GateAdmissionReportIndexRecord,
        "record_hash"
      > = {
        report_hash: reportHash,
        report_version: report.version,
        report_path: path,
        tick_anchor: meta.tick_anchor,
        start_tick: report.startTick ?? null,
        end_tick: report.endTick ?? null,
        events_analyzed: report.eventsAnalyzed,
        proposals_analyzed: report.proposalsAnalyzed,
        ts_unix_ms: Date.now(),
        prev_record_hash: prevRecordHash,
        witness: meta.witness,
      };
      const recordHash = await GATE_ADMISSION_REPORT.indexRecordHash(
        indexRecordWithoutHash,
      );
      const indexRecord: GateAdmissionReportIndexRecord = {
        ...indexRecordWithoutHash,
        record_hash: recordHash,
      };
      await Deno.writeTextFile(
        GATE_ADMISSION_REPORT.INDEX_PATH,
        JSON.stringify(indexRecord) + "\n",
        { append: true, create: true },
      );
      return { path, created: true, indexRecord };
    } catch (e) {
      if (!(e instanceof Deno.errors.AlreadyExists)) throw e;

      const existing = await Deno.readTextFile(path);
      const parsed = JSON.parse(existing) as GateAdmissionReport;
      const existingHash = await GATE_ADMISSION_REPORT.hash(parsed);
      if (existingHash !== reportHash) {
        throw new Error(`GATE_ADMISSION_REPORT_HASH_CONFLICT:${reportHash}`);
      }
      return { path, created: false };
    }
  },
};
