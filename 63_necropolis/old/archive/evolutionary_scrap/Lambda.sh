# --- 0. State ---
# Find REPO_ROOT by hunting for .git
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
while [ ! -d "$REPO_ROOT/.git" ] && [ "$REPO_ROOT" != "/" ]; do
    REPO_ROOT=$(dirname "$REPO_ROOT")
done
export REPO_ROOT

source "$REPO_ROOT/sh/8/Tensor.sh"
source "$REPO_ROOT/sh/8/Sprout.sh"
source "$REPO_ROOT/sh/8/Sync.sh"
source "$REPO_ROOT/sh/8/Genesis.sh"
source "$REPO_ROOT/sh/8/Synapse.sh"
source "$REPO_ROOT/sh/8/Loop.sh"
source "$REPO_ROOT/sh/8/Doctor.sh"
λ() { "$REPO_ROOT/sh/lambda.sh" "$@"; }

# --- Action Mapping ---
GLYPH=$1

# Якщо пустий ввід - показуємо карту
if [ -z "$GLYPH" ]; then GLYPH="map"; else shift; fi

case "$GLYPH" in
    "⊕") # Create / Expand (Sprout)
        "$REPO_ROOT/sh/8/Sprout.sh" "$@"
        ;;
    "∞"|"loop") # Iterate (Loop)
        "$REPO_ROOT/sh/8/Loop.sh" "$@"
        ;;
    "⋈") # Sync / Join
        echo "🔄 Aligning timelines..."
        git pull && git submodule update --init --recursive
        ;;
    "?"|"map"|"synapse") # Query / Status (Synapse) or Sigma Lens
        if [ $# -gt 0 ]; then
            python3 "$REPO_ROOT/tools/py/sigma_view.py" --mode=short "$@"
        else
            "$REPO_ROOT/sh/8/Synapse.sh" "$@"
        fi
        ;;
    "??") # Sigma Lens (Full)
        python3 "$REPO_ROOT/tools/py/sigma_view.py" --mode=full "$@"
        ;;
    "Δ") # Change / Commit
        MSG="$@"
        if [ -z "$MSG" ]; then MSG="Δ mutation"; fi
        git add .
        git commit -m "Δ $MSG"
        git push
        ;;
    "⚕️"|"doctor") # Health (Doctor)
        "$REPO_ROOT/sh/8/Doctor.sh" "$@"
        ;;
    "✨"|"ascend") # Ascension (Crystal)
        "$REPO_ROOT/sh/ascend.sh" "$@"
        ;;
    "☢️"|"reactor") # Integrity (Reactor)
        "$REPO_ROOT/sh/reactor.sh" "$@"
        ;;
    "#") # Executable Comment
        echo "🔮 Executing shadow code..."
        eval "$@"
        ;;
    "🧠"|"brain") # Local AI
        "$REPO_ROOT/sh/brain.sh" "$@"
    	;;
    "🧬"|"unfold"|"sync") # Genetic Projection / Mass Genesis (Sync)
        "$REPO_ROOT/sh/8/Sync.sh" "$@"
        ;;
    "⚡"|"genesis") # Wave Collapse (Genesis)
        "$REPO_ROOT/sh/8/Genesis.sh" "$@"
        ;;
    "🟣"|"transmute") # Ether (WASM)
        "$REPO_ROOT/sh/transmute.sh" "$@"
        ;;
    "🧫"|"proteins-sync") # Protein cache via DNS-TXT
        python3 "$REPO_ROOT/tools/py/proteins_sync.py" "$@"
        ;;
    "feed") # DNS Ribosome
        "$REPO_ROOT/sh/ribosome.sh" "$@"
        ;;
    "⛺"|"bootstrap") # Quantum DNA bootstrap
        python3 "$REPO_ROOT/tools/py/edges.py" collapse "$1"
        python3 "$REPO_ROOT/tools/py/bootstrap.py" "$@"
        ;;
    "edges") # Edge graph navigator
        python3 "$REPO_ROOT/tools/py/edges.py" "$@"
        ;;
    "Y"|"process") # Recursion / Daemon
        source "$REPO_ROOT/sh/7/Y.sh"
        Y "$@"
        ;;
    *)
        # Передаємо команду в системний git (fallback)
        git $GLYPH "$@"
        ;;
esac
