import { Project, SyntaxKind } from "npm:ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.ts");

const mappings: Record<string, string> = {
  "RISC.ENTANGLE": "OP_HEBB",
  "RISC.ROLE": "OP_SECRETE_PLASMID",
  "RISC.OP_ROLE": "OP_SECRETE_PLASMID",
  "RISC.OP_ENTANGLE": "OP_HEBB",
};

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;
  const usedConstants = new Set<string>();

  // 1. Replace usages
  const propAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);
  for (const node of propAccesses) {
      // Because we modify the AST during traversal, we must be careful.
      // Getting descendants up front is usually safe if we only replace text of the leaf.
      if (node.wasForgotten()) continue;
      
      const text = node.getText();
      if (text.startsWith("RISC.") || text.startsWith("SYS.") || text.startsWith("STRUCTURE.")) {
        let replacement = "";
        if (mappings[text]) {
          replacement = mappings[text];
        } else {
          const parts = text.split(".");
          const namespace = parts[0];
          const prop = parts[1];
          
          if (namespace === "SYS") {
            replacement = prop.startsWith("SYS_") ? prop : "SYS_" + prop;
          } else if (namespace === "STRUCTURE") {
            replacement = prop.startsWith("STR_") ? prop : "STR_" + prop;
          } else if (namespace === "RISC") {
            replacement = prop; 
          }
        }
        
        if (replacement) {
          node.replaceWithText(replacement);
          usedConstants.add(replacement);
          changed = true;
        }
      }
  }

  if (changed) {
    // 2. Fix imports
    const declarations = sourceFile.getImportDeclarations();
    let targetImport = declarations.find(d => {
      const specifier = d.getModuleSpecifierValue();
      // Look for the module that would contain our namespaces
      return specifier.includes("STATE_MATRIX") || specifier.includes("ATOM_ACCESS") || specifier.includes("00/mod");
    });

    if (targetImport) {
      const namedImports = targetImport.getNamedImports();
      
      for (const ni of namedImports) {
        const name = ni.getName();
        if (["RISC", "SYS", "STRUCTURE"].includes(name)) {
          ni.remove();
        }
      }

      for (const uc of usedConstants) {
         if (!targetImport.getNamedImports().some(ni => ni.getName() === uc)) {
             targetImport.addNamedImport(uc);
         }
      }
    } else {
      // If there was no target import found, we need to add one.
      // Usually it's available via ATOM_ACCESS
      sourceFile.addImportDeclaration({
          moduleSpecifier: "../../00/STATE_MATRIX.ts", // placeholder, will need manual cleanup if it's wrong depth
          namedImports: Array.from(usedConstants)
      });
    }

    sourceFile.saveSync();
    console.log(`Refactored ${sourceFile.getFilePath()}`);
  }
}
