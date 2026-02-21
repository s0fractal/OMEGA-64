---
eigenvalue: "0x95DA9A3CDC2EB5E9"
vector: 05.00.00
symbol: "TENSOR"
desc: "Tensor constructor. VECTOR(dims)(values)"
---

## GREEN (G)

N-dimensional Tensor. Constructs a complex data structure by pairing a `dims`
vector (shape) with a `values` vector. Uses the foundational Level 5 `VECTOR`
for aggregation.

## BLUE (B)

```typescript
/**
 * TENSOR: Multi-dimensional aggregate
 */
export const ATOM =
  ({ siblings: { VECTOR } }) => (dims: any) => (values: any) =>
    VECTOR(dims)(values);
```
