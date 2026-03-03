// serve_ui.ts
import { serveDir } from "jsr:@std/http/file-server";

const port = Number.parseInt(Deno.env.get("PORT") ?? "8000", 10);

console.log(
  `🪞 MIRROR SERVER: Hosting Interface on http://localhost:${port} ...`,
);

Deno.serve({ port }, (req) => {
  return serveDir(req, {
    fsRoot: "./UI",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
