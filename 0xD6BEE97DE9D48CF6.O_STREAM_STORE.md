---
eigenvalue: "0xD6BEE97DE9D48CF6"
vector: 08.06.00
symbol: "O_STREAM_STORE"
desc: "O_STREAM Persistence Facade. Bridges to JetStream/Persistent ledger."
---

## GREEN (G)

O_STREAM Store. The persistence layer for the O_STREAM (Omega Stream).
Facilitates the appending and reading of delta proposals to the system's causal
history.

## BLUE (B)

```typescript
/**
 * O_STREAM_STORE: Persistence
 */
export const ATOM = (
  { siblings: { O_STREAM_APPEND, O_STREAM_PATH, O_STREAM_READ } },
) => ({
  append: (proposal: any, path: string = O_STREAM_PATH()) =>
    O_STREAM_APPEND(proposal, path),
  read: (path: string = O_STREAM_PATH()) => O_STREAM_READ(path),
});
```
