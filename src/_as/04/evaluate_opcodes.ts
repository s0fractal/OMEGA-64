// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/evaluate_opcodes.md
import { INSTRUCTIONS_OFFSET, MAX_ATOMS, GRID_W, NEURAL_COHERENCE_OFF, MEMORY_GRID_OFF, OP_NOP, OP_SET, OP_GET, OP_PUT, OP_ADD, OP_SUB, OP_JNZ, OP_JMP, OP_SYSCALL, OP_RESOLVE, OP_RESONATE_KURAMOTO, OP_SPORE_DRIVE, OP_SENSE_AS, PROP_ENERGY, PROP_RESONANCE, PROP_X, PROP_Y, PROP_PHASE, PROP_GRID_CHARGE, PROP_QUORUM, PROP_NEURAL_COHERENCE, PROP_MEMORY, PROP_CONSENSUS, get_p_c, set_p_c, get_x, get_y, get_phase, set_phase, get_reg, set_reg, get_spatial_grid_count, get_spatial_grid_atom, get_hormone, set_energy, set_resonance, set_pending_syscall, in_grid, read_structure_charge, math_sin, math_cos } from "../03/mod";

@inline
export function evaluate_opcodes(atomIndex: i32, energy: i32, resonance: i32, mass: i32): i32 {
let pc = get_p_c(atomIndex);
  const instr_base: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;

  let gasUsed: i32 = 0;
  // Hard cap to prevent WASM thread lockup, bounded by physical energy
  let baseLimit: i32 = energy < 100 ? energy : 100;
  let gasLimit: i32 = baseLimit / mass;
  if (gasLimit < 1) gasLimit = 1;

  while (gasUsed < gasLimit) {
    const op = load<u8>(instr_base + (pc as usize));
    if (op == OP_NOP) {
      gasUsed += 1;
      break;
    }

    switch (op) {
      case OP_SET: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let imm = load<i8>(instr_base + (pc + 2) as usize);
        set_reg(atomIndex, reg as i32, imm as i32);
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_GET: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let prop = load<u8>(instr_base + (pc + 2) as usize);
        let val: i32 = 0;
        if (prop == PROP_ENERGY) val = energy;
        else if (prop == PROP_RESONANCE) val = resonance;
        else if (prop == PROP_X) val = get_x(atomIndex) as i32;
        else if (prop == PROP_Y) val = get_y(atomIndex) as i32;
        else if (prop == PROP_PHASE) val = get_phase(atomIndex);
        else if (prop == PROP_GRID_CHARGE) {
          let rx = get_x(atomIndex) as i32;
          let ry = get_y(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (in_grid(gx, gy)) {
            val = read_structure_charge(gy * GRID_W + gx);
          }
        } else if (prop == PROP_QUORUM) {
          let rx = get_x(atomIndex) as i32;
          let ry = get_y(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (in_grid(gx, gy)) {
            val = get_spatial_grid_count(gx, gy);
          }
        } else if (prop == PROP_NEURAL_COHERENCE) {
          val = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
        } else if (prop == PROP_MEMORY) {
          let rx = get_x(atomIndex) as i32;
          let ry = get_y(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (in_grid(gx, gy)) {
            val = load<u8>(MEMORY_GRID_OFF + ((gy * GRID_W + gx) << 3)) as i32;
          }
        } else if (prop == PROP_CONSENSUS) {
          val = get_hormone(6) as i32;
        }
        set_reg(atomIndex, reg as i32, val);
        pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_PUT: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let prop = load<u8>(instr_base + (pc + 2) as usize);
        let val = get_reg(atomIndex, reg as i32);
        if (prop == PROP_ENERGY) {
          energy = val;
          set_energy(atomIndex, val);
        } else if (prop == PROP_RESONANCE) {
          if (val > resonance) {
            let diff = val - resonance;
            let cost = diff * 1000; // Energy is stored in thousandths
            if (energy >= cost) {
              energy -= cost;
              resonance = val;
            } else {
              resonance += energy / 1000;
              energy = 0;
            }
          } else {
            // Free stealth drop
            resonance = val;
          }
          set_resonance(atomIndex, resonance);
          set_energy(atomIndex, energy);
        } else if (prop == PROP_PHASE) set_phase(atomIndex, val);
        pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_ADD: {
        let r1 = load<u8>(instr_base + (pc + 1) as usize);
        let r2 = load<u8>(instr_base + (pc + 2) as usize);
        set_reg(
          atomIndex,
          r1 as i32,
          get_reg(atomIndex, r1 as i32) + get_reg(atomIndex, r2 as i32),
        );
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_SUB: {
        let r1 = load<u8>(instr_base + (pc + 1) as usize);
        let r2 = load<u8>(instr_base + (pc + 2) as usize);
        set_reg(
          atomIndex,
          r1 as i32,
          get_reg(atomIndex, r1 as i32) - get_reg(atomIndex, r2 as i32),
        );
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_JNZ: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let target = load<u8>(instr_base + (pc + 2) as usize);
        if (get_reg(atomIndex, reg as i32) != 0) pc = target;
        else pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_JMP: {
        pc = load<u8>(instr_base + (pc + 1) as usize);
        gasUsed += 2;
        break;
      }
      case OP_SYSCALL: {
        set_pending_syscall(atomIndex, 1);
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_RESOLVE: {
        let destReg = load<u8>(instr_base + ((pc + 1) as usize));
        let angleReg = load<u8>(instr_base + ((pc + 2) as usize));
        let modeReg = load<u8>(instr_base + ((pc + 3) as usize));

        let angle = get_reg(atomIndex, angleReg as i32);
        let modeVal = get_reg(atomIndex, modeReg as i32);

        // modeVal decoding:
        // 0: Sin Direct  (1 Gas)
        // 1: Sin LERP    (5 Gas)
        // 2: Cos Direct  (1 Gas)
        // 3: Cos LERP    (5 Gas)
        // 4: Sin Taylor2 (10 Gas - Reserved)

        let val = 0;
        let cost = 1;
        let highRes = 0;

        if (modeVal == 1 || modeVal == 3) {
          highRes = 1;
          cost = 5;
        } else if (modeVal == 4 || modeVal == 5) {
          highRes = 2; // Reserved for Taylor2
          cost = 10;
        }

        if (modeVal == 0 || modeVal == 1 || modeVal == 4) {
          val = math_sin(angle, highRes);
        } else {
          val = math_cos(angle, highRes);
        }

        set_reg(atomIndex, destReg as i32, val);
        pc += 4;
        gasUsed += cost;
        break;
      }
      case OP_RESONATE_KURAMOTO: {
        let gx = (get_x(atomIndex) / 1000) as i32;
        let gy = (get_y(atomIndex) / 1000) as i32;
        let sumSin = 0;
        let currentPhase = get_phase(atomIndex);
        let neighborCount = 0;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            let nx = gx + dx;
            let ny = gy + dy;
            if (in_grid(nx, ny)) {
              let count = get_spatial_grid_count(nx, ny);
              for (let i = 0; i < count; i++) {
                let neighborId = get_spatial_grid_atom(nx, ny, i);
                if (
                  neighborId > 0 && neighborId != atomIndex &&
                  neighborId < MAX_ATOMS
                ) {
                  let neighborPhase = get_phase(neighborId);
                  let diff = (neighborPhase - currentPhase) & 255;
                  sumSin += math_sin(diff, 0); // Direct lookup for density scaling
                  neighborCount++;
                }
              }
            }
          }
        }

        let coh = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
        let K = 5 + (coh / 100);
        if (K > 128) K = 128;

        if (neighborCount > 0) {
          let d_theta = (K * sumSin) >> 15;
          let theta_next = (currentPhase + d_theta) & 255;
          set_phase(atomIndex, theta_next as u8);
        }

        pc += 1;
        gasUsed += 5 + neighborCount * 2;
        break;
      }
      case OP_SPORE_DRIVE: {
        set_pending_syscall(atomIndex, 20); // 20 = SYS_SPORE_DRIVE in JS Host
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_SENSE_AS: {
        set_pending_syscall(atomIndex, 21); // 21 = SYS_SENSE_PHASE
        pc += 1;
        gasUsed += 2;
        gasLimit = 0; // force yield to host
        break;
      }
      default: {
        pc = 0; // Reset or stop
        gasUsed += 1;
        gasLimit = 0; // stop execution on invalid opcode
        break;
      }
    }
    if (pc >= 64) pc = 0;
  }
  set_p_c(atomIndex, pc);
  
  // We mutated resonance and energy inside OP_PUT, return them if we had multiple returns, but here we expect caller to just fetch them again. Yes! So we just return gasUsed!
  return gasUsed;
}
