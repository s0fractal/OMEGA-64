# s0fractal Synapse v1.1 (Neural Context)
# Generated from Synapse.sigma

# --- 0. Prepare ---
echo "--- SYSTEM CONTEXT START ---"
echo "Root: $REPO_ROOT"
echo "Citizen: $(whoami)"

# 1. TOPOLOGY (Dynamic)
echo "### TOPOLOGY (Matrix)"
λ loop dims "ls -d . 2>/dev/null || echo '[Mirage]'"
echo ""

# 2. THERMODYNAMICS (M/S Map)
echo "### THERMODYNAMICS (M/S Map)"
for dim in "${ALL_DIMS[@]}"; do
    VEC=$(get_vector "$dim")
    # id|type|path|hex|syn|mute|lift|mass|entropy
    M=$(echo "$VEC" | cut -d'|' -f8)
    S=$(echo "$VEC" | cut -d'|' -f9)
    printf "  %-8s [M: %-3s | S: %-3s]\n" "$dim" "$M" "$S"
done
echo ""

# 3. LEXICON (Protocol)
LEXICON_DIR="$REPO_ROOT/sigma/chaos/lexicon"
if [ -d "$LEXICON_DIR" ]; then
    echo "### LEXICON (Protocols)"
    ls "$LEXICON_DIR" | sed 's/^/- /'
fi
echo ""

# 3. INTENT (Active DNA)
echo "### SIGMA (Active Intents)"
# Show first lines of all .sigma files to give context on what particles exist
for particle in "$REPO_ROOT/sigma"/*.sigma; do
    [ -f "$particle" ] || continue
    echo "- $(basename "$particle"): $(head -n 2 "$particle" | tail -n 1 | sed 's/^# //')"
done
echo ""

# 4. HEALTH
echo "### VITAL SIGNS"
λ ⚕️ | grep -v "Scanning"
echo ""

echo "--- SYSTEM CONTEXT END ---"
