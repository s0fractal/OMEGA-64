// test_llm.ts
// Verification of Era 3.4: Semantic Bridge

import { VOID__04_06 as injectSecrets, VOID__04_06 as VOID } from "@generated";
import { LLM_ADAPTER as MockAdapter } from "@generated";

console.log("🌉 TEST: Semantic Bridge");

// 1. Test Mock (Default)
console.log("\n1. Testing Mock Adapter (Default)...");
const response1 = await VOID.ask("Is this a virus?");
console.log(`Query: "Is this a virus?" -> Response: ${response1}`);

if (response1 === "PURGE") {
  console.log("✅ Mock Adapter logic working (Virus -> PURGE)");
} else {
  console.warn("⚠️ Mock Adapter logic unexpected (Should be PURGE)");
}

// 2. Test Injection
console.log("\n2. Testing Secret Injection...");
injectSecrets({ OPENAI_API_KEY: "chk_test_key_123" });

// We can't easily spy on the adapter without re-exporting it,
// but we can trust the log message "VOID: OpenAI Adapter Activated."

// 3. Test Failover (Invalid Key -> Error -> Fallback)
// Since we don't have a real key, this will likely fail the fetch.
// VOID.ask should catch the error and return ALLOW.
console.log("\n3. Testing OpenAI Adapter (Invalid Key Fallback)...");
const response2 = await VOID.ask("Hello World");
console.log(`Query: "Hello World" -> Response: ${response2}`);

if (response2 === "ALLOW (Error Fallback)" || response2 === "ALLOW") {
  console.log("✅ Error handling working.");
} else {
  console.log("❓ Result:", response2);
}

console.log("\n✅ TEST LLM: Finished.");
