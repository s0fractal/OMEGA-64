const STREAM_PATH = "TELEMETRY_STREAM.ts";
const SYSTEM_PATH = "SYSTEM_START.ts";

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
  const [stream, system] = await Promise.all([
    Deno.readTextFile(STREAM_PATH),
    Deno.readTextFile(SYSTEM_PATH),
  ]);

  requireSnippet(
    stream,
    "export const TELEMETRY_STREAM",
    STREAM_PATH,
    "Telemetry stream module must export stream runtime singleton",
    violations,
  );
  requireSnippet(
    stream,
    "histogram:",
    STREAM_PATH,
    "Telemetry stream must expose histogram API",
    violations,
  );
  requireSnippet(
    stream,
    "attach:",
    STREAM_PATH,
    "Telemetry stream must expose websocket attach API",
    violations,
  );
  requireSnippet(
    stream,
    "emit:",
    STREAM_PATH,
    "Telemetry stream must expose emit API",
    violations,
  );

  requireSnippet(
    system,
    "/api/telemetry/stream",
    SYSTEM_PATH,
    "System API must expose telemetry stream snapshot endpoint",
    violations,
  );
  requireSnippet(
    system,
    "/api/telemetry/histogram",
    SYSTEM_PATH,
    "System API must expose telemetry histogram endpoint",
    violations,
  );
  requireSnippet(
    system,
    "/api/telemetry/ws",
    SYSTEM_PATH,
    "System API must expose telemetry websocket endpoint",
    violations,
  );
  requireSnippet(
    system,
    "TELEMETRY_STREAM.emit",
    SYSTEM_PATH,
    "Pulse loop must emit telemetry into stream channel",
    violations,
  );
  requireSnippet(
    system,
    "actions_dynamic_max_in_window",
    SYSTEM_PATH,
    "Daemon governance telemetry must expose dynamic budget ceiling",
    violations,
  );

  if (violations.length > 0) {
    console.error("[telemetry-stream-contract] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[telemetry-stream-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
