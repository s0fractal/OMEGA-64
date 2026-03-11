import { HORMONE_BUFFER_CATALOG, HORMONE_BUFFER_LENGTH, hormoneBaselineState, hormoneSpecById } from "../02_metabolism/mod.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  expect(
    HORMONE_BUFFER_LENGTH === 7,
    "[hormone_buffer] expected 7 initial hormones",
  );
  expect(
    HORMONE_BUFFER_CATALOG.length === HORMONE_BUFFER_LENGTH,
    "[hormone_buffer] length constant drift",
  );

  const ids = new Set(HORMONE_BUFFER_CATALOG.map((spec) => spec.id));
  expect(
    ids.size === HORMONE_BUFFER_CATALOG.length,
    "[hormone_buffer] ids must be unique",
  );

  const indices = new Set(HORMONE_BUFFER_CATALOG.map((spec) => spec.index));
  expect(
    indices.size === HORMONE_BUFFER_CATALOG.length,
    "[hormone_buffer] indices must be unique",
  );

  for (const spec of HORMONE_BUFFER_CATALOG) {
    expect(
      spec.min <= spec.defaultValue,
      `[hormone_buffer] default below min for ${spec.id}`,
    );
    expect(
      spec.defaultValue <= spec.max,
      `[hormone_buffer] default above max for ${spec.id}`,
    );
    expect(
      spec.notes.trim().length > 0,
      `[hormone_buffer] notes missing for ${spec.id}`,
    );
    expect(
      spec.sourcePath.trim().length > 0,
      `[hormone_buffer] sourcePath missing for ${spec.id}`,
    );
  }

  const baseline = hormoneBaselineState();
  expect(
    Object.keys(baseline).length === HORMONE_BUFFER_LENGTH,
    "[hormone_buffer] baseline state size mismatch",
  );
  expect(
    hormoneSpecById("entropy_pressure")?.index === 0,
    "[hormone_buffer] entropy_pressure must stay at slot 0",
  );
  expect(
    hormoneSpecById("mutation_friction") !== null,
    "[hormone_buffer] mutation_friction must exist",
  );

  console.log(
    `[hormone_buffer] contract guard passed. hormones=${HORMONE_BUFFER_LENGTH}`,
  );
};

main();
