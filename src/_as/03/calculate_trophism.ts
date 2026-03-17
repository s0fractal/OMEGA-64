// SSoT: file:///Users/s0fractal/OMEGA/I/physics/calculate_trophism.md
import { SPATIAL_CELL_SIZE, MAX_ATOMS, ROLE_PRODUCER, ROLE_NEUTRAL, ROLE_GUARDIAN, ROLE_PARASITE, ROLE_ARCHITECT, GRID_W, fast_min, get_read_energy, in_grid, get_spatial_grid_count, get_spatial_grid_atom, get_read_x, get_read_y, get_role, add_energy_delta, add_resonance_delta, get_read_resonance, get_attention_cell, get_glyph_influence, read_structure_cell, encode_force_tuple } from "../02/mod";

@inline
export function calculate_trophism(idx: i32, x: i32, y: i32, role: u8): void {
let tx: f32 = 0;
let ty: f32 = 0;
const radius: f32 = 250.0;
const detectionRadiusSq: f32 = 225.0; // 15^2
const flow: i32 = (0.2 * 1000.0) as i32; // Using 1000.0 for literal scale
const burn: i32 = (1.0 * 1000.0) as i32;
let energy = get_read_energy(idx);

const gx = x / SPATIAL_CELL_SIZE;
const gy = y / SPATIAL_CELL_SIZE;

// Scan neighborhood for chemotaxis, trophic flow, and social recognition
for (let oy = -3; oy <= 3; oy++) {
  for (let ox = -3; ox <= 3; ox++) {
    let cx = gx + ox;
    let cy = gy + oy;
    if (in_grid(cx, cy)) {
      let count = get_spatial_grid_count(cx, cy);
      for (let s = 0; s < count; s++) {
        let otherIdx = get_spatial_grid_atom(cx, cy, s);
        if (otherIdx == idx || otherIdx >= MAX_ATOMS) continue;

        let oX = get_read_x(otherIdx) as f32;
        let oY = get_read_y(otherIdx) as f32;
        let dx = oX - (x as f32);
        let dy = oY - (y as f32);
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.001) {
          // Overlapping atoms flow energy but don't apply chemotaxis/avoidance (divide by zero)
          d2 = 0.001;
        } else if (d2 < 1.0) {
          // Minor overlap, let it through
        }

        // --- PHASE 15: SOCIAL RECOGNITION (AVOIDANCE) ---
        if (d2 < 100.0) { // Too close!
          tx -= dx * 0.5;
          ty -= dy * 0.5;
        }

        // --- PHASE 17+: TROPHIC FLOW ---
        if (d2 <= detectionRadiusSq) {
          let otherRole = get_role(otherIdx);
          if (role == ROLE_PRODUCER && otherRole == ROLE_NEUTRAL) {
            if (energy > 100 * 1000) {
              add_energy_delta(idx, -flow);
              add_energy_delta(otherIdx, flow);
              energy -= flow;
            }
          }
          if (role == ROLE_GUARDIAN && otherRole == ROLE_PARASITE) {
            let oEnergy = get_read_energy(otherIdx);
            if (oEnergy > 0) {
              add_energy_delta(
                otherIdx,
                -fast_min(oEnergy, burn),
              );
              add_resonance_delta(idx, 5);
            }
          }
        }

        if (d2 > radius * radius) continue;
        let d = Mathf.sqrt(d2);

        // --- PHASE 14: CHEMOTAXIS ---
        let oEnergy = get_read_energy(otherIdx);
        let oRes = get_read_resonance(otherIdx);

        let multiplier: f32 = 1.0;
        if (role == ROLE_GUARDIAN && oRes > 50) multiplier = 3.0;
        if (role == ROLE_PRODUCER && (oEnergy as f32) < 50000.0) {
          multiplier = 2.0; // 50.0 * 1000
        }

        let force = ((oEnergy as f32) / 100000.0) * ((radius - d) / radius) *
          (2.0 * multiplier);

        // Hard cap on chemotactic force to prevent physics explosions
        // when arbitrary massive energy pools are assigned by the test runner.
        if (force < -20.0) force = -20.0;
        if (force > 20.0) force = 20.0;

        // Anti-overshoot mechanism: Do not pull an atom past its target
        if (force > 0.0 && force > d) {
          force = d;
        }

        tx += (dx / d) * force;
        ty += (dy / d) * force;
      }
    }
  }
}

// Observer presence field (Era 70): role-dependent response to attention gradients.
let gradX = get_attention_cell(gx + 1, gy) - get_attention_cell(gx - 1, gy);
let gradY = get_attention_cell(gx, gy + 1) - get_attention_cell(gx, gy - 1);
if (gradX > 200.0) gradX = 200.0;
if (gradX < -200.0) gradX = -200.0;
if (gradY > 200.0) gradY = 200.0;
if (gradY < -200.0) gradY = -200.0;

let attentionDrive: f32 = 0.0;
if (role == ROLE_PARASITE) {
  attentionDrive = -0.04;
} else if (role == ROLE_ARCHITECT) {
  const localAttention = get_attention_cell(gx, gy);
  attentionDrive = localAttention > 80.0 ? -0.03 : 0.02;
} else if (role == ROLE_GUARDIAN) {
  attentionDrive = 0.02;
} else {
  attentionDrive = 0.05; // Producers and neutral explorers gravitate to attention.
}
tx += gradX * attentionDrive;
ty += gradY * attentionDrive;

let glyphGradX = get_glyph_influence(gx + 1, gy, role) -
  get_glyph_influence(gx - 1, gy, role);
let glyphGradY = get_glyph_influence(gx, gy + 1, role) -
  get_glyph_influence(gx, gy - 1, role);
if (glyphGradX > 200.0) glyphGradX = 200.0;
if (glyphGradX < -200.0) glyphGradX = -200.0;
if (glyphGradY > 200.0) glyphGradY = 200.0;
if (glyphGradY < -200.0) glyphGradY = -200.0;
tx += glyphGradX * 0.015;
ty += glyphGradY * 0.015;

if (role == ROLE_ARCHITECT) {
  // Simple 4-way density check
  for (let i = 0; i < 4; i++) {
    let ox: i32 = 0;
    let oy: i32 = 0;
    if (i == 0) {
      oy = -2;
    } else if (i == 1) {
      oy = 2;
    } else if (i == 2) {
      ox = -2;
    } else {
      ox = 2;
    }
    let cx = gx + ox;
    let cy = gy + oy;
    if (in_grid(cx, cy)) {
      let cell = read_structure_cell(cy * GRID_W + cx);
      let density = (cell >> 8) & 0xFF;
      let force = (255.0 as f32 - (density as f32)) / (50.0 as f32);
      tx += ((ox as f32) / (2.0 as f32)) * force;
      ty += ((oy as f32) / (2.0 as f32)) * force;
    }
  }
}

return encode_force_tuple(tx, ty);
}
