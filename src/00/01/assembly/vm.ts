// deno-lint-ignore-file
// @ts-nocheck
import {
  INSTRUCTIONS_OFFSET,
  MAX_ATOMS,
  GRID_W,
  GRID_H,
  NEURAL_COHERENCE_OFF,
  MEMORY_GRID_OFF
} from "./constants.assembly";

import {
  getReg,
  setReg,
  getPC,
  setPC,
  setPendingSyscall,
  getX,
  getY,
  getPhase,
  setPhase,
  getSpatialGridCount,
  getSpatialGridAtom,
  getHormone,
  setEnergy,
  setResonance
} from "./memory_access";

import { WORLD_MAX_X, WORLD_MAX_Y, clampWorldX, clampWorldY, storeClampedPos, dir4X, dir4Y, dir8X, dir8Y, inGrid } from "./spatial";

import { math_sin, math_cos } from "./math";

// We import these two from index.ts to prevent duplicate complexity, circular imports are fine in AS for pure functions
import { readStructureCharge } from "./pulse_orchestrator";

// RISC-I Opcodes
export const OP_NOP: u8 = 0x00;
export const OP_SET: u8 = 0x01; // SET Reg, Imm8
export const OP_GET: u8 = 0x02; // GET Reg, Prop
export const OP_PUT: u8 = 0x03; // PUT Reg, Prop
export const OP_ADD: u8 = 0x04; // ADD R1, R2
export const OP_SUB: u8 = 0x05; // SUB R1, R2
export const OP_JNZ: u8 = 0x11; // JNZ Reg, RelAddr
export const OP_JMP: u8 = 0x12; // JMP RelAddr
export const OP_SYSCALL: u8 = 0x60;
export const OP_RESOLVE: u8 = 0xB0;
export const OP_RESONATE_KURAMOTO: u8 = 0xB1;
export const OP_SENSE: u8 = 0xB2;
export const OP_SPORE_DRIVE: u8 = 0xA8;

// Property IDs for GET/PUT
export const PROP_ENERGY: u8 = 0;
export const PROP_RESONANCE: u8 = 1;
export const PROP_X: u8 = 2;
export const PROP_Y: u8 = 3;
export const PROP_PHASE: u8 = 4;
export const PROP_GRID_CHARGE: u8 = 7;
export const PROP_QUORUM: u8 = 8;
export const PROP_NEURAL_COHERENCE: u8 = 9;
export const PROP_MEMORY: u8 = 10;
export const PROP_CONSENSUS: u8 = 11;

export function evaluate_opcodes(
  atomIndex: i32,
  energy: i32,
  resonance: i32,
  mass: i32
): i32 {
  let pc = getPC(atomIndex);
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
        setReg(atomIndex, reg as i32, imm as i32);
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
        else if (prop == PROP_X) val = getX(atomIndex) as i32;
        else if (prop == PROP_Y) val = getY(atomIndex) as i32;
        else if (prop == PROP_PHASE) val = getPhase(atomIndex);
        else if (prop == PROP_GRID_CHARGE) {
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (inGrid(gx, gy)) {
            val = readStructureCharge(gy * GRID_W + gx);
          }
        } else if (prop == PROP_QUORUM) {
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (inGrid(gx, gy)) {
            val = getSpatialGridCount(gx, gy);
          }
        } else if (prop == PROP_NEURAL_COHERENCE) {
          val = atomic.load<i32>(NEURAL_COHERENCE_OFF);
        } else if (prop == PROP_MEMORY) {
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (inGrid(gx, gy)) {
            val = load<u8>(MEMORY_GRID_OFF + ((gy * GRID_W + gx) << 3)) as i32;
          }
        } else if (prop == PROP_CONSENSUS) {
          val = getHormone(6) as i32;
        }
        setReg(atomIndex, reg as i32, val);
        pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_PUT: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let prop = load<u8>(instr_base + (pc + 2) as usize);
        let val = getReg(atomIndex, reg as i32);
        if (prop == PROP_ENERGY) {
          energy = val;
          setEnergy(atomIndex, val);
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
          setResonance(atomIndex, resonance);
          setEnergy(atomIndex, energy);
        } else if (prop == PROP_PHASE) setPhase(atomIndex, val);
        pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_ADD: {
        let r1 = load<u8>(instr_base + (pc + 1) as usize);
        let r2 = load<u8>(instr_base + (pc + 2) as usize);
        setReg(
          atomIndex,
          r1 as i32,
          getReg(atomIndex, r1 as i32) + getReg(atomIndex, r2 as i32),
        );
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_SUB: {
        let r1 = load<u8>(instr_base + (pc + 1) as usize);
        let r2 = load<u8>(instr_base + (pc + 2) as usize);
        setReg(
          atomIndex,
          r1 as i32,
          getReg(atomIndex, r1 as i32) - getReg(atomIndex, r2 as i32),
        );
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_JNZ: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let target = load<u8>(instr_base + (pc + 2) as usize);
        if (getReg(atomIndex, reg as i32) != 0) pc = target;
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
        setPendingSyscall(atomIndex, 1);
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_RESOLVE: {
        let destReg = load<u8>(instr_base + ((pc + 1) as usize));
        let angleReg = load<u8>(instr_base + ((pc + 2) as usize));
        let modeReg = load<u8>(instr_base + ((pc + 3) as usize));

        let angle = getReg(atomIndex, angleReg as i32);
        let modeVal = getReg(atomIndex, modeReg as i32);

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

        setReg(atomIndex, destReg as i32, val);
        pc += 4;
        gasUsed += cost;
        break;
      }
      case OP_RESONATE_KURAMOTO: {
        let gx = (getX(atomIndex) / 1000) as i32;
        let gy = (getY(atomIndex) / 1000) as i32;
        let sumSin = 0;
        let currentPhase = getPhase(atomIndex);
        let neighborCount = 0;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            let nx = gx + dx;
            let ny = gy + dy;
            if (inGrid(nx, ny)) {
              let count = getSpatialGridCount(nx, ny);
              for (let i = 0; i < count; i++) {
                let neighborId = getSpatialGridAtom(nx, ny, i);
                if (
                  neighborId > 0 && neighborId != atomIndex &&
                  neighborId < MAX_ATOMS
                ) {
                  let neighborPhase = getPhase(neighborId);
                  let diff = (neighborPhase - currentPhase) & 255;
                  sumSin += math_sin(diff, 0); // Direct lookup for density scaling
                  neighborCount++;
                }
              }
            }
          }
        }

        let coh = atomic.load<i32>(NEURAL_COHERENCE_OFF);
        let K = 5 + (coh / 100);
        if (K > 128) K = 128;

        if (neighborCount > 0) {
          let d_theta = (K * sumSin) >> 15;
          let theta_next = (currentPhase + d_theta) & 255;
          setPhase(atomIndex, theta_next);
        }

        pc += 1;
        gasUsed += 5 + neighborCount * 2;
        break;
      }
      case OP_SPORE_DRIVE: {
        setPendingSyscall(atomIndex, 20); // 20 = SYS_SPORE_DRIVE in JS Host
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_SENSE: {
        setPendingSyscall(atomIndex, 21); // 21 = SYS_SENSE_PHASE
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
  setPC(atomIndex, pc);
  
  // We mutated resonance and energy inside OP_PUT, return them if we had multiple returns, but here we expect caller to just fetch them again. Yes! So we just return gasUsed!
  return gasUsed;
}
