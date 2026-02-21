---
eigenvalue: "0xE09A8EFCE7A9BF1C"
vector: 02.00.00
symbol: "BYTE"
desc: "Byte constructor (8-bit). Assembles 8 bits into a single selector structure."
---

## GREEN (G)

Byte constructor. Organizes 8 bits (b7 down to b0) into a nested CONS structure.
Allows the system to treat 8-bit blocks as single units of logic/data.

## BLUE (B)

```typescript
export const ATOM = ({ siblings: { CONS } }) => (b7: any) => (b6: any) => (b5: any) => (b4: any) => (b3: any) => (b2: any) => (b1: any) => (b0: any) => CONS(b7)(CONS(b6)(CONS(b5)(CONS(b4)(CONS(b3)(CONS(b2)(CONS(b1)(b0))))))));
```
