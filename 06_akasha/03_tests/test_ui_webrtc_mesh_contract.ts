const UI_PATH = "63_necropolis/old/ui/ui/index.html";

const requireSnippet = (
  source: string,
  snippet: string,
  reason: string,
  violations: string[],
) => {
  if (!source.includes(snippet)) {
    violations.push(`${reason} (missing: ${snippet})`);
  }
};

const main = async () => {
  const violations: string[] = [];
  const ui = await Deno.readTextFile(UI_PATH);

  requireSnippet(
    ui,
    "RTC_SIGNAL_PATH",
    "UI must declare explicit signaling path constant",
    violations,
  );
  requireSnippet(
    ui,
    '"/rtc/signal"',
    "UI must target WebRTC signaling route",
    violations,
  );
  requireSnippet(
    ui,
    "deriveRtcSignalUrl",
    "UI must derive signaling URL from query/storage/runtime",
    violations,
  );
  requireSnippet(
    ui,
    "RTC_SIGNAL_ROOM",
    "UI must bind signaling room identifier",
    violations,
  );
  requireSnippet(
    ui,
    "RTCPeerConnection",
    "UI must use RTCPeerConnection for mesh channel negotiation",
    violations,
  );
  requireSnippet(
    ui,
    "connectRtcSignaling",
    "UI must open signaling websocket membrane",
    violations,
  );
  requireSnippet(
    ui,
    "createRtcOffer",
    "UI must support outbound offer creation",
    violations,
  );
  requireSnippet(
    ui,
    "handleRtcSignalFrame",
    "UI must handle inbound offer/answer/candidate frames",
    violations,
  );
  requireSnippet(
    ui,
    'sendRtcSignalFrame(remotePeerId, "offer"',
    "UI must relay offer frames via signaling",
    violations,
  );
  requireSnippet(
    ui,
    'sendRtcSignalFrame(fromPeerId, "answer"',
    "UI must relay answer frames via signaling",
    violations,
  );
  requireSnippet(
    ui,
    'sendRtcSignalFrame(remotePeerId, "candidate"',
    "UI must relay ICE candidate frames via signaling",
    violations,
  );
  requireSnippet(
    ui,
    "broadcastRtcTelemetry",
    "UI must emit telemetry frames over data channels",
    violations,
  );
  requireSnippet(
    ui,
    "postWebRtcInject",
    "UI must forward mesh packets through gated WebRTC inject endpoint",
    violations,
  );
  requireSnippet(
    ui,
    '"/api/webrtc/inject"',
    "UI mesh ingress must use dedicated Akasha inject route",
    violations,
  );
  requireSnippet(
    ui,
    "mesh_pheromone",
    "UI must support mesh pheromone packet type",
    violations,
  );
  requireSnippet(
    ui,
    "mesh_plasmid",
    "UI must support mesh plasmid packet type",
    violations,
  );
  requireSnippet(
    ui,
    "ingestMeshFrame",
    "UI must validate and ingest inbound mesh packets",
    violations,
  );
  requireSnippet(
    ui,
    "omegaRtcMesh",
    "UI must expose explicit mesh emit API for operators",
    violations,
  );
  requireSnippet(
    ui,
    "updatePeerMeshHud",
    "UI must surface mesh signaling status in HUD",
    violations,
  );

  if (violations.length > 0) {
    throw new Error(
      `[ui-webrtc-mesh-contract] contract violations:\n${
        violations.map((v) => `- ${v}`).join("\n")
      }`,
    );
  }

  console.log("[ui-webrtc-mesh-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
