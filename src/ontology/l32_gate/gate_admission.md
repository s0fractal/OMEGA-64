---
id: CANON_CAUSAL_BRIDGE
type: module
name: Canon Causal Bridge Admission
description: Gate admission verification logic prioritizing invariant integrity chains.
tags:
  - gate
vars:
  - BridgeInvariantReportLike
deps:
  - TYPES
min_level: 12
---

### TypeScript
```typescript
const resolveBridgeMode = (
  report?: BridgeInvariantReportLike,
): { mode: "GREEN" | "AMBER" | "RED"; reason: string } => {
  if (!report) {
    return { mode: "AMBER", reason: "INVARIANT_REPORT_MISSING" };
  }

  const indexChecked = report.index_chain_checked === true;
  const indexOk = report.index_chain_ok !== false;
  const gateChecked = report.gate_admission_index_chain_checked === true;
  const gateOk = report.gate_admission_index_chain_ok !== false;

  if (!indexOk) {
    const failure = report.index_chain_failures?.[0] ?? "INDEX_CHAIN_FAILED";
    return { mode: "RED", reason: failure };
  }
  if (!gateOk) {
    const failure = report.gate_admission_index_chain_failures?.[0] ??
      "GATE_ADMISSION_INDEX_CHAIN_FAILED";
    return { mode: "RED", reason: failure };
  }

  if (!indexChecked || !gateChecked) {
    const missingChecks: string[] = [];
    if (!indexChecked) missingChecks.push("INDEX_CHAIN_UNCHECKED");
    if (!gateChecked) {
      missingChecks.push("GATE_ADMISSION_INDEX_CHAIN_UNCHECKED");
    }
    return { mode: "AMBER", reason: missingChecks.join("+") };
  }

  return { mode: "GREEN", reason: "INVARIANT_INDEX_CHAIN_VERIFIED" };
};

const proposalIsCanonBound = (proposal: unknown): boolean => {
  const p = proposal as { target_path?: string; canon_bound?: boolean };
  if (p?.canon_bound === true) return true;
  const target = typeof p?.target_path === "string"
    ? p.target_path.trim().toUpperCase()
    : "";
  return target === "CANON" || target.startsWith("CANON/") ||
    target.startsWith("CANON:") || target.startsWith("/CANON");
};

const extractBridgeInvariantReport = (
  state: unknown,
  explicit?: BridgeInvariantReportLike,
): BridgeInvariantReportLike | undefined => {
  if (explicit) return explicit;
  if (!state || typeof state !== "object") return undefined;
  const s = state as Record<string, unknown>;
  const direct = s.bridge_invariant_report;
  if (direct && typeof direct === "object") {
    return direct as BridgeInvariantReportLike;
  }
  const runtime = s.runtime;
  if (runtime && typeof runtime === "object") {
    const fromRuntime = (runtime as Record<string, unknown>)
      .bridge_invariant_report;
    if (fromRuntime && typeof fromRuntime === "object") {
      return fromRuntime as BridgeInvariantReportLike;
    }
  }
  const replayAudit = s.replay_audit;
  if (replayAudit && typeof replayAudit === "object") {
    const invariantReport = (replayAudit as Record<string, unknown>)
      .invariantReport;
    if (invariantReport && typeof invariantReport === "object") {
      return invariantReport as BridgeInvariantReportLike;
    }
  }
  return undefined;
};

const bridgeVerifyDetailed = (
  state: unknown,
  proposals: unknown,
  explicitReport?: BridgeInvariantReportLike,
): {
  ok: boolean;
  mode: "GREEN" | "AMBER" | "RED";
  reason: string;
  canon_bound_proposals: string[];
  blocked_canon_proposals: string[];
} => {
  const list = Array.isArray(proposals) ? proposals : [];
  const canonBound = list
    .filter((p) => proposalIsCanonBound(p))
    .map((p, idx) => {
      const id =
        typeof (p as { proposal_id?: unknown }).proposal_id === "string"
          ? ((p as { proposal_id: string }).proposal_id)
          : "canon_" + idx;
      return id;
    });
  const report = extractBridgeInvariantReport(state, explicitReport);
  const resolution = resolveBridgeMode(report);
  const blocked = resolution.mode === "GREEN" ? [] : [...canonBound];
  return {
    ok: blocked.length === 0,
    mode: resolution.mode,
    reason: resolution.reason,
    canon_bound_proposals: canonBound,
    blocked_canon_proposals: blocked,
  };
};

export const CANON_CAUSAL_BRIDGE = {
  verify: (
    state: unknown,
    proposals: unknown,
    report?: BridgeInvariantReportLike,
  ): boolean => bridgeVerifyDetailed(state, proposals, report).ok,
  verifyDetailed: bridgeVerifyDetailed,
  resolveMode: (report?: BridgeInvariantReportLike) =>
    resolveBridgeMode(report),
  isCanonBound: (proposal: unknown) => proposalIsCanonBound(proposal),
};
```
