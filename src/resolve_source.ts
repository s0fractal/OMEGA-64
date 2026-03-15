// src/resolve_source.ts
import { join } from "node:path";

/**
 * Dynamically finds a TypeScript source file by basename 
 * anywhere inside `src/` or `src/_/`. 
 * Useful for tests that need to read or parse source code as text.
 */
export async function resolveSourcePath(basename: string): Promise<string> {
  if (!basename.endsWith(".ts") && !basename.endsWith(".md")) {
    basename += ".ts";
  }

  async function searchDir(dir: string): Promise<string | null> {
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.name.startsWith(".")) continue;
  
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory) {
          if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
          const found = await searchDir(fullPath);
          if (found) return found;
        } else if (entry.isFile && entry.name === basename) {
          return fullPath;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }

  const found = await searchDir("src");
  if (found) return found;
  throw new Error(`[resolveSourcePath] Could not find ${basename} in src/`);
}
