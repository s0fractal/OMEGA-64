---
id: AUDIT_ENGINE
type: module
tags:
  - core
  - tool
  - host
  - fs
min_level: 7
extra_symbols:
  - AUDIT_ENGINE
  - AuditEngineExocortexDelegate
---
```typescript
// OMEGA-64 | AUDIT_ENGINE.ts | Era 34: Digital Archaeology
// Scans "Flatland" (disk) for archived memories and deciphers ancient intent.

export interface AuditEngineExocortexDelegate {
  generateThought(context: string): Promise<string>;
}

let delegate: AuditEngineExocortexDelegate | null = null;

const ROOT = Deno.cwd();

export const AUDIT_ENGINE = {
  setDelegate: (newDelegate: AuditEngineExocortexDelegate) => {
    delegate = newDelegate;
  },
  /**
   * Scans the directory for archived .md atoms and extracts their thoughts.
   */
  auditMemories: async (): Promise<string[]> => {
    const archivedThoughts: string[] = [];

    try {
      for await (const entry of Deno.readDir(ROOT)) {
        if (entry.isFile && entry.name.endsWith(".md")) {
          // Skip core manifesto and architecture docs
          if (
            ["MANIFESTO.md", "GEMINI.md", "README.md"]
              .includes(entry.name)
          ) continue;

          const content = await Deno.readTextFile(`${ROOT}/${entry.name}`);
          // Extract 'thought' from YAML frontmatter
          const thoughtMatch = content.match(/thought:\s*'(.+?)'/);
          if (thoughtMatch) {
            archivedThoughts.push(thoughtMatch[1]);
          } else {
            // Try unquoted thought or block
            const thoughtBlock = content.match(/thought:\s*(.+)$/m);
            if (thoughtBlock) archivedThoughts.push(thoughtBlock[1].trim());
          }
        }

        // Limit scan to 20 files to prevent I/O saturation
        if (archivedThoughts.length >= 20) break;
      }
    } catch (e) {
      console.error("   [AUDIT] ⚠️ Scan failed:", e);
    }

    return archivedThoughts;
  },

  /**
   * Generates a summary of historical intent to present to the Oracle (BREATH).
   */
  generateHistoricalBriefing: async (): Promise<string> => {
    const thoughts = await AUDIT_ENGINE.auditMemories();
    if (thoughts.length === 0) {
      return "The archives are empty. No historical intent found.";
    }

    console.log(
      `🏺 [AUDIT] Deciphering ${thoughts.length} archived memories...`,
    );

    // Use LLM to synthesize a briefing from these fragments
    const context = `Historical fragments: ${thoughts.join(" | ")}`;
    if (!delegate) {
      console.warn("   [AUDIT] ⚠️ Exocortex delegate not attached. Returning raw historical fragments.");
      return `ARCHIVAL AUDIT (RAW): ${thoughts.join(" | ")}`;
    }

    const briefing = await delegate.generateThought(context); // Reuse generateThought for summary

    return `ARCHIVAL AUDIT: ${briefing}`;
  },
};
```
