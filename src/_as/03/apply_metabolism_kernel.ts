// SSoT: file:///Users/s0fractal/OMEGA/I/autopoiesis/apply_metabolism_kernel.md
import { METABOLISM_SCRATCH_OFFSET, IDS_OFFSET, ROLES_OFFSET, RESONANCE_OFFSET, CONTEXT_OFFSET, XS_OFFSET, YS_OFFSET, SPATIAL_CELL_SIZE, GRID_W, STRUCTURE_GRID_OFF, MEMORY_GRID_OFF, MAX_ATOMS, ENERGY_OFFSET, BONDS_OFFSET, get_energy, set_energy, genome_key16, fast_abs } from "../02/mod";

@inline
export function apply_metabolism_kernel(startIdx: i32, endIdx: i32, noveltySigned: i32, symbiosisSigned: i32, baseTax: i32, targetEnergy: i32, homeostasisBand: i32, homeostasisMaxDelta: i32, overflowThreshold: i32, spatialOverflowRatio: i32, starvationFloor: i32, subsidyEnabled: i32): void {

}
