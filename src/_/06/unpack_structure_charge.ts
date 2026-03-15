/** SSoT: {@link ../../ontology/math/unpack_structure_charge.md} */

export function unpack_structure_charge(intent: number): number {
    return ((intent >>> 0) & 0x7F000000) >>> 24;
}
