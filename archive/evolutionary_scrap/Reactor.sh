# s0fractal Reactor v1.0
# Enforces chain of custody via .gitkeep anchors.

usage() {
  cat <<'EOF'
Usage: reactor.sh [options]

Options:
  --dims <csv>     Comma-separated dimensions (default: ts,rs)
  --levels <N>     Max layer to check (default: 8)
  --check          Verify only; do not create missing anchors
EOF
}

DIMS_CSV="ts,rs"
MAX_LEVEL=8
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dims) DIMS_CSV="$2"; shift 2 ;;
    --levels) MAX_LEVEL="$2"; shift 2 ;;
    --check) CHECK_ONLY=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1
      ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
IFS=',' read -r -a DIMS <<< "$DIMS_CSV"

hash_file() {
  shasum -a 256 "$1" | awk '{print $1}'
}

hash_text() {
  printf "%s" "$1" | shasum -a 256 | awk '{print $1}'
}

ensure_anchor() {
  local dim="$1"
  local layer="$2"
  local dir="$REPO_ROOT/$dim/$layer"
  local anchor="$dir/.gitkeep"

  if [ ! -d "$dir" ]; then
    return 0
  fi

  if [ ! -f "$REPO_ROOT/.gitkeep" ]; then
    if [ "$CHECK_ONLY" -eq 1 ]; then
      echo "REACTOR BREACH: missing void anchor .gitkeep"
      exit 1
    fi
    {
      echo "ANCHOR: VOID"
      echo "ORIGIN: SELF"
    } > "$REPO_ROOT/.gitkeep"
  fi

  local void_hash
  void_hash="$(hash_file "$REPO_ROOT/.gitkeep")"

  if [ "$layer" -eq 0 ]; then
    if [ ! -f "$anchor" ]; then
      if [ "$CHECK_ONLY" -eq 1 ]; then
        echo "REACTOR BREACH: missing genesis anchor $dim/$layer"
        exit 1
      fi
      {
        echo "# ⚓ ANCHOR: LAYER 0 (IDENTITY)"
        echo "DIM: $dim"
        echo "LAYER: 0"
        echo "ROUTE: $(hash_text "$dim:0")"
        echo "PARENT: NONE"
        echo "ORIGIN: $void_hash"
        echo "FLOW: VOID"
        echo "PRIORITY: 0"
      } > "$anchor"
      echo "FORGED: $dim/$layer"
    fi
    return 0
  fi

  local parent_dir="$REPO_ROOT/$dim/$((layer - 1))"
  local parent_anchor="$parent_dir/.gitkeep"
  if [ ! -f "$parent_anchor" ]; then
    echo "REACTOR BREACH: missing parent anchor $dim/$((layer - 1))"
    exit 1
  fi

  local parent_hash
  parent_hash="$(hash_file "$parent_anchor")"

  if [ ! -f "$anchor" ]; then
    if [ "$CHECK_ONLY" -eq 1 ]; then
      echo "REACTOR BREACH: missing anchor $dim/$layer"
      exit 1
    fi
    {
      echo "# ⚓ ANCHOR: LAYER $layer"
      echo "DIM: $dim"
      echo "LAYER: $layer"
      echo "ROUTE: $(hash_text "$dim:$layer")"
      echo "PARENT: $parent_hash"
      echo "ORIGIN: $void_hash"
      echo "FLOW: $dim/$((layer - 1))"
      echo "PRIORITY: $layer"
    } > "$anchor"
    echo "FORGED: $dim/$layer"
    return 0
  fi

  local claimed_parent
  local claimed_origin
  local claimed_flow
  local claimed_priority
  local claimed_route
  claimed_parent="$(awk '/^PARENT:/ {print $2}' "$anchor" || true)"
  claimed_origin="$(awk '/^ORIGIN:/ {print $2}' "$anchor" || true)"
  claimed_flow="$(awk '/^FLOW:/ {print $2}' "$anchor" || true)"
  claimed_priority="$(awk '/^PRIORITY:/ {print $2}' "$anchor" || true)"
  claimed_route="$(awk '/^ROUTE:/ {print $2}' "$anchor" || true)"

  if [ "$claimed_parent" != "$parent_hash" ]; then
    echo "REACTOR BREACH: $dim/$layer PARENT mismatch"
    echo "  expected: $parent_hash"
    echo "  found:    $claimed_parent"
    exit 1
  fi

  if [ "$claimed_origin" != "$void_hash" ]; then
    echo "REACTOR BREACH: $dim/$layer ORIGIN mismatch"
    echo "  expected: $void_hash"
    echo "  found:    $claimed_origin"
    exit 1
  fi

  local expected_flow="$dim/$((layer - 1))"
  if [ "$claimed_flow" != "$expected_flow" ]; then
    echo "REACTOR BREACH: $dim/$layer FLOW mismatch"
    echo "  expected: $expected_flow"
    echo "  found:    $claimed_flow"
    exit 1
  fi

  local expected_priority="$layer"
  if [ "$claimed_priority" != "$expected_priority" ]; then
    echo "REACTOR BREACH: $dim/$layer PRIORITY mismatch"
    echo "  expected: $expected_priority"
    echo "  found:    $claimed_priority"
    exit 1
  fi

  local expected_route
  expected_route="$(hash_text "$dim:$layer")"
  if [ "$claimed_route" != "$expected_route" ]; then
    echo "REACTOR BREACH: $dim/$layer ROUTE mismatch"
    echo "  expected: $expected_route"
    echo "  found:    $claimed_route"
    exit 1
  fi
}

echo "Reactor: verifying anchors in $REPO_ROOT"

for dim in "${DIMS[@]}"; do
  ensure_anchor "$dim" 0
  for ((layer=1; layer<=MAX_LEVEL; layer++)); do
    ensure_anchor "$dim" "$layer"
  done
done

echo "Reactor: stable"
