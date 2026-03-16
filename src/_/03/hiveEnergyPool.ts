// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/hiveEnergyPool.md
import { HIVE_ENERGY_POOL_SIZE, HIVE_ENERGY_POOL_OFFSET, sharedBuffer, TYPES } from "@g02";

export const hiveEnergyPool = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE);
