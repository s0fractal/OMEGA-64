# E (Effect): Виконує команду, але пропускає оригінальний потік далі
E() {
    local cmd="$1"
    tee >(eval "$cmd" > /dev/null)
}
