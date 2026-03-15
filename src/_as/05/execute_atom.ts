/** SSoT: {@link ../../ontology/core/execute_atom.md} */
import { IDS_OFFSET, INSTRUCTIONS_OFFSET, BONDS_OFFSET, MAX_ATOMS, NEURAL_COHERENCE_OFF, evaluate_opcodes, get_p_c, get_read_energy, get_read_resonance, get_hormone, get_phase, set_phase, set_resonance, fire_signal, get_energy, get_resonance, set_energy } from "../04/mod";

@inline
export function execute_atom(atomIndex: i32): void {
let id = load<u64>(IDS_OFFSET + (atomIndex << 3) as usize);
if (id == 0) return;

let pc = get_p_c(atomIndex);
let energy = get_read_energy(atomIndex);
let resonance = get_read_resonance(atomIndex);
const instrBase: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;

// Bounded Reduction - Gas Accounting Economy
let mass: i32 = 1;
const bondBase = BONDS_OFFSET + (atomIndex << 4) as usize;
for (let b = 0; b < 4; b++) {
  const target = load<i32>(bondBase + (b << 2) as usize);
  if (target > 0 && target < MAX_ATOMS) mass++;
}

let gasUsed = evaluate_opcodes(atomIndex, energy, resonance, mass);

// HORMONE 0: entropy_pressure scales metabolic cost (range 0..2048 → +0..+4 per executed step)
let entropyH: i32 = get_hormone(0) as i32;
// HORMONE 5: mutation_friction adds a metabolic floor (range 0..2048 → +0..+8 per execute)
let frictionH: i32 = get_hormone(5) as i32;

// --- [x] Stage 11.1: Neural Synthesis (The Global Coherence)
let coherenceVal = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
// Coherence discount: if global coherence is high (>100 signals), reduce cost
let discount: i32 = coherenceVal > 1000 ? 2 : (coherenceVal > 100 ? 1 : 0);

let baseComputeCost = gasUsed >> discount;
let metabolicCost = 1 + baseComputeCost +
  ((gasUsed * entropyH) >> (12 + discount)) + (frictionH >> 8);

// --- STAGE 11.1: PHASE SYNCHRONIZATION ---
if (coherenceVal > 500) {
  // Neural Field Resonance: pull atomic phase towards harmonic threshold (128)
  let curPhase: i32 = get_phase(atomIndex) as i32;
  if (curPhase < 128) curPhase += 2;
  else if (curPhase > 128) curPhase -= 1;
  set_phase(atomIndex, curPhase as u8);
}

// Auto-Firing Action Potential
if (resonance > 300) {
  if (energy > 200) {
    energy -= 200;
    set_resonance(atomIndex, 0);
    set_phase(atomIndex, 5);
    fire_signal(atomIndex);
  } else {
    set_resonance(atomIndex, 280);
  }
}

// HORMONE 4: repair_drive slows resonance decay (range 0..2048; >1024 halves decay)
let repairH: i32 = get_hormone(4) as i32;
let resonanceDecay: i32 = repairH > 1024 ? 1 : 2;
// Re-fetch energy and resonance because asynchronous Syscalls (e.g. SYS_TRANSFER) might have mutated the host buffer
let finalEnergy: i32 = get_energy(atomIndex) as i32;
let finalResonance: i32 = get_resonance(atomIndex) as i32;

if (finalResonance > 0) {
  set_resonance(atomIndex, finalResonance - resonanceDecay);
}
set_energy(
  atomIndex,
  finalEnergy > metabolicCost ? finalEnergy - metabolicCost : 0,
);
}
