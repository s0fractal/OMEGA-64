type Violation = {
  file: string;
  reason: string;
};

const GATE_PATH = "src/_/03/GATE.ts";
const VALIDATOR_PATH = "src/_/03/GATE_VALIDATOR.ts";
const MERGER_PATH = "src/_/03/GATE_MERGER.ts";
const BUDGET_PATH = "src/03/GATE_BUDGET.ts";
const LEDGER_PATH = "src/_/03/GATE_LEDGER.ts";

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  out: Violation[],
) => {
  if (!source.includes(snippet)) {
    out.push({ file, reason: `${reason} (missing: ${snippet})` });
  }
};

const forbidSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  out: Violation[],
) => {
  if (source.includes(snippet)) {
    out.push({ file, reason: `${reason} (found: ${snippet})` });
  }
};

const main = async () => {
  const violations: Violation[] = [];
  const gate = await Deno.readTextFile(GATE_PATH);
  const validator = await Deno.readTextFile(VALIDATOR_PATH);
  const merger = await Deno.readTextFile(MERGER_PATH);
  const budget = await Deno.readTextFile(BUDGET_PATH);
  const ledger = await Deno.readTextFile(LEDGER_PATH);

  requireSnippet(gate, "import { validateGateProposals } from \"@generated\";", GATE_PATH, "GATE must delegate proposal validation", violations);
  requireSnippet(gate, "import { mergeGateProposals } from \"@generated\";", GATE_PATH, "GATE must delegate proposal merge/budget", violations);
  requireSnippet(gate, "import { persistGateLedgerArtifacts } from \"@generated\";", GATE_PATH, "GATE must delegate ledger/checkpoint persistence", violations);
  forbidSnippet(
    gate,
    "AGENT_SIGNATURE.proposalEnvelopeHash(",
    GATE_PATH,
    "Validation internals must stay outside GATE.ts",
    violations,
  );
  forbidSnippet(
    gate,
    "LOAD.calculate(",
    GATE_PATH,
    "Merge/cost internals must stay outside GATE.ts",
    violations,
  );
  forbidSnippet(
    gate,
    "appendFromLedgerEvent(",
    GATE_PATH,
    "Ledger persistence internals must stay outside GATE.ts",
    violations,
  );

  requireSnippet(
    validator,
    "export const validateGateProposals",
    VALIDATOR_PATH,
    "Validator module must export validate lambda",
    violations,
  );
  requireSnippet(
    merger,
    "export const mergeGateProposals",
    MERGER_PATH,
    "Merger module must export merge lambda",
    violations,
  );
  requireSnippet(
    budget,
    "export const GATE_BUDGET",
    BUDGET_PATH,
    "Budget module must export budget helpers",
    violations,
  );
  requireSnippet(
    ledger,
    "export const persistGateLedgerArtifacts",
    LEDGER_PATH,
    "Ledger module must export persist lambda",
    violations,
  );

  if (violations.length > 0) {
    console.error("[gate-decomposition] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[gate-decomposition] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
