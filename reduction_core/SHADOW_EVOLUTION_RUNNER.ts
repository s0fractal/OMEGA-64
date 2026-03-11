/**
 * SHADOW_EVOLUTION_RUNNER.ts
 * Automates the validation of semantic proposals against the OMEGA-64 Golden Traces.
 * Runs in a secure WebAssembly memory sandbox (DollFork) isolated from the main matrix.
 */

import { REDUCTION_CASES } from "../verification/reduction_cases.ts";
import { GENESIS_PROGRAMS } from "./GENESIS_BOOT.ts";
import { DollFork } from "./doll_fork/DOLL_FORK_MATRIX.ts";
import { DollForkRunner } from "./doll_fork/DOLL_FORK_RUNNER.ts";
import { DriftWarden } from "./DRIFT_WARDEN.ts";
import { ReificationAction } from "./REIFICATION_ACTION.ts";
import * as OFFSETS from "../00_substrate/mod.ts";

export type SemanticProposal = {
  id: string;
  targetRole: string; // e.g. "guardian_base"
  proposedBytecode: number[];
  driftBudget: number; // Max allowed energy/state mismatch
};

async function loadProposals(): Promise<SemanticProposal[]> {
  try {
    const data = await Deno.readTextFile(
      "./reduction_core/sandbox/PROPOSALS.json",
    );
    const json = JSON.parse(data);
    return json.proposals || [];
  } catch {
    return [];
  }
}

async function markProposalProcessed(id: string) {
  try {
    const data = await Deno.readTextFile(
      "./reduction_core/sandbox/PROPOSALS.json",
    );
    const json = JSON.parse(data);
    json.proposals = (json.proposals || []).filter((p: any) => p.id !== id);
    await Deno.writeTextFile(
      "./reduction_core/sandbox/PROPOSALS.json",
      JSON.stringify(json, null, 2),
    );
  } catch (err) {
    // Ignore updates if json corrupted
  }
}

export async function runShadowValidation() {
  const proposals = await loadProposals();
  if (proposals.length === 0) return;
  console.log(`[shadow_runner] detected ${proposals.length} active proposals.`);

  const fork = new DollFork();
  const runner = new DollForkRunner(fork);
  await runner.init();

  const warden = new DriftWarden(
    fork.views.energies,
    fork.views.ids,
    fork.views.coherence,
  );
  const reification = new ReificationAction();

  for (const proposal of proposals) {
    console.log(
      `[shadow_runner] validating proposal: ${proposal.id} (Budget: ${proposal.driftBudget})...`,
    );

    // 1. Fork Reality
    fork.forkFromMainline();

    // 2. Inject proposed bytecode into 15 active atoms
    let infectedCount = 0;
    const proposed = new Uint8Array(proposal.proposedBytecode);
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (fork.views.ids[i] !== 0n) {
        fork.views.logic.set(proposed, i * 8);
        infectedCount++;
        if (infectedCount >= 15) break;
      }
    }

    if (infectedCount === 0) {
      console.log(
        `[shadow_runner] proposal ${proposal.id} REJECTED: no living atoms available to host.`,
      );
      await markProposalProcessed(proposal.id);
      continue;
    }

    // 3. Baseline Drift
    // Since DollFork forks mainline, we start at a baseline drift relative to mainline.
    const initialMetrics = warden.analyze(0);
    const initialDrift = initialMetrics.driftIndex;

    // 4. Shadow Simulation
    const SHADOW_TICKS = 50;
    for (let t = 0; t < SHADOW_TICKS; t++) {
      runner.runShadowTick(t);
    }

    // 5. Final Drift
    const finalMetrics = warden.analyze(SHADOW_TICKS);
    const finalDrift = finalMetrics.driftIndex;

    const deltaDrift = finalDrift - initialDrift;

    // Evaluate Survival
    // Ensure all test subjects didn't just instantly die
    const activePopulation = fork.getMetrics().activePopulation;

    console.log(
      `[shadow_runner] ${proposal.id} | Initial Drift: ${
        initialDrift.toFixed(3)
      } | Final: ${finalDrift.toFixed(3)} | Delta: ${deltaDrift.toFixed(3)}`,
    );

    if (deltaDrift <= proposal.driftBudget && activePopulation > 0) {
      console.log(
        `[shadow_runner] proposal ${proposal.id} PASSED. Mutants stabilized.`,
      );

      // Save Relic Payload
      const relic = {
        id: proposal.id,
        bytecode: proposal.proposedBytecode,
        targetRole: proposal.targetRole,
        metadata: {
          deltaDrift,
          activePopulation,
        },
      };

      const sandboxPath = `./reduction_core/sandbox/relic_${proposal.id}.json`;
      await Deno.writeTextFile(sandboxPath, JSON.stringify(relic, null, 2));

      await reification.reify(proposal.id);
    } else {
      console.log(
        `[shadow_runner] proposal ${proposal.id} REJECTED: Destructive trajectory detected.`,
      );
    }

    // Cleanup queue
    await markProposalProcessed(proposal.id);
  }
}

if (import.meta.main) {
  runShadowValidation().catch((err) => {
    console.error("Shadow verification failed:", err);
    Deno.exit(1);
  });
}
