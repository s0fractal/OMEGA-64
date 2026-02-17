import { GATE_RUNNER } from "../../../4/0/GATE_RUNNER/_.ts";
import type { GateRunnerTickInput, GateRunnerTickOutput } from "../../../4/0/GATE_RUNNER/_.ts";

export const GLIDER_LITE = (input: GateRunnerTickInput): Promise<GateRunnerTickOutput> => GATE_RUNNER.step(input);
