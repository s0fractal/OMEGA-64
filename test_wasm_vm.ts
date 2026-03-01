const WASM_PATH = "./omega_wasm_asc/build/lambda_vm.wasm";

async function testWasm() {
    console.log("🕸️ [TEST] Loading Wasm Module...");
    const wasmCode = await Deno.readFile(WASM_PATH);
    const wasmModule = await WebAssembly.instantiate(wasmCode, {
        env: {
            memory: new WebAssembly.Memory({ initial: 1 }),
            abort: () => console.log("Abort called")
        }
    });

    const exports = wasmModule.instance.exports as any;
    const memory = new Uint8Array(exports.memory.buffer);
    const memoryF32 = new Float32Array(exports.memory.buffer);
    
    // Test ISA_ADD (0x40)
    console.log("   [TEST] Testing ISA_ADD (r0 = r1 + r2)");
    // Input Buffer at 0
    memory[0] = 0x40; // op (ADD)
    memory[1] = 0;    // p1 (dest r0)
    memory[2] = 1;    // p2 (src r1)
    memory[3] = 2;    // p3 (src r2)
    memory[4] = 0;    // bonuses
    
    // Context starts at 5. Registers start at Context[2] => offset 5 + 2 = 7
    memory[7 + 1] = 15; // r1 = 15
    memory[7 + 2] = 27; // r2 = 27

    const handled = exports.execute_atom();
    
    if (handled !== 1) {
        console.log("❌ [TEST] Wasm refused to handle ISA_ADD.");
        Deno.exit(1);
    }

    // Output Buffer at 64. Context starts at 64 + 20 = 84. Registers start at 84 + 2 = 86
    const r0 = memory[86 + 0];
    console.log(`   [TEST] Result r0 = ${r0} (Target: 42)`);

    if (r0 === 42) {
        console.log("✅ [TEST] Wasm ISA_ADD works perfectly. ⚡🕸️");
    } else {
        console.log("❌ [TEST] Wasm math failed.");
        Deno.exit(1);
    }
}

testWasm();
