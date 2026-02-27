#!/bin/bash
# s0fractal Spore Generator v1.0
# Creates a tiny, self-extracting survival capsule.

REPO_ROOT=$(git rev-parse --show-toplevel)
SPORE_FILE="$REPO_ROOT/SPORE.sh"

echo "🦠 Generating Survival Spore..."

# 1. Header (The DNA Wrapper)
cat << 'EOF' > "$SPORE_FILE"
#!/bin/bash
# Σ-SPORE: Universal Survival Unit
# Just run this file to terraform the void.
# ----------------------------------------
mkdir -p s0_void/{sigma,sh,ts,rs}
cd s0_void || exit
echo "🌱 Spore landing... expanding DNA..."
base64 -d << 'PAYLOAD' | tar -xz
EOF

# 2. Payload (The Essence)
# We pack only critical: sigma + sh (+ rb if needed).
cd "$REPO_ROOT" || exit
tar -cz sigma sh rb 2>/dev/null | base64 >> "$SPORE_FILE"

# 3. Footer (Ignition)
cat << 'EOF' >> "$SPORE_FILE"
PAYLOAD
echo "⚡ Ignite: ./sh/setup.sh"
chmod +x sh/*.sh
EOF

chmod +x "$SPORE_FILE"
SIZE=$(du -h "$SPORE_FILE" | cut -f1)

echo "✅ Spore created: $SPORE_FILE ($SIZE)"
echo "   Copy this file anywhere. It IS the system."
