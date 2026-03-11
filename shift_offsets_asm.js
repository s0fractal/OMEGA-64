const fs = require("fs");
let code = fs.readFileSync("assembly/index.ts", "utf8");

const lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  // We only want to shift offsets that are after QUORUM_OFFSET (which is SAFETY_BUFFER + 120138412)
  // The first one impacted is COHERENCE_OFF: SAFETY_BUFFER + 120238440
  // We can just check if the line has `const ... = SAFETY_BUFFER + (\d+);`
  let match = line.match(
    /const [A-Z_]+:\s+usize\s*=\s*SAFETY_BUFFER \+ (\d+);/,
  );
  if (match) {
    let val = parseInt(match[1], 10);
    if (val >= 120238440) { // This ensures we only shift items from COHERENCE onwards
      lines[i] = line.replace(/SAFETY_BUFFER \+ (\d+)/, (m, p1) => {
        let v = parseInt(p1, 10);
        return "SAFETY_BUFFER + " + (v + 258372);
      });
    }
  }
}

fs.writeFileSync("assembly/index.ts", lines.join("\n"));
