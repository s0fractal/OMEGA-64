# 🔗 Shell implementation
I() {
    printf '%s\n' "$1"
}
# 🔗 Shell implementation
B() {
    local f="$1"
    local g="$2"
    local x="$3"
    echo "B-Composition: $f ($g $x)"
}
# 🔗 Shell implementation
C() {
    local f="$1"
    local x="$2"
    local y="$3"
    echo "C-Exchange: $f $y $x"
}

# 🔗 Shell implementation
C() {
    local f="$1"
    local x="$2"
    local y="$3"
    echo "C-Exchange: $f $y $x"
}
