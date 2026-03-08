// OMEGA-64 | CRYSTALLIZE.ts | The Alchemist
// Reads a pending atom, digests it, and moves it to its Flatland vector.

import { CRYSTAL } from "./CRYSTAL_DIGEST.ts";
import { move } from "jsr:@std/fs@^1.0.5";

const atomFile = Deno.args[0];
if (!atomFile) {
  console.error("Usage: deno run -A CRYSTALLIZE.ts <file.md>");
  Deno.exit(1);
}

try {
  const content = await Deno.readTextFile(atomFile);
  const spectrum = await CRYSTAL.digest(content);
  const newPath = CRYSTAL.proposeVector(spectrum);

  // 1. Inject Eigenvalue into Alpha (YAML)
  let updatedContent = content;
  const eigenvalueField = `eigenvalue: "0x${spectrum.digest}"`;

  if (content.match(/^---\n([\s\S]+?)\n---/)) {
    // If frontmatter exists, inject if not present
    if (!content.includes("eigenvalue:")) {
      updatedContent = content.replace(/^---\n/, `---\n${eigenvalueField}\n`);
    } else {
      // Update existing eigenvalue
      updatedContent = content.replace(
        /eigenvalue: "0x[0-9A-F]+"/i,
        eigenvalueField,
      );
    }
  } else {
    // Create frontmatter if missing
    updatedContent = `---\n${eigenvalueField}\n---\n\n${content}`;
  }

  // Check if we are renaming (source != target)
  if (atomFile === newPath && content === updatedContent) {
    console.log(
      `✨ ${
        spectrum.alpha?.symbol ?? "ATOM"
      } is already at its terminal vector and has metadata.`,
    );
    Deno.exit(0);
  }

  console.log(`💎 Crystallizing ${spectrum.alpha?.symbol ?? "ATOM"}...`);
  console.log(`   Color: 0x${spectrum.digest}`);
  console.log(`   Vector: ${newPath}`);

  await Deno.writeTextFile(newPath, updatedContent);
  console.log(`✅ Atom crystallized at ${newPath}`);

  // Remove source after successful migration or rename
  if (atomFile !== newPath) {
    await Deno.remove(atomFile);
    console.log(`🧹 Removed legacy vector: ${atomFile}`);
  }
} catch (e) {
  console.error("Crystallization failed:", e);
}
