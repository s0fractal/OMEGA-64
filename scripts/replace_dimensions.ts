import { walk } from "https://deno.land/std@0.210.0/fs/walk.ts";
import { join, dirname, relative, resolve } from "https://deno.land/std@0.210.0/path/mod.ts";

const SRC_DIR = resolve("./src");
const OFFSETS_FILE = resolve("./src/00/OFFSETS.ts");

// Complex regexes to safely catch grid dimensions
// 1. Array creations: new Uint8Array(140 * 80) or new Float32Array(140 * 80 * 2)
// 2. Linear indexing: gy * 140 + gx or (y + 1) * 140
// 3. Simple bounds limit checks: < 140, < 80, >= 140
// 4. Standalone dimensions: 140 * 80
// 5. Hardcoded const declarations: const GRID_COLS = 140;

const replacements = [
  // 1. Array creations or direct products
  { regex: /\b140\s*\*\s*80\b/g, replacement: "GRID_W * GRID_H" },
  { regex: /\bGRID_W\s*\*\s*80\b/g, replacement: "GRID_W * GRID_H" },
  { regex: /\b80\s*\*\s*GRID_W\b/g, replacement: "GRID_H * GRID_W" },

  // 2. Linear Indexing (y * width + x)
  { regex: /\b([a-zA-Z]*y|Y)\s*\*\s*140\b/g, replacement: "$1 * GRID_W" },
  { regex: /\b\(\s*([a-zA-Z]*y|Y)\s*(\+|\-)\s*\d+\s*\)\s*\*\s*140\b/g, replacement: "($1 $2 1) * GRID_W" },
  { regex: /\b(\d+)\s*\*\s*140\b/g, replacement: "$1 * GRID_W" },
  { regex: /\b140\s*\*\s*(\d+)\b/g, replacement: "GRID_W * $1" },

  // 3. Grid bounds clamping/checking (e.g. x < 140, gx >= 140)
  { regex: /\b([a-zA-Z]*x|X)\s*<\s*140\b/g, replacement: "$1 < GRID_W" },
  { regex: /\b([a-zA-Z]*x|X)\s*>=\s*140\b/g, replacement: "$1 >= GRID_W" },
  { regex: /\b([a-zA-Z]*y|Y)\s*<\s*80\b/g, replacement: "$1 < GRID_H" },
  { regex: /\b([a-zA-Z]*y|Y)\s*>=\s*80\b/g, replacement: "$1 >= GRID_H" },
  { regex: /\b140\s*>\s*([a-zA-Z]*x|X)\b/g, replacement: "GRID_W > $1" },
  { regex: /\b80\s*>\s*([a-zA-Z]*y|Y)\b/g, replacement: "GRID_H > $1" },

  // 4. Modulo/Div math
  { regex: /\bMath\.floor\(\s*([a-zA-Z]*Cell)\s*\/\s*140\s*\)/g, replacement: "Math.floor($1 / GRID_W)" },
  { regex: /\b([a-zA-Z]*Cell)\s*%\s*140\b/g, replacement: "$1 % GRID_W" },

  // 5. Specific test hardcodes (Array instantiations like Array(140))
  // We'll let the second pass of replacing `Array(80)` to `Array(GRID_H)` handle this safely.
];

function getRelativeImportPath(fromFile: string, toFile: string): string {
  let rel = relative(dirname(fromFile), toFile);
  if (!rel.startsWith(".")) {
    rel = "./" + rel;
  }
  // replace backslashes (Windows) with forward slashes
  rel = rel.replace(/\\/g, "/");
  // remove the .ts extension
  rel = rel.replace(/\.ts$/, ".ts"); // Deno imports require the exact extension usually, or we can use the ts extension. In this codebase they use explicit .ts usually.
  return rel;
}

async function processFile(filePath: string) {
  const content = await Deno.readTextFile(filePath);
  
  // Skip generation files and AS files for now, dealing only with core TS logically.
  if (filePath.includes("generate.ts") || filePath.includes("assembly/")) {
      return;
  }
  
  // Deno explicit rule: don't format string literals that happen to look like dimensions like `width="140%"`
  // Our regexes are mostly bounded to prevent this.

  let newContent = content;
  let modified = false;

  // 1. Remove redundancy local declarations since they will conflict
  const redundantDecls = [
    /const GRID_COLS = 140;\n?/g,
    /const GRID_ROWS = 80;\n?/g,
    /const GRID_W = 140;\n?/g,
    /const GRID_H = 80;\n?/g,
    /const GRID_ROWS = 80; \/\/ 800 \/ 10\n?/g
  ];

  for (const regex of redundantDecls) {
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, "");
      modified = true;
    }
  }

  // Also replace `GRID_ROWS` and `GRID_COLS` with `GRID_H` and `GRID_W` everywhere in the rest of the text
  if (newContent.includes("GRID_COLS") || newContent.includes("GRID_ROWS")) {
      newContent = newContent.replace(/\bGRID_COLS\b/g, "GRID_W");
      newContent = newContent.replace(/\bGRID_ROWS\b/g, "GRID_H");
      modified = true;
  }

  // 2. Apply rules
  for (const { regex, replacement } of replacements) {
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, replacement);
      modified = true;
    }
  }
  
  // Fallbacks for arrays initialized like `Array(80)`
  const arrayMatches = [
      { regex: /\bArray\(80\)/g, replacement: "Array(GRID_H)" },
      { regex: /\bArray\(140\)/g, replacement: "Array(GRID_W)" }
  ];
  for (const { regex, replacement } of arrayMatches) {
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, replacement);
      modified = true;
    }
  }

  if (modified) {
    // 3. Inject standard import if missing
    if (!newContent.includes("GRID_W") && !newContent.includes("GRID_H")) {
       // if we accidentally replaced everything back to normals, skip
    } else {
        const importRegex = /import\s+\{.*\}\s+from\s+["'].*OFFSETS.*["'];?/;
        const missingW = newContent.includes("GRID_W") && !newContent.match(/import.*GRID_W.*OFFSETS/);
        const missingH = newContent.includes("GRID_H") && !newContent.match(/import.*GRID_H.*OFFSETS/);

        if (missingW || missingH) {
            // Check if there is already an import from OFFSETS
            if (importRegex.test(newContent)) {
                 // Try to augment existing import
                 const match = newContent.match(/(import\s+\{)(.*)(\}\s+from\s+["'].*OFFSETS.*["'];?)/);
                 if (match) {
                     let inner = match[2];
                     if (missingW) inner += ", GRID_W";
                     if (missingH) inner += ", GRID_H";
                     newContent = newContent.replace(match[0], `${match[1]}${inner}${match[3]}`);
                 }
            } else {
                let toImport = [];
                if (missingW) toImport.push("GRID_W");
                if (missingH) toImport.push("GRID_H");
                
                // Exclude the OFFSETS.ts file itself
                if (filePath !== OFFSETS_FILE) {
                    const importPath = getRelativeImportPath(filePath, OFFSETS_FILE);
                    const importStatement = `import { ${toImport.join(", ")} } from "${importPath}";\n`;
                    // Prepend after the first docstring or shebang if it exists, otherwise line 1
                    if (newContent.startsWith("//") || newContent.startsWith("/*")) {
                         // simple naive insert for now
                         newContent = importStatement + newContent;
                    } else {
                         newContent = importStatement + newContent;
                    }
                }
            }
        }
    }

    await Deno.writeTextFile(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
}

async function main() {
  for await (const entry of walk(SRC_DIR, { exts: [".ts"] })) {
    if (entry.isFile) {
      await processFile(entry.path);
    }
  }
}

main();
