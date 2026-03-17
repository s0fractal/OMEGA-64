import { expandGlob } from "https://deno.land/std@0.224.0/fs/expand_glob.ts";

for await (const file of expandGlob("I/**/*.md")) {
  const content = await Deno.readTextFile(file.path);
  
  // Only process if it has my faulty `asCode` block
  if (content.includes("\`\`\`asCode")) {
    const parts = content.split("---");
    const frontmatter = parts[1];
    
    // Extract the body inside `asCode`
    const bodyMatch = content.match(/\`\`\`asCode\n([\s\S]*?)\`\`\`/);
    if (!bodyMatch) continue;
    let body = bodyMatch[1].trim();

    // If I accidentally included the old markdown, clean it
    body = body.replace(/^\`\`\`typescript/m, "");
    body = body.replace(/^\`\`\`assemblyscript/m, "");
    body = body.replace(/^\`\`\`/gm, "");

    const newContent = `---${frontmatter}---

\`\`\`rust
unimplemented!()
\`\`\`

\`\`\`typescript
${body}
\`\`\`

\`\`\`assemblyscript
${body}
\`\`\`
`;
    await Deno.writeTextFile(file.path, newContent);
    console.log(`Repaired ${file.path}`);
  }
}
