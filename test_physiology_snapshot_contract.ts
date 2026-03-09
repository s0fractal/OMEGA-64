import { capturePhysiologySnapshot } from "./PHYSIOLOGY_SNAPSHOT.ts";
import {
  createGeneticLedgerRuntime,
  snapshotLedgerRuntime,
} from "./GENERIC_LEDGER_SYSTEM.ts";
import { createPhysiologicalLedgerRuntime } from "./HORMONE_BUFFER.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const entropyRuntime = createPhysiologicalLedgerRuntime("entropy_pressure");
  entropyRuntime.currentValue = 800;
  const timeRuntime = createPhysiologicalLedgerRuntime("time_viscosity");
  timeRuntime.currentValue = 500;
  
  const baseTaxRuntime = createGeneticLedgerRuntime(
    "pulse.homeostasis.baseTax",
  );
  baseTaxRuntime.currentValue = 3;

  const snapshot = capturePhysiologySnapshot({
    tick: 123,
    hormones: {
      entropy_pressure: snapshotLedgerRuntime(entropyRuntime),
      time_viscosity: snapshotLedgerRuntime(timeRuntime),
      aggression: snapshotLedgerRuntime(createPhysiologicalLedgerRuntime("aggression")),
      replication_bias: snapshotLedgerRuntime(createPhysiologicalLedgerRuntime("replication_bias")),
      repair_drive: snapshotLedgerRuntime(createPhysiologicalLedgerRuntime("repair_drive")),
      mutation_friction: snapshotLedgerRuntime(createPhysiologicalLedgerRuntime("mutation_friction")),
      global_consensus: snapshotLedgerRuntime(createPhysiologicalLedgerRuntime("global_consensus")),
    },
    ledger: {
      "pulse.homeostasis.baseTax": snapshotLedgerRuntime(baseTaxRuntime),
    },
  });

  expect(snapshot.tick === 123, "[physiology_snapshot] tick must be preserved");
  expect(
    Object.keys(snapshot.hormones).length === 7,
    "[physiology_snapshot] expected 7 hormones",
  );
  expect(
    Object.keys(snapshot.ledger).length >= 1,
    "[physiology_snapshot] expected non-trivial ledger surface",
  );
  expect(
    snapshot.ledger["pulse.homeostasis.baseTax"]?.currentSource === "runtime",
    "[physiology_snapshot] base tax must be projected from runtime state",
  );
  expect(
    snapshot.hormones.entropy_pressure.currentValue >= 0,
    "[physiology_snapshot] entropy pressure must be bounded",
  );

  console.log(
    `[physiology_snapshot] contract guard passed. hormones=${
      Object.keys(snapshot.hormones).length
    } ledger=${Object.keys(snapshot.ledger).length}`,
  );
};

main();
