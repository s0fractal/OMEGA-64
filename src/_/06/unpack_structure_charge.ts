// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/unpack_structure_charge.md
import { TYPES } from "@g05";

export function unpack_structure_charge(intent: number): number {
    return ((intent >>> 0) & 0x7F000000) >>> 24;
}
