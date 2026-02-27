# E (Effect): Виконує команду, але пропускає оригінальний потік далі
E() {
    local cmd="$1"
    tee >(eval "$cmd" > /dev/null)
}

# Σ-PoI: 173649bec1ab88b9e4f5f34d3f03fcac876043f8a44f61f7c711821b321f5620
