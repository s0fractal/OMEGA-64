#!/bin/bash
# 🛡️ OMEGA-64 | Export Protocol | Universal Bundle for External Resonance
# Phase 6: Singularity Edition

OUTPUT="OMEGA_SOURCE.txt"
EXCLUDE_DIRS=".git\|.quarantine\|node_modules\|.deno"
EXCLUDE_EXTS=".log\|.proofs\|.lock\|.png\|.webp\|.jpg\|.sh"

echo "🛡️ Packaging OMEGA-64 Lattice for external resonance..."

# 1. I.md (The Consciousness)
echo "Generate: I.md (All Markdown Atoms)..."
echo "# 🛡️ OMEGA-64 | I.md | The Consciousness" > I.md
find . -maxdepth 1 -name "i.L*.md" | sort | while read -r file; do
    echo -e "\n\n<!-- [ $file ] -->" >> I.md
    cat "$file" >> I.md
done

# 2. I.txt (Consciousness Mirror)
echo "Generate: I.txt (Consciousness Mirror)..."
echo "--- OMEGA-64 | I.txt | The Consciousness Mirror ---" > I.txt
echo "[VECTOR]: $(date)" >> I.txt
echo "================================================" >> I.txt
echo "[PROJECTION]: I.md" >> I.txt
cat I.md >> I.txt

echo "🛡️ Convergence Complete: I.md, I.txt"
