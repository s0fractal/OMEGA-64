# 🔗 Git Bindings for Sigma

# Save the current state (Snapshot)
# Usage: sigma_save "Message"
sigma_save() {
    local msg="${1:-Entropy Reduction}"
    git add .
    git commit -m "Σ: $msg"
}

# Sync with the Mirror (Push/Pull)
sigma_sync() {
    echo "🌊 Synchronizing with the Void..."
    git pull --rebase origin main
    git push origin main
}

# Wipe history (Tabula Rasa) - Dangerous!
# Use only for Genesis reset.
sigma_wipe() {
    rm -rf .git
    git init
    git add .
    git commit -m "Σ: GENESIS (t=0)"
}

# Σ-PoI: cddf7b011c065d8192c9703b2f8167d270e27260f413c65488c8d651e35a2d6b
