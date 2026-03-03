import { parse as parseYaml } from "jsr:@std/yaml@^1.0.5";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";

const PORT = RUNTIME_POLICY.akasha.port;
const HOST = RUNTIME_POLICY.akasha.host;
const ROOT = "./";

RUNTIME_POLICY.logFingerprintOnce("akasha-server");

let clients = new Set<WebSocket>();

// Store the latest state of the universe
let akashaState: string = "{}";

async function scanUniverse() {
  const atoms: any[] = [];
  const bonds: Array<{ source: string; target: string }> = [];

  try {
    for await (const entry of Deno.readDir(ROOT)) {
      if (
        entry.isFile && entry.name.endsWith(".md") &&
        entry.name.startsWith("0x")
      ) {
        const content = await Deno.readTextFile(`${ROOT}/${entry.name}`);
        const metaMatch = content.match(/^---\n([\s\S]+?)\n---/);
        if (metaMatch) {
          try {
            const alpha = parseYaml(metaMatch[1]) as any;
            const eigenvalue = alpha.eigenvalue || entry.name.split(".")[0];
            atoms.push({
              id: eigenvalue,
              symbol: alpha.symbol || entry.name.split(".")[1],
              x: Number(alpha.x) || Math.random() * 800,
              y: Number(alpha.y) || Math.random() * 800,
              energy: Number(alpha.energy) || 0,
              resonance: Number(alpha.resonance) || 0,
              logic: alpha.logic || "00000000",
              thought: alpha.thought || "DRIFTING",
            });

            if (alpha.bonds && Array.isArray(alpha.bonds)) {
              for (const b of alpha.bonds) {
                bonds.push({ source: eigenvalue, target: b });
              }
            }
          } catch (e) {
            // silently ignore parsing errors for individual files
          }
        }
      }
    }
  } catch (e) {
    console.error("Error scanning universe:", e);
  }

  akashaState = JSON.stringify({ type: "SYNC", data: { atoms, bonds } });
  broadcast(akashaState);
}

function broadcast(message: string) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Initial scan
await scanUniverse();

// Periodic full state push (every 1 second)
setInterval(scanUniverse, 1000);

// Also try to watch for file changes to push instantly, but Deno.watchFs can be chatty,
// so we'll rely primarily on the 1s interval for UI smoothness, but trigger scan on watch too.
async function watchUniverse() {
  const watcher = Deno.watchFs(ROOT);
  let debounceTimer: number | null = null;
  for await (const event of watcher) {
    if (event.paths.some((p) => p.endsWith(".md"))) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scanUniverse, 100);
    }
  }
}
watchUniverse(); // background

const reqHandler = async (req: Request) => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response("Akasha Node - WebSocket endpoint only.", {
      status: 200,
    });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = () => {
    console.log("   [👁️ AKASHA] New Observer Connected.");
    clients.add(socket);
    socket.send(akashaState); // send latest state immediately
  };
  socket.onmessage = (e) => {
    // Visualization channel is read-only; ignore client payloads.
  };
  socket.onclose = () => {
    console.log("   [👁️ AKASHA] Observer Disconnected.");
    clients.delete(socket);
  };
  socket.onerror = (e) => console.error("   [⚠️ AKASHA] WebSocket Error:", e);

  return response;
};

Deno.serve({ hostname: HOST, port: PORT }, reqHandler);
console.log(`🌌 Akasha Server listening on ws://${HOST}:${PORT}/`);
