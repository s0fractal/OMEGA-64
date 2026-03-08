// i.L64.core.PROJECTION.ts
// 🛡️ OMEGA-64 | Topological Lens | Vector 2
// "Truth is a resonance pattern projected across geometries."

import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export interface Point3D {
  x: number;
  y: number;
  z: number;
  norm: number;
}

const PROJECTION_CONFIG = {
  CYLINDER_RADIUS: 250,
  CYLINDER_HEIGHT: 800,
  TORUS_MAJOR_R: 300,
  TORUS_MINOR_R: 120,
  LEVELS: 64,
};

const toCylinder = (val: number, level: number): Point3D => {
  const norm = val / I16.abs;
  const phase = (level / PROJECTION_CONFIG.LEVELS) * Math.PI * 2 * 2;
  const r = PROJECTION_CONFIG.CYLINDER_RADIUS + (norm * 80);
  return {
    x: r * Math.cos(phase),
    z: r * Math.sin(phase),
    y: (level - 32) * 12,
    norm,
  };
};

const toTorus = (val: number, level: number): Point3D => {
  const norm = val / I16.abs;
  const theta = (level / PROJECTION_CONFIG.LEVELS) * Math.PI * 2;
  const phi = norm * Math.PI * 2;
  const R = PROJECTION_CONFIG.TORUS_MAJOR_R;
  const r = PROJECTION_CONFIG.TORUS_MINOR_R;
  return {
    x: (R + r * Math.cos(phi)) * Math.cos(theta),
    z: (R + r * Math.cos(phi)) * Math.sin(theta),
    y: r * Math.sin(phi),
    norm,
  };
};

const toOrbit = (val: number, level: number): Point3D => {
  const norm = val / I16.abs;
  const phase = (level / PROJECTION_CONFIG.LEVELS) * Math.PI * 2 * 2;
  const r = PROJECTION_CONFIG.CYLINDER_RADIUS + (norm * 10); // Minimal jitter
  return {
    x: r * Math.cos(phase),
    z: r * Math.sin(phase),
    y: (level - 32) * 12,
    norm,
  };
};

const projectState = (
  state_i16: Int16Array,
  mode: "CYLINDER" | "TORUS" | "ORBIT",
): Point3D[] => {
  const points: Point3D[] = [];
  for (let i = 0; i < state_i16.length; i++) {
    let p: Point3D;
    if (mode === "CYLINDER") p = toCylinder(state_i16[i], i);
    else if (mode === "TORUS") p = toTorus(state_i16[i], i);
    else p = toOrbit(state_i16[i], i);
    points.push(p);
  }
  return points;
};

export const PROJECTION = {
  CONFIG: PROJECTION_CONFIG,
  toCylinder,
  toTorus,
  toOrbit,
  projectState,
};
