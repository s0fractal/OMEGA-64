#!/bin/bash
# s0fractal Collider v1.0
# Verifies Identity across Dimensions.
# Usage: λ collide <glyph>

GLYPH=$1
if [ -z "$GLYPH" ]; then echo "Usage: λ collide <GlyphName>"; exit 1; fi

# Find REPO_ROOT by hunting for .git
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
while [ ! -d "$REPO_ROOT/.git" ] && [ "$REPO_ROOT" != "/" ]; do
    REPO_ROOT=$(dirname "$REPO_ROOT")
done
export REPO_ROOT

source "$REPO_ROOT/sh/8/Tensor.sh"

echo "🌀 Collider: Accelerating particles for '$GLYPH'..."

# 1. LOCATE PARTICLES
TS_FILE=$(find "$REPO_ROOT/ts" -name "$GLYPH.ts" | head -n 1)
RS_FILE=$(find "$REPO_ROOT/rs" -name "$GLYPH.rs" | head -n 1)
SH_FILE=$(find "$REPO_ROOT/sh" -name "$GLYPH.sh" | head -n 1)

if [ -z "$TS_FILE" ] && [ -z "$RS_FILE" ] && [ -z "$SH_FILE" ]; then
    echo "❌ Symmetry Broken: No projections found for $GLYPH."
    exit 1
fi

# 2. HASH CHECK (Static Resonance)
echo ""
echo "   📊 Static Resonance Check:"

if [ -n "$TS_FILE" ]; then
    TS_HASH=$(shasum -a 256 "$TS_FILE" | cut -c1-8)
    echo "   🔵 TS Spin: $TS_HASH ($TS_FILE)"
fi

if [ -n "$RS_FILE" ]; then
    RS_HASH=$(shasum -a 256 "$RS_FILE" | cut -c1-8)
    echo "   🔴 RS Spin: $RS_HASH ($RS_FILE)"
fi

if [ -n "$SH_FILE" ]; then
    SH_HASH=$(shasum -a 256 "$SH_FILE" | cut -c1-8)
    echo "   🟢 SH Spin: $SH_HASH ($SH_FILE)"
fi

# 3. SEMANTIC CHECK (Dynamic Resonance)
# Check if all projections reference the same Sigma source
echo ""
echo "   🔍 Dynamic Resonance Check:"

SIGMA_SOURCES=()

if [ -n "$TS_FILE" ]; then
    TS_SRC=$(grep "COLLAPSED FROM" "$TS_FILE" | head -n 1 | awk '{print $5}')
    if [ -n "$TS_SRC" ]; then
        SIGMA_SOURCES+=("$TS_SRC")
        echo "   TS Origin: $TS_SRC"
    fi
fi

if [ -n "$RS_FILE" ]; then
    RS_SRC=$(grep "COLLAPSED FROM" "$RS_FILE" | head -n 1 | awk '{print $5}')
    if [ -n "$RS_SRC" ]; then
        SIGMA_SOURCES+=("$RS_SRC")
        echo "   RS Origin: $RS_SRC"
    fi
fi

if [ -n "$SH_FILE" ]; then
    SH_SRC=$(grep "COLLAPSED FROM" "$SH_FILE" | head -n 1 | awk '{print $5}')
    if [ -n "$SH_SRC" ]; then
        SIGMA_SOURCES+=("$SH_SRC")
        echo "   SH Origin: $SH_SRC"
    fi
fi

# Verify all sources are the same
if [ ${#SIGMA_SOURCES[@]} -gt 0 ]; then
    FIRST_SRC="${SIGMA_SOURCES[0]}"
    ALL_SAME=true
    
    for src in "${SIGMA_SOURCES[@]}"; do
        if [ "$src" != "$FIRST_SRC" ]; then
            ALL_SAME=false
            break
        fi
    done
    
    if $ALL_SAME; then
        echo ""
        echo "   ✅ Origins Align: $FIRST_SRC"
        echo ""
        echo "🟢 COLLISION SUCCESSFUL. Reality is consistent."
        exit 0
    else
        echo ""
        echo "   ❌ Origins Diverge!"
        for i in "${!SIGMA_SOURCES[@]}"; do
            echo "      Projection $i -> ${SIGMA_SOURCES[$i]}"
        done
        exit 1
    fi
else
    echo ""
    echo "   ⚠️  No origin metadata found in projections"
    echo "   (Files may be manually created)"
    exit 0
fi
