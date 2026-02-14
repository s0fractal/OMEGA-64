
// serve_ui.ts
import { serve } from "@std/http/server";
import { serveDir } from "@std/http/file_server";

console.log("🪞 MIRROR SERVER: Hosting Interface on http://localhost:8000 ...");

serve((req) => {
    return serveDir(req, {
        fsRoot: "./vis",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });
}, { port: 8000 });
