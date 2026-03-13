const fs = require('fs');
let code = fs.readFileSync('src/02/PULSE_WORKER.ts', 'utf8');

if (!code.includes('performance.now()')) {
  code = code.replace(/for \(let i = startIdx; i < endIdx; i\+\+\) \{/, `for (let i = startIdx; i < endIdx; i++) {
        const startAtomMs = performance.now();
        const startId = Atomics.load(idsView, i);`);
  
  code = code.replace(/handle_syscall\(i\); \/\/ Process any syscall intent pending from the atom/, `handle_syscall(i); // Process any syscall intent pending from the atom
        const deltaAtomMs = performance.now() - startAtomMs;
        if (deltaAtomMs > 1000) {
           console.log(\`[WATCHDOG MUST SEE] Atom \${i} took \${deltaAtomMs}ms to execute!\`);
        }`);
  
  fs.writeFileSync('src/02/PULSE_WORKER.ts', code);
  console.log("Patched PULSE_WORKER.ts with watchdog!");
}
