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

  const header = output.split(/\r?\n/u).slice(0, 16);
  const title = header[0] ?? "";
  expect(
    title.includes(`ERA ${era}`),
    `[export-provenance] title does not include era=${era}`,
  );

  const manifestLine = header.find((line) =>
    line.startsWith("*Manifest SHA256: ")
  );
  const exportSetLine = header.find((line) =>
    line.startsWith("*Export Set SHA256: ")
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
    "[export-provenance] missing Manifest SHA256 header",
  );
  expect(
    typeof exportSetLine === "string",
    "[export-provenance] missing Export Set SHA256 header",
  );
  expect(
    typeof commitLine === "string",
    "[export-provenance] missing Git Commit header",
  );
  expect(
    typeof runtimeRootsLine === "string",
    "[export-provenance] missing Runtime Roots header",
  );
  expect(
    typeof runtimeClosureLine === "string",
    "[export-provenance] missing Runtime Closure Files header",
  );
  expect(
    typeof nonRuntimeCodeLine === "string",
    "[export-provenance] missing Non-Runtime Code Files header",
  );
  expect(
    typeof runtimeSupportLine === "string",
    "[export-provenance] missing Runtime-Support Code Files header",
  );
  expect(
    typeof experimentalLine === "string",
    "[export-provenance] missing Experimental Code Files header",
  );

  const manifestHash = parseHeaderValue(manifestLine!, "*Manifest SHA256: ");
  const exportSetHash = parseHeaderValue(
    exportSetLine!,
    "*Export Set SHA256: ",
  );
  const gitCommit = parseHeaderValue(commitLine!, "*Git Commit: ");
  const runtimeRootCount = Number(
    parseHeaderValue(runtimeRootsLine!, "*Runtime Roots: "),
  );
  const runtimeClosureCount = Number(
    parseHeaderValue(runtimeClosureLine!, "*Runtime Closure Files: "),
  );
  const nonRuntimeCodeCount = Number(
    parseHeaderValue(nonRuntimeCodeLine!, "*Non-Runtime Code Files: "),
  );
  const runtimeSupportCount = Number(
    parseHeaderValue(runtimeSupportLine!, "*Runtime-Support Code Files: "),
  );
  const experimentalCount = Number(
    parseHeaderValue(experimentalLine!, "*Experimental Code Files: "),
  );

  expect(
    SHA256_RE.test(manifestHash),
    `[export-provenance] invalid manifest SHA256: ${manifestHash}`,
  );
  expect(
    SHA256_RE.test(exportSetHash),
    `[export-provenance] invalid export-set SHA256: ${exportSetHash}`,
  );
  expect(
    COMMIT_RE.test(gitCommit),
    `[export-provenance] invalid git commit marker: ${gitCommit}`,
  );
  expect(
    Number.isInteger(runtimeRootCount) && runtimeRootCount >= 1,
    `[export-provenance] invalid runtime root count: ${runtimeRootCount}`,
  );
  expect(
    Number.isInteger(runtimeClosureCount) && runtimeClosureCount >= 1,
    `[export-provenance] invalid runtime closure count: ${runtimeClosureCount}`,
  );
  expect(
    Number.isInteger(nonRuntimeCodeCount) && nonRuntimeCodeCount >= 0,
    `[export-provenance] invalid non-runtime code count: ${nonRuntimeCodeCount}`,
  );
  expect(
    Number.isInteger(runtimeSupportCount) && runtimeSupportCount >= 0,
    `[export-provenance] invalid runtime-support count: ${runtimeSupportCount}`,
  );
  expect(
    Number.isInteger(experimentalCount) && experimentalCount >= 0,
    `[export-provenance] invalid experimental count: ${experimentalCount}`,
  );

  expect(
    manifestHash === provenance.manifestSha256,
    "[export-provenance] manifest hash mismatch between header and provenance",
  );
  expect(
    exportSetHash === provenance.exportSetSha256,
    "[export-provenance] export-set hash mismatch between header and provenance",
  );
  expect(
    gitCommit === provenance.gitCommit,
    "[export-provenance] git commit mismatch between header and provenance",
  );
  expect(
    runtimeRootCount === runtimeRoots.length,
    "[export-provenance] runtime root count mismatch between header and payload",
  );
  expect(
    runtimeClosureCount === runtimeClosureFiles.length,
    "[export-provenance] runtime closure count mismatch between header and payload",
  );
  expect(
    nonRuntimeCodeCount === nonRuntimeCodeFiles.length,
    "[export-provenance] non-runtime code count mismatch between header and payload",
  );
  expect(
    runtimeSupportCount === runtimeSupportCodeFiles.length,
    "[export-provenance] runtime-support count mismatch between header and payload",
  );
  expect(
    experimentalCount === experimentalCodeFiles.length,
    "[export-provenance] experimental count mismatch between header and payload",
  );

  console.log(
    `[export-provenance] export provenance guard passed. files=${files.length} era=${era} commit=${gitCommit}`,
  );
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
