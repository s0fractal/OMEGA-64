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
  const { output, files, era, provenance } = await renderCoreExport();
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

  const manifestHash = parseHeaderValue(manifestLine!, "*Manifest SHA256: ");
  const exportSetHash = parseHeaderValue(
    exportSetLine!,
    "*Export Set SHA256: ",
  );
  const gitCommit = parseHeaderValue(commitLine!, "*Git Commit: ");

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

  console.log(
    `[export-provenance] export provenance guard passed. files=${files.length} era=${era} commit=${gitCommit}`,
  );
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
