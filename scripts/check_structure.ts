import { readLines } from "https://deno.land/std@0.224.0/io/read_lines.ts";
import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { resolve, join, relative } from "https://deno.land/std@0.224.0/path/mod.ts";

const CWD = Deno.cwd();

// Load .env variables synchronously
try {
  loadSync({ export: true });
} catch (e) {
  // Ignore
}

const GEN_DIR_TS = Deno.env.get("GEN_DIR_TS") || "src/_";
const GEN_DIR_RS = Deno.env.get("GEN_DIR_RS") || "src/00/sigma_core/src/ontology_gen";
const GEN_DIR_AS = Deno.env.get("GEN_DIR_AS") || "src/_as";

async function checkGitignore() {
  const gitignorePath = join(CWD, ".gitignore");
  let gitignoreContent = "";
  try {
    gitignoreContent = await Deno.readTextFile(gitignorePath);
  } catch (err) {
    console.error(`[FATAL] Could not read .gitignore: ${err}`);
    Deno.exit(1);
  }

  const lines = gitignoreContent.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));

  const requiredPaths = [GEN_DIR_TS, GEN_DIR_RS, GEN_DIR_AS];
  let missing = false;

  console.log("[Structure] Checking generated path IGNORE coverage...");

  for (const p of requiredPaths) {
    // Check if the path or path/ is in gitignore
    const normalized = relative(CWD, resolve(CWD, p));
    const isIgnored = lines.some(l => l === normalized || l === normalized + "/" || l === "/" + normalized || l === "/" + normalized + "/");

    if (!isIgnored) {
      console.error(`[ERROR] Generated path '${normalized}' is not present in .gitignore!`);
      missing = true;
    } else {
      console.log(`  [OK] ${normalized}`);
    }
  }

  if (missing) {
    console.error("\n[FATAL] Some generated code directories are not ignored by Git. Committing these files leads to heavy diff pollution.");
    console.error("Please add the missing paths to your .gitignore.");
    Deno.exit(1);
  }

  console.log("\n[Structure] All generated paths are safely ignored.");
}

if (import.meta.main) {
  await checkGitignore();
}
