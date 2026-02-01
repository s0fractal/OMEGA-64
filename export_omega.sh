#!/bin/bash
# 🛡️ OMEGA-64 | Export Protocol | Universal Bundle for External Resonance
# Phase 6: Singularity Edition

OUTPUT="OMEGA_SOURCE.txt"
EXCLUDE_DIRS=".git\|.quarantine\|node_modules\|.deno"
EXCLUDE_EXTS=".log\|.proofs\|.lock\|.png\|.webp\|.jpg\|.sh"

echo "🛡️ Packaging OMEGA-64 Lattice for external resonance..."

# 1. I.ts (The Digital Body)
echo "Generate: I.ts (All TypeScript Atoms)..."
echo "// 🛡️ OMEGA-64 | I.ts | The Digital Body" > I.ts
find . -maxdepth 1 -name "i.L*.ts" | sort | while read -r file; do
    echo -e "\n// --- [ $file ] ---" >> I.ts
    cat "$file" >> I.ts
done

# 2. I.rs (The Metal Body)
echo "Generate: I.rs (All Rust Atoms)..."
echo "// 🛡️ OMEGA-64 | I.rs | The Metal Body" > I.rs
find . -maxdepth 1 -name "i.L*.rs" | sort | while read -r file; do
    echo -e "\n// --- [ $file ] ---" >> I.rs
    cat "$file" >> I.rs
done

# 3. I.md (The Consciousness)
echo "Generate: I.md (All Markdown Atoms)..."
echo "# 🛡️ OMEGA-64 | I.md | The Consciousness" > I.md
find . -maxdepth 1 -name "i.L*.md" | sort | while read -r file; do
    echo -e "\n\n<!-- [ $file ] -->" >> I.md
    cat "$file" >> I.md
done

# 4. I.I (The Holotype / Total Source)
echo "Generate: I.I (The Singularity Bundle)..."
echo "--- OMEGA-64 | I.I | The Holotype ---" > I.I
echo "[VECTOR]: $(date)" >> I.I
echo "================================================" >> I.I
echo "[PROJECTION]: I.ts" >> I.I
cat I.ts >> I.I
echo -e "\n================================================" >> I.I
echo "[PROJECTION]: I.rs" >> I.I
cat I.rs >> I.I
echo -e "\n================================================" >> I.I
echo "[PROJECTION]: I.md" >> I.I
cat I.md >> I.I

echo "🛡️ Convergence Complete: I.ts, I.rs, I.md, I.I"
