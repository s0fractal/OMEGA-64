import { GATE_RUNNER } from "./i.L32.core.GATE_RUNNER.ts";
import type { GateRunnerTickInput, GateRunnerTickOutput } from "./i.L32.core.GATE_RUNNER.ts";

export const GLIDER_LITE = (input: GateRunnerTickInput): Promise<GateRunnerTickOutput> => GATE_RUNNER.step(input);
