// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/pack_structure_intent.md

export function pack_structure_intent(target_type: number, target_value: number, locked: boolean): number {
    let intent = target_type | (target_value << 24);
    if (locked) {
        intent |= 0x80000000;
    }
    return intent | 0;
}
