// OMEGA-64 | Wasm Kernel (AssemblyScript)

export const IN_PTR: u32 = 0;
export const OUT_PTR: u32 = 64;

const ISA_MOVE: u8 = 0x10;
const ISA_ADD: u8  = 0x40;
const ISA_SUB: u8  = 0x41;
const ISA_LOAD: u8 = 0x50;
const ISA_STORE: u8 = 0x51;

export function execute_atom(): u8 {
    let op = load<u8>(IN_PTR + 0);
    let p1 = load<u8>(IN_PTR + 1);
    let p2 = load<u8>(IN_PTR + 2);
    let p3 = load<u8>(IN_PTR + 3);
    let bonuses = load<u8>(IN_PTR + 4);

    let isSwift = (bonuses & 1) == 1;

    let energyDelta: f32 = 0.0;
    if (bonuses > 0) energyDelta -= 0.05;

    // Reset Outputs
    store<f32>(OUT_PTR + 0, energyDelta);
    store<f32>(OUT_PTR + 4, 0.0); // resonanceDelta
    store<u8>(OUT_PTR + 8, 0); // hasIntent
    store<f32>(OUT_PTR + 12, 0.0); // intentDx
    store<f32>(OUT_PTR + 16, 0.0); // intentDy

    // Copy context to output context
    for (let i: u32 = 0; i < 32; i++) {
        let v = load<u8>(IN_PTR + 5 + i);
        store<u8>(OUT_PTR + 20 + i, v);
    }

    if (op == ISA_MOVE) {
        store<u8>(OUT_PTR + 8, 1); // hasIntent = 1;
        let dx: f32 = (f32(p1) - 128.0) / 10.0;
        let dy: f32 = (f32(p2) - 128.0) / 10.0;
        store<f32>(OUT_PTR + 12, dx);
        store<f32>(OUT_PTR + 16, dy);

        if (!isSwift) energyDelta -= 1.0;
        store<f32>(OUT_PTR + 0, energyDelta);
        return 1; // Handled
    }
    
    if (op == ISA_ADD) {
        let v1 = load<u8>(OUT_PTR + 20 + 2 + (p2 % 8)); // REG2
        let v2 = load<u8>(OUT_PTR + 20 + 2 + (p3 % 8)); // REG3
        store<u8>(OUT_PTR + 20 + 2 + (p1 % 8), v1 + v2); // wrap implicitly
        return 1;
    }

    if (op == ISA_SUB) {
        let v1 = load<u8>(OUT_PTR + 20 + 2 + (p2 % 8));
        let v2 = load<u8>(OUT_PTR + 20 + 2 + (p3 % 8));
        store<u8>(OUT_PTR + 20 + 2 + (p1 % 8), v1 - v2);
        return 1;
    }

    if (op == ISA_LOAD) {
        let sp = load<u8>(OUT_PTR + 20 + 18) % 8; // context[18] is SP
        if (p2 == 0) { // REG => REG
            let val = load<u8>(OUT_PTR + 20 + 2 + (p3 % 8));
            store<u8>(OUT_PTR + 20 + 2 + (p1 % 8), val);
        } else if (p2 == 1) { // STACK => REG
            // Stack is 10..17
            let val = load<u8>(OUT_PTR + 20 + 10 + sp);
            store<u8>(OUT_PTR + 20 + 2 + (p1 % 8), val);
        }
        return 1;
    }

    if (op == ISA_STORE) {
        if (p1 == 1) { // REG => STACK
            let sp = load<u8>(OUT_PTR + 20 + 18) % 8;
            let val = load<u8>(OUT_PTR + 20 + 2 + (p2 % 8));
            store<u8>(OUT_PTR + 20 + 10 + sp, val);
            // sp++
            store<u8>(OUT_PTR + 20 + 18, (sp + 1) % 8);
        }
        return 1;
    }

    return 0; // Unhandled
}
