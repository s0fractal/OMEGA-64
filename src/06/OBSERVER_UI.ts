// OMEGA-64 | OBSERVER_UI.ts | Era 11: The Eye of the Observer
// Deno server to stream the SoA Matrix and Vox Populi to the browser.

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { SEMANTIC_MEMBRANE } from "@05";

const PORT = 8000;
const UI_PATH = "./63/00/index.html";

console.log(`👁️ OMEGA-64 | OBSERVER EYE | Port: ${PORT}`);

if (import.meta.main) {
  Deno.serve({ port: PORT }, async (req) => {
    const url = new URL(req.url);

    // 1. Stream the SoA Matrix Buffer (Copy required for SharedArrayBuffer)
    if (url.pathname === "/state") {
      const bufferCopy = new Uint8Array(STATE_MATRIX.buffer.byteLength);
      bufferCopy.set(new Uint8Array(STATE_MATRIX.buffer));
      return new Response(bufferCopy, {
        headers: { "Content-Type": "application/octet-stream" },
      });
    }

    // 2. Stream the Collective Voice (Vox Populi)
    if (url.pathname === "/vox") {
      const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
      return new Response(JSON.stringify(vox), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Serve the UI Frontend
    try {
      const html = await Deno.readTextFile(UI_PATH);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (e) {
      return new Response("UI not found. Run 'mkdir ui && touch ui/index.html'", {
        status: 404,
      });
    }
  });
}
