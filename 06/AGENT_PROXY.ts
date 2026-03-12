import { RISC, STATE_MATRIX, SYS } from "@00";
import { PULSE } from "@02";
import { SPATIAL_HASH } from "@01";
import { assembleScript } from "@02";
import { LOGGER } from "@00";

export class AgentProxy {
  port: number;
  server: Deno.HttpServer | null = null;

  constructor(port: number = 8080) {
    this.port = port;
  }

  start() {
    LOGGER.info(
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
      LOGGER.info("[AGENT_PROXY] Server stopped.");
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
    const tick = Atomics.load((STATE_MATRIX as any).tickCounter, 0);
    // Simple population scan
    for (let i = 1; i <= 10000; i++) { // Bounding scan for performance
      const id = Number(STATE_MATRIX.getId(i));
      const energy = STATE_MATRIX.getEnergy(i);
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
    const id = Number(STATE_MATRIX.getId(atomId));
    if (id <= 0) {
      return new Response(JSON.stringify({ error: "Atom not found or dead" }), {
        status: 404,
      });
    }

    const x = STATE_MATRIX.getX(atomId);
    const y = STATE_MATRIX.getY(atomId);
    const energy = STATE_MATRIX.getEnergy(atomId);
    const role = STATE_MATRIX.getRole(atomId);

    // Radar scan (radius 50 units = 5 cells)
    const neighbors = SPATIAL_HASH.queryRadius(x, y, 50);
    const vision = neighbors
      .filter((nIdx) => nIdx !== atomId)
      .map((nIdx) => ({
        id: Number(STATE_MATRIX.getId(nIdx)),
        idx: nIdx,
        dx: STATE_MATRIX.getX(nIdx) - x,
        dy: STATE_MATRIX.getY(nIdx) - y,
        role: STATE_MATRIX.getRole(nIdx),
        distance: Math.sqrt(
          Math.pow(STATE_MATRIX.getX(nIdx) - x, 2) +
            Math.pow(STATE_MATRIX.getY(nIdx) - y, 2),
        ),
      })).sort((a, b) => a.distance - b.distance)
      .slice(0, 30);

    return new Response(
      JSON.stringify({
        self: { id, idx: atomId, x, y, energy, role },
        vision,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  async handleAtomAct(req: Request, atomId: number): Promise<Response> {
    const id = Number(STATE_MATRIX.getId(atomId));
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
            RISC.OP_SET,
            1,
            targetIdx,
            RISC.OP_SET,
            2,
            intensity,
            RISC.OP_SET,
            0,
            SYS.ATTRACT,
            RISC.OP_SYSCALL,
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
            RISC.OP_SET,
            1,
            targetIdx,
            RISC.OP_SET,
            2,
            resourceType,
            RISC.OP_SET,
            3,
            amount & 0xFF, // Negative fits in 8 bits nicely if < 127 steals
            RISC.OP_SET,
            0,
            SYS.TRANSFER,
            RISC.OP_SYSCALL,
          ];
          break;
        }
        case "YIELD":
        default:
          ops = [0]; // HALT/NOP
          break;
      }

      const compiledScript = assembleScript(ops);
      STATE_MATRIX.setInstructions(atomId, compiledScript);

      return new Response(
        JSON.stringify({ success: true, compiled_bytes: ops.length }),
      );
    } catch (e) {
      LOGGER.error(e);
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
