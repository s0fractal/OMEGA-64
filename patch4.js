const fs = require('fs');

let worker = fs.readFileSync('src/02/PULSE_WORKER.ts', 'utf8');

// Undo bad patch
worker = worker.replace(
  /Atomics\.store\(syncStateView, 1, i\);\s*Atomics\.store\(syncStateView, 2, 1\); \/\/ 1 = execute_atom_fn\s*/g,
  ""
);
worker = worker.replace(
  /Atomics\.store\(syncStateView, 2, 2\); \/\/ 2 = handle_syscall\s*/g,
  ""
);

// Add DONE tracing
worker = worker.replace(
  /self\.postMessage\(\{ type: "DONE", pulseId \}\);/g,
  `console.log("[WORKER " + currentPulseId + "] SENDING DONE", pulseId);
    self.postMessage({ type: "DONE", pulseId });`
);

fs.writeFileSync('src/02/PULSE_WORKER.ts', worker);

let pulse = fs.readFileSync('src/02/PULSE.ts', 'utf8');

// Add listener tracing
pulse = pulse.replace(
  /const listener = \(e: MessageEvent\) => \{/g,
  `const listener = (e: MessageEvent) => {
      console.log("[HOST] RECEIVED MESSAGE", e.data);`
);

// Undo bad pulse patch
pulse = pulse.replace(
  /const syncState_arr = STATE_MATRIX.syncState;/g,
  `const syncState = STATE_MATRIX.syncState;`
);
pulse = pulse.replace(
  /if \(syncState_arr\) \{[\s\S]*?console\.error\(\`\\n\[FATAL STALL\] Worker \$\{workerIndex\} deadlocked on Atom \$\{val1\} at stage \$\{val2\} \(1=WASM, 2=JS\)\`\);[\s\S]*?\}/g,
  `if (syncState) {}` // remove the deadlocked console error safely
);

fs.writeFileSync('src/02/PULSE.ts', pulse);
console.log("Patched trace logs for DONE!");
