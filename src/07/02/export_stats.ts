import { buildExportFileList } from "@g";

async function main() {
  const { files } = await buildExportFileList();

  const stats = await Promise.all(
    files.map(async (file) => {
      const content = await Deno.readTextFile(file);
      const lines = content.split("\n").length;
      return { file, lines };
    })
  );

  stats.sort((a, b) => b.lines - a.lines);

  const totalLines = stats.reduce((acc, curr) => acc + curr.lines, 0);

  console.log(`\n=== OMEGA-64 Architecture File Statistics ===`);
  console.log(`Total Files Explicitly Exported: ${stats.length}`);
  console.log(`Total Lines in LLM Context: ${totalLines}\n`);

  console.log(`Top 20 Largest Files:`);
  stats.slice(0, 20).forEach((s, idx) => {
    console.log(`${(idx + 1).toString().padStart(2, " ")}. ${s.lines.toString().padStart(5, " ")} lines | ${s.file}`);
  });
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error("❌ Failed to generate statistics:", error);
    Deno.exit(1);
  }
}
