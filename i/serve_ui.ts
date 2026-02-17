// serve_ui.ts
import { serve } from "@std/http/server";
import { serveDir } from "@std/http/file_server";

const port = Number.parseInt(Deno.env.get("PORT") ?? "8000", 10);

console.log(`🪞 MIRROR SERVER: Hosting Interface on http://localhost:${port} ...`);

serve((req) => {
    return serveDir(req, {
        fsRoot: "./UI",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });
}, { port });
