const RTC_SIGNAL_PATH = "/rtc/signal";
const MAX_SIGNAL_MESSAGE_BYTES = 128 * 1024;
const PEER_ID_RE = /^[A-Za-z0-9._:-]{1,64}$/u;
const ROOM_ID_RE = /^[A-Za-z0-9._:-]{1,64}$/u;
const SIGNAL_TYPES = [
  "offer",
  "answer",
  "candidate",
  "plasmid",
  "pheromone",
  "telemetry",
] as const;

type SignalType = typeof SIGNAL_TYPES[number];
type JsonMap = Record<string, unknown>;

type SignalingSession = {
  socket: WebSocket;
  roomId: string | null;
  peerId: string | null;
};

const signalTypeSet = new Set<string>(SIGNAL_TYPES);
const sessions = new Map<WebSocket, SignalingSession>();
const roomPeers = new Map<string, Set<string>>();
const socketsByRoomPeer = new Map<string, WebSocket>();

const roomPeerKey = (roomId: string, peerId: string): string =>
  `${roomId}::${peerId}`;

const toSignalTypeList = (): SignalType[] => [...SIGNAL_TYPES];

const safeSend = (socket: WebSocket, payload: JsonMap): void => {
  if (socket.readyState !== WebSocket.OPEN) return;
  try {
    socket.send(JSON.stringify(payload));
  } catch {
    // Ignore socket send faults; session cleanup is handled by close/error.
  }
};

const sendError = (socket: WebSocket, code: string, detail: string): void => {
  safeSend(socket, { type: "error", code, detail });
};

const readObject = (value: unknown): JsonMap | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as JsonMap;
};

const normalizeId = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const ensureRoomPeerSet = (roomId: string): Set<string> => {
  const existing = roomPeers.get(roomId);
  if (existing) return existing;
  const created = new Set<string>();
  roomPeers.set(roomId, created);
  return created;
};

const listRoomPeers = (roomId: string): string[] => {
  const peers = roomPeers.get(roomId);
  if (!peers) return [];
  return Array.from(peers).sort((a, b) => a.localeCompare(b));
};

const broadcastRoom = (
  roomId: string,
  payload: JsonMap,
  excludePeerId?: string,
): void => {
  const peers = roomPeers.get(roomId);
  if (!peers || peers.size === 0) return;
  for (const peerId of peers) {
    if (excludePeerId && peerId === excludePeerId) continue;
    const socket = socketsByRoomPeer.get(roomPeerKey(roomId, peerId));
    if (!socket) continue;
    safeSend(socket, payload);
  }
};

const leaveRoom = (
  session: SignalingSession,
  cause: "client_leave" | "disconnect",
): void => {
  if (!session.roomId || !session.peerId) return;
  const roomId = session.roomId;
  const peerId = session.peerId;
  const key = roomPeerKey(roomId, peerId);
  socketsByRoomPeer.delete(key);
  const peers = roomPeers.get(roomId);
  if (peers) {
    peers.delete(peerId);
    if (peers.size === 0) roomPeers.delete(roomId);
  }
  session.roomId = null;
  session.peerId = null;
  broadcastRoom(roomId, { type: "peer-left", room: roomId, peerId, cause });
};

const joinRoom = (session: SignalingSession, message: JsonMap): void => {
  const roomId = normalizeId(message.room);
  const peerId = normalizeId(message.peerId);
  if (!ROOM_ID_RE.test(roomId)) {
    sendError(
      session.socket,
      "ROOM_REQUIRED",
      "room must match [A-Za-z0-9._:-]{1,64}",
    );
    return;
  }
  if (!PEER_ID_RE.test(peerId)) {
    sendError(
      session.socket,
      "PEER_ID_REQUIRED",
      "peerId must match [A-Za-z0-9._:-]{1,64}",
    );
    return;
  }
  const key = roomPeerKey(roomId, peerId);
  const existingSocket = socketsByRoomPeer.get(key);
  if (existingSocket && existingSocket !== session.socket) {
    sendError(session.socket, "PEER_ID_TAKEN", "peerId already exists in room");
    return;
  }

  if (session.roomId && session.peerId) {
    leaveRoom(session, "client_leave");
  }

  const peers = ensureRoomPeerSet(roomId);
  peers.add(peerId);
  socketsByRoomPeer.set(key, session.socket);
  session.roomId = roomId;
  session.peerId = peerId;

  safeSend(session.socket, {
    type: "joined",
    room: roomId,
    peerId,
    peers: listRoomPeers(roomId).filter((id) => id !== peerId),
  });
  broadcastRoom(
    roomId,
    { type: "peer-joined", room: roomId, peerId },
    peerId,
  );
};

const relaySignal = (session: SignalingSession, message: JsonMap): void => {
  if (!session.roomId || !session.peerId) {
    sendError(session.socket, "NOT_JOINED", "join room before signaling");
    return;
  }

  const roomId = normalizeId(message.room);
  const toPeerId = normalizeId(message.to);
  const fromPeerId = normalizeId(message.from) || session.peerId;
  const rawSignalType = normalizeId(message.signalType).toLowerCase();
  const payload = message.payload ?? null;

  if (roomId !== session.roomId) {
    sendError(
      session.socket,
      "ROOM_MISMATCH",
      "signal room must match joined room",
    );
    return;
  }
  if (fromPeerId !== session.peerId) {
    sendError(session.socket, "FROM_MISMATCH", "from must match joined peerId");
    return;
  }
  if (!PEER_ID_RE.test(toPeerId)) {
    sendError(session.socket, "TARGET_REQUIRED", "target peerId is invalid");
    return;
  }
  if (!signalTypeSet.has(rawSignalType)) {
    sendError(
      session.socket,
      "SIGNAL_TYPE_INVALID",
      `signalType must be one of: ${toSignalTypeList().join(", ")}`,
    );
    return;
  }

  const targetSocket = socketsByRoomPeer.get(
    roomPeerKey(session.roomId, toPeerId),
  );
  if (!targetSocket || targetSocket.readyState !== WebSocket.OPEN) {
    sendError(session.socket, "TARGET_OFFLINE", "target peer is not connected");
    return;
  }

  safeSend(targetSocket, {
    type: "signal",
    room: session.roomId,
    from: session.peerId,
    signalType: rawSignalType,
    payload,
  });
  safeSend(session.socket, {
    type: "signal-ack",
    room: session.roomId,
    to: toPeerId,
    signalType: rawSignalType,
  });
};

const handleMessage = (session: SignalingSession, raw: string): void => {
  if (raw.length > MAX_SIGNAL_MESSAGE_BYTES) {
    sendError(
      session.socket,
      "MESSAGE_TOO_LARGE",
      `message exceeds ${MAX_SIGNAL_MESSAGE_BYTES} bytes`,
    );
    return;
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    sendError(session.socket, "INVALID_JSON", "message must be valid JSON");
    return;
  }
  const message = readObject(parsed);
  if (!message) {
    sendError(
      session.socket,
      "INVALID_SHAPE",
      "message payload must be an object",
    );
    return;
  }

  const type = normalizeId(message.type).toLowerCase();
  if (type === "join") {
    joinRoom(session, message);
    return;
  }
  if (type === "signal") {
    relaySignal(session, message);
    return;
  }
  if (type === "leave") {
    leaveRoom(session, "client_leave");
    safeSend(session.socket, { type: "left" });
    return;
  }
  sendError(
    session.socket,
    "TYPE_UNSUPPORTED",
    "supported types: join | signal | leave",
  );
};

const attach = (socket: WebSocket): void => {
  const session: SignalingSession = {
    socket,
    roomId: null,
    peerId: null,
  };
  sessions.set(socket, session);

  socket.onopen = () => {
    safeSend(socket, {
      type: "hello",
      path: RTC_SIGNAL_PATH,
      signalTypes: toSignalTypeList(),
    });
  };
  socket.onmessage = (event: MessageEvent) => {
    if (typeof event.data !== "string") {
      sendError(socket, "INVALID_DATA_TYPE", "message data must be string");
      return;
    }
    handleMessage(session, event.data);
  };
  socket.onclose = () => {
    leaveRoom(session, "disconnect");
    sessions.delete(socket);
  };
  socket.onerror = () => {
    // Let close handler handle membership cleanup.
  };
};

const status = (): JsonMap => ({
  ok: true,
  path: RTC_SIGNAL_PATH,
  rooms: roomPeers.size,
  peers: socketsByRoomPeer.size,
  signalTypes: toSignalTypeList(),
  maxMessageBytes: MAX_SIGNAL_MESSAGE_BYTES,
});

export const AKASHA_SIGNALING = {
  path: RTC_SIGNAL_PATH,
  attach,
  status,
} as const;
