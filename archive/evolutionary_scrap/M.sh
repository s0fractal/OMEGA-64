# 🔗 Shell implementation
W() {
    local f="$1"
    local x="$2"
    echo "W-Fork: $f $x $x"
}
# 🔗 Shell implementation
I() {
    printf '%s\n' "$1"
}

# 🔗 Shell implementation
M() {
    local x="$1"
    $x $x
}
