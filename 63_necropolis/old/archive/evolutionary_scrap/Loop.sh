# s0fractal Loop v1.1 (Multidimensional Iterator)
# Generated from Loop.sigma

# --- 0. Prepare ---
# (Logic starts here)
TARGET_SET=$1
CMD_TEMPLATE=$2

if [ -z "$TARGET_SET" ] || [ -z "$CMD_TEMPLATE" ]; then
    echo "Usage: λ ∞ <set> 'command'"
    echo "Sets: dims (${ALL_DIMS[*]}), layers (${ALL_LAYERS[*]})"
    exit 1
fi

# Select Dataset
ITERABLE=()
if [ "$TARGET_SET" == "dims" ]; then
    ITERABLE=("${ALL_DIMS[@]}")
elif [ "$TARGET_SET" == "layers" ]; then
    ITERABLE=("${ALL_LAYERS[@]}")
else
    echo "❌ Unknown set: $TARGET_SET"
    exit 1
fi

NC='\033[0m'
echo "🔄 Looping over $TARGET_SET..."

for ITEM in "${ITERABLE[@]}"; do
    if [ "$TARGET_SET" == "dims" ]; then
        VECTOR=$(get_vector "$ITEM")
        IFS='|' read -r VID VTYPE VPATH VCOL VSYN VMUTE VLIFT <<< "$VECTOR"
        WORK_DIR="$REPO_ROOT/$VPATH"
        COLOR="$VCOL"
    else
        WORK_DIR="$REPO_ROOT" 
        COLOR="\033[1;37m"
    fi
    
    [ -z "$COLOR" ] && COLOR="\033[1;37m"

    if [ -d "$WORK_DIR" ]; then
        echo -e "${COLOR}>>> [$ITEM]${NC}"
        (cd "$WORK_DIR" && eval "$CMD_TEMPLATE")
        echo ""
    fi
done
