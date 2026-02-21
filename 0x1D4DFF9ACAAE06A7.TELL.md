---
eigenvalue: "0x1D4DFF9ACAAE06A7"
vector: 03.02.00
symbol: "TELL"
desc: "Writer Monad: Signaling operator. Produces a log value with no result."
---

## GREEN (G)

Signaling operator for the Writer Monad. Creates a WRITER with an undefined
result and the provided value `w` as the output. `TELL w = WRITER undefined w`.

## BLUE (B)

```typescript
/**
 * TELL: Emitting a signal
 */
export const ATOM = () => (w: any) => (pair: any) => pair(undefined)(w);
```
