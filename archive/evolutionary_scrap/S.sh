# 🔗 Shell implementation
I() {
    printf '%s\n' "$1"
}
# 🔗 Shell implementation
K() {
    printf '%s\n' "$1"
}

# 🔗 Shell implementation
S() {
    local f="$1"
    local g="$2"
    local x="$3"
    echo "S-Fusion: ($f $x) ($g $x)"
}
