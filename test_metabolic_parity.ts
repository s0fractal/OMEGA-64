// OMEGA-64 | test_metabolic_parity.ts | Metabolic Parity Verifier
import * as STATE_MATRIX from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { PULSE } from "./PULSE.ts";

async function testMetabolicParity() {
  console.log("🧬 [TEST] Starting Metabolic Parity Test...");

  const MAX_ATOMS = OFFSETS.MAX_ATOMS;
  const sharedBuffer = STATE_MATRIX.sharedBuffer;
  const energiesView = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
  const logicView = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8);

  // 1. Setup Deterministic State
  STATE_MATRIX.STATE_MATRIX.clear();
  
  // Create atoms with diverse genomes and energies
  const activeIdx: number[] = [];
  for (let i = 0; i < 500; i++) {
    const idx = i * 2; // Spread them out
    STATE_MATRIX.STATE_MATRIX.setId(idx, BigInt(idx + 1));
    
    // Set some diverse genomes in the first 2 bytes of Logic area
    const genomeKey = (i % 5); 
    logicView[idx * 8] = (genomeKey >> 8) & 0xFF;
    logicView[idx * 8 + 1] = genomeKey & 0xFF;

    if (i < 5) {
      console.log(`   [DEBUG] Setting atom=${idx} key=${genomeKey} bytes=(${logicView[idx * 8]},${logicView[idx * 8 + 1]})`);
    }
    
    // Set initial energy
    energiesView[idx] = 1000 + (idx % 500);
    activeIdx.push(idx);
  }

  // Clone energies for host reference
  const hostEnergies = new Int32Array(MAX_ATOMS);
  hostEnergies.set(energiesView);

  // Constants (matching legacy applyEnergyHomeostasisTerms / applyEvolutionPressureTerms)
  const noveltySigned = 10;
  const symbiosisSigned = -5;
  const baseTax = 2;
  const targetEnergy = 1000;
  const homeostasisBand = 100;
  const homeostasisMaxDelta = 10;
  const overflowThreshold = 0.5; // 50%
  const spatialOverflowRatio = 0.2; // 20% (below threshold)
  const starvationFloor = 100;
  const subsidyEnabled = true;

  // --- RUN HOST REFERENCE LOGIC ---
  console.log("   [HOST] Running legacy metabolic logic...");
  
  // Pass 1: Evolution Pressure
  const genomeCounts = new Map<number, number>();
  for (const idx of activeIdx) {
    const key = (logicView[idx * 8] << 8) | logicView[idx * 8 + 1];
    genomeCounts.set(key, (genomeCounts.get(key) ?? 0) + 1);
  }

  const population = activeIdx.length;
  for (const idx of activeIdx) {
    const key = (logicView[idx * 8] << 8) | logicView[idx * 8 + 1];
    const sameGenomeCount = genomeCounts.get(key) ?? 1;

    // Novelty
    let noveltyTerm = Math.trunc((noveltySigned * (population - (sameGenomeCount * 2))) / population);
    
    // Symbiosis (Simplified for parity test - no bonds set)
    let symbiosisTerm = (symbiosisSigned >= 0 ? 1 : -1) * -symbiosisSigned;

    const delta = noveltyTerm + symbiosisTerm;
    hostEnergies[idx] = Math.max(0, hostEnergies[idx] + delta);
  }

  // Pass 2: Homeostasis
  const bandStep = Math.max(1, Math.floor(homeostasisBand / 2));
  const overflowActive = spatialOverflowRatio >= overflowThreshold;

  for (const idx of activeIdx) {
    let current = hostEnergies[idx];
    if (current <= 0) continue;
    let delta = 0;

    if (baseTax > 0 && current > starvationFloor) {
      const tax = Math.min(baseTax, current);
      delta -= tax;
    }

    const deviation = current - targetEnergy;
    const absDeviation = Math.abs(deviation);
    if (absDeviation > homeostasisBand) {
      const gradient = absDeviation - homeostasisBand;
      const step = Math.min(homeostasisMaxDelta, 1 + Math.floor(gradient / bandStep));

      if (deviation > 0) {
        delta -= step;
        if (overflowActive) delta -= 1;
      } else if (subsidyEnabled) {
        let subsidy = step;
        if (overflowActive) subsidy = Math.max(1, Math.floor(subsidy * 0.6));
        delta += subsidy;
      }
    }

    if (current <= starvationFloor && delta < 0) delta = 0;
    hostEnergies[idx] = Math.max(0, current + delta);
  }

  // --- RUN WASM LOGIC ---
  console.log("   [WASM] Running kernel metabolic logic...");
  if (!(PULSE as any).workers || (PULSE as any).workers.length === 0) {
      await PULSE.initWorkers();
  }
  const worker0 = (PULSE as any).getWorker(0);
  const pulseId = Date.now();

  // Accumulate
  await new Promise<void>((resolve) => {
    const handler = (e: MessageEvent) => {
        if (e.data.type === "METABOLISM_ACCUMULATE_DONE" && e.data.pulseId === pulseId) {
            worker0.removeEventListener("message", handler);
            resolve();
        }
    };
    worker0.addEventListener("message", handler);
    worker0.postMessage({ type: "METABOLISM_ACCUMULATE", pulseId, startIdx: 0, endIdx: MAX_ATOMS, clear: true });
  });

  // Apply
  await new Promise<void>((resolve) => {
    const handler = (e: MessageEvent) => {
        if (e.data.type === "METABOLISM_APPLY_DONE" && e.data.pulseId === pulseId + 1) {
            worker0.removeEventListener("message", handler);
            resolve();
        }
    };
    worker0.addEventListener("message", handler);
    worker0.postMessage({
        type: "METABOLISM_APPLY",
        pulseId: pulseId + 1,
        startIdx: 0,
        endIdx: MAX_ATOMS,
        noveltySigned,
        symbiosisSigned,
        baseTax,
        targetEnergy,
        homeostasisBand,
        homeostasisMaxDelta,
        overflowThreshold,
        spatialOverflowRatio,
        starvationFloor,
        subsidyEnabled,
    });
  });

  // --- COMPARISON ---
  let errors = 0;
  for (let i = 0; i < MAX_ATOMS; i++) {
    const wasmEnergy = energiesView[i];
    const hostEnergy = hostEnergies[i];
    if (wasmEnergy !== hostEnergy) {
      if (errors < 10) {
          console.error(`❌ Metabolism Mismatch @ atom=${i}: WASM=${wasmEnergy} HOST=${hostEnergy}`);
      }
      errors++;
    }
  }

  if (errors === 0) {
    console.log("✅ [PARITY] Metabolic Homeostasis bit-perfect!");
  } else {
    console.log(`❌ [PARITY] Metabolic Homeostasis failed with ${errors} errors.`);
    Deno.exit(1);
  }
}

testMetabolicParity().catch(err => {
  console.error(err);
  Deno.exit(1);
});
