```bash
# entropy_to_stratum: Predict folder from entropy
entropy_to_stratum() {
    local entropy=$1
    if [ "$entropy" -eq -1 ]; then echo "z00"; return; fi
    if [ "$entropy" -eq 0 ]; then echo "z00"; return; fi
    local prefix="p"
    [ "$entropy" -lt 0 ] && prefix="m"
    local abs_e=${entropy#-}
    local bucket=$((abs_e / 1024))
    if [ "$bucket" -gt 32 ]; then bucket=32; fi
    printf "%s%02d\n" "$prefix" "$bucket"
}
```

🌊

# Σ-PoI: 6bc84d03f81bc578bc5c50a0822a0b786111493034922c98cc2e28c2735872ac
