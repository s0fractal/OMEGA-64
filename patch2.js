const fs = require('fs');
let worker = fs.readFileSync('src/02/PULSE_WORKER.ts', 'utf8');

// Instrument Worker
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

// Instrument Pulse orchestrator to print the stalled atom
pulse = pulse.replace(
  /if \(err instanceof WorkerTimeoutError\) \{/,
  `if (err instanceof WorkerTimeoutError) {
      const syncState = STATE_MATRIX.syncState;
      if (syncState) {
         console.error(\`\n[FATAL STALL] Worker \${workerIndex} deadlocked on Atom \${syncState[1]} at stage \${syncState[2]} (1=WASM, 2=JS)\`);
      }`
);

fs.writeFileSync('src/02/PULSE.ts', pulse);
console.log("Patched both files for exact freeze detection!");
