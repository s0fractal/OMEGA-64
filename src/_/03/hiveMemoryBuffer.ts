// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/hiveMemoryBuffer.md
import { HIVE_MEMORY_SIZE, HIVE_MEMORY_OFFSET, sharedBuffer, TYPES } from "@g02";

export const hiveMemoryBuffer = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE).buffer;
