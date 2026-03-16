// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/hiveEnergyPoolBuffer.md
import { HIVE_ENERGY_POOL_SIZE, HIVE_ENERGY_POOL_OFFSET, sharedBuffer, TYPES } from "@g02";

export const hiveEnergyPoolBuffer = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE).buffer;
