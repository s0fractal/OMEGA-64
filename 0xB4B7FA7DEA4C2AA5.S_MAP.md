---
eigenvalue: "0xB4B7FA7DEA4C2AA5"
vector: 01.07.00
symbol: "S_MAP"
desc: "Stream Map operator. Transforms every element of a lazy stream."
---

## GREEN (G)

Stream Map operator. Uses recursion (Y) to apply a function `f` to every element
of a stream `s`. Preserves the lazy structure of the stream.

## BLUE (B)

```typescript
/**
 * S_MAP: Lazy Stream Transformation
 */
export const ATOM = ({ siblings: { Y, CAR, CDR, CONS } }) =>
  Y((r: any) => (f: any) => (s: any) => CONS(f(CAR(s)))(r(f)(CDR(s))));
```
