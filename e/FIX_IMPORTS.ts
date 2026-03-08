// e/FIX_IMPORTS.ts
// Fixes imports in i/ files after migration from root.
// "../i.Lxx" -> "./i.Lxx"

async function main() {
  console.log("Fixing imports in i/...");
  let updatedCount = 0;

  for await (const entry of Deno.readDir("i")) {
    if (entry.isFile && entry.name.endsWith(".ts")) {
      const path = `i/${entry.name}`;
      try {
        const content = await Deno.readTextFile(path);

        // Replace "../i." with "./i."
        const newContent = content.replace(
          /from\s+['"]\.\.\/i\./g,
          'from "./i.',
        );

        if (content !== newContent) {
          await Deno.writeTextFile(path, newContent);
          console.log(`Updated ${entry.name}`);
          updatedCount++;
        }
      } catch (e) {
        console.error(`Error processing ${entry.name}`, e);
      }
    }
  }
  console.log(`Fixed imports in ${updatedCount} files.`);
}

main();
