export const DETERMINISM_CAPTURE_MARKER = "__OMEGA_DETERMINISM_CAPTURE__";
const DETERMINISM_CAPTURE_SCRIPT = "02/03/test_worker_determinism.ts";

export type DeterminismAtomState = {
  idx: number;
  id: string;
  role: number;
  x: number;
  y: number;
  energy: number;
  resonance: number;
  phase: number;
  pc: number;
  logic: number[];
  bonds: number[];
  bondDistances: number[];
  damping: number;
};

export type DeterminismSnapshot = {
  activeCount: number;
  tickCounter: number;
  atoms: DeterminismAtomState[];
  structureSlice: number[];
  signalSlice: number[];
};

export type DeterminismCapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  seed: number;
  ticks: number;
  atomCount: number;
  hash: string;
  snapshot: DeterminismSnapshot;
};

export type DeterminismCaptureRunOptions = {
  workerCount: number;
  strict: boolean;
  seed?: number;
  ticks?: number;
  atomCount?: number;
  script?: string;
  context?: string;
};

const decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

export const emitDeterminismCapture = (
  payload: DeterminismCapturePayload,
): void => {
  console.log(`${DETERMINISM_CAPTURE_MARKER}${JSON.stringify(payload)}`);
};

export const parseDeterminismCaptureFromMergedOutput = (
  mergedOutput: string,
  context: string,
): DeterminismCapturePayload => {
  const markerLine = mergedOutput
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.startsWith(DETERMINISM_CAPTURE_MARKER));
  if (!markerLine) {
    throw new Error(`[${context}] capture marker missing.\n${mergedOutput}`);
  }

  return JSON.parse(
    markerLine.slice(DETERMINISM_CAPTURE_MARKER.length),
  ) as DeterminismCapturePayload;
};

export const runDeterminismCaptureSubprocess = async (
  options: DeterminismCaptureRunOptions,
): Promise<DeterminismCapturePayload> => {
  const {
    workerCount,
    strict,
    seed,
    ticks,
    atomCount,
    script = DETERMINISM_CAPTURE_SCRIPT,
    context = "DETERMINISM",
  } = options;

  const env: Record<string, string> = {
    ...Deno.env.toObject(),
    OMEGA_PULSE_WORKERS: String(workerCount),
    OMEGA_STRICT_DETERMINISM: strict ? "1" : "0",
  };
  if (typeof seed === "number") env.OMEGA_DETERMINISM_SEED = String(seed);
  if (typeof ticks === "number") env.OMEGA_DETERMINISM_TICKS = String(ticks);
  if (typeof atomCount === "number") {
    env.OMEGA_DETERMINISM_ATOMS = String(atomCount);
  }

  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", script, "--capture"],
    env,
    stdout: "piped",
    stderr: "piped",
  });

  const res = await cmd.output();
  const mergedOutput = `${decode(res.stdout)}\n${decode(res.stderr)}`;

  if (res.code !== 0) {
    throw new Error(
      `[${context}] capture failed workers=${workerCount} strict=${strict}.\n${mergedOutput}`,
    );
  }

  return parseDeterminismCaptureFromMergedOutput(mergedOutput, context);
};
