import { renderCoreExport } from "./export_core.ts";

const SHA256_RE = /^[0-9a-f]{64}$/u;
const COMMIT_RE = /^(unknown|[0-9a-f]{7,40})$/u;

const parseHeaderValue = (line: string, prefix: string): string => {
  if (!line.startsWith(prefix)) {
    throw new Error(
      `[export-provenance] missing header prefix: expected "${prefix}" got "${line}"`,
    );
  }
  return line.slice(prefix.length).replace(/\*$/u, "").trim();
};

const expect = (cond: unknown, message: string): void => {
  if (!cond) throw new Error(message);
};

type ParsedHeader = {
  title: string;
  manifestHash: string;
  exportSetHash: string;
  exportContentHash: string;
  gitCommit: string;
  runtimeRootCount: number;
  runtimeClosureCount: number;
  nonRuntimeCodeCount: number;
  runtimeSupportCount: number;
  experimentalCount: number;
};

const parseExportHeader = (
  output: string,
  sourceLabel: string,
): ParsedHeader => {
  const header = output.split(/\r?\n/u).slice(0, 20);
  const title = header[0] ?? "";
  const manifestLine = header.find((line) =>
    line.startsWith("*Manifest SHA256: ")
  );
  const exportSetLine = header.find((line) =>
    line.startsWith("*Export Set SHA256: ")
  );
  const exportContentLine = header.find((line) =>
    line.startsWith("*Export Content SHA256: ")
  );
  const commitLine = header.find((line) => line.startsWith("*Git Commit: "));
  const runtimeRootsLine = header.find((line) =>
    line.startsWith("*Runtime Roots: ")
  );
  const runtimeClosureLine = header.find((line) =>
    line.startsWith("*Runtime Closure Files: ")
  );
  const nonRuntimeCodeLine = header.find((line) =>
    line.startsWith("*Non-Runtime Code Files: ")
  );
  const runtimeSupportLine = header.find((line) =>
    line.startsWith("*Runtime-Support Code Files: ")
  );
  const experimentalLine = header.find((line) =>
    line.startsWith("*Experimental Code Files: ")
  );

  expect(
    typeof manifestLine === "string",
    `[export-provenance] missing Manifest SHA256 header in ${sourceLabel}`,
  );
  expect(
    typeof exportSetLine === "string",
    `[export-provenance] missing Export Set SHA256 header in ${sourceLabel}`,
  );
  expect(
    typeof exportContentLine === "string",
    `[export-provenance] missing Export Content SHA256 header in ${sourceLabel}`,
  );
  expect(
    typeof commitLine === "string",
    `[export-provenance] missing Git Commit header in ${sourceLabel}`,
  );
  expect(
    typeof runtimeRootsLine === "string",
    `[export-provenance] missing Runtime Roots header in ${sourceLabel}`,
  );
  expect(
    typeof runtimeClosureLine === "string",
    `[export-provenance] missing Runtime Closure Files header in ${sourceLabel}`,
  );
  expect(
    typeof nonRuntimeCodeLine === "string",
    `[export-provenance] missing Non-Runtime Code Files header in ${sourceLabel}`,
  );
  expect(
    typeof runtimeSupportLine === "string",
    `[export-provenance] missing Runtime-Support Code Files header in ${sourceLabel}`,
  );
  expect(
    typeof experimentalLine === "string",
    `[export-provenance] missing Experimental Code Files header in ${sourceLabel}`,
  );

  const parsed: ParsedHeader = {
    title,
    manifestHash: parseHeaderValue(manifestLine!, "*Manifest SHA256: "),
    exportSetHash: parseHeaderValue(exportSetLine!, "*Export Set SHA256: "),
    exportContentHash: parseHeaderValue(
      exportContentLine!,
      "*Export Content SHA256: ",
    ),
    gitCommit: parseHeaderValue(commitLine!, "*Git Commit: "),
    runtimeRootCount: Number(
      parseHeaderValue(runtimeRootsLine!, "*Runtime Roots: "),
    ),
    runtimeClosureCount: Number(
      parseHeaderValue(runtimeClosureLine!, "*Runtime Closure Files: "),
    ),
    nonRuntimeCodeCount: Number(
      parseHeaderValue(nonRuntimeCodeLine!, "*Non-Runtime Code Files: "),
    ),
    runtimeSupportCount: Number(
      parseHeaderValue(runtimeSupportLine!, "*Runtime-Support Code Files: "),
    ),
    experimentalCount: Number(
      parseHeaderValue(experimentalLine!, "*Experimental Code Files: "),
    ),
  };

  expect(
    SHA256_RE.test(parsed.manifestHash),
    `[export-provenance] invalid manifest SHA256 in ${sourceLabel}: ${parsed.manifestHash}`,
  );
  expect(
    SHA256_RE.test(parsed.exportSetHash),
    `[export-provenance] invalid export-set SHA256 in ${sourceLabel}: ${parsed.exportSetHash}`,
  );
  expect(
    SHA256_RE.test(parsed.exportContentHash),
    `[export-provenance] invalid export-content SHA256 in ${sourceLabel}: ${parsed.exportContentHash}`,
  );
  expect(
    COMMIT_RE.test(parsed.gitCommit),
    `[export-provenance] invalid git commit marker in ${sourceLabel}: ${parsed.gitCommit}`,
  );
  expect(
    Number.isInteger(parsed.runtimeRootCount) && parsed.runtimeRootCount >= 1,
    `[export-provenance] invalid runtime root count in ${sourceLabel}: ${parsed.runtimeRootCount}`,
  );
  expect(
    Number.isInteger(parsed.runtimeClosureCount) &&
      parsed.runtimeClosureCount >= 1,
    `[export-provenance] invalid runtime closure count in ${sourceLabel}: ${parsed.runtimeClosureCount}`,
  );
  expect(
    Number.isInteger(parsed.nonRuntimeCodeCount) &&
      parsed.nonRuntimeCodeCount >= 0,
    `[export-provenance] invalid non-runtime code count in ${sourceLabel}: ${parsed.nonRuntimeCodeCount}`,
  );
  expect(
    Number.isInteger(parsed.runtimeSupportCount) &&
      parsed.runtimeSupportCount >= 0,
    `[export-provenance] invalid runtime-support count in ${sourceLabel}: ${parsed.runtimeSupportCount}`,
  );
  expect(
    Number.isInteger(parsed.experimentalCount) && parsed.experimentalCount >= 0,
    `[export-provenance] invalid experimental count in ${sourceLabel}: ${parsed.experimentalCount}`,
  );

  return parsed;
};

const main = async () => {
  const {
    output,
    files,
    era,
    provenance,
    runtimeRoots,
    runtimeClosureFiles,
    nonRuntimeCodeFiles,
    runtimeSupportCodeFiles,
    experimentalCodeFiles,
  } = await renderCoreExport();
  expect(
    files.length > 0,
    "[export-provenance] export file set cannot be empty",
  );

  const renderedHeader = parseExportHeader(output, "rendered output");
  const title = renderedHeader.title;
  expect(
    title.includes(`ERA ${era}`),
    `[export-provenance] title does not include era=${era}`,
  );

  expect(
    renderedHeader.manifestHash === provenance.manifestSha256,
    "[export-provenance] manifest hash mismatch between header and provenance",
  );
  expect(
    renderedHeader.exportSetHash === provenance.exportSetSha256,
    "[export-provenance] export-set hash mismatch between header and provenance",
  );
  expect(
    renderedHeader.exportContentHash === provenance.exportContentSha256,
    "[export-provenance] export-content hash mismatch between header and provenance",
  );
  expect(
    renderedHeader.gitCommit === provenance.gitCommit,
    "[export-provenance] git commit mismatch between header and provenance",
  );
  expect(
    renderedHeader.runtimeRootCount === runtimeRoots.length,
    "[export-provenance] runtime root count mismatch between header and payload",
  );
  expect(
    renderedHeader.runtimeClosureCount === runtimeClosureFiles.length,
    "[export-provenance] runtime closure count mismatch between header and payload",
  );
  expect(
    renderedHeader.nonRuntimeCodeCount === nonRuntimeCodeFiles.length,
    "[export-provenance] non-runtime code count mismatch between header and payload",
  );
  expect(
    renderedHeader.runtimeSupportCount === runtimeSupportCodeFiles.length,
    "[export-provenance] runtime-support count mismatch between header and payload",
  );
  expect(
    renderedHeader.experimentalCount === experimentalCodeFiles.length,
    "[export-provenance] experimental count mismatch between header and payload",
  );

  const exportedMarkdown = await Deno.readTextFile("OMEGA_CORE_LOGIC.md");
  const persistedHeader = parseExportHeader(
    exportedMarkdown,
    "OMEGA_CORE_LOGIC.md",
  );
  expect(
    persistedHeader.title.includes(`ERA ${era}`),
    `[export-provenance] OMEGA_CORE_LOGIC.md title does not include era=${era}`,
  );
  expect(
    persistedHeader.manifestHash === provenance.manifestSha256,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: manifest hash mismatch vs current render",
  );
  expect(
    persistedHeader.exportSetHash === provenance.exportSetSha256,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: export-set hash mismatch vs current render",
  );
  expect(
    persistedHeader.exportContentHash === provenance.exportContentSha256,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: export-content hash mismatch vs current render",
  );
  expect(
    persistedHeader.gitCommit === provenance.gitCommit,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: git commit mismatch vs current render",
  );
  expect(
    persistedHeader.runtimeRootCount === runtimeRoots.length,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: runtime root count mismatch vs current render",
  );
  expect(
    persistedHeader.runtimeClosureCount === runtimeClosureFiles.length,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: runtime closure count mismatch vs current render",
  );
  expect(
    persistedHeader.nonRuntimeCodeCount === nonRuntimeCodeFiles.length,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: non-runtime code count mismatch vs current render",
  );
  expect(
    persistedHeader.runtimeSupportCount === runtimeSupportCodeFiles.length,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: runtime-support count mismatch vs current render",
  );
  expect(
    persistedHeader.experimentalCount === experimentalCodeFiles.length,
    "[export-provenance] OMEGA_CORE_LOGIC.md stale: experimental count mismatch vs current render",
  );

  console.log(
    `[export-provenance] export provenance guard passed. files=${files.length} era=${era} commit=${renderedHeader.gitCommit}`,
  );
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
