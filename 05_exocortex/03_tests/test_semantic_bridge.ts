import { assertEquals } from "https://deno.land/std@0.211.0/assert/mod.ts";
import { SOVEREIGN_ORACLE } from "@05";
import { LLM_SYNAPSE } from "@05";
import { SEMANTIC_MEMBRANE } from "@05";

Deno.test("Semantic Bridge: LSH Quantization of LLM Intent", async () => {
  // Preserve original methods
  const originalGetEmbedding = LLM_SYNAPSE.getEmbedding;
  const originalGenerateAutonomousPlasmid = LLM_SYNAPSE.generateAutonomousPlasmid;

  try {
    // Mock the embedding API with a stable pseudo-random vector
    LLM_SYNAPSE.getEmbedding = async (text: string) => {
      const vec = new Array(768).fill(0);
      for (let i = 0; i < 768; i++) {
        vec[i] = Math.sin(text.charCodeAt(i % text.length) * (i + 1));
      }
      return vec;
    };

    // Mock the LLM to return exactly the semantic intent instead of raw plasmid hex
    const targetIntent = "Protect the core structural resonance";
    LLM_SYNAPSE.generateAutonomousPlasmid = async (_telemetry: any) => {
      return { 
        intent: targetIntent, 
        narrativeMood: "A philosophical test assertion." 
      };
    };

    // Execute the autonomous oracle
    await SOVEREIGN_ORACLE.consultAutonomousOracle({ epoch: 1 });

    // Assert that the intent passed through the LSH quantizer and reached Akasha Archive
    let foundHash: string | null = null;
    let foundIntent: string | null = null;
    
    for (const [hash, intent] of SEMANTIC_MEMBRANE.thoughtArchive.entries()) {
      if (intent === targetIntent) {
        foundHash = hash;
        foundIntent = intent;
        break;
      }
    }

    assertEquals(foundIntent, targetIntent, "The Oracle did not archive the textual intent correctly.");
    assertEquals(foundHash?.length, 16, "The LSH projection did not yield a valid 8-byte (16 hex) hash.");

  } finally {
    // Restore mocks
    LLM_SYNAPSE.getEmbedding = originalGetEmbedding;
    LLM_SYNAPSE.generateAutonomousPlasmid = originalGenerateAutonomousPlasmid;
  }
});
