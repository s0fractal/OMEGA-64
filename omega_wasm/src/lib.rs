#![no_std]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

const ISA_MOVE: u8 = 0x10;
const ISA_ADD: u8 = 0x40;
const ISA_SUB: u8 = 0x41;
const ISA_LOAD: u8 = 0x50;
const ISA_STORE: u8 = 0x51;

#[repr(C)]
pub struct WasmInput {
    pub op: u8,
    pub p1: u8,
    pub p2: u8,
    pub p3: u8,
    pub bonuses: u8,
    pub context: [u8; 32],
}

#[repr(C)]
pub struct WasmOutput {
    pub energy_delta: f32,
    pub resonance_delta: f32,
    pub new_context: [u8; 32],
    pub has_intent: u8,
    pub intent_dx: f32,
    pub intent_dy: f32,
}

#[no_mangle]
pub static mut INPUT_BUFFER: WasmInput = WasmInput {
    op: 0, p1: 0, p2: 0, p3: 0, bonuses: 0, context: [0; 32],
};

#[no_mangle]
pub static mut OUTPUT_BUFFER: WasmOutput = WasmOutput {
    energy_delta: 0.0,
    resonance_delta: 0.0,
    new_context: [0; 32],
    has_intent: 0,
    intent_dx: 0.0,
    intent_dy: 0.0,
};

#[no_mangle]
pub extern "C" fn execute_atom() -> u8 {
    unsafe {
        let input = &INPUT_BUFFER;
        let mut output = &mut OUTPUT_BUFFER;

        // Reset output
        output.energy_delta = 0.0;
        output.resonance_delta = 0.0;
        output.has_intent = 0;
        output.intent_dx = 0.0;
        output.intent_dy = 0.0;
        output.new_context.copy_from_slice(&input.context);

        let is_swift = (input.bonuses & 1) == 1;

        if input.bonuses > 0 {
            output.energy_delta -= 0.05;
        }

        let p1 = input.p1 as usize;
        let p2 = input.p2 as usize;
        let p3 = input.p3 as usize;

        match input.op {
            ISA_MOVE => {
                output.has_intent = 1;
                output.intent_dx = (input.p1 as f32 - 128.0) / 10.0;
                output.intent_dy = (input.p2 as f32 - 128.0) / 10.0;
                if !is_swift {
                    output.energy_delta -= 1.0;
                }
                1 // Handled
            }
            ISA_ADD => {
                let v1 = output.new_context[2 + (p2 % 8)];
                let v2 = output.new_context[2 + (p3 % 8)];
                output.new_context[2 + (p1 % 8)] = v1.wrapping_add(v2);
                1 // Handled
            }
            ISA_SUB => {
                let v1 = output.new_context[2 + (p2 % 8)];
                let v2 = output.new_context[2 + (p3 % 8)];
                output.new_context[2 + (p1 % 8)] = v1.wrapping_sub(v2);
                1 // Handled
            }
            ISA_LOAD => {
                // Stack reads. Stack is indices 10 to 17. SP is index 18.
                let sp = output.new_context[18] as usize % 8;
                if input.p2 == 0 { // REG => REG (Internal copy)
                    output.new_context[2 + (p1 % 8)] = output.new_context[2 + (p3 % 8)];
                } else if input.p2 == 1 { // STACK => REG
                    output.new_context[2 + (p1 % 8)] = output.new_context[10 + sp];
                }
                1 // Handled
            }
            ISA_STORE => {
                if input.p1 == 1 { // REG => STACK
                    let sp = output.new_context[18] as usize % 8;
                    output.new_context[10 + sp] = output.new_context[2 + (p2 % 8)];
                    // sp++
                    output.new_context[18] = (sp as u8 + 1) % 8;
                }
                1 // Handled
            }
            _ => {
                0 // Not Handled. Fallback to JS.
            }
        }
    }
}
