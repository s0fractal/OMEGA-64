// i.L99.core.BOOTSTRAP.ts
// @noncanonical
// OMEGA-64 | BOOTSTRAP (Dry-Boot Manifest)
// Read I.sigma.md, extract executable cells, emit manifest JSON.

/// <reference lib="deno.ns" />

const DEFAULT_INPUT = "I.sigma.md";
const DEFAULT_OUTPUT = "I.sigma.manifest.json";
const DEFAULT_MOUNT_LIST = "i.L99.core.MOUNT_LIST.md";
const DEFAULT_MOUNT_OUTPUT = "OMEGA_MOUNTS.json";

type Cell = {
  id: string;
  lang: string;
  hash: string;
  bytes: number;
  lines: number;
};

type MountRecord = {
  mount_id: string;
  source: string;
  root: string;
  prefix: string;
  mode: "lazy" | "eager";
  trust: "readonly" | "verified" | "signed";
};

type MountProjection = {
  mount_id: string;
  source: string;
  root: string;
  prefix: string;
  mode: MountRecord["mode"];
  trust: MountRecord["trust"];
  files: string[];
};

const parseArgs = (args: string[]) => {
  const out: { input: string; output: string; mounts?: string; help: boolean } = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    mounts: undefined,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--input") {
      out.input = args[i + 1] ?? DEFAULT_INPUT;
      i += 1;
      continue;
    }
    if (arg === "--output") {
      out.output = args[i + 1] ?? DEFAULT_OUTPUT;
      i += 1;
      continue;
    }
    if (arg === "--mounts") {
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        out.mounts = next;
        i += 1;
      } else {
        out.mounts = DEFAULT_MOUNT_LIST;
      }
      continue;
    }
  }
  return out;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.BOOTSTRAP.ts [--input <file>] [--output <file>] [--mounts <file>]",
    "",
    "Defaults:",
    `  input: ${DEFAULT_INPUT}`,
    `  output: ${DEFAULT_OUTPUT}`,
    `  mounts: ${DEFAULT_MOUNT_LIST}`,
  ].join("\n");

const isEntityHeader = (line: string): boolean => line.startsWith("### ");

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const extractCells = async (lines: string[]): Promise<Cell[]> => {
  const cells: Cell[] = [];
  let currentId = "";
  let currentLang = "";
  let capture = false;
  let buffer: string[] = [];

  const flush = async () => {
    if (!currentId || !currentLang) return;
    const payload = buffer.join("\n").trimEnd();
    const hash = await sha256Hex(payload);
    const bytes = new TextEncoder().encode(payload).byteLength;
    const linesCount = payload.length === 0 ? 0 : payload.split("\n").length;
    cells.push({
      id: currentId,
      lang: currentLang,
      hash,
      bytes,
      lines: linesCount,
    });
  };

  for (const line of lines) {
    if (isEntityHeader(line)) {
      currentId = line.replace("### ", "").trim();
      continue;
    }
    if (line.trim().startsWith("```")) {
      if (!capture) {
        capture = true;
        currentLang = line.trim().slice(3).trim();
        buffer = [];
      } else {
        capture = false;
        await flush();
        currentLang = "";
        buffer = [];
      }
      continue;
    }
    if (capture) {
      buffer.push(line);
    }
  }

  return cells;
};

const parseMounts = (text: string): MountRecord[] => {
  const records: MountRecord[] = [];
  const blocks = text.split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const record: Partial<MountRecord> = {};
    for (const line of lines) {
      const [key, ...rest] = line.split(":");
      if (!key || rest.length === 0) continue;
      const value = rest.join(":").trim();
      if (key === "mount_id") record.mount_id = value;
      if (key === "source") record.source = value;
      if (key === "root") record.root = value;
      if (key === "prefix") record.prefix = value;
      if (key === "mode") record.mode = value as MountRecord["mode"];
      if (key === "trust") record.trust = value as MountRecord["trust"];
    }
    if (!record.mount_id || !record.source || !record.prefix) continue;
    records.push({
      mount_id: record.mount_id,
      source: record.source,
      root: record.root ?? "/",
      prefix: record.prefix,
      mode: record.mode ?? "lazy",
      trust: record.trust ?? "readonly",
    });
  }
  return records;
};

const dotFold = (prefix: string, path: string): string => {
  const clean = path.replace(/^[./]+/, "").replace(/\\/g, "/");
  const segments = clean.split("/").filter(Boolean);
  return [prefix, ...segments].join(".");
};

const scanMount = async (record: MountRecord): Promise<MountProjection> => {
  const files: string[] = [];
  try {
    for await (const entry of Deno.readDir(record.root)) {
      if (entry.isFile) {
        files.push(dotFold(record.prefix, entry.name));
      }
    }
  } catch {
    // Missing local root: keep projection empty (lazy mode compatible)
  }
  return {
    mount_id: record.mount_id,
    source: record.source,
    root: record.root,
    prefix: record.prefix,
    mode: record.mode,
    trust: record.trust,
    files,
  };
};

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }
  const input = await Deno.readTextFile(args.input);
  const cells = await extractCells(input.split("\n"));
  let mounts: MountProjection[] | undefined = undefined;
  if (args.mounts) {
    try {
      const mountText = await Deno.readTextFile(args.mounts);
      const mountRecords = parseMounts(mountText);
      mounts = [];
      for (const record of mountRecords) {
        mounts.push(await scanMount(record));
      }
    } catch {
      mounts = [];
    }
  }
  const output = {
    generated_at: new Date().toISOString(),
    source: args.input,
    mounts_source: args.mounts ?? null,
    mounts,
    cells,
  };
  await Deno.writeTextFile(args.output, JSON.stringify(output, null, 2));
  if (args.mounts && mounts) {
    const mountsOutput = {
      generated_at: output.generated_at,
      source: args.mounts,
      mounts,
    };
    await Deno.writeTextFile(
      DEFAULT_MOUNT_OUTPUT,
      JSON.stringify(mountsOutput, null, 2),
    );
  }
  console.log(`Bootstrap manifest written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
