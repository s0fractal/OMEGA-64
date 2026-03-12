// OMEGA-64 | export_rust.ts
// Builds RUST_CORE_LOGIC.md by consolidating the sigma_core and omega_wasm Rust sources.

import { extname, join } from "node:path";

const TARGET_DIRS = ["00_substrate/sigma_core"];
const ALLOWED_EXTENSIONS = [".rs", ".toml", ".json", ".lock"];

const EXCLUDE_PATTERNS = [
  /\/target\//,
  /\/.git\//,
  /\/tests\/.*\.rs$/,
];

async function collectFiles(dir: string): Promise<string[]> {
  const discovered: string[] = [];
  const queue = [dir];
  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    try {
      for await (const entry of Deno.readDir(currentPath)) {
        if (entry.name.startsWith(".")) {
          // Include .cargo but not .git
          if (entry.name !== ".cargo") continue;
        }

        const entryPath = join(currentPath, entry.name);

        if (EXCLUDE_PATTERNS.some((p) => p.test(entryPath))) continue;

        if (entry.isDirectory) {
          queue.push(entryPath);
        } else if (
          entry.isFile && ALLOWED_EXTENSIONS.includes(extname(entry.name))
        ) {
          if (
            entry.name === "Cargo.lock" && currentPath !== "00_substrate/sigma_core"
          ) {
            continue; // Only grab root locks
          }
          discovered.push(entryPath);
        }
      }
    } catch {
      continue;
    }
  }
  return discovered;
}

async function exportRustCore() {
  let allFiles: string[] = [];
  for (const dir of TARGET_DIRS) {
    allFiles = allFiles.concat(await collectFiles(dir));
  }

  allFiles.sort();

  let output = `# OMEGA-64 | RUST CORE LOGIC\n\n`;
  output += `*Generated: ${new Date().toISOString()}*\n`;
  output += `*Exported Files: ${allFiles.length}*\n\n---\n\n`;

  output += `## FILE INDEX\n\n`;
  for (const file of allFiles) {
    output += `- ${file}\n`;
  }
  output += `\n---\n\n`;

  for (const file of allFiles) {
    try {
      const content = await Deno.readTextFile(file);
      let lang = "rust";
      if (file.endsWith(".toml")) lang = "toml";
      if (file.endsWith(".json")) lang = "json";

      output += `## FILE: ${file}\n\n`;
      output += `\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
    } catch (e) {
      console.warn(`Could not read ${file}`);
    }
  }

  await Deno.mkdir("08_artifacts", { recursive: true });
  await Deno.writeTextFile("08_artifacts/RUST_CORE_LOGIC.md", output);
  console.log(
    `✅ 08_artifacts/RUST_CORE_LOGIC.md exported successfully. Indexed ${allFiles.length} files.`,
  );
}

if (import.meta.main) {
  await exportRustCore();
}
