// src/bin.ts
// Dynamic Script Router for OMEGA-64
//
// Finds and executes the target script regardless of whether it resides in
// src/XX/ or src/_/XX/, insulating standard tools and tests from
// the auto-generated topology's constant shifting.

import { join, extname } from "node:path";

async function searchDir(dir: string, basename: string): Promise<string | null> {
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.name.startsWith(".")) continue;

      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory) {
        if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
        const found = await searchDir(fullPath, basename);
        if (found) return found;
      } else if (entry.isFile && entry.name === basename) {
        return fullPath;
      }
    }
  } catch {
    // Ignore read errors
  }
  return null;
}

async function main() {
  const args = Deno.args;
  if (args.length === 0) {
    console.error("Usage: deno run -A src/bin.ts <target-script-name> [args...]");
    Deno.exit(1);
  }

  const targetName = args[0];
  const targetArgs = args.slice(1);

  let basename = targetName.split("/").pop() || targetName;
  if (!basename.endsWith(".ts")) {
    basename += ".ts";
  }

  const searchRoots = ["src"]; // Just search entire src dir since it covers src/_ and src/_as
  let resolvedPath: string | null = null;
  
  for (const root of searchRoots) {
    const found = await searchDir(root, basename);
    if (found) {
      resolvedPath = found;
      break;
    }
  }

  if (!resolvedPath) {
    console.error(`[bin.ts] Error: Could not find script matching '${basename}' in src/`);
    Deno.exit(1);
  }

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      resolvedPath,
      ...targetArgs
    ],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit"
  });

  const { success, code } = await cmd.output();
  if (!success) {
    Deno.exit(code);
  }
}

if (import.meta.main) {
  await main();
}
