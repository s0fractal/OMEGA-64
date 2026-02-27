# s0fractal Sync v1.0 (Universe Synchronizer)
# Generated from Sync.sigma

# --- 0. State ---
# Find REPO_ROOT by hunting for .git
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
while [ ! -d "$REPO_ROOT/.git" ] && [ "$REPO_ROOT" != "/" ]; do
    REPO_ROOT=$(dirname "$REPO_ROOT")
done
export REPO_ROOT

source "$REPO_ROOT/sh/8/Tensor.sh"
λ() { "$REPO_ROOT/sh/lambda.sh" "$@"; }
# (Logic starts here)
echo "🧬 Engaging Alignment..."

# Iterate over all particles in the Sigma field
for particle in "$REPO_ROOT/sigma"/*.sigma; do
    # Skip the matrix itself as it is the source of truth for the tensor, not a collapse-target
    [[ "$particle" == *"matrix.sigma" ]] && continue
    
    λ ⚡ "$particle"
done

echo "✅ Universe Synchronized."
