console.log("Probing i/0/0...");
for await (const entry of Deno.readDir("i/0/0")) {
  console.log(entry.name, entry.isDirectory ? "[DIR]" : "[FILE]");
}
