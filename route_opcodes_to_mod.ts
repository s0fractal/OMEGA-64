import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

for await (const entry of walk("src", { exts: [".ts", ".md"] })) {
  if (entry.isFile) {
    let content = Deno.readTextFileSync(entry.path);
    
    // Match ONLY `import { ... } from "...STATE_MATRIX.ts"`
    // Exclude `export * from "...STATE_MATRIX.ts"`
    const regex = /(import\s*\{[^}]+\}\s*from\s*["'][^"']*)STATE_MATRIX\.ts(["'])/g;
    
    let changed = false;
    content = content.replace(regex, (match, prefix, q) => {
      changed = true;
      return `${prefix}mod.ts${q}`;
    });

    if (changed) {
      Deno.writeTextFileSync(entry.path, content);
      console.log("Redirected STATE_MATRIX.ts named imports in", entry.path);
    }
  }
}
