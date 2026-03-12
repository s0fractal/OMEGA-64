import { dirname, join, normalize } from "jsr:@std/path";

type Manifest = {
  runtime_root_files: string[];
  runtime_support_files: string[];
};

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";

const IMPORT_RE =
  /(?:import|export)\s+(?:[\s\S]*?\sfrom\s+)?["'](\.[^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /import\(\s*["'](\.[^"']+)["']\s*\)/g;

const fileExists = async (path: string): Promise<boolean> => {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch {
    return false;
  }
};

const parseLocalSpecs = (source: string): string[] => {
  const out = new Set<string>();
  for (const regex of [IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(source)) !== null) {
      out.add(match[1]);
    }
  }
  return Array.from(out).sort((a, b) => a.localeCompare(b));
};

const resolveLocalImport = async (
  fromFile: string,
  specifier: string,
): Promise<string | null> => {
  if (!specifier.startsWith("./") && !specifier.startsWith("../")) return null;

  const base = normalize(join(dirname(fromFile), specifier));
  const candidates = [base, `${base}.ts`, `${base}.tsx`];
  for (const c of candidates) {
    if (await fileExists(c)) return c;
  }
  return null;
};

const reconstructPath = (
  parent: Map<string, string>,
  leaf: string,
): string[] => {
  const chain = [leaf];
  let cursor = leaf;
  while (parent.has(cursor)) {
    const p = parent.get(cursor)!;
    chain.push(p);
    cursor = p;
  }
  return chain.reverse();
};

const ensureStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || value.some((x) => typeof x !== "string")) {
    throw new Error(
      `[runtime-support-boundary] manifest field must be string[]: ${field}`,
    );
  }
  return (value as string[]).map((x) => normalize(x));
};

const main = async () => {
  const manifestRaw = await Deno.readTextFile(MANIFEST_PATH);
  const manifest = JSON.parse(manifestRaw) as Manifest;

  const runtimeRoots = ensureStringArray(
    manifest.runtime_root_files,
    "runtime_root_files",
  );
  const runtimeSupportFiles = ensureStringArray(
    manifest.runtime_support_files,
    "runtime_support_files",
  );

  if (runtimeRoots.length === 0) {
    throw new Error(
      "[runtime-support-boundary] runtime_root_files cannot be empty",
    );
  }

  const supportSet = new Set(runtimeSupportFiles);
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue = [...runtimeRoots];
  const directEdgesToSupport: Array<{ from: string; to: string }> = [];
  const missingRoots: string[] = [];

  for (const root of runtimeRoots) {
    if (!(await fileExists(root))) missingRoots.push(root);
  }
  if (missingRoots.length > 0) {
    throw new Error(
      `[runtime-support-boundary] runtime root missing on disk:\n${
        missingRoots.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  while (queue.length > 0) {
    const file = queue.shift()!;
    if (visited.has(file)) continue;
    visited.add(file);

    if (!(file.endsWith(".ts") || file.endsWith(".tsx"))) continue;

    const source = await Deno.readTextFile(file);
    const specs = parseLocalSpecs(source);
    for (const specifier of specs) {
      const resolved = await resolveLocalImport(file, specifier);
      if (!resolved) continue;

      if (supportSet.has(resolved)) {
        directEdgesToSupport.push({ from: file, to: resolved });
      }

      if (!visited.has(resolved)) {
        if (!parent.has(resolved)) parent.set(resolved, file);
        queue.push(resolved);
      }
    }
  }

  const reachedSupport = runtimeSupportFiles.filter((f) => visited.has(f));
  if (reachedSupport.length > 0) {
    const traces = reachedSupport.map((f) => reconstructPath(parent, f));
    const traceLines = traces.map((chain) => `- ${chain.join(" -> ")}`);
    const directLines = directEdgesToSupport.map((edge) =>
      `- ${edge.from} -> ${edge.to}`
    );
    throw new Error(
      `[runtime-support-boundary] runtime closure reached runtime-support modules.\nPaths:\n${
        traceLines.join("\n")
      }${
        directLines.length > 0
          ? `\nDirect runtime->support edges:\n${directLines.join("\n")}`
          : ""
      }`,
    );
  }

  console.log(
    `[runtime-support-boundary] guard passed. runtimeVisited=${visited.size} support=${runtimeSupportFiles.length}`,
  );
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
