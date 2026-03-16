// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/hiveBalance.md
import { HIVE_BALANCE_OFFSET, sharedBuffer } from "@g02";

export const hiveBalance = new Int32Array(sharedBuffer, HIVE_BALANCE_OFFSET, 1);
