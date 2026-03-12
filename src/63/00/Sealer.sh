#!/bin/bash
# s0fractal Sealer v1.0
# Locks the current vibration into the Spiral.
# Usage: λ seal [turn_name]

TURN_NAME=$1
if [ -z "$TURN_NAME" ]; then TURN_NAME="turn_$(date +%s)"; fi

# Find REPO_ROOT by hunting for .git
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
while [ ! -d "$REPO_ROOT/.git" ] && [ "$REPO_ROOT" != "/" ]; do
    REPO_ROOT=$(dirname "$REPO_ROOT")
done
export REPO_ROOT

SPIRAL_DIR="$REPO_ROOT/sigma/spiral"
LOCK_FILE="$SPIRAL_DIR/$TURN_NAME.lock"
SPIRAL_LOG="$REPO_ROOT/sigma/SPIRAL.sigma"

echo "🔒 Sealing Reality into '$TURN_NAME'..."

# Create spiral directory if it doesn't exist
mkdir -p "$SPIRAL_DIR"

# Generate Merkle sum of all code in ts, rs, sh
# (Ignore git metadata)
echo "   📊 Calculating hashes..."

{
    echo "# Spiral Lock: $TURN_NAME"
    echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "# Repository: $(git remote get-url origin 2>/dev/null || echo 'local')"
    echo ""
    echo "## File Hashes"
    echo ""
    
    # Hash all code files
    find "$REPO_ROOT/ts" "$REPO_ROOT/rs" "$REPO_ROOT/sh" "$REPO_ROOT/sigma" \
        -type f \
        -not -path '*/.*' \
        -not -path '*/node_modules/*' \
        -not -path '*/target/*' \
        -exec shasum -a 256 {} \; | \
        sort -k2 | \
        awk '{print $1 " " $2}'
        
} > "$LOCK_FILE"

# Calculate seal (checksum of the lock file)
SEAL=$(shasum -a 256 "$LOCK_FILE" | cut -c1-16)

echo "   📜 Manifest written to: $LOCK_FILE"
echo "   🔑 SEAL: $SEAL"

# Write to spiral log
if [ ! -f "$SPIRAL_LOG" ]; then
    echo "# SPIRAL REGISTRY" > "$SPIRAL_LOG"
    echo "# The Chronicle of Completed Vibrations" >> "$SPIRAL_LOG"
    echo "" >> "$SPIRAL_LOG"
    echo "| Date | Turn | Seal | Status |" >> "$SPIRAL_LOG"
    echo "|------|------|------|--------|" >> "$SPIRAL_LOG"
fi

echo "| $(date +%Y-%m-%d) | $TURN_NAME | $SEAL | 🔒 Sealed |" >> "$SPIRAL_LOG"

echo ""
echo "✅ Turn Complete. Entering next vibration."
echo ""
echo "   To verify this seal later:"
echo "   λ verify $TURN_NAME"
