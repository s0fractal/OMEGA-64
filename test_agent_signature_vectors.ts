import { AGENT_SIGNATURE } from "./i.L32.core.AGENT_SIGNATURE.ts";

const res = await AGENT_SIGNATURE.verifyTV1();
console.log("🛡️ AGENT_SIGNATURE TV-1 Verification:", res.ok ? "✅ PASS" : "❌ FAIL");
if (!res.ok) {
    console.error(JSON.stringify(res.results, null, 2));
    Deno.exit(1);
}
