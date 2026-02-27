# 🔗 Shell implementation
C() {
    local f="$1"
    local x="$2"
    local y="$3"
    echo "C-Exchange: $f $y $x"
}
# 🔗 Shell implementation
I() {
    printf '%s\n' "$1"
}

# 🔗 Shell implementation
T() {
    local x="$1"
    local f="$2"
    $f $x
}
