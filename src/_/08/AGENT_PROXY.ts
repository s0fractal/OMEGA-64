// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/membrane/agent_proxy.md
import { LOGGER, Le, Li, OP_SET, OP_SYSCALL, MX, SYS_ATTRACT, SYS_TRANSFER, assemble, assembler } from "@g07";

export class AgentProxy {
  port: number;
  server: Deno.HttpServer | null = null;

  constructor(port: number = 8080) {
    this.port = port;
  }

  start() {
    Li(
      `[AGENT_PROXY] Starting LLM Sandbox Proxy on port ${this.port}...`,
    );
    this.server = Deno.serve(
      { port: this.port },
      this.handleRequest.bind(this),
    );
  }

  stop() {
    if (this.server) {
      this.server.shutdown();
      Li("[AGENT_PROXY] Server stopped.");
    }
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const method = req.method;

    if (method === "GET" && url.pathname === "/api/matrix/info") {
      return this.handleMatrixInfo(req);
    }

    const atomMatch = url.pathname.match(/^\/api\/atom\/(\d+)(?:\/(.*))?$/);
    if (atomMatch) {
      const atomId = parseInt(atomMatch[1], 10);
      const action = atomMatch[2];

      if (!action && method === "GET") {
        return this.handleAtomSense(atomId);
      }

      if (action === "act" && method === "POST") {
        return await this.handleAtomAct(req, atomId);
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  handleMatrixInfo(req: Request): Response {
    let pop = 0;
    let totalEnergy = 0;
    const tick = Atomics.load((MX as any).tickCounter, 0);
    // Simple population scan
    for (let i = 1; i <= 10000; i++) { // Bounding scan for performance
      const id = Number(MX.getId(i));
      const energy = MX.getEnergy(i);
      if (id > 0 && energy > 0) {
        pop++;
        totalEnergy += energy;
      }
    }

    return new Response(
      JSON.stringify({
        tick,
        population: pop,
        totalEnergy,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  handleAtomSense(atomId: number): Response {
    const id = Number(MX.getId(atomId));
    if (id <= 0) {
      return new Response(JSON.stringify({ error: "Atom not found or dead" }), {
        status: 404,
      });
    }

    const x = MX.getX(atomId);
    const y = MX.getY(atomId);
    const energy = MX.getEnergy(atomId);
    const role = MX.getRole(atomId);

    // Radar scan (radius 50 units = 5 cells)
    const vision = [];
    const MAX_DISTANCE_SQ = 50 * 50;

    // Bounded scan over MX to avoid legacy SPATIAL_HASH O(1) grid overhead
    // which requires constant upkeep from workers.
    for (let currentAt = 1; currentAt <= 10000; currentAt++) {
      if (currentAt === atomId) continue;

      const nId = Number(MX.getId(currentAt));
      if (nId <= 0) continue;

      const nX = MX.getX(currentAt);
      const nY = MX.getY(currentAt);

      const dx = nX - x;
      const dy = nY - y;
      const dSq = dx * dx + dy * dy;

      if (dSq <= MAX_DISTANCE_SQ) {
        vision.push({
          id: nId,
          idx: currentAt,
          dx,
          dy,
          role: MX.getRole(currentAt),
          distance: Math.sqrt(dSq),
        });
      }
    }

    vision.sort((a, b) => a.distance - b.distance);
    vision.splice(30); // Keep only nearest 30

    return new Response(
      JSON.stringify({
        self: { id, idx: atomId, x, y, energy, role },
        vision,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  async handleAtomAct(req: Request, atomId: number): Promise<Response> {
    const id = Number(MX.getId(atomId));
    if (id <= 0) {
      return new Response(JSON.stringify({ error: "Atom not found or dead" }), {
        status: 404,
      });
    }

    try {
      const body = await req.json();
      const action = body.action;

      let ops: number[] = [];

      switch (action) {
        case "ATTRACT": {
          const targetIdx = typeof body.targetIdx === "number"
            ? body.targetIdx
            : 0;
          const intensity = typeof body.intensity === "number"
            ? body.intensity
            : 1;

          ops = [
            OP_SET,
            1,
            targetIdx,
            OP_SET,
            2,
            intensity,
            OP_SET,
            0,
            SYS_ATTRACT,
            OP_SYSCALL,
          ];
          break;
        }
        case "TRANSFER": {
          const targetIdx = typeof body.targetIdx === "number"
            ? body.targetIdx
            : 0;
          const resourceType = typeof body.resourceType === "number"
            ? body.resourceType
            : 0;
          const amount = typeof body.amount === "number" ? body.amount : 0;

          ops = [
            OP_SET,
            1,
            targetIdx,
            OP_SET,
            2,
            resourceType,
            OP_SET,
            3,
            amount & 0xFF, // Negative fits in 8 bits nicely if < 127 steals
            OP_SET,
            0,
            SYS_TRANSFER,
            OP_SYSCALL,
          ];
          break;
        }
        case "YIELD":
        default:
          ops = [0]; // HALT/NOP
          break;
      }

      const compiledScript = assemble(ops);
      MX.setInstructions(atomId, compiledScript);

      return new Response(
        JSON.stringify({ success: true, compiled_bytes: ops.length }),
      );
    } catch (e) {
      Le(e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON or Internal Error" }),
        { status: 400 },
      );
    }
  }
}

if (import.meta.main) {
  const proxy = new AgentProxy();
  proxy.start();
}
