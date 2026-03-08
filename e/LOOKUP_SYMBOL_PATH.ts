import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";

const ROOT = Deno.cwd();
const wanted = new Set(Deno.args);
const found = new Map<string, string>();

for await (
  const entry of walk(ROOT, { includeDirs: false, match: [/\/_.yaml$/] })
) {
  const rel = entry.path.replace(`${ROOT}/`, "");
  const match = rel.match(/^(\d)\/(\d)\/([^/]+)\/_.yaml$/);
  if (!match) continue;
  try {
    const raw = parseYaml(await Deno.readTextFile(entry.path)) as Record<
      string,
      unknown
    >;
    const symbol = typeof raw?.symbol === "string" ? raw.symbol : match[3];
    if (wanted.size === 0 || wanted.has(symbol)) {
      if (!found.has(symbol)) {
        found.set(symbol, `${match[1]}/${match[2]}/${symbol}/_.ts`);
      }
    }
  } catch {
    // ignore
  }
}

for (const sym of (wanted.size ? [...wanted] : [...found.keys()].sort())) {
  const path = found.get(sym);
  if (path) {
    console.log(`${sym} ${path}`);
  } else {
    console.log(`${sym} NOT_FOUND`);
  }
}
