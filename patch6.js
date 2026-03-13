const fs = require('fs');

let worker = fs.readFileSync('src/02/PULSE_WORKER.ts', 'utf8');

// Fix syncStateView initialization
worker = worker.replace(
  /syncStateView = new Int32Array\(sb, OFFSETS\.SYNC_STATE_OFFSET, 1\);/,
  `syncStateView = new Int32Array(sb, OFFSETS.SYNC_STATE_OFFSET, 4);`
);

// Re-inject the watchdog
worker = worker.replace(
  /const beforeX11 = Atomics\.load\(xsView!, 11\);/,
  `Atomics.store(syncStateView, 1, i);
        Atomics.store(syncStateView, 2, 1); // 1 = execute_atom_fn
        const beforeX11 = Atomics.load(xsView!, 11);`
);

worker = worker.replace(
  /handle_syscall\(i\);/,
  `Atomics.store(syncStateView, 2, 2); // 2 = handle_syscall
        handle_syscall(i);`
);

fs.writeFileSync('src/02/PULSE_WORKER.ts', worker);

let pulse = fs.readFileSync('src/02/PULSE.ts', 'utf8');

pulse = pulse.replace(
  /if \(syncState\) \{\}/g,
  `if (syncState) {
         console.error(\`\\n[FATAL STALL] Worker \${workerIndex} deadlocked on Atom \${Atomics.load(syncState, 1)} at stage \${Atomics.load(syncState, 2)} (1=WASM, 2=JS)\`);
      }`
);

fs.writeFileSync('src/02/PULSE.ts', pulse);
console.log("Patched correctly!");
