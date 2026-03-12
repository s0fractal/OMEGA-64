import {
  type DeterminismAtomState,
  type DeterminismCapturePayload,
  runDeterminismCaptureSubprocess,
} from "@02/03/worker_determinism_capture.ts";

const REPORT_PATH = "WORKER_DRIFT_AUDIT.md";
const REPORT_JSON_PATH = "WORKER_DRIFT_AUDIT.json";

type CapturePayload = DeterminismCapturePayload;

type Snapshot = {
  activeCount: number;
  tickCounter: number;
  atoms: AtomState[];
  structureSlice: number[];
  signalSlice: number[];
};

type AtomState = DeterminismAtomState;

type AtomDrift = {
  idx: number;
  dx: number;
  dy: number;
  dPos: number;
  dEnergy: number;
  dResonance: number;
  dPhase: number;
  dPc: number;
};

type DriftMetrics = {
  hashEqual: boolean;
  activeCountDelta: number;
  tickCounterDelta: number;
  atomDiffCount: number;
  structureDiffCount: number;
  signalDiffCount: number;
  maxPosDrift: number;
  maxEnergyDrift: number;
  maxResonanceDrift: number;
  topAtomDrifts: AtomDrift[];
};

const runCapture = async (
  workerCount: number,
  strict: boolean,
): Promise<CapturePayload> => {
  return await runDeterminismCaptureSubprocess({
    workerCount,
    strict,
    context: "AUDIT",
  });
};

const countArrayDiff = (a: number[], b: number[]): number => {
  const n = Math.min(a.length, b.length);
  let diff = 0;
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) diff++;
  }
  return diff + Math.abs(a.length - b.length);
};

const computeDrift = (a: CapturePayload, b: CapturePayload): DriftMetrics => {
  const atomCount = Math.min(a.snapshot.atoms.length, b.snapshot.atoms.length);
  const drifts: AtomDrift[] = [];
  let atomDiffCount = 0;
  let maxPosDrift = 0;
  let maxEnergyDrift = 0;
  let maxResonanceDrift = 0;

  for (let i = 0; i < atomCount; i++) {
    const aa = a.snapshot.atoms[i];
    const bb = b.snapshot.atoms[i];
    const dx = Math.abs(aa.x - bb.x);
    const dy = Math.abs(aa.y - bb.y);
    const dPos = dx + dy;
    const dEnergy = Math.abs(aa.energy - bb.energy);
    const dResonance = Math.abs(aa.resonance - bb.resonance);
    const dPhase = Math.abs(aa.phase - bb.phase);
    const dPc = Math.abs(aa.pc - bb.pc);
    const changed = dPos > 0 || dEnergy > 0 || dResonance > 0 || dPhase > 0 ||
      dPc > 0;

    if (changed) atomDiffCount++;
    if (dPos > maxPosDrift) maxPosDrift = dPos;
    if (dEnergy > maxEnergyDrift) maxEnergyDrift = dEnergy;
    if (dResonance > maxResonanceDrift) maxResonanceDrift = dResonance;

    drifts.push({
      idx: aa.idx,
      dx,
      dy,
      dPos,
      dEnergy: Number(dEnergy.toFixed(3)),
      dResonance,
      dPhase,
      dPc,
    });
  }

  drifts.sort((x, y) =>
    y.dPos - x.dPos || y.dEnergy - x.dEnergy || y.dResonance - x.dResonance
  );

  return {
    hashEqual: a.hash === b.hash,
    activeCountDelta: Math.abs(a.snapshot.activeCount - b.snapshot.activeCount),
    tickCounterDelta: Math.abs(a.snapshot.tickCounter - b.snapshot.tickCounter),
    atomDiffCount,
    structureDiffCount: countArrayDiff(
      a.snapshot.structureSlice,
      b.snapshot.structureSlice,
    ),
    signalDiffCount: countArrayDiff(
      a.snapshot.signalSlice,
      b.snapshot.signalSlice,
    ),
    maxPosDrift,
    maxEnergyDrift: Number(maxEnergyDrift.toFixed(3)),
    maxResonanceDrift,
    topAtomDrifts: drifts.slice(0, 8),
  };
};

const formatAtomTable = (rows: AtomDrift[]): string => {
  if (rows.length === 0) return "_No atom drift detected._";
  const header =
    "| idx | dx | dy | dPos | dEnergy | dRes | dPhase | dPc |\n|---:|---:|---:|---:|---:|---:|---:|---:|";
  const body = rows
    .map((r) =>
      `| ${r.idx} | ${r.dx} | ${r.dy} | ${r.dPos} | ${r.dEnergy} | ${r.dResonance} | ${r.dPhase} | ${r.dPc} |`
    )
    .join("\n");
  return `${header}\n${body}`;
};

const writeReport = async (
  strictOne: CapturePayload,
  strictFour: CapturePayload,
  nonStrictOne: CapturePayload,
  nonStrictFour: CapturePayload,
  strictMetrics: DriftMetrics,
  nonStrictMetrics: DriftMetrics,
) => {
  const now = new Date().toISOString();
  const report = `# Worker Drift Audit

Generated: ${now}

## Strict Determinism

- workers=1 hash: \`${strictOne.hash}\`
- workers=4 hash: \`${strictFour.hash}\`
- hashEqual: \`${strictMetrics.hashEqual}\`
- atomDiffCount: \`${strictMetrics.atomDiffCount}\`
- structureDiffCount: \`${strictMetrics.structureDiffCount}\`
- signalDiffCount: \`${strictMetrics.signalDiffCount}\`

## Non-Strict Drift

- workers=1 hash: \`${nonStrictOne.hash}\`
- workers=4 hash: \`${nonStrictFour.hash}\`
- hashEqual: \`${nonStrictMetrics.hashEqual}\`
- activeCountDelta: \`${nonStrictMetrics.activeCountDelta}\`
- tickCounterDelta: \`${nonStrictMetrics.tickCounterDelta}\`
- atomDiffCount: \`${nonStrictMetrics.atomDiffCount}\`
- structureDiffCount: \`${nonStrictMetrics.structureDiffCount}\`
- signalDiffCount: \`${nonStrictMetrics.signalDiffCount}\`
- maxPosDrift: \`${nonStrictMetrics.maxPosDrift}\`
- maxEnergyDrift: \`${nonStrictMetrics.maxEnergyDrift}\`
- maxResonanceDrift: \`${nonStrictMetrics.maxResonanceDrift}\`

### Top Atom Drift (Non-Strict)

${formatAtomTable(nonStrictMetrics.topAtomDrifts)}
`;

  await Deno.writeTextFile(REPORT_PATH, report);
  await Deno.writeTextFile(
    REPORT_JSON_PATH,
    JSON.stringify(
      {
        generatedAt: now,
        strict: {
          worker1: strictOne,
          worker4: strictFour,
          metrics: strictMetrics,
        },
        nonStrict: {
          worker1: nonStrictOne,
          worker4: nonStrictFour,
          metrics: nonStrictMetrics,
        },
      },
      null,
      2,
    ),
  );
};

async function main() {
  console.log("AUDIT [worker-drift] capturing strict=1 baseline...");
  const strictOne = await runCapture(1, true);
  const strictFour = await runCapture(4, true);

  console.log("AUDIT [worker-drift] capturing strict=0 drift profile...");
  const nonStrictOne = await runCapture(1, false);
  const nonStrictFour = await runCapture(4, false);

  const strictMetrics = computeDrift(strictOne, strictFour);
  const nonStrictMetrics = computeDrift(nonStrictOne, nonStrictFour);

  await writeReport(
    strictOne,
    strictFour,
    nonStrictOne,
    nonStrictFour,
    strictMetrics,
    nonStrictMetrics,
  );

  console.log(`   strict hashEqual=${strictMetrics.hashEqual}`);
  console.log(`   non-strict hashEqual=${nonStrictMetrics.hashEqual}`);
  console.log(
    `   non-strict drift atoms=${nonStrictMetrics.atomDiffCount}, structure=${nonStrictMetrics.structureDiffCount}, signal=${nonStrictMetrics.signalDiffCount}, maxPos=${nonStrictMetrics.maxPosDrift}`,
  );
  console.log(`   report: ${REPORT_PATH}`);
  console.log(`   reportJson: ${REPORT_JSON_PATH}`);

  if (!strictMetrics.hashEqual) {
    throw new Error("[AUDIT] strict determinism gate failed.");
  }
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
