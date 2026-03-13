// deno-lint-ignore-file
// @ts-nocheck
import { XS_OFFSET, YS_OFFSET, WORLD_MAX_X, WORLD_MAX_Y, GRID_W, GRID_H } from "./constants.assembly";

export { WORLD_MAX_X, WORLD_MAX_Y };

export function clampWorldX(x: i32): i32 {
  if (x < 0) return 0;
  if (x > WORLD_MAX_X) return WORLD_MAX_X;
  return x;
}

export function clampWorldY(y: i32): i32 {
  if (y < 0) return 0;
  if (y > WORLD_MAX_Y) return WORLD_MAX_Y;
  return y;
}

export function storeClampedPos(idx: i32, x: i32, y: i32): void {
  store<i16>(XS_OFFSET + (idx << 1) as usize, clampWorldX(x) as i16);
  store<i16>(YS_OFFSET + (idx << 1) as usize, clampWorldY(y) as i16);
}

export function dir4X(n: i32): i32 {
  if (n == 0) return -1;
  if (n == 1) return 1;
  return 0;
}

export function dir4Y(n: i32): i32 {
  if (n == 2) return -1;
  if (n == 3) return 1;
  return 0;
}

export function dir8X(n: i32): i32 {
  if (n == 0 || n == 4 || n == 6) return -1;
  if (n == 1 || n == 5 || n == 7) return 1;
  return 0;
}

export function dir8Y(n: i32): i32 {
  if (n == 2 || n == 4 || n == 5) return -1;
  if (n == 3 || n == 6 || n == 7) return 1;
  return 0;
}

export function inGrid(x: i32, y: i32): boolean {
  return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
}
