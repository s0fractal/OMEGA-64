
// serve_ui.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.177.0/http/file_server.ts";

console.log("🪞 MIRROR SERVER: Hosting Interface on http://localhost:8000 ...");

serve((req) => {
    return serveDir(req, {
        fsRoot: "./UI",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });
}, { port: 8000 });
