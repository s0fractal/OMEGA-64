const findNewPath = (basename: string) => {
  for (const dirEntry of Deno.readDirSync("src/_")) {
    if (dirEntry.isDirectory) {
      try {
        for (const f of Deno.readDirSync("src/_/" + dirEntry.name)) {
          if (f.isFile && f.name === basename) {
            return "src/_/" + dirEntry.name + "/" + f.name;
          }
        }
      } catch (e) {}
    }
  }
  return null;
};

let content = Deno.readTextFileSync("deno.jsonc");
let changed = false;

const regex = /"src\/\d{2}\/([a-zA-Z0-9_]+)\.ts"/g;
content = content.replace(regex, (match, basename) => {
  try {
    Deno.statSync(match.substring(1, match.length - 1));
    return match; // exists, keep it
  } catch (e) {
    const newPath = findNewPath(basename + ".ts");
    if (newPath) {
      changed = true;
      return '"' + newPath + '"';
    }
    return match;
  }
});

if (changed) {
  Deno.writeTextFileSync("deno.jsonc", content);
  console.log("Updated paths in deno.jsonc");
}

