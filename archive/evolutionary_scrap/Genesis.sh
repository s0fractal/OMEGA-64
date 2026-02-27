# --- 0. Prepare ---
SOURCE="$1"
if [ -z "$SOURCE" ]; then echo "Usage: genesis <file.sigma>"; exit 1; fi

# --- 1. Audit DNA (Frontmatter) ---
FM=$(awk '/^---$/ {count++; next} count==1 {print}' "$SOURCE")
ENERGY=$(echo "$FM" | grep "^⚡ENERGY:" | cut -d':' -f2 | xargs)
GLYPH=$(echo "$FM" | grep "^GLYPH:" | cut -d':' -f2 | xargs)

if [ -z "$ENERGY" ] || [ -z "$GLYPH" ]; then
    echo "⚠️  Quantum Decoherence: Missing ⚡ENERGY or GLYPH in $SOURCE"
    exit 1
fi

echo "👁️  Observing: $GLYPH (E$ENERGY)"

# --- 2. Wave Collapse (Body) ---
IN_FREQ=0
CAPTURING=0
TARGET=""
TMP_TARGET=""
PREFIX=""

while IFS= read -r line; do
    # Start of freq block: @[id]
    if [[ "$line" =~ ^@\[([a-z]+)\] ]]; then
        ID="${BASH_REMATCH[1]}"
        VECTOR=$(get_vector "$ID")
        IFS="|" read -r VID VTYPE VPATH VCOL VSYN VMUTE VLIFT VMASS VSENT VIMPORT <<< "$VECTOR"
        
        if [ -z "$VID" ]; then
            IN_FREQ=0
            continue
        fi

        # Unquote function for columns
        unquote() { echo "$1" | sed "s/^[[:space:]]*//; s/[[:space:]]*$//; s/^'\(.*\)'$/\1/; s/^\"\(.*\)\"$/\1/"; }
        
        VID=$(unquote "$VID")
        VTYPE=$(unquote "$VTYPE")
        VPATH=$(unquote "$VPATH")
        VCOL=$(unquote "$VCOL")
        VSYN=$(unquote "$VSYN")
        VMUTE=$(unquote "$VMUTE")
        VLIFT=$(unquote "$VLIFT")
        VMASS=$(unquote "$VMASS")
        VSENT=$(unquote "$VSENT")
        VIMPORT=$(unquote "$VIMPORT")
        
        # Target Path Construction
        TARGET="$REPO_ROOT/$VPATH$ENERGY/$GLYPH.$VID"
        TMP_TARGET="$TARGET.tmp"
        PREFIX="$VMUTE"
        [ -z "$PREFIX" ] && PREFIX="// "
        
        echo "   ⚡ Collapse @[$ID] -> $VPATH$ENERGY/$GLYPH.$VID"
        mkdir -p "$(dirname "$TARGET")"
        
        # Initialize with Syntax DNA
        if [ -n "$VLIFT" ]; then
            echo "$VLIFT" > "$TMP_TARGET"
            echo "${PREFIX}🛑 QUANTUM STATE: COLLAPSED FROM $(basename "$SOURCE")" >> "$TMP_TARGET"
        else
            echo "${PREFIX}🛑 QUANTUM STATE: COLLAPSED FROM $(basename "$SOURCE")" > "$TMP_TARGET"
        fi
        echo "${PREFIX}🌊 FREQUENCY: $ID | ENERGY: $ENERGY" >> "$TMP_TARGET"
        
        # Grant execution for shell frequency
        [[ "$ID" == "sh" ]] && chmod +x "$TMP_TARGET"
        
        # --- Supply Chain: AUTO-INJECTION ---
        if [ -n "$VIMPORT" ]; then
            # 1. Context Awareness (Internal for SH)
            if [[ "$ID" == "sh" ]]; then
                SLOT_PATH="$VPATH$ENERGY/"
                D_COUNT=$(echo "$SLOT_PATH" | tr -cd '/' | wc -c | tr -d ' ')
                DIRNAME_CALLS="\$SCRIPT_DIR"
                for ((i=0; i<D_COUNT; i++)); do DIRNAME_CALLS="\$(dirname \"$DIRNAME_CALLS\")"; done
                echo "SCRIPT_DIR=\"\$( cd \"\$( dirname \"\${BASH_SOURCE[0]}\" )\" &> /dev/null && pwd )\"" >> "$TMP_TARGET"
                echo "export REPO_ROOT=\"$DIRNAME_CALLS\"" >> "$TMP_TARGET"
            fi
            
            # 2. Source Connections (Symbolic Resolution)
            # Guard against duplicates
            declare -A SEEN_SOURCES
            
            echo "$FM" | sed -n '/^SOURCE:/,/^[A-Z]\|---/p' | grep "origin:" | cut -d':' -f2- | while read -r line; do
                origin=$(echo "$line" | xargs)
                [ -z "$origin" ] || [ "$origin" == "null" ] && continue
                
                # Check for duplicate
                if [[ -n "${SEEN_SOURCES[$origin]}" ]]; then continue; fi
                SEEN_SOURCES[$origin]=1
                
                # Check if origin is symbolic (Particle name) or literal (path)
                if [[ ! "$origin" =~ [/.] ]]; then
                    # RESOLVE SYMBOLIC
                    # Find the energy of the dependency from its .sigma file
                    DEP_SIGMA="$SIGMA_DIR/$origin.sigma"
                    if [ -f "$DEP_SIGMA" ]; then
                        DEP_ENERGY=$(awk '/^---$/ {count++; next} count==1 {print}' "$DEP_SIGMA" | grep "^⚡ENERGY:" | cut -d':' -f2 | xargs)
                        [ -z "$DEP_ENERGY" ] && DEP_ENERGY=0
                    else
                        DEP_ENERGY=$ENERGY # Fallback
                    fi
                    
                    REL_PARTICLE_PATH="$VPATH$DEP_ENERGY/$origin.$VID"
                    RESOLVED_PATH="$REL_PARTICLE_PATH"
                    NAME="$origin"
                else
                    # LITERAL
                    RESOLVED_PATH="$origin"
                    NAME=$(basename "$origin" | cut -d'.' -f1)
                fi
                
                # Inject using pattern
                INJECTION=$(echo "$VIMPORT" | sed "s|%p|$RESOLVED_PATH|g; s|%n|$NAME|g")
                echo "$INJECTION" >> "$TMP_TARGET"
            done
            
            # 3. Portals (Internal for SH)
            if [[ "$ID" == "sh" ]]; then
                echo 'λ() { "$REPO_ROOT/sh/lambda.sh" "$@"; }' >> "$TMP_TARGET"
            fi
        fi
        
        IN_FREQ=1
        continue
    fi

    # Markdown Fences (Toggle Capture)
    if [[ "$line" =~ ^\`\`\` ]]; then
        if [ $IN_FREQ -eq 1 ]; then
            if [ $CAPTURING -eq 1 ]; then
                CAPTURING=0
                IN_FREQ=0
                mv "$TMP_TARGET" "$TARGET"
                TARGET=""
                TMP_TARGET=""
            else
                CAPTURING=1
            fi
        fi
        continue
    fi

    # Project content to Material File
    if [ $CAPTURING -eq 1 ] && [ -n "$TMP_TARGET" ]; then
        echo "$line" >> "$TMP_TARGET"
    fi
done < "$SOURCE"

echo "✅ Observation Complete."
