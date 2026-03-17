// SSoT: file:///Users/s0fractal/OMEGA/I/memory/hiveMemory.md
import { HIVE_MEMORY_SIZE, HIVE_MEMORY_OFFSET, sharedBuffer } from "@g02";

export const hiveMemory = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE);
