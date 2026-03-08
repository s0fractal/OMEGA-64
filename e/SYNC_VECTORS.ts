// e/SYNC_VECTORS.ts
// Syncs the 'vector' L-component in YAML files to match the 'origin' L-level.

import { parse } from "jsr:@std/yaml";

async function main() {
  console.log("Syncing Vectors with Origin Levels...");
  let updatedCount = 0;

  for await (const entry of Deno.readDir("i")) {
    if (entry.isFile && entry.name.endsWith(".yaml")) {
      const path = `i/${entry.name}`;
      try {
        const content = await Deno.readTextFile(path);

        // We need to parse strictly to find origin, but we want to preserve comments/formatting
        // So we will use Regex to find origin and vector lines.

        const originMatch = content.match(/origin:\s*['"]?([^'"\n]+)['"]?/);
        if (!originMatch) continue;

        const origin = originMatch[1];
        // Extract L from i.L26.core.NAME.ts
        const levelMatch = origin.match(/\.L(\d+)\./);
        if (!levelMatch) continue;

        const correctL = parseInt(levelMatch[1]);

        // Find current vector
        const vectorMatch = content.match(
          /vector:\s*['"]?(\d+)\.(\d+)\.(\d+)['"]?/,
        );
        if (vectorMatch) {
          const currentL = parseInt(vectorMatch[1]);
          const currentD = vectorMatch[2];
          const currentV = vectorMatch[3];

          if (currentL !== correctL) {
            const newVector = `${correctL}.${currentD}.${currentV}`;
            // Replace only the vector line
            const newContent = content.replace(
              /vector:\s*['"]?[\d\.]+['"]?/,
              `vector: ${newVector}`,
            );

            await Deno.writeTextFile(path, newContent);
            console.log(`Updated ${entry.name}: ${currentL} -> ${correctL}`);
            updatedCount++;
          }
        }
      } catch (e) {
        console.error(`Error processing ${entry.name}`, e);
      }
    }
  }

  console.log(`Done. Updated ${updatedCount} files.`);
}

main();
