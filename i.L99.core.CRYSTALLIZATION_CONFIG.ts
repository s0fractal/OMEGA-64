// i.L99.core.CRYSTALLIZATION_CONFIG.ts
// OMEGA-64 | Canon Policy | Crystallization Runtime Defaults

export interface CrystallizationConfig {
    policyVersion: string;
    window: number;
    minSoftPasses: number;
    defaultRequiredWindows: number;
    projectionDriftMaxP95: number;
    projectionDriftTopLevels: number;
}

export const CRYSTALLIZATION_CONFIG: CrystallizationConfig = {
    policyVersion: "crystallization/v1",
    window: 512,
    minSoftPasses: 5,
    defaultRequiredWindows: 3,
    projectionDriftMaxP95: 1024,
    projectionDriftTopLevels: 8
};
