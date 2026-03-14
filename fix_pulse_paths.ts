const walk = async (dir: string) => {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      await walk(path);
    } else if (entry.isFile && (path.endsWith(".ts") || path.endsWith(".md"))) {
      let content = await Deno.readTextFile(path);
      let changed = false;

      // 1. TUI_DASHBOARD imports
      if (content.includes('from "../02/PULSE.ts"')) {
        content = content.replace(/from "\.\.\/02\/PULSE\.ts"/g, 'from "../05/PULSE.ts"');
        changed = true;
      }
      if (content.includes('from "../_/02/PULSE.ts"')) {
        content = content.replace(/from "\.\.\/_\/02\/PULSE\.ts"/g, 'from "../_/05/PULSE.ts"');
        changed = true;
      }

      // 2. Dynamic imports in tests
      if (content.includes('import("@02/PULSE.ts")')) {
        content = content.replace(/import\("@02\/PULSE\.ts"\)/g, 'import("../../_/05/PULSE.ts")');
        changed = true;
      }
      
      // 3. String literals in tests / contracts
      if (content.includes('"src/02/PULSE.ts"')) {
        content = content.replace(/"src\/02\/PULSE\.ts"/g, '"src/_/05/PULSE.ts"');
        changed = true;
      }
      if (content.includes('"src/02/PULSE_WORKER.ts"')) {
        content = content.replace(/"src\/02\/PULSE_WORKER\.ts"/g, '"src/_/05/PULSE_WORKER.ts"');
        changed = true;
      }

      // 4. Test files searching for AST matches
      if (content.includes('extractVector("./02/PULSE.ts")')) {
        content = content.replace(/extractVector\("\.\/02\/PULSE\.ts"\)/g, 'extractVector("./05/PULSE.ts")');
        changed = true;
      }

      if (changed) {
        console.log(`Updated ${path}`);
        await Deno.writeTextFile(path, content);
      }
    }
  }
};

await walk("./src");
