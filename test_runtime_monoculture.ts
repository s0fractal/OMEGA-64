type Violation = {
  surface: string;
  location: string;
  reason: string;
  command: string;
};

const FORBIDDEN_INVOCATION =
  /(^|[\s;&|()])(node|npm|npx|pnpm|yarn|ts-node)(?=([\s;&|()]|$))/;

const parseWorkflowRunCommands = (
  source: string,
): Array<{ line: number; command: string }> => {
  const lines = source.split(/\r?\n/);
  const commands: Array<{ line: number; command: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s*)run:\s*(.*)$/);
    if (!match) continue;

    const runIndent = match[1].length;
    const rhs = match[2].trim();

    if (/^[>|]/.test(rhs)) {
      const block: string[] = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const next = lines[j];
        if (next.trim().length === 0) {
          block.push("");
          continue;
        }
        const nextIndent = next.match(/^\s*/)?.[0].length ?? 0;
        if (nextIndent <= runIndent) break;
        block.push(next.trim());
      }
      commands.push({ line: i + 1, command: block.join("\n") });
      i = j - 1;
      continue;
    }

    commands.push({ line: i + 1, command: rhs });
  }

  return commands;
};

const checkDenoTasks = async (): Promise<Violation[]> => {
  const raw = await Deno.readTextFile("deno.jsonc");
  const cfg = JSON.parse(raw) as { tasks?: Record<string, string> };
  const tasks = cfg.tasks ?? {};

  const violations: Violation[] = [];
  for (const [name, command] of Object.entries(tasks)) {
    if (!/\bdeno\b/.test(command)) {
      violations.push({
        surface: "deno.task",
        location: `deno.jsonc::tasks.${name}`,
        reason: "task command has no deno invocation",
        command,
      });
    }
    if (FORBIDDEN_INVOCATION.test(command)) {
      violations.push({
        surface: "deno.task",
        location: `deno.jsonc::tasks.${name}`,
        reason: "forbidden Node tool invocation detected",
        command,
      });
    }
  }

  return violations;
};

const checkWorkflows = async (): Promise<Violation[]> => {
  const violations: Violation[] = [];

  for await (const entry of Deno.readDir(".github/workflows")) {
    if (!entry.isFile) continue;
    if (!entry.name.endsWith(".yml") && !entry.name.endsWith(".yaml")) continue;

    const path = `.github/workflows/${entry.name}`;
    const source = await Deno.readTextFile(path);
    const runCommands = parseWorkflowRunCommands(source);

    for (const cmd of runCommands) {
      if (!FORBIDDEN_INVOCATION.test(cmd.command)) continue;
      violations.push({
        surface: "github.workflow",
        location: `${path}:${cmd.line}`,
        reason: "forbidden Node tool invocation detected",
        command: cmd.command,
      });
    }
  }

  return violations;
};

const main = async () => {
  const violations = [
    ...(await checkDenoTasks()),
    ...(await checkWorkflows()),
  ];

  if (violations.length > 0) {
    console.error("[toolchain] Deno monoculture guard failed.");
    for (const v of violations) {
      console.error(` - [${v.surface}] ${v.location}`);
      console.error(`   reason: ${v.reason}`);
      console.error(`   command: ${v.command}`);
    }
    Deno.exit(1);
  }

  console.log("[toolchain] Deno monoculture guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
