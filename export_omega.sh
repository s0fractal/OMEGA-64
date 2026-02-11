#!/bin/bash
# 🛡️ OMEGA-64 | Export Protocol | Universal Bundle for External Resonance
# Phase 6: Singularity Edition (Restored Full Spectrum)

echo "🛡️ Packaging OMEGA-64 Lattice for external resonance..."

# 1. I.md (The Consciousness)
echo "Generate: I.md (All Markdown Atoms)..."
echo "# 🛡️ OMEGA-64 | I.md | The Consciousness" > I.md
find . -maxdepth 1 -name "i.L*.md" | sort | while read -r file; do
    echo -e "\n\n<!-- [ $file ] -->" >> I.md
    cat "$file" >> I.md
done

# 2. I.ts (The Logic)
echo "Generate: I.ts (All TypeScript Atoms)..."
echo "// 🛡️ OMEGA-64 | I.ts | The Logic" > I.ts
find . -maxdepth 1 -name "i.L*.ts" | sort | while read -r file; do
    echo -e "\n\n// [ $file ]" >> I.ts
    cat "$file" >> I.ts
done

# 3. I.rs (The Core)
echo "Generate: I.rs (All Rust Atoms)..."
echo "// 🛡️ OMEGA-64 | I.rs | The Core" > I.rs
find . -maxdepth 1 -name "i.L*.rs" | sort | while read -r file; do
    echo -e "\n\n// [ $file ]" >> I.rs
    cat "$file" >> I.rs
done

# 4. I.txt (The Singularity Bundle - ALL IN ONE)
echo "Generate: I.txt (The Singularity Bundle)..."
echo "--- OMEGA-64 | I.txt | Singularity Bundle ---" > I.txt
echo "[VECTOR]: $(date)" >> I.txt
echo "================================================" >> I.txt

echo "[LAYER]: MARKDOWN (Context)" >> I.txt
cat I.md >> I.txt

echo -e "\n\n================================================" >> I.txt
echo "[LAYER]: TYPESCRIPT (Behavior)" >> I.txt
cat I.ts >> I.txt

echo -e "\n\n================================================" >> I.txt
echo "[LAYER]: RUST (Structure)" >> I.txt
cat I.rs >> I.txt

echo "🛡️ Convergence Complete: I.txt holds the full hologram."
