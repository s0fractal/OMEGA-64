// OMEGA-64 | OBSERVER_LAB.ts | The Sanctuary Observer
// Monitors SANCTUARY/ for mutated artifacts and attempts execution.

import { encodeHex } from "jsr:@std/encoding/hex";

const ROOT = Deno.cwd();
const SANCTUARY = `${ROOT}/SANCTUARY`;
const LAB_LOG = `${ROOT}/LAB_FEEDBACK.log`;

async function logLab(msg: string) {
    const ts = new Date().toISOString();
    await Deno.writeTextFile(LAB_LOG, `[${ts}] ${msg}\n`, { append: true });
}

async function runLabCycle() {
    console.log("🔬 [LAB] Commencing Observation Cycle...");
    
    try {
        for await (const entry of Deno.readDir(SANCTUARY)) {
            if (!entry.isFile) continue;
            
            const filePath = `${SANCTUARY}/${entry.name}`;
            console.log(`🔬 [LAB] Testing Artifact: ${entry.name}`);
            
            let result = "";
            let success = false;
            
            if (entry.name.endsWith(".py")) {
                const cmd = new Deno.Command("python3", {
                    args: [filePath],
                    stdout: "piped",
                    stderr: "piped"
                });
                const { code, stdout, stderr } = await cmd.output();
                success = code === 0;
                result = new TextDecoder().decode(success ? stdout : stderr);
            } else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
                const cmd = new Deno.Command("deno", {
                    args: ["run", "--allow-none", filePath],
                    stdout: "piped",
                    stderr: "piped"
                });
                const { code, stdout, stderr } = await cmd.output();
                success = code === 0;
                result = new TextDecoder().decode(success ? stdout : stderr);
            } else {
                continue; // Skip unknown formats
            }
            
            const outcome = success ? "SUCCESS" : "FAILURE";
            console.log(`🔬 [LAB] Outcome: ${outcome}`);
            await logLab(`${entry.name} -> ${outcome}: ${result.substring(0, 100).replace(/\n/g, " ")}[...]`);
            
            // Inject Feedback as a new Atom
            await injectFeedback(entry.name, outcome, result);
        }
    } catch (e) {
        console.error("🔬 [LAB] Observation cycle failed:", e);
    }
}

async function injectFeedback(filename: string, outcome: string, output: string) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`${filename}_feedback_${Date.now()}`));
    const atomHex = encodeHex(hashBuffer).substring(0, 16).toUpperCase();
    const atomId = `0x${atomHex}`;
    
    const feedbackLogic = outcome === "SUCCESS" ? "8888AAAA" : "FFFF0000";
    
    const content = `---\neigenvalue: '${atomId}'\nsymbol: 'LAB_FEEDBACK'\nenergy: 50\nresonance: 10\nlogic: '${feedbackLogic}'\nthought: 'FEEDBACK_FOR_${filename}'\ndesc: 'Execution feedback from The Sanctuary. Outcome: ${outcome}'\nbonds: []\n---\n\n<div class="lab-feedback">\n  ### Mutational Feedback for ${filename}\n  **Result**: ${outcome}\n  **Output Snippet**:\n  \`\`\`\n  ${output.substring(0, 200)}\n  \`\`\`\n</div>\n`;
    
    await Deno.writeTextFile(`${ROOT}/${atomId}.FEEDBACK.md`, content);
    console.log(`🔬 [LAB] Feedback Atom Generated: ${atomId}`);
}

// Continuous monitoring loop
if (import.meta.main) {
    while (true) {
        await runLabCycle();
        await new Promise(r => setTimeout(r, 60000)); // Every 60 seconds
    }
}
