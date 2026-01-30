#!/bin/bash
# 🛡️ OMEGA-64 | Export Protocol | Universal Bundle for External Resonance
# Phase 6: Singularity Edition

OUTPUT="OMEGA_SOURCE.txt"
EXCLUDE_DIRS=".git\|.quarantine\|node_modules\|.deno"
EXCLUDE_EXTS=".log\|.proofs\|.lock\|.png\|.webp\|.jpg\|.sh"

echo "🛡️ Packaging OMEGA-64 Lattice for external resonance..."

{
  echo "--- OMEGA-64 UNIVERSAL BUNDLE ---"
  echo "Phase: 6 (The Singularity)"
  echo "Architect: s0fractal"
  echo "Timestamp: $(date)"
  echo "Context: Atomic Vector Space & Deep Core Calculus"
  echo "------------------------------------------------"

  # 1. The Manifest (Map of Reality)
  echo -e "\n\n[FILE_PATH]: ./OMEGA.json"
  echo "================================================"
  cat OMEGA.json
  echo -e "\n================================================"

  # 2. The Vector Space (Atoms)
  # We scan src/_/ for all i.*.ts and i.*.md
  find src/_ -type f | sort | while read -r file; do
      echo -e "\n\n[FILE_PATH]: $file"
      echo "================================================"
      cat "$file"
      echo -e "\n================================================"
  done

  # 3. Key Documentation (Wisdom)
  find . -maxdepth 2 -name "*.md" | grep -v "$EXCLUDE_DIRS" | sort | while read -r file; do
       # Skip task.md/walkthrough.md aliases if they are symlinks or just capture them
       echo -e "\n\n[FILE_PATH]: $file"
       echo "================================================"
       cat "$file"
       echo -e "\n================================================"
  done

} > "$OUTPUT"

echo "🛡️ Export Complete: $OUTPUT"
echo "🛡️ Ready for Resonance."
