const CODEX_PATH = "AKASHA_CODEX.ts";
const SYSTEM_START_PATH = "SYSTEM_START.ts";
const AKASHA_SERVER_PATH = "AKASHA_SERVER.ts";
const DAEMON_PATH = "OMEGA_DAEMON.ts";

type Violation = {
  file: string;
  reason: string;
};

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  violations: Violation[],
) => {
  if (!source.includes(snippet)) {
    violations.push({ file, reason: `${reason} (missing: ${snippet})` });
  }
};

const main = async () => {
  const violations: Violation[] = [];
  const [codex, system, akasha, daemon] = await Promise.all([
    Deno.readTextFile(CODEX_PATH),
    Deno.readTextFile(SYSTEM_START_PATH),
    Deno.readTextFile(AKASHA_SERVER_PATH),
    Deno.readTextFile(DAEMON_PATH),
  ]);

  requireSnippet(
    codex,
    "getNarrative",
    CODEX_PATH,
    "Codex module must expose human-readable narrative API",
    violations,
  );
  requireSnippet(
    system,
    '"/codex/narrative"',
    SYSTEM_START_PATH,
    "System server must expose direct codex narrative endpoint",
    violations,
  );
  requireSnippet(
    system,
    '"/api/codex/narrative"',
    SYSTEM_START_PATH,
    "System server must expose API-prefixed codex narrative endpoint",
    violations,
  );
  requireSnippet(
    system,
    "AKASHA_CODEX.getNarrative",
    SYSTEM_START_PATH,
    "System server must source narrative from AKASHA_CODEX",
    violations,
  );

  requireSnippet(
    akasha,
    '"/api/codex/narrative"',
    AKASHA_SERVER_PATH,
    "Akasha proxy must expose codex narrative endpoint",
    violations,
  );
  requireSnippet(
    akasha,
    '"/api/codex"',
    AKASHA_SERVER_PATH,
    "Akasha proxy must expose codex snapshot endpoint",
    violations,
  );

  requireSnippet(
    daemon,
    "CODEX_NARRATIVE_URL",
    DAEMON_PATH,
    "Daemon must request codex narrative context",
    violations,
  );
  requireSnippet(
    daemon,
    "codex_narrative",
    DAEMON_PATH,
    "Daemon prompt must include codex narrative bridge",
    violations,
  );

  if (violations.length > 0) {
    console.error("[codex-narrative-contract] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[codex-narrative-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
