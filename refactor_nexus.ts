const filePath = "src/ontology/swarm/swarm_nexus.md";
let content = new TextDecoder().decode(Deno.readFileSync(filePath));

// 1. Replace class declaration
content = content.replace(
  "export class SwarmNexus {",
  `export type SwarmNexus = {
  nodeId: string;
  instanceId: number;
  port: number;
  seedNodes: string[];
  mainnetEnabled: boolean;
  bootstrapHubUrl: string;
  connectedPeers: Map<string, WebSocket>;
  peerHeartbeats: Map<string, { tick: number; tps: number; lastSeen: number }>;
  localCurrentTick: number;
  localTps: number;
  onAtomTransit?: (payload: Uint8Array) => void;
  onSyncRequest?: (peerId: string) => void;
  onEpochPayload?: (payload: Uint8Array) => void;

  start: () => void;
  stop: () => void;
  routeAtom: (egressEvent: Uint8Array) => void;
  getMedianSwarmTick: (localTickFallback: number) => number;
  broadcastEpochConsensus: (epochTick: number, hash: bigint) => void;
  broadcastSyncRequest: () => void;
  sendEpochPayload: (targetNodeId: string, epochData: Uint8Array) => void;
};

export const createSwarmNexus = (config: NexusConfig): SwarmNexus => {
  const self = {
    nodeId: crypto.randomUUID(),
    instanceId: config.instanceId,
    port: 8080 + config.instanceId,
    seedNodes: config.seedNodes,
    mainnetEnabled: config.mainnetEnabled ?? false,
    bootstrapHubUrl: config.bootstrapHubUrl ?? "",
    connectedPeers: new Map<string, WebSocket>(),
    peerHeartbeats: new Map<string, { tick: number; tps: number; lastSeen: number }>(),
    localCurrentTick: 0,
    localTps: 0,
    onAtomTransit: undefined,
    onSyncRequest: undefined,
    onEpochPayload: undefined,
  } as unknown as SwarmNexus;

  const serverAbortController = new AbortController();
  let heartbeatInterval: number | undefined;

`
);

// 2. Remove constructor entirely since state is initialized above
const constructorRegex = /  constructor\(config: NexusConfig\) \{[\s\S]*?^\s*\}/m;
content = content.replace(constructorRegex, "");

// 3. Remove public/private variable declarations at the top of the old class
// (From `public nodeId:` up to the constructor)
const varsRegex = /  public nodeId: string;[\s\S]*?  public onEpochPayload\?: \(payload: Uint8Array\) => void;/;
content = content.replace(varsRegex, "");

// 4. Convert all methods to `self.methodName = (args) => {`
content = content.replace(/  public start\(\) \{/g, "  self.start = () => {");
content = content.replace(/  public stop\(\) \{/g, "  self.stop = () => {");
content = content.replace(/  private connectToPeer\(url: string\) \{/g, "  const connectToPeer = (url: string) => {");
content = content.replace(/  private connectToHub\(\) \{/g, "  const connectToHub = () => {");
content = content.replace(/  private handleConnection\([\s\S]*?\) \{/gm, "  const handleConnection = (socket: WebSocket, direction: \"INBOUND\" | \"OUTBOUND\") => {");
content = content.replace(/  private sendHandshake\(socket: WebSocket\) \{/g, "  const sendHandshake = (socket: WebSocket) => {");
content = content.replace(/  private handleHandshake\(socket: WebSocket, payload: Uint8Array\): string \{/g, "  const handleHandshake = (socket: WebSocket, payload: Uint8Array): string => {");
content = content.replace(/  public routeAtom\(egressEvent: Uint8Array\) \{/g, "  self.routeAtom = (egressEvent: Uint8Array) => {");
content = content.replace(/  private sendDataChannel\(socket: WebSocket, payload: ArrayBufferLike\) \{/g, "  const sendDataChannel = (socket: WebSocket, payload: ArrayBufferLike) => {");
content = content.replace(/  private handleAtomTransit\(payload: Uint8Array\) \{/g, "  const handleAtomTransit = (payload: Uint8Array) => {");
content = content.replace(/  private broadcastHeartbeat\(\) \{/g, "  const broadcastHeartbeat = () => {");
content = content.replace(/  private handleHeartbeat\(remoteId: string, payload: Uint8Array\) \{/g, "  const handleHeartbeat = (remoteId: string, payload: Uint8Array) => {");
content = content.replace(/  public getMedianSwarmTick\(localTickFallback: number\): number \{/g, "  self.getMedianSwarmTick = (localTickFallback: number): number => {");
content = content.replace(/  public broadcastEpochConsensus\(epochTick: number, hash: bigint\) \{/g, "  self.broadcastEpochConsensus = (epochTick: number, hash: bigint) => {");
content = content.replace(/  private handleEpochConsensus\(remoteId: string, payload: Uint8Array\) \{/g, "  const handleEpochConsensus = (remoteId: string, payload: Uint8Array) => {");
content = content.replace(/  public broadcastSyncRequest\(\) \{/g, "  self.broadcastSyncRequest = () => {");
content = content.replace(/  private handleSyncRequest\(remoteId: string\) \{/g, "  const handleSyncRequest = (remoteId: string) => {");
content = content.replace(/  public sendEpochPayload\(targetNodeId: string, epochData: Uint8Array\) \{/g, "  self.sendEpochPayload = (targetNodeId: string, epochData: Uint8Array) => {");
content = content.replace(/  private handleEpochPayload\(payload: Uint8Array\) \{/g, "  const handleEpochPayload = (payload: Uint8Array) => {");

// 5. Replace `this.` with `self.` globally for public properties, OR completely remove `this.` for private equivalents.
// For simplicity, we just change all `this.` to `self.` and let closures handle local stuff for private variables too.
content = content.replace(/this\./g, "self.");

// Private vars that we mapped as local vars instead of self fields need to not be self.
content = content.replace(/self\.serverAbortController/g, "serverAbortController");
content = content.replace(/self\.heartbeatInterval/g, "heartbeatInterval");

// Private methods that we mapped as local consts need to not be self.
content = content.replace(/self\.connectToPeer/g, "connectToPeer");
content = content.replace(/self\.connectToHub/g, "connectToHub");
content = content.replace(/self\.handleConnection/g, "handleConnection");
content = content.replace(/self\.sendHandshake/g, "sendHandshake");
content = content.replace(/self\.handleHandshake/g, "handleHandshake");
content = content.replace(/self\.sendDataChannel/g, "sendDataChannel");
content = content.replace(/self\.handleAtomTransit/g, "handleAtomTransit");
content = content.replace(/self\.broadcastHeartbeat/g, "broadcastHeartbeat");
content = content.replace(/self\.handleHeartbeat/g, "handleHeartbeat");
content = content.replace(/self\.handleEpochConsensus/g, "handleEpochConsensus");
content = content.replace(/self\.handleSyncRequest/g, "handleSyncRequest");
content = content.replace(/self\.handleEpochPayload/g, "handleEpochPayload");


// 6. Close the factory
content = content.replace(/}\n\n```/g, "  return self;\n};\n\n```");

Deno.writeFileSync(filePath, new TextEncoder().encode(content));
console.log("Refactored swarm_nexus.md");
