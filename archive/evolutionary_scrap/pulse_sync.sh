#!/zsh

# PULSE_SYNC: Synchronizing the Citadel's Heartbeat with the Mesh (GitHub)

REPO="s0fractal/sigma"
SIGMA_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo ".")"
BRAIN_ROOT="${HOME}/.antigravity"

echo "--- PULSE SYNC: Initiating Heartbeat Synchronization ---"

# 1. Prepare the Pulse Report
REPORT="/tmp/RESONANCE_PULSE.md"
echo "# Σ-GLYPH Sovereign Pulse" > $REPORT
echo "Generated at: $(date -u)" >> $REPORT
echo "\n## Resonance State" >> $REPORT
cat "$BRAIN_ROOT/RESONANCE_STATE.json" | jq -r 'to_entries | .[] | "* **\(.key)**: \(.value)"' >> $REPORT

echo "\n## Sovereign Objectives" >> $REPORT
grep -A 10 "## Current High-Level Objectives" "$BRAIN_ROOT/SOVEREIGN_LOG.md" | grep "\*" >> $REPORT

# 2. Push to GitHub
# We use a dedicated side-car approach to not pollute the core logic with sync meta
echo "Syncing State to GitHub..."
gh core repo view $REPO --web 2>/dev/null # Ensure repo visibility

# Copy report to SENSE for persistence in the repo
cp $REPORT "$SIGMA_ROOT/SENSE/RESONANCE.md"

# Commit and Push
cd "$SIGMA_ROOT"
git add SENSE/RESONANCE.md
git commit -m "Pulse: Cycle $(jq '.last_cycle' "$BRAIN_ROOT/RESONANCE_STATE.json") | Resonance Status: Radiant" 2>/dev/null
git push origin main 2>/dev/null

echo "--- Pulse Sync Complete. Heartbeat Resonating on GitHub ---"
