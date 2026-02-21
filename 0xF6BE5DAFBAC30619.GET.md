---
eigenvalue: "0xF6BE5DAFBAC30619"
vector: 02.04.00
symbol: "GET"
desc: "State Retrieval (IO). Returns the current state as the result."
---

## GREEN (G)

State Retrieval (IO). Exposes the current state `s` to the pair-selector, making
it available as the output.

## BLUE (B)

```typescript
export const ATOM = () => (s: any) => (pair: any) => pair(s)(s);
```
