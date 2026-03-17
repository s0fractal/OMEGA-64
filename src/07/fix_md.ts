import { expandGlob } from "https://deno.land/std@0.224.0/fs/expand_glob.ts";

for await (const file of expandGlob("I/**/*.md")) {
  const content = await Deno.readTextFile(file.path);
  if (content.includes("```asCode")) continue;

  const parts = content.split("---");
  if (parts.length >= 3) {
    const frontmatter = parts[1];
    const body = parts.slice(2).join("---").trim();
    if (body.length > 0) {
      const newContent = `---${frontmatter}---

\`\`\`asCode
${body}
\`\`\`

\`\`\`rustCode
unimplemented!()
\`\`\`
`;
      await Deno.writeTextFile(file.path, newContent);
      console.log(`Fixed ${file.path}`);
    }
  }
}
