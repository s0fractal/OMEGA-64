#!/bin/bash
# s0fractal Chronos v1.0
# "Never calculate what you can remember."
# Usage: λ chronos <domain> <key> [fallback_command]

DOMAIN=$1   # e.g., "math/fibonacci"
KEY=$2      # e.g., "50" (Line number or search key)
FALLBACK=$3 # e.g., "./calc_fib.sh 50"

# Find REPO_ROOT by hunting for .git
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
while [ ! -d "$REPO_ROOT/.git" ] && [ "$REPO_ROOT" != "/" ]; do
    REPO_ROOT=$(dirname "$REPO_ROOT")
done
export REPO_ROOT

# 1. Визначаємо координати в Акаші
AKASHA="$REPO_ROOT/json/akasha" 
FILE="$AKASHA/$DOMAIN.txt"

# 2. Спроба згадати (Lookup) - O(1)
if [ -f "$FILE" ]; then
    # Якщо ключ - це число, беремо рядок (super fast)
    if [[ "$KEY" =~ ^[0-9]+$ ]]; then
        # sed 'Np' друкує N-й рядок. q - виходить одразу.
        RESULT=$(sed -n "${KEY}p;${KEY}q" "$FILE")
    else
        # Інакше шукаємо по ключу (grep)
        RESULT=$(grep "^$KEY:" "$FILE" | cut -d':' -f2-)
    fi
    
    if [ -n "$RESULT" ]; then
        echo "⚡ Recalled: $RESULT" >&2
        echo "$RESULT" # Instant Return
        exit 0
    fi
fi

# 3. Якщо не згадали - доводиться думати (Compute & Cache)
echo "⏳ Computing event..." >&2

if [ -n "$FALLBACK" ]; then
    # Виконуємо обчислення
    RESULT=$(eval "$FALLBACK")
    echo "$RESULT"
    
    # 4. Закрутка Спіралі (Memoize back to Git)
    # Записуємо результат у файл, щоб наступного разу не думати
    mkdir -p "$(dirname "$FILE")"
    
    if [[ "$KEY" =~ ^[0-9]+$ ]]; then
        # Для числових ключів записуємо як key:value
        echo "$KEY:$RESULT" >> "$FILE"
    else
        echo "$KEY:$RESULT" >> "$FILE"
    fi
    
    # Асинхронна фіксація (щоб не блокувати потік)
    (
        cd "$AKASHA" 2>/dev/null || cd "$REPO_ROOT/json"
        git add . 2>/dev/null
        git commit -m "🧠 Chronos: Learned $DOMAIN($KEY)" 2>/dev/null
        git push 2>/dev/null
    ) &
    
    echo "💾 Cached to Akasha" >&2
else
    echo "❌ Unknown and no fallback."
    exit 1
fi
