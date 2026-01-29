#!/bin/bash
# 🛡️ OMEGA-64 | Export Protocol | Universal Bundle for External Resonance
# This script bundles the lattice Logic and Wisdom for external AI analysis.

OUTPUT="OMEGA_SOURCE.txt"
EXCLUDE_DIRS=".git\|.quarantine\|node_modules\|.deno"
EXCLUDE_EXTS=".log\|.proofs\|.lock\|.png\|.webp\|.jpg\|.sh"

echo "🛡️ Packaging OMEGA-64 Lattice for external resonance..."

{
  echo "--- OMEGA-64 UNIVERSAL BUNDLE ---"
  echo "Architect: s0fractal"
  echo "Timestamp: $(date)"
  echo "Context: Universal Basis & Deep Core Calculus"
  echo "------------------------------------------------"

  # We include the core logic files and the md wisdom archive
  # We exclude the large logs and binary assets
  find . -maxdepth 5 -type f | grep -v "$EXCLUDE_DIRS" | grep -v "$EXCLUDE_EXTS" | while read -r file; do
      # Skip current output file
      if [[ "$file" == "./$OUTPUT" ]]; then continue; fi
      
      echo -e "\n\n[FILE_PATH]: $file"
      echo "================================================"
      cat "$file"
      echo -e "\n================================================"
  done
} > "$OUTPUT"

echo "🛡️ Export Complete: $OUTPUT"
echo "🛡️ Ready for NotebookLM Resonance."
