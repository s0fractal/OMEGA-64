// SSoT: src/ontology/spatial/dir8_x.md

@inline
export function dir8_x(n: i32): i32 {
if (n == 0 || n == 4 || n == 6) return -1;
if (n == 1 || n == 5 || n == 7) return 1;
return 0;
}
