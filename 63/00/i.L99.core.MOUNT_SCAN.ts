// i.L99.core.MOUNT_SCAN.ts
// @noncanonical
// OMEGA-64 | Mount Scan (Dry Projection)
// Scan mount records and emit a virtual dot-fold projection list.

/// <reference lib="deno.ns" />

const DEFAULT_MOUNT_LIST = "i.L99.core.MOUNT_LIST.md";
const DEFAULT_OUTPUT = "OMEGA_MOUNTS.json";

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
  const out: { input: string; output: string; help: boolean } = {
    input: DEFAULT_MOUNT_LIST,
    output: DEFAULT_OUTPUT,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--input") {
      out.input = args[i + 1] ?? DEFAULT_MOUNT_LIST;
      i += 1;
      continue;
    }
    if (arg === "--output") {
      out.output = args[i + 1] ?? DEFAULT_OUTPUT;
      i += 1;
      continue;
    }
  }
  return out;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.MOUNT_SCAN.ts [--input <file>] [--output <file>]",
    "",
    "Defaults:",
    `  input: ${DEFAULT_MOUNT_LIST}`,
    `  output: ${DEFAULT_OUTPUT}`,
  ].join("\n");

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
  const raw = await Deno.readTextFile(args.input);
  const mounts = parseMounts(raw);
  const projections: MountProjection[] = [];
  for (const record of mounts) {
    projections.push(await scanMount(record));
  }
  const output = {
    generated_at: new Date().toISOString(),
    source: args.input,
    mounts: projections,
  };
  await Deno.writeTextFile(args.output, JSON.stringify(output, null, 2));
  console.log(`Mount scan written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
