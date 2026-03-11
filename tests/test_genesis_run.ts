import { assert } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { delay } from "https://deno.land/std@0.210.0/async/delay.ts";

Deno.test({
  name: "Genesis Run Autonomous Mode",
  sanitizeOps: false,
  sanitizeResources: false,
  sanitizeExit: false
}, async () => {
  Deno.env.set("OMEGA_MOCK_LLM", "1");
  Deno.env.set("OMEGA_LOG_LEVEL", "info");

  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "SYSTEM_START.ts", "--genesis", "--genesis-interval=100"],
    stdout: "piped",
    stderr: "piped",
  });

  const child = cmd.spawn();
  const reader = child.stdout.getReader();
  const decoder = new TextDecoder();
  let output = "";
  let injected = false;
  
  // Wait up to 30 seconds for the simulation to perform a genesis run
  const timeoutId = setTimeout(() => {
    console.error("Test timeout reached");
    try {
        child.kill("SIGINT");
    } catch (e) {}
  }, 30000); 

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      output += text;
      
      if (output.includes("[AUTONOMOUS_ORACLE] Divine Plasmid Dropped")) {
        injected = true;
        console.log("Found autonomous plasmid injection in logs!");
        break; 
      }
    }
  } finally {
    clearTimeout(timeoutId);
    try {
        await child.stdout.cancel();
        await child.stderr.cancel();
        child.kill("SIGINT");
        await child.status;
    } catch (e) {
      // Ignore errors when killing
    }
  }

  assert(injected, "Autonomous mode did not successfully run the oracle loop and inject a plasmid.\nOutput: " + output);
});
