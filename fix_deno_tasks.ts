const path = "deno.jsonc";
const raw = await Deno.readTextFile(path);

// deno.jsonc might contain comments, but standard JSON.parse won't work.
// Since we only need to replace the file paths, we can do string replacements.
let newRaw = raw;
const testFiles = [];
for await (const entry of Deno.readDir("tests")) {
  if (entry.isFile && entry.name.endsWith(".ts")) {
    testFiles.push(entry.name);
  }
}

for (const tf of testFiles) {
  // Replace references like "deno run -A test_foo.ts" with "deno run -A tests/test_foo.ts"
  // But ensure we don't replace "tests/test_foo.ts" with "tests/tests/test_foo.ts"
  const regex = new RegExp(`(?<!tests\\/)${tf}`, "g");
  newRaw = newRaw.replace(regex, `tests/${tf}`);
}

await Deno.writeTextFile(path, newRaw);
console.log("Updated deno.jsonc test paths.");
