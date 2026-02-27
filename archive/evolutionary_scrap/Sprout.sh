# s0fractal Sprout v1.0 (Node Spawner)
# Generated from Sprout.sigma

# --- 0. Prepare ---
TARGET=$1
if [ -z "$TARGET" ]; then echo "Usage: λ ⊕ <name>"; exit 1; fi

# Logic A: Materialization (If target is a .sigma file)
if [ -f "$TARGET" ]; then
    λ genesis "$TARGET"
    exit $?
fi

# Logic B: Node Spawning (External Repositories)
if [[ "$TARGET" =~ ^[0-9]+-[a-z]+$ ]]; then
    ORG=$(git remote get-url origin | sed -E 's/.*[:\/](.*)\/-.git/\1/')
    echo "🌟 Spawning External Node: '$TARGET' in organization '$ORG'..."
    
    NODE_DIR="../$TARGET"
    [ -d "$NODE_DIR" ] && { echo "⚠️  $NODE_DIR already exists!"; exit 1; }
    
    mkdir -p "$NODE_DIR" && cd "$NODE_DIR"
    git init -b main
    mkdir -p meta
    git submodule add "git@github.com:$ORG/-.git" meta/root
    
    # Genetic Templates (Could be moved to their own .sigma files later)
    if [[ "$TARGET" == *"-ts" ]]; then
        echo '{ "compilerOptions": { "strict": true }, "imports": { "~": "./meta/root/" } }' > deno.json
        mkdir ts
        echo "export const I = <T>(x: T) => x;" > ts/I.ts
    fi
    
    git add . && git commit -m "⊕ Genesis: Node initialized"
    
    echo "☁️  Materializing on GitHub..."
    gh repo create "$ORG/$TARGET" --public --source=. --remote=origin --push
    
    cd "$REPO_ROOT"
    git submodule add "git@github.com:$ORG/$TARGET.git" "nodes/$TARGET"
    git commit -m "⊕ Nodes: Connected $TARGET to the Grid"
    git push
    
    echo "✅ Node '$TARGET' is alive."

# Logic C: Dimension Expansion (Internal Matrix)
else
    VECTOR=$(get_vector "$TARGET")
    if [ -n "$VECTOR" ]; then
        IFS='|' read -r ID STORAGE PATH_VAL SYNTAX COLOR MUTE LIFT <<< "$VECTOR"
        echo "🌌 Expanding Tensor Dimension: '$ID' ($STORAGE)..."
        
        if [[ "$STORAGE" == "submodule" ]]; then
             CURRENT_BRANCH=$(git branch --show-current)
             if [ -d "$PATH_VAL" ]; then
                 echo "✅ Dimension '$ID' already linked."
             else
                 if ! git show-ref --verify --quiet "refs/heads/$ID"; then
                     echo "🌱 Genesis: Creating orphan branch '$ID'..."
                     git checkout --orphan "$ID"
                     git rm -rf .
                     touch .keep && git add .keep && git commit -m "⊕ Genesis: $ID dimension"
                     git push -u origin "$ID"
                     git checkout "$CURRENT_BRANCH"
                 fi
                 git submodule add -b "$ID" ./ "$PATH_VAL"
                 git commit -m "Link dimension: $ID"
                 git push origin "$CURRENT_BRANCH"
             fi
        elif [[ "$STORAGE" == "folder" ]] || [[ "$STORAGE" == "virtual" ]]; then
             mkdir -p "$PATH_VAL" && touch "$PATH_VAL/.keep"
        fi
        echo "✅ Dimension '$ID' expanded."
    else
        echo "❌ Unknown Target: '$TARGET'."
        exit 1
    fi
fi
