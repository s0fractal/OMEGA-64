import { resolveSourcePath } from "../../resolve_source.ts";
const DAEMON_PATH = await resolveSourcePath("OMEGA_DAEMON.ts");
const AKASHA_SERVER_PATH = await resolveSourcePath("AKASHA_SERVER.ts");
const SYSTEM_START_PATH = await resolveSourcePath("SYSTEM_START.ts");

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  violations: string[],
) => {
  if (!source.includes(snippet)) {
    violations.push(`${file}: ${reason} (missing snippet: ${snippet})`);
  }
};

const requirePattern = (
  source: string,
  pattern: RegExp,
  file: string,
  reason: string,
  violations: string[],
) => {
  if (!pattern.test(source)) {
    violations.push(`${file}: ${reason} (missing pattern: ${pattern.source})`);
  }
};

const main = async () => {
  const violations: string[] = [];
  const daemon = await Deno.readTextFile(DAEMON_PATH);
  const akasha = await Deno.readTextFile(AKASHA_SERVER_PATH);
  const systemStart = await Deno.readTextFile(SYSTEM_START_PATH);

  requireSnippet(
    daemon,
    "OPENAI_API_KEY",
    DAEMON_PATH,
    "daemon must read OpenAI key from environment",
    violations,
  );
  requirePattern(
    daemon,
    /response_format\s*:\s*\{\s*type\s*:\s*"json_object"\s*\}/u,
    DAEMON_PATH,
    "daemon must force JSON output from OpenAI",
    violations,
  );
  requireSnippet(
    daemon,
    "/api/telemetry",
    DAEMON_PATH,
    "daemon must consume telemetry endpoint",
    violations,
  );
  requireSnippet(
    daemon,
    "/api/inject",
    DAEMON_PATH,
    "daemon must call inject endpoint",
    violations,
  );
  requireSnippet(
    daemon,
    "/api/pressure-ring",
    DAEMON_PATH,
    "daemon must call pressure-ring endpoint for seasonal theta scheduling",
    violations,
  );
  requireSnippet(
    daemon,
    "daemon_memory.json",
    DAEMON_PATH,
    "daemon must persist local continuity memory file",
    violations,
  );

  requireSnippet(
    akasha,
    "/api/telemetry",
    AKASHA_SERVER_PATH,
    "akasha server must expose telemetry endpoint",
    violations,
  );
  requireSnippet(
    akasha,
    "/api/inject",
    AKASHA_SERVER_PATH,
    "akasha server must expose inject endpoint",
    violations,
  );
  requireSnippet(
    akasha,
    "/api/pressure-ring",
    AKASHA_SERVER_PATH,
    "akasha server must expose pressure-ring endpoint",
    violations,
  );
  requireSnippet(
    systemStart,
    "DROP_PHEROMONE",
    SYSTEM_START_PATH,
    "system runtime must support pheromone injections",
    violations,
  );
  requireSnippet(
    systemStart,
    "INJECT_PLASMID",
    SYSTEM_START_PATH,
    "system runtime must support plasmid injections",
    violations,
  );
  requireSnippet(
    systemStart,
    "/api/pressure-ring",
    SYSTEM_START_PATH,
    "system runtime must expose pressure-ring control endpoint",
    violations,
  );

  if (violations.length > 0) {
    throw new Error(
      `[daemon-contract] contract violations:\n${
        violations.map((v) => `- ${v}`).join("\n")
      }`,
    );
  }

  console.log("[daemon-contract] daemon + akasha API contract passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
