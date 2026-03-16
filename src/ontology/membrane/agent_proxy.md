---
id: AGENT_PROXY
type: module
description: Migrated from src/06/AGENT_PROXY.ts
tags:
  - standalone
  - server
deps:
  - LOGGER
  - assembler
  - SIGMA_FFI_BRIDGE
  - TYPES
min_level: 14
entry: true
vars:
  - LOGGER
  - Le
  - Li
  - OP_SET
  - OP_SYSCALL
  - MX
  - SYS_ATTRACT
  - SYS_TRANSFER
  - assemble
  - SIGMA_FFI
extra_symbols:
  - AgentProxy
---

### TypeScript

```typescript




const sensoryBuffer = new Float32Array(12);
const sensoryPtr = Deno.UnsafePointer.of(sensoryBuffer);

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

    // Phase 4: Vector Vision (Directional Gradients)
    if (SIGMA_FFI.loaded()) {
      SIGMA_FFI.getSensoryVector(atomId, sensoryPtr);
    } else {
      sensoryBuffer.fill(0);
    }

    return new Response(
      JSON.stringify({
        self: { id, idx: atomId, x, y, energy, role },
        sensory_tensor: {
          trophic: Array.from(sensoryBuffer.slice(0, 4)),
          threat: Array.from(sensoryBuffer.slice(4, 8)),
          glyph: Array.from(sensoryBuffer.slice(8, 12)),
          directions: ["N", "E", "S", "W"],
        },
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
```
