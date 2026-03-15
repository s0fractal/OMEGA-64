// SSoT: src/ontology/spatial/dir8_y.md

@inline
export function dir8_y(n: i32): i32 {
if (n == 2 || n == 4 || n == 5) return -1;
if (n == 3 || n == 6 || n == 7) return 1;
return 0;
}
