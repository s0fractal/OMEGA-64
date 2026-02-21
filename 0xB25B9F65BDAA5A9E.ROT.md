---
vector: 00.00.08
symbol: ROT
desc: "Complex Rotation Operator (90 degrees). Performs a cyclic shift on a 4-basis state."
---

## GREEN (G)

Complex Rotation Operator (90 degrees). Performs a cyclic shift on a 4-basis
state. Acts as a phase shifter in the Quad-Logic system.

## BLUE (B)

```typescript
export const ATOM =
  () => (s: any) => (a: any) => (b: any) => (c: any) => (d: any) =>
    s(b)(c)(d)(a);
```
