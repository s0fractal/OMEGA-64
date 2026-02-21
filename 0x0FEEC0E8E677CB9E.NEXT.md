---
eigenvalue: "0x0FEEC0E8E677CB9E"
vector: 07.05.01
symbol: "NEXT"
desc: "Observable next step. Takes a value and an observer. (v => obs => obs(v))"
---

## GREEN (G)

Observable Next. Represents a pending state or value that is delivered to an
observer function. Used for step-by-step execution and signal propagation.
`NEXT val obs = obs val`.

## BLUE (B)

```typescript
/**
 * NEXT: Step Propagation
 */
export const ATOM = () => (val: any) => (obs: any) => obs(val);
```
