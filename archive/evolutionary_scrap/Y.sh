# Y (Recursion): Нескінченний цикл з перевіркою статусу
Y() {
    local FUNC=$1
    shift
    local ARGS="$@"
    while true; do
        $FUNC $ARGS
        if [ $? -ne 0 ]; then break; fi
        sleep 1
    done
}
