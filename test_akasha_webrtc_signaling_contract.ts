const AKASHA_SERVER_PATH = "AKASHA_SERVER.ts";
const SIGNALING_PATH = "AKASHA_SIGNALING.ts";

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  violations: string[],
) => {
  if (!source.includes(snippet)) {
    violations.push(`${file}: ${reason} (missing: ${snippet})`);
  }
};

const main = async () => {
  const violations: string[] = [];
  const [server, signaling] = await Promise.all([
    Deno.readTextFile(AKASHA_SERVER_PATH),
    Deno.readTextFile(SIGNALING_PATH),
  ]);

  requireSnippet(
    server,
    "AKASHA_SIGNALING",
    AKASHA_SERVER_PATH,
    "akasha server must integrate signaling module",
    violations,
  );
  requireSnippet(
    server,
    '"/api/webrtc"',
    AKASHA_SERVER_PATH,
    "akasha server must expose webrtc status endpoint",
    violations,
  );
  requireSnippet(
    server,
    "url.pathname === AKASHA_SIGNALING.path",
    AKASHA_SERVER_PATH,
    "akasha server must route websocket upgrades to signaling path",
    violations,
  );
  requireSnippet(
    server,
    "AKASHA_SIGNALING.attach(socket)",
    AKASHA_SERVER_PATH,
    "akasha server must attach signaling websocket handler",
    violations,
  );
  requireSnippet(
    server,
    "AKASHA_SIGNALING.status()",
    AKASHA_SERVER_PATH,
    "akasha server must return signaling status payload",
    violations,
  );

  requireSnippet(
    signaling,
    'const RTC_SIGNAL_PATH = "/rtc/signal"',
    SIGNALING_PATH,
    "signaling path must be explicit and stable",
    violations,
  );
  requireSnippet(
    signaling,
    "MAX_SIGNAL_MESSAGE_BYTES",
    SIGNALING_PATH,
    "signaling must cap inbound message size",
    violations,
  );
  requireSnippet(
    signaling,
    'type === "join"',
    SIGNALING_PATH,
    "signaling must support join handshake",
    violations,
  );
  requireSnippet(
    signaling,
    'type: "signal"',
    SIGNALING_PATH,
    "signaling must support signal relay frames",
    violations,
  );
  requireSnippet(
    signaling,
    'type: "peer-joined"',
    SIGNALING_PATH,
    "signaling must emit peer join events",
    violations,
  );
  requireSnippet(
    signaling,
    'type: "peer-left"',
    SIGNALING_PATH,
    "signaling must emit peer leave events",
    violations,
  );
  requireSnippet(
    signaling,
    "signalType",
    SIGNALING_PATH,
    "signaling relay must preserve signalType semantics",
    violations,
  );
  requireSnippet(
    signaling,
    '"offer"',
    SIGNALING_PATH,
    "signaling must include offer relay support",
    violations,
  );
  requireSnippet(
    signaling,
    '"answer"',
    SIGNALING_PATH,
    "signaling must include answer relay support",
    violations,
  );
  requireSnippet(
    signaling,
    '"candidate"',
    SIGNALING_PATH,
    "signaling must include ICE candidate relay support",
    violations,
  );

  if (violations.length > 0) {
    throw new Error(
      `[akasha-webrtc-signaling] contract violations:\n${
        violations.map((v) => `- ${v}`).join("\n")
      }`,
    );
  }

  console.log("[akasha-webrtc-signaling] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
