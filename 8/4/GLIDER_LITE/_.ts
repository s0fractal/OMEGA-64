import { GATE_RUNNER_GATE_RUNNER as GATE_RUNNER } from "@omega";
import type { GATE_RUNNER_GateRunnerTickInput as GateRunnerTickInput, GATE_RUNNER_GateRunnerTickOutput as GateRunnerTickOutput } from "@omega";

export const GLIDER_LITE = (input: GateRunnerTickInput): Promise<GateRunnerTickOutput> => GATE_RUNNER.step(input);
