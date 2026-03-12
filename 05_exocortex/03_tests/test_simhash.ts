import { SEMANTIC_MEMBRANE } from "@05";

async function testSimHash() {
  const phrases = [
    "A peaceful garden of blue flowers",
    "A quiet garden of bright blue flowers", // Should be very close to the first
    "Constructing a massive obsidian fortress",
    "Building a giant black stone castle", // Should be very close to the third
    "Burning inferno of absolute chaos",
    "The quick brown fox jumps over the lazy dog",
  ];

  console.log("🧪 Testing Era 65 Semantic SimHash (LSH)\n");
  for (const phrase of phrases) {
    const hash = await SEMANTIC_MEMBRANE.quantizeThought(phrase);
    const hex = Array.from(hash).map((b) => b.toString(16).padStart(2, "0"))
      .join("").toUpperCase();
    console.log(`[GENOME: ${hex}] | THOUGHT: "${phrase}"`);
  }
}

testSimHash();
