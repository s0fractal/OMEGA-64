---
eigenvalue: "0x9D30DC0D1D6BFD6B"
vector: 02.06.00
symbol: "JOIN"
desc: "Logical Join primitive. Consolidates two wave phases."
---

## GREEN (G)

Logical Join. Applies a property or prefix `p` to a head `h`. The simplest form
of semantic binding.

## BLUE (B)

```typescript
export const ATOM = () => (p: any) => (h: any) => p(h);
```
