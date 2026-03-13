const fs = require('fs');
let worker = fs.readFileSync('src/02/PULSE_WORKER.ts', 'utf8');

// Add safe debug view
worker = worker.replace(
  /let syncStateView: Int32Array;/g,
  `let syncStateView: Int32Array;
let debugView: Int32Array;`
);

worker = worker.replace(
  /syncStateView = new Int32Array\([^)]*\);/g,
  `syncStateView = new Int32Array(sb, OFFSETS.SYNC_STATE_OFFSET, 1);
    debugView = new Int32Array(sb, 0, 16);` // safely at address 0
);

// Inject properly
worker = worker.replace(
  /Atomics\.store\(syncStateView, 1, i\);\s*Atomics\.store\(syncStateView, 2, 1\);/g, ""
);
worker = worker.replace(
  /Atomics\.store\(syncStateView, 2, 2\);/g, ""
);

worker = worker.replace(
  /const beforeX11 = Atomics\.load\(xsView!, 11\);/g,
  `Atomics.store(debugView, 0, i);
        Atomics.store(debugView, 1, 1);
        const beforeX11 = Atomics.load(xsView!, 11);`
);

worker = worker.replace(
  /handle_syscall\(i\);/g,
  `Atomics.store(debugView, 1, 2);
        handle_syscall(i);`
);

fs.writeFileSync('src/02/PULSE_WORKER.ts', worker);

let pulse = fs.readFileSync('src/02/PULSE.ts', 'utf8');
pulse = pulse.replace(
  /\[FATAL STALL\] Worker \$\{workerIndex\} deadlocked on Atom \$\{syncState\[1\]\} at stage \$\{syncState\[2\]\} \(1=WASM, 2=JS\)/g,
  `[FATAL STALL] Worker \${workerIndex} deadlocked on Atom \${new Int32Array(STATE_MATRIX.buffer!)[0]} at stage \${new Int32Array(STATE_MATRIX.buffer!)[1]} (1=WASM, 2=JS)`
);
fs.writeFileSync('src/02/PULSE.ts', pulse);
console.log("Patched debugView safely at address 0!");
