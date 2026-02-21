---
eigenvalue: "0x4BCFE7BB04AB4FEE"
vector: 05.05.01
symbol: "FLOW"
desc: "Functional flow (Pipe). (f => g => x => g(f(x)))"
---

## GREEN (G)

Functional FLOW. A composition operator that pipes the output of function `f`
into the input of function `g`. `FLOW f g x = g(f(x))`.

## BLUE (B)

```typescript
/**
 * FLOW: Composable pipeline
 */
export const ATOM = () => (f: any) => (g: any) => (x: any) => g(f(x));
```
