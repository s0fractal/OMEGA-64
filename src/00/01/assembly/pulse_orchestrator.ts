// deno-lint-ignore-file
// @ts-nocheck
// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

export * from "../../../_as/mod";
import { build_spatial_hash as core_build_spatial_hash, diffuse_viral_semantics, tick_structure_grid } from "../../../_as/mod";

let spatialHashOverflowCount: i32 = 0;
let spatialHashMaxCellCount: i32 = 0;

export function get_spatial_hash_overflow_count(): i32 {
  return spatialHashOverflowCount;
}

export function get_spatial_hash_max_cell_count(): i32 {
  return spatialHashMaxCellCount;
}

export function build_spatial_hash(): void {
  const result: i64 = core_build_spatial_hash();
  spatialHashMaxCellCount = (result >> 32) as i32;
  spatialHashOverflowCount = (result & 0xFFFFFFFF) as i32;
}

export { diffuse_viral_semantics as diffuseViralSemantics };

export function tick_matrix(): void {
  tick_structure_grid();
}
