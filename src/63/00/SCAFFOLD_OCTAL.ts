/**
 * [e/SCAFFOLD_OCTAL.ts]
 * Generates the Octal Directory Structure (8x8) and Metadata Stubs.
 * i/{0..7}/{0..7}/_.yaml
 */

const ROOT = "i";

// 1. Root Metadata
await Deno.writeTextFile(
  `${ROOT}/_.yaml`,
  `standard: OMEGA-64
version: 2.0
note: "The Octal Structure"
tags: [OMEGA, ROOT]
`,
);

console.log(`Created ${ROOT}/_.yaml`);

// 2. Loop Octaves (Major Levels)
for (let M = 0; M < 8; M++) {
  const majorPath = `${ROOT}/${M}`;
  await Deno.mkdir(majorPath, { recursive: true });

  await Deno.writeTextFile(
    `${majorPath}/_.yaml`,
    `major: ${M}
note: "Octave ${M}"
tags: [OCTAVE_${M}]
`,
  );

  // 3. Loop Notes (Minor Levels)
  for (let m = 0; m < 8; m++) {
    const minorPath = `${majorPath}/${m}`;
    await Deno.mkdir(minorPath, { recursive: true });

    const absoluteLevel = M * 8 + m;

    await Deno.writeTextFile(
      `${minorPath}/_.yaml`,
      `minor: ${m}
level: ${absoluteLevel}
note: "Note ${m} of Octave ${M}"
tags: [L${absoluteLevel}]
`,
    );
  }
}

console.log("Scaffolding Complete: 8x8 Matrix Established.");
