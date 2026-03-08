// e/MATRIX.ts
// Visualizing the 16-bit Space as a Density Map.

import { Coord, SPACE_16 } from "./SPACE_16.ts";

// Constants from Knowledge Map
const LAYERS = 64;
const SECTORS = 64;

// We will render a 64x64 grid where:
// Y-axis = Level (0-63)
// X-axis = Domain (0-63)
// Cell Char = Volume (0-15 hex char)

console.log("--- OMEGA-16 MATRIX [L x D] (Values = V) ---");
console.log(
  "    " +
    Array.from(
      { length: 64 },
      (_, i) => i % 10 === 0 ? (i / 10).toString() : " ",
    ).join(""),
);
console.log("    " + Array.from({ length: 64 }, (_, i) => i % 10).join(""));

for (let L = 63; L >= 0; L--) {
  let row = `${L.toString().padStart(2, "0")}| `;
  for (let D = 0; D < 64; D++) {
    // Here we would typically query the "real" atoms
    // For this experiment, let's visualize the "Structure"
    // by placing hypothetical atoms based on the Dipole Law

    let val = ".";

    // Hypothetical Logic:
    // Genesis (L63) occupies Center (D0)
    if (L === 63 && D === 0) val = "F"; // Max Volume

    // Ribosome (L32) equator
    if (L === 32) val = "1";

    // Surface (L00)
    if (L === 0) val = "0";

    // Dipole Symmetry visualization
    // If we have something at D, we should see something at D+32

    row += val;
  }
  console.log(row);
}
