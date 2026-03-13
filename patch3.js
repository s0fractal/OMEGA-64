const fs = require('fs');
let pulse = fs.readFileSync('src/02/PULSE.ts', 'utf8');

pulse = pulse.replace(
  /const syncState = STATE_MATRIX.syncState;/,
  `const syncState_arr = STATE_MATRIX.syncState;`
);

pulse = pulse.replace(
  /if \(syncState\) \{([\s\S]*?)console\.error\(`\\n\[FATAL STALL\] Worker \$\{workerIndex\} deadlocked on Atom \$\{syncState\[1\]\} at stage \$\{syncState\[2\]\} \(1=WASM, 2=JS\)`\);([\s\S]*?)\}/,
  `if (syncState_arr) {
         const val1 = Atomics.load(syncState_arr, 1);
         const val2 = Atomics.load(syncState_arr, 2);
         console.error(\`\\n[FATAL STALL] Worker \${workerIndex} deadlocked on Atom \${val1} at stage \${val2} (1=WASM, 2=JS)\`);
      }`
);

fs.writeFileSync('src/02/PULSE.ts', pulse);
console.log("Patched PULSE.ts again!");
