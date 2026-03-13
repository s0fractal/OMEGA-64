const fs = require('fs');

let worker = fs.readFileSync('src/02/PULSE_WORKER.ts', 'utf8');

worker = worker.replace(
  /while \(Atomics\.load\(syncStateView, 0\) !== 1\) \{/g,
  `console.log("[WORKER " + currentPulseId + "] RECEIVED PULSE MSG. CHECKING SYNC STATE...", Atomics.load(syncStateView, 0));
    let stuckCycles = 0;
    while (Atomics.load(syncStateView, 0) !== 1) {
      if (stuckCycles++ > 100) { console.log("[WORKER " + currentPulseId + "] SYNC STATE SPINLOOP STUCK! state:", Atomics.load(syncStateView, 0)); stuckCycles = 0;} `
);

worker = worker.replace(
  /try \{/g,
  `console.log("[WORKER " + currentPulseId + "] ENTERING TRY-CATCH EXECUTION LOOP!");\ntry {`
);

fs.writeFileSync('src/02/PULSE_WORKER.ts', worker);
console.log("Patched PULSE_WORKER.ts!");
