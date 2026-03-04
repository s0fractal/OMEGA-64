type Manifest = {
  era: string;
  runtime_root_files: string[];
  runtime_support_files: string[];
  experimental_files: string[];
};

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";
const ACTIVE_DOC_PATH = "ARCHITECTURE_ACTIVE.md";

const ensureStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || value.some((x) => typeof x !== "string")) {
    throw new Error(
      `[architecture-active] manifest field must be string[]: ${field}`,
    );
  }
  return value as string[];
};

const main = async () => {
  const manifestRaw = await Deno.readTextFile(MANIFEST_PATH);
  const manifest = JSON.parse(manifestRaw) as Manifest;

  const era = typeof manifest.era === "string" ? manifest.era.trim() : "";
  if (!era) {
    throw new Error("[architecture-active] manifest era must be non-empty");
  }

  const runtimeRoots = ensureStringArray(
    manifest.runtime_root_files,
    "runtime_root_files",
  );
  const runtimeSupport = ensureStringArray(
    manifest.runtime_support_files,
    "runtime_support_files",
  );
  const experimental = ensureStringArray(
    manifest.experimental_files,
    "experimental_files",
  );

  if (runtimeRoots.length === 0) {
    throw new Error("[architecture-active] runtime_root_files cannot be empty");
  }

  const doc = await Deno.readTextFile(ACTIVE_DOC_PATH);
  const firstLine = doc.split(/\r?\n/u, 1)[0] ?? "";
  const expectedTitle = `# OMEGA-64 | Active Architecture (Era ${era})`;
  if (firstLine.trim() !== expectedTitle) {
    throw new Error(
      `[architecture-active] title/era drift. expected=\"${expectedTitle}\" actual=\"${firstLine.trim()}\"`,
    );
  }

  const requiredMarkers = [
    "## Runtime Classification Contract (Manifest)",
    "`runtime_root_files`",
    "`runtime_support_files`",
    "`experimental_files`",
  ];
  for (const marker of requiredMarkers) {
    if (!doc.includes(marker)) {
      throw new Error(
        `[architecture-active] missing contract marker in active doc: ${marker}`,
      );
    }
  }

  const missingRootMentions = runtimeRoots.filter((f) => !doc.includes(`\`${f}\``));
  if (missingRootMentions.length > 0) {
    throw new Error(
      `[architecture-active] runtime roots not surfaced in active doc:\n${
        missingRootMentions.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  const overlap = runtimeSupport.filter((f) => experimental.includes(f));
  if (overlap.length > 0) {
    throw new Error(
      `[architecture-active] runtime_support_files overlaps experimental_files:\n${
        overlap.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  console.log(
    `[architecture-active] contract guard passed. era=${era} runtimeRoots=${runtimeRoots.length} runtimeSupport=${runtimeSupport.length} experimental=${experimental.length}`,
  );
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
