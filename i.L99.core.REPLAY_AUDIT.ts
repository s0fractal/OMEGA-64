/// <reference lib="deno.ns" />
// i.L99.core.REPLAY_AUDIT.ts
// OMEGA-64 | Deterministic Replay Audit
// Produces a strict replayGreen signal from ledger events.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { LedgerEvent, PolicyTransitionEvent, TopologyEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { TOPOLOGICAL_SIGNATURE, TopologicalSignature } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";
import { CRYSTALLIZATION_CONFIG, CRYSTALLIZATION_POLICY } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import { CRYSTALLIZATION_REPORT } from "./i.L99.core.CRYSTALLIZATION_REPORT.ts";
import { GATE_ADMISSION_REPORT } from "./i.L99.core.GATE_ADMISSION_REPORT.ts";
import type { InvariantPacket } from "./i.L32.core.INVARIANT_PACKET.ts";
import { INVARIANT_PACKET } from "./i.L32.core.INVARIANT_PACKET.ts";
import { I16_CLAMP } from "./i.L00.core.I16_CLAMP.ts";
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

export interface ReplayGenesis {
    tick: number;
    state_i16: Int16Array;
    state_hash: string;
}

export interface ReplayAuditOptions {
    runs?: number;
    startTick?: number;
    endTick?: number;
    verifyTopologicalSignatures?: boolean;
    verifyLedgerChain?: boolean;
    invariantOnly?: boolean;
}

export interface ReplayAuditResult {
    replayGreen: boolean;
    runs: number;
    checkedEvents: number;
    skippedEvents: number;
    checkedProjectionEvents: number;
    skippedProjectionEvents: number;
    projectionTickReport: ProjectionTickReport[];
    checkedPolicyEvents: number;
    skippedPolicyEvents: number;
    policyTickReport: PolicyTickReport[];
    checkedCanonReports: number;
    skippedCanonReports: number;
    canonReportTickReport: CanonReportTickReport[];
    checkedGateAdmissionReports: number;
    skippedGateAdmissionReports: number;
    gateAdmissionReportTickReport: GateAdmissionReportTickReport[];
    invariantPacket?: InvariantPacket;
    invariantReport: ReplayInvariantReport;
    finalHashes: string[];
    failures: string[];
}

export interface ProjectionTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
}

export interface PolicyTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
    policy_version?: string;
    policy_hash?: string;
}

export interface CanonReportTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
    report_hash?: string;
    report_uri?: string;
}

export interface GateAdmissionReportTickReport {
    tick: number;
    status: "PASS" | "FAIL" | "SKIP";
    reason: string;
    report_hash?: string;
    report_uri?: string;
}

export interface ReplayInvariantReport {
    index_chain_checked: boolean;
    index_chain_ok: boolean;
    index_chain_checked_records: number;
    index_chain_failures: string[];
    gate_admission_index_chain_checked: boolean;
    gate_admission_index_chain_ok: boolean;
    gate_admission_index_chain_checked_records: number;
    gate_admission_index_chain_failures: string[];
    ledger_chain_checked?: boolean;
    ledger_chain_ok?: boolean;
    ledger_chain_checked_events?: number;
    ledger_chain_chain_anchored_events?: number;
    ledger_chain_legacy_events?: number;
    ledger_chain_failures?: string[];
}

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b));
        const body = entries
            .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
            .join(",");
        return `{${body}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

const saturatingAdd = (base: Int16Array, delta: Array<{ level: number; value: number }>): Int16Array => {
    const next = new Int16Array(base) as Int16Array;
    for (const d of delta) {
        if (!Number.isInteger(d.level) || d.level < 0 || d.level >= next.length) {
            continue;
        }
        const value = next[d.level] + d.value;
        next[d.level] = I16_CLAMP(value);
    }
    return next;
};

const expectedStateHash = async (
    nextState: Int16Array,
    nextTick: number,
    gateConfigVersion: string,
    proposalDigest: string
): Promise<string> =>
    await sha256Hex(stableStringify({
        state_i16: Array.from(nextState),
        tick: nextTick,
        gate_config_version: gateConfigVersion,
        proposal_digest: proposalDigest
    }));

const isPolicyTransitionEvent = (entry: TopologyEvent): entry is PolicyTransitionEvent =>
    "event_type" in entry && entry.event_type === "POLICY_TRANSITION_EVENT";

const isCanonizationEvent = (entry: TopologyEvent): entry is TopologyEvent & {
    event_type: "CANONIZATION_EVENT";
    checkpoint_tick: number;
    crystallization_report_hash?: string;
    crystallization_report_uri?: string;
    gate_admission_report_hash?: string;
    gate_admission_report_uri?: string;
} =>
    "event_type" in entry && entry.event_type === "CANONIZATION_EVENT";

const isLedgerEvent = (entry: TopologyEvent): entry is LedgerEvent =>
    !("event_type" in entry) &&
    typeof entry.tick === "number" &&
    Array.isArray(entry.accepted_delta) &&
    typeof entry.state_before_hash === "string" &&
    typeof entry.state_after_hash === "string";

const collectLedgerEvents = async (
    startTick?: number,
    endTick?: number
): Promise<{
    events: LedgerEvent[];
    transitionsByTick: Map<number, PolicyTransitionEvent[]>;
    canonByCheckpointTick: Map<number, TopologyEvent[]>;
    skipped: number;
}> => {
    const byTick = new Map<number, LedgerEvent>();
    const transitionsByTick = new Map<number, PolicyTransitionEvent[]>();
    const canonByCheckpointTick = new Map<number, TopologyEvent[]>();
    let skipped = 0;

    for await (const entry of LEDGER.readAllRaw()) {
        if (isPolicyTransitionEvent(entry)) {
            const inStart = startTick === undefined || entry.tick >= startTick;
            const inEnd = endTick === undefined || entry.tick <= endTick;
            if (!inStart || !inEnd) continue;
            const current = transitionsByTick.get(entry.tick) ?? [];
            current.push(entry);
            transitionsByTick.set(entry.tick, current);
            continue;
        }
        if (isCanonizationEvent(entry)) {
            const inStart = startTick === undefined || entry.checkpoint_tick >= startTick;
            const inEnd = endTick === undefined || entry.checkpoint_tick <= endTick;
            if (!inStart || !inEnd) continue;
            const current = canonByCheckpointTick.get(entry.checkpoint_tick) ?? [];
            current.push(entry);
            canonByCheckpointTick.set(entry.checkpoint_tick, current);
            continue;
        }
        if (!isLedgerEvent(entry)) {
            continue;
        }
        const inStart = startTick === undefined || entry.tick >= startTick;
        const inEnd = endTick === undefined || entry.tick <= endTick;
        if (!inStart || !inEnd) {
            continue;
        }
        // Skip non-mutating dry-run style events in replay chain.
        if (entry.state_after_hash === entry.state_before_hash) {
            skipped++;
            continue;
        }
        // Last event for same tick wins (append-only correction pattern).
        byTick.set(entry.tick, entry);
    }

    return {
        events: Array.from(byTick.values()).sort((a, b) => a.tick - b.tick),
        transitionsByTick,
        canonByCheckpointTick,
        skipped
    };
};

export const REPLAY_AUDIT = {
    audit: async (genesis: ReplayGenesis, options: ReplayAuditOptions = {}): Promise<ReplayAuditResult> => {
        const runs = options.runs ?? 3;
        const verifyTopologicalSignatures = options.verifyTopologicalSignatures ?? true;
        const { events, transitionsByTick, canonByCheckpointTick, skipped } = await collectLedgerEvents(options.startTick, options.endTick);
        const localPolicyHash = await CRYSTALLIZATION_POLICY.hash();
        const finalHashes: string[] = [];
        const failures: string[] = [];
        let checkedProjectionEvents = 0;
        let skippedProjectionEvents = 0;
        const projectionTickReport: ProjectionTickReport[] = [];
        let checkedPolicyEvents = 0;
        const skippedPolicyEvents = 0;
        const policyTickReport: PolicyTickReport[] = [];
        let checkedCanonReports = 0;
        let skippedCanonReports = 0;
        const canonReportTickReport: CanonReportTickReport[] = [];
        let checkedGateAdmissionReports = 0;
        let skippedGateAdmissionReports = 0;
        const gateAdmissionReportTickReport: GateAdmissionReportTickReport[] = [];
        const invariantReport: ReplayInvariantReport = {
            index_chain_checked: false,
            index_chain_ok: true,
            index_chain_checked_records: 0,
            index_chain_failures: [],
            gate_admission_index_chain_checked: false,
            gate_admission_index_chain_ok: true,
            gate_admission_index_chain_checked_records: 0,
            gate_admission_index_chain_failures: [],
            ledger_chain_checked: false,
            ledger_chain_ok: true,
            ledger_chain_checked_events: 0,
            ledger_chain_chain_anchored_events: 0,
            ledger_chain_legacy_events: 0,
            ledger_chain_failures: []
        };
        if (options.verifyLedgerChain ?? false) {
            const ledgerChain = await LEDGER.verifyChainDetailed();
            invariantReport.ledger_chain_checked = true;
            invariantReport.ledger_chain_ok = ledgerChain.ok;
            invariantReport.ledger_chain_checked_events = ledgerChain.checkedEvents;
            invariantReport.ledger_chain_chain_anchored_events = ledgerChain.chainAnchoredEvents;
            invariantReport.ledger_chain_legacy_events = ledgerChain.legacyEvents;
            invariantReport.ledger_chain_failures = [...ledgerChain.failures];
            if (!ledgerChain.ok) {
                return {
                    replayGreen: false,
                    runs,
                    checkedEvents: events.length,
                    skippedEvents: skipped,
                    checkedProjectionEvents,
                    skippedProjectionEvents,
                    projectionTickReport,
                    checkedPolicyEvents,
                    skippedPolicyEvents,
                    policyTickReport,
                    checkedCanonReports,
                    skippedCanonReports,
                    canonReportTickReport,
                    checkedGateAdmissionReports,
                    skippedGateAdmissionReports,
                    gateAdmissionReportTickReport,
                    invariantReport,
                    finalHashes,
                    failures: ledgerChain.failures.map((x) => `ledger_chain:${x}`)
                };
            }
        }
        const hasCanonEvents = canonByCheckpointTick.size > 0;
        if (hasCanonEvents) {
            const indexChain = await CRYSTALLIZATION_REPORT.verifyIndexChain(true);
            invariantReport.index_chain_checked = true;
            invariantReport.index_chain_ok = indexChain.ok;
            invariantReport.index_chain_checked_records = indexChain.checkedRecords;
            invariantReport.index_chain_failures = [...indexChain.failures];
            if (!indexChain.ok) {
                return {
                    replayGreen: false,
                    runs,
                    checkedEvents: events.length,
                    skippedEvents: skipped,
                    checkedProjectionEvents,
                    skippedProjectionEvents,
                    projectionTickReport,
                    checkedPolicyEvents,
                    skippedPolicyEvents,
                    policyTickReport,
                    checkedCanonReports,
                    skippedCanonReports,
                    canonReportTickReport,
                    checkedGateAdmissionReports,
                    skippedGateAdmissionReports,
                    gateAdmissionReportTickReport,
                    invariantReport,
                    finalHashes,
                    failures: indexChain.failures.map((x) => `index_chain:${x}`)
                };
            }
            const gateIndexChain = await GATE_ADMISSION_REPORT.verifyIndexChain(true);
            invariantReport.gate_admission_index_chain_checked = true;
            invariantReport.gate_admission_index_chain_ok = gateIndexChain.ok;
            invariantReport.gate_admission_index_chain_checked_records = gateIndexChain.checkedRecords;
            invariantReport.gate_admission_index_chain_failures = [...gateIndexChain.failures];
            if (!gateIndexChain.ok) {
                return {
                    replayGreen: false,
                    runs,
                    checkedEvents: events.length,
                    skippedEvents: skipped,
                    checkedProjectionEvents,
                    skippedProjectionEvents,
                    projectionTickReport,
                    checkedPolicyEvents,
                    skippedPolicyEvents,
                    policyTickReport,
                    checkedCanonReports,
                    skippedCanonReports,
                    canonReportTickReport,
                    checkedGateAdmissionReports,
                    skippedGateAdmissionReports,
                    gateAdmissionReportTickReport,
                    invariantReport,
                    finalHashes,
                    failures: gateIndexChain.failures.map((x) => `gate_admission_index_chain:${x}`)
                };
            }
        }
        if (options.invariantOnly) {
            const packet = await INVARIANT_PACKET.fromInvariantReport(
                invariantReport,
                { tick_anchor: options.endTick ?? genesis.tick }
            );
            return {
                replayGreen: true,
                runs,
                checkedEvents: 0,
                skippedEvents: events.length + skipped,
                checkedProjectionEvents,
                skippedProjectionEvents,
                projectionTickReport,
                checkedPolicyEvents,
                skippedPolicyEvents,
                policyTickReport,
                checkedCanonReports,
                skippedCanonReports,
                canonReportTickReport,
                checkedGateAdmissionReports,
                skippedGateAdmissionReports,
                gateAdmissionReportTickReport,
                invariantPacket: packet,
                invariantReport,
                finalHashes: [genesis.state_hash],
                failures
            };
        }

        for (let run = 0; run < runs; run++) {
            let tick = genesis.tick;
            let stateHash = genesis.state_hash;
            let state = new Int16Array(genesis.state_i16) as Int16Array;
            let currentPolicyVersion: string | undefined;
            let currentPolicyHash: string | undefined;

            for (const evt of events) {
                const expectedTick = tick;
                if (evt.tick !== expectedTick) {
                    failures.push(`run=${run} tick continuity mismatch: expected ${expectedTick}, got ${evt.tick}`);
                    break;
                }
                if (evt.state_before_hash !== stateHash) {
                    failures.push(`run=${run} state_before_hash mismatch at tick ${evt.tick}`);
                    break;
                }

                const nextState = saturatingAdd(state, evt.accepted_delta);
                const nextTick = tick + 1;
                const expectedHash = await expectedStateHash(
                    nextState,
                    nextTick,
                    evt.gate_config_version,
                    evt.proposal_digest
                );

                if (evt.state_after_hash !== expectedHash) {
                    failures.push(`run=${run} state_after_hash mismatch at tick ${evt.tick}`);
                    break;
                }

                const policyVersion = evt.policy_version;
                const policyHash = evt.policy_hash;
                const transitions = transitionsByTick.get(evt.tick) ?? [];
                if (!policyVersion || !policyHash) {
                    failures.push(`run=${run} missing policy anchor at tick ${evt.tick}`);
                    if (run === 0) {
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "FAIL",
                            reason: "MISSING_POLICY_ANCHOR"
                        });
                    }
                    break;
                }

                if (
                    policyVersion === CRYSTALLIZATION_CONFIG.policyVersion &&
                    policyHash !== localPolicyHash
                ) {
                    failures.push(`run=${run} policy hash mismatch with local config at tick ${evt.tick}`);
                    if (run === 0) {
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "FAIL",
                            reason: "LOCAL_POLICY_HASH_MISMATCH",
                            policy_version: policyVersion,
                            policy_hash: policyHash
                        });
                    }
                    break;
                }

                if (currentPolicyVersion === undefined || currentPolicyHash === undefined) {
                    currentPolicyVersion = policyVersion;
                    currentPolicyHash = policyHash;
                    if (run === 0) {
                        checkedPolicyEvents++;
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "PASS",
                            reason: "POLICY_ANCHOR_SET",
                            policy_version: policyVersion,
                            policy_hash: policyHash
                        });
                    }
                } else if (policyVersion !== currentPolicyVersion || policyHash !== currentPolicyHash) {
                    const transition = transitions.find((t) =>
                        t.to_policy_version === policyVersion &&
                        t.to_policy_hash === policyHash
                    );
                    if (!transition) {
                        failures.push(`run=${run} policy change without transition at tick ${evt.tick}`);
                        if (run === 0) {
                            policyTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "POLICY_CHANGE_WITHOUT_TRANSITION",
                                policy_version: policyVersion,
                                policy_hash: policyHash
                            });
                        }
                        break;
                    }
                    if (
                        transition.from_policy_version !== undefined &&
                        transition.from_policy_version !== currentPolicyVersion
                    ) {
                        failures.push(`run=${run} transition from_policy_version mismatch at tick ${evt.tick}`);
                        if (run === 0) {
                            policyTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "TRANSITION_FROM_VERSION_MISMATCH",
                                policy_version: policyVersion,
                                policy_hash: policyHash
                            });
                        }
                        break;
                    }
                    if (
                        transition.from_policy_hash !== undefined &&
                        transition.from_policy_hash !== currentPolicyHash
                    ) {
                        failures.push(`run=${run} transition from_policy_hash mismatch at tick ${evt.tick}`);
                        if (run === 0) {
                            policyTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "TRANSITION_FROM_HASH_MISMATCH",
                                policy_version: policyVersion,
                                policy_hash: policyHash
                            });
                        }
                        break;
                    }
                    currentPolicyVersion = policyVersion;
                    currentPolicyHash = policyHash;
                    if (run === 0) {
                        checkedPolicyEvents++;
                        policyTickReport.push({
                            tick: evt.tick,
                            status: "PASS",
                            reason: "POLICY_TRANSITION_APPLIED",
                            policy_version: policyVersion,
                            policy_hash: policyHash
                        });
                    }
                } else if (run === 0) {
                    checkedPolicyEvents++;
                    policyTickReport.push({
                        tick: evt.tick,
                        status: "PASS",
                        reason: "POLICY_ANCHOR_STABLE",
                        policy_version: policyVersion,
                        policy_hash: policyHash
                    });
                }

                const canonEvents = canonByCheckpointTick.get(nextTick) ?? [];
                if (canonEvents.length > 0) {
                    const canon = canonEvents[canonEvents.length - 1] as {
                        crystallization_report_hash?: string;
                        crystallization_report_uri?: string;
                        gate_admission_report_hash?: string;
                        gate_admission_report_uri?: string;
                    };
                    const reportHash = canon.crystallization_report_hash;
                    const reportUri = canon.crystallization_report_uri;

                    if (!reportHash || !reportUri) {
                        failures.push(`run=${run} missing canon report anchor at tick ${evt.tick}`);
                        if (run === 0) {
                            canonReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "MISSING_CANON_REPORT_ANCHOR",
                                report_hash: reportHash,
                                report_uri: reportUri
                            });
                        }
                        break;
                    }

                    try {
                        const body = await Deno.readTextFile(reportUri);
                        const parsed = JSON.parse(body);
                        const computed = await CRYSTALLIZATION_REPORT.hash(parsed);
                        if (computed !== reportHash) {
                            failures.push(`run=${run} canon report hash mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                canonReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "CANON_REPORT_HASH_MISMATCH",
                                    report_hash: reportHash,
                                    report_uri: reportUri
                                });
                            }
                            break;
                        }
                        const indexRecord = await CRYSTALLIZATION_REPORT.findIndexRecord(reportHash, reportUri);
                        if (!indexRecord) {
                            failures.push(`run=${run} canon report index missing/mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                canonReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "CANON_REPORT_INDEX_MISSING_OR_MISMATCH",
                                    report_hash: reportHash,
                                    report_uri: reportUri
                                });
                            }
                            break;
                        }
                        if (run === 0) {
                            checkedCanonReports++;
                            canonReportTickReport.push({
                                tick: evt.tick,
                                status: "PASS",
                                reason: "CANON_REPORT_MATCH",
                                report_hash: reportHash,
                                report_uri: reportUri
                            });
                        }
                    } catch {
                        failures.push(`run=${run} canon report missing/unreadable at tick ${evt.tick}`);
                        if (run === 0) {
                            canonReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "CANON_REPORT_MISSING_OR_UNREADABLE",
                                report_hash: reportHash,
                                report_uri: reportUri
                            });
                        }
                        break;
                    }

                    const gateReportHash = canon.gate_admission_report_hash;
                    const gateReportUri = canon.gate_admission_report_uri;

                    if (!gateReportHash || !gateReportUri) {
                        failures.push(`run=${run} missing gate admission report anchor at tick ${evt.tick}`);
                        if (run === 0) {
                            gateAdmissionReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "MISSING_GATE_ADMISSION_REPORT_ANCHOR",
                                report_hash: gateReportHash,
                                report_uri: gateReportUri
                            });
                        }
                        break;
                    }

                    try {
                        const body = await Deno.readTextFile(gateReportUri);
                        const parsed = JSON.parse(body);
                        const computed = await GATE_ADMISSION_REPORT.hash(parsed);
                        if (computed !== gateReportHash) {
                            failures.push(`run=${run} gate admission report hash mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                gateAdmissionReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "GATE_ADMISSION_REPORT_HASH_MISMATCH",
                                    report_hash: gateReportHash,
                                    report_uri: gateReportUri
                                });
                            }
                            break;
                        }
                        const indexRecord = await GATE_ADMISSION_REPORT.findIndexRecord(gateReportHash, gateReportUri);
                        if (!indexRecord) {
                            failures.push(`run=${run} gate admission report index missing/mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                gateAdmissionReportTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "GATE_ADMISSION_REPORT_INDEX_MISSING_OR_MISMATCH",
                                    report_hash: gateReportHash,
                                    report_uri: gateReportUri
                                });
                            }
                            break;
                        }
                        if (run === 0) {
                            checkedGateAdmissionReports++;
                            gateAdmissionReportTickReport.push({
                                tick: evt.tick,
                                status: "PASS",
                                reason: "GATE_ADMISSION_REPORT_MATCH",
                                report_hash: gateReportHash,
                                report_uri: gateReportUri
                            });
                        }
                    } catch {
                        failures.push(`run=${run} gate admission report missing/unreadable at tick ${evt.tick}`);
                        if (run === 0) {
                            gateAdmissionReportTickReport.push({
                                tick: evt.tick,
                                status: "FAIL",
                                reason: "GATE_ADMISSION_REPORT_MISSING_OR_UNREADABLE",
                                report_hash: gateReportHash,
                                report_uri: gateReportUri
                            });
                        }
                        break;
                    }
                } else if (run === 0) {
                    skippedCanonReports++;
                    canonReportTickReport.push({
                        tick: evt.tick,
                        status: "SKIP",
                        reason: "NO_CANONIZATION_EVENT"
                    });
                    skippedGateAdmissionReports++;
                    gateAdmissionReportTickReport.push({
                        tick: evt.tick,
                        status: "SKIP",
                        reason: "NO_CANONIZATION_EVENT"
                    });
                }

                if (verifyTopologicalSignatures) {
                    const hasProjectionData = Boolean(
                        evt.projection_2d_hash ||
                        evt.thread_1d_hash ||
                        evt.projection_version ||
                        evt.signature_artifact_hash ||
                        evt.signature_tick ||
                        evt.signature_causal_refs
                    );

                    if (hasProjectionData) {
                        if (!evt.projection_2d_hash || !evt.thread_1d_hash || !evt.projection_version) {
                            failures.push(`run=${run} incomplete projection fields at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "INCOMPLETE_PROJECTION_FIELDS"
                                });
                            }
                            break;
                        }
                        if (evt.projection_version !== TOPOLOGICAL_SIGNATURE.PROJECTION_VERSION) {
                            failures.push(`run=${run} unsupported projection version at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "UNSUPPORTED_PROJECTION_VERSION"
                                });
                            }
                            break;
                        }
                        if (evt.signature_tick !== undefined && evt.signature_tick !== nextTick) {
                            failures.push(`run=${run} signature_tick mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "SIGNATURE_TICK_MISMATCH"
                                });
                            }
                            break;
                        }
                        if (evt.signature_artifact_hash !== undefined && evt.signature_artifact_hash !== evt.proposal_digest) {
                            failures.push(`run=${run} signature_artifact_hash mismatch at tick ${evt.tick}`);
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: "SIGNATURE_ARTIFACT_HASH_MISMATCH"
                                });
                            }
                            break;
                        }

                        const signature: TopologicalSignature = {
                            artifact_hash: evt.signature_artifact_hash ?? evt.proposal_digest,
                            state_hash: expectedHash,
                            tick: evt.signature_tick ?? nextTick,
                            causal_refs: evt.signature_causal_refs ?? [],
                            projection_2d_hash: evt.projection_2d_hash,
                            thread_1d_hash: evt.thread_1d_hash,
                            projection_version: evt.projection_version
                        };

                        const verifyResult = await TOPOLOGICAL_SIGNATURE.verify(
                            signature,
                            TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
                                state_hash: expectedHash,
                                state_i16: nextState
                            })
                        );

                        if (!verifyResult.ok) {
                            failures.push(
                                `run=${run} projection mismatch at tick ${evt.tick}: ${verifyResult.reasons.join("|")}`
                            );
                            if (run === 0) {
                                projectionTickReport.push({
                                    tick: evt.tick,
                                    status: "FAIL",
                                    reason: `PROJECTION_MISMATCH:${verifyResult.reasons.join("|")}`
                                });
                            }
                            break;
                        }

                        if (run === 0) {
                            checkedProjectionEvents++;
                            projectionTickReport.push({
                                tick: evt.tick,
                                status: "PASS",
                                reason: "PROJECTION_MATCH"
                            });
                        }
                    } else {
                        if (run === 0) {
                            skippedProjectionEvents++;
                            projectionTickReport.push({
                                tick: evt.tick,
                                status: "SKIP",
                                reason: "NO_PROJECTION_FIELDS"
                            });
                        }
                    }
                } else if (run === 0) {
                    skippedProjectionEvents++;
                    projectionTickReport.push({
                        tick: evt.tick,
                        status: "SKIP",
                        reason: "VERIFY_DISABLED"
                    });
                }

                tick = nextTick;
                state = nextState;
                stateHash = expectedHash;
            }

            finalHashes.push(stateHash);
        }

        const allEqual = finalHashes.length > 0 && finalHashes.every((h) => h === finalHashes[0]);
        const replayGreen = failures.length === 0 && allEqual;

        return {
            replayGreen,
            runs,
            checkedEvents: events.length,
            skippedEvents: skipped,
            checkedProjectionEvents,
            skippedProjectionEvents,
            projectionTickReport,
            checkedPolicyEvents,
            skippedPolicyEvents,
            policyTickReport,
            checkedCanonReports,
            skippedCanonReports,
            canonReportTickReport,
            checkedGateAdmissionReports,
            skippedGateAdmissionReports,
            gateAdmissionReportTickReport,
            invariantReport,
            finalHashes,
            failures
        };
    },

    /**
     * Helper for GATE or other components to verify causal integrity of an event.
     */
    verifyEventCausalIntegrity: async (
        event: LedgerEvent,
        previousState: { tick: number; state_hash: string; state_i16: Int16Array }
    ): Promise<{ ok: boolean; reason?: string }> => {
        if (event.tick !== previousState.tick) {
            return { ok: false, reason: `TICK_MISMATCH: expected ${previousState.tick}, got ${event.tick}` };
        }
        if (event.state_before_hash !== previousState.state_hash) {
            return { ok: false, reason: `BASE_HASH_MISMATCH: expected ${previousState.state_hash}, got ${event.state_before_hash}` };
        }
        
        // saturatingAdd logic from inside REPLAY_AUDIT
        const nextStateI16 = new Int16Array(previousState.state_i16);
        for (const d of event.accepted_delta) {
            let value = nextStateI16[d.level] + d.value;
            if (value > I16.max) value = I16.max;
            if (value < I16.min) value = I16.min;
            nextStateI16[d.level] = value;
        }

        const nextTick = previousState.tick + 1;
        const expectedHash = await expectedStateHash(
            nextStateI16,
            nextTick,
            event.gate_config_version,
            event.proposal_digest
        );
        if (event.state_after_hash !== expectedHash) {
            return { ok: false, reason: `STATE_AFTER_HASH_MISMATCH: computed ${expectedHash}, event has ${event.state_after_hash}` };
        }
        return { ok: true };
    }
};

if ((import.meta as any).main) {
    await Deno.stdout.write(
        new TextEncoder().encode("Usage: import REPLAY_AUDIT and call audit(genesis, options).\n")
    );
}
const I16 = I16_LIMITS();
