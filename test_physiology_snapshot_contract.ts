import {
  capturePhysiologySnapshot,
} from "./PHYSIOLOGY_SNAPSHOT.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const snapshot = capturePhysiologySnapshot({
    tick: 123,
    homeostasis: {
      targetEnergyCurrent: 320,
      band: 240,
      maxDelta: 32,
      overflowThreshold: 0.4,
      baseTaxCurrent: 3,
    },
    pressure: {
      novelty: 180,
      fear: 20,
      symbiosis: 140,
      ego: 15,
      ring: {
        scale: 512,
      },
    },
  });

  expect(snapshot.tick === 123, "[physiology_snapshot] tick must be preserved");
  expect(
    Object.keys(snapshot.hormones).length === 6,
    "[physiology_snapshot] expected 6 hormones",
  );
  expect(
    Object.keys(snapshot.ledger).length >= 10,
    "[physiology_snapshot] expected non-trivial ledger surface",
  );
  expect(
    snapshot.ledger["pulse.homeostasis.baseTax"].currentSource === "runtime",
    "[physiology_snapshot] base tax must be projected from runtime state",
  );
  expect(
    snapshot.ledger["daemon.maxPlasmidCharge"].currentSource === "policy",
    "[physiology_snapshot] daemon plasmid charge stays policy-backed until live wiring exists",
  );
  expect(
    snapshot.hormones.entropy_pressure.currentValue >= 0,
    "[physiology_snapshot] entropy pressure must be bounded",
  );

  console.log(
    `[physiology_snapshot] contract guard passed. hormones=${Object.keys(snapshot.hormones).length} ledger=${Object.keys(snapshot.ledger).length}`,
  );
};

main();
