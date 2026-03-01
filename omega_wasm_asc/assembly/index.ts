// @ts-nocheck: AssemblyScript file
// OMEGA-64 | Wasm Kernel (AssemblyScript)

export const IN_PTR: u32 = 0;
export const OUT_PTR: u32 = 64;

const ISA_MOVE: u8 = 0x10;
const ISA_JMP: u8  = 0x30;
const ISA_JZ: u8   = 0x31;
const ISA_JNZ: u8  = 0x32;
const ISA_CALL: u8 = 0x33;
const ISA_RET: u8  = 0x34;

const ISA_ADD: u8  = 0x40;
const ISA_SUB: u8  = 0x41;
const ISA_MUL: u8  = 0x42;
const ISA_CMP: u8  = 0x43;

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

    // Copy context to output context (32 bytes)
    for (let i: u32 = 0; i < 32; i++) {
        let v = load<u8>(IN_PTR + 5 + i);
        store<u8>(OUT_PTR + 20 + i, v);
    }

    // Load Logic (8 bytes starting at IN_PTR + 37)
    // context ends at 5 + 32 = 37. So logic starts at 37
    for (let j: u32 = 0; j < 8; j++) {
        let l = load<u8>(IN_PTR + 37 + j);
        store<u8>(OUT_PTR + 52 + j, l);
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

    if (op == ISA_MUL) {
        let v1 = load<u8>(OUT_PTR + 20 + 2 + (p2 % 8));
        let v2 = load<u8>(OUT_PTR + 20 + 2 + (p3 % 8));
        store<u8>(OUT_PTR + 20 + 2 + (p1 % 8), v1 * v2);
        return 1;
    }

    if (op == ISA_CMP) {
        let v1 = load<u8>(OUT_PTR + 20 + 2 + (p1 % 8));
        let v2 = load<u8>(OUT_PTR + 20 + 2 + (p2 % 8));
        let flags = load<u8>(OUT_PTR + 20 + 1);
        if (v1 == v2) {
            store<u8>(OUT_PTR + 20 + 1, flags | 0x01);
        } else {
            store<u8>(OUT_PTR + 20 + 1, flags & ~0x01);
        }
        return 1;
    }

    // --- Control Flow ---
    if (op == ISA_JMP) {
        store<u8>(OUT_PTR + 20 + 0, p1 % 16); // PC = p1
        return 2; // return 2 indicates pcJumped = true
    }

    if (op == ISA_JZ) {
        let flags = load<u8>(OUT_PTR + 20 + 1);
        if ((flags & 0x01) == 1) {
            store<u8>(OUT_PTR + 20 + 0, p1 % 16);
            return 2;
        }
        return 1;
    }

    if (op == ISA_JNZ) {
        let flags = load<u8>(OUT_PTR + 20 + 1);
        if ((flags & 0x01) == 0) {
            store<u8>(OUT_PTR + 20 + 0, p1 % 16);
            return 2;
        }
        return 1;
    }

    if (op == ISA_CALL) {
        let sp = load<u8>(OUT_PTR + 20 + 18);
        if (sp < 8) {
            let pc = load<u8>(OUT_PTR + 20 + 0);
            store<u8>(OUT_PTR + 20 + 10 + sp, (pc + 1) % 16); // push
            store<u8>(OUT_PTR + 20 + 18, (sp + 1) % 8); // sp++
            store<u8>(OUT_PTR + 20 + 0, p1 % 16); // jump
            return 2;
        }
        return 1;
    }

    if (op == ISA_RET) {
        let sp = load<u8>(OUT_PTR + 20 + 18);
        if (sp > 0) {
            let val = load<u8>(OUT_PTR + 20 + 10 + (sp - 1)); // pop
            store<u8>(OUT_PTR + 20 + 18, sp - 1); // sp--
            store<u8>(OUT_PTR + 20 + 0, val); // jump
            return 2;
        }
        return 1;
    }

    // --- Data Movement ---

    if (op == ISA_LOAD) {
        // TS: regs[p1 % 8] = logic[p2 % 8];
        let val = load<u8>(OUT_PTR + 52 + (p2 % 8)); // 52 is Logic
        store<u8>(OUT_PTR + 20 + 2 + (p1 % 8), val); // 20+2 is Regs
        return 1;
    }

    if (op == ISA_STORE) {
        // TS: res.modifiedLogic = { index: p2 % 8, value: regs[p1 % 8] };
        // Write to Logic buffer
        let val = load<u8>(OUT_PTR + 20 + 2 + (p1 % 8)); // 20+2 is Regs
        store<u8>(OUT_PTR + 52 + (p2 % 8), val); // 52 is Logic
        return 1;
    }

    return 0; // Unhandled
}
