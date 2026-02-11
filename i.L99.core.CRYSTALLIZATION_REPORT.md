# i.L99.core.CRYSTALLIZATION_REPORT

Status: Draft  
Layer: L99  
Intent: Canonical final artifact for crystallization decisions.

## 1. Purpose

A canonization decision must be reproducible from one deterministic report artifact.

The report binds:
1. replay audit (including `policyTickReport`),
2. projection replay report,
3. projection drift analytics,
4. policy anchor (`policy_version`, `policy_hash`),
5. thresholds used for the decision.

## 2. Runtime

Source:
`i.L99.core.CRYSTALLIZATION_REPORT.ts`

API:
1. `CRYSTALLIZATION_REPORT.build(input)`
2. `CRYSTALLIZATION_REPORT.hash(report)`
3. `CRYSTALLIZATION_REPORT.buildWithHash(input)`

Version:
`crystallization-report/v1`

## 3. Event Coupling

`CANONIZATION_EVENT` MUST carry:
1. `crystallization_report_version`
2. `crystallization_report_hash`

This hash is the canonical pointer to the decision artifact.

