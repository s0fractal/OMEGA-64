// OMEGA-64: Acoustic Audit (L13)
// Interference & Noise Cancellation

async function runAcousticAudit() {
  console.log("🌊 INITIATING ACOUSTIC AUDIT (L13)...");

  const cmd = new Deno.Command("./omega_rust_core", {
    args: ["--level", "13", "--intent", "AUDIT"],
  });
  const { stdout } = await cmd.output();
  const result = new TextDecoder().decode(stdout).trim();

  console.log(result);
}

runAcousticAudit();
