import { join, normalize } from "jsr:@std/path@^1.1.4";

const PORT = 8081;
const HOST = Deno.env.get("OMEGA_P2P_HOST")?.trim() || "127.0.0.1";
const ROOT = "./";
const ROOT_DIR = await Deno.realPath(ROOT);
const ROOT_PREFIX = ROOT_DIR.endsWith("/") ? ROOT_DIR : `${ROOT_DIR}/`;
const MUTATE_ENABLED =
  (Deno.env.get("OMEGA_P2P_MUTATE_ENABLE") ?? "").trim().toLowerCase() ===
    "1" ||
  (Deno.env.get("OMEGA_P2P_MUTATE_ENABLE") ?? "").trim().toLowerCase() ===
    "true";
const MUTATE_TOKEN = (Deno.env.get("OMEGA_P2P_MUTATE_TOKEN") ?? "").trim();
const ALIEN_ID_RE = /^0x[0-9A-F]{8,64}$/u;

const issueAlienId = (): string =>
  `0x${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

console.log(
  `🛸 P2P Synapse Membrane open on ${HOST}:${PORT} (mutate=${
    MUTATE_ENABLED ? "on" : "off"
  })`,
);

async function handler(req: Request): Promise<Response> {
  if (req.method === "POST" && new URL(req.url).pathname === "/mutate") {
    if (!MUTATE_ENABLED) {
      return new Response("MUTATION_DISABLED", { status: 403 });
    }
    if (MUTATE_TOKEN) {
      const token = req.headers.get("x-omega-mutate-token")?.trim() ?? "";
      if (token !== MUTATE_TOKEN) {
        return new Response("MUTATION_UNAUTHORIZED", { status: 401 });
      }
    }

    try {
      const alienData = await req.json();
      const rawId = typeof alienData.eigenvalue === "string"
        ? alienData.eigenvalue.trim().toUpperCase()
        : "";
      const alienId = ALIEN_ID_RE.test(rawId) ? rawId : issueAlienId();
      const filename = `${alienId}.ALIEN.md`;
      const targetPath = normalize(join(ROOT_DIR, filename));
      if (!targetPath.startsWith(ROOT_PREFIX)) {
        return new Response("MUTATION_REJECTED_PATH", { status: 400 });
      }

      const content = `---
eigenvalue: '${alienId}'
symbol: '${alienData.symbol || "ALIEN"}'
energy: ${alienData.energy || 100}
resonance: ${alienData.resonance || 0}
logic: '${alienData.logic || "00000000"}'
thought: '${alienData.thought || "UNKNOWN"}'
desc: '${alienData.desc || "Migrated from an external dimension."}'
---

<div class="alien-payload">
  System intrusion detected from external origin. This atom represents an alien logic state materialized via P2P Synapse.
</div>
`;
      await Deno.writeTextFile(targetPath, content);
      console.log(
        `   [P2P] 🛸 ALIEN ATOM MATERIALIZED: ${targetPath} (Logic: ${alienData.logic})`,
      );
      return new Response(
        JSON.stringify({ status: "MUTATION_ACCEPTED", target: filename }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("   [P2P] ⚠️ Failed to parse alien logic.", e);
      return new Response("MUTATION_REJECTED", { status: 400 });
    }
  }
  return new Response(
    JSON.stringify({
      status: "OMEGA-64 P2P Membrane Active",
      mutate_enabled: MUTATE_ENABLED,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

Deno.serve({ hostname: HOST, port: PORT }, handler);
