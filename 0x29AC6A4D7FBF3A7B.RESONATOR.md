---
vector: 00.00.10
symbol: RESONATOR
desc: "Active Toroidal Memory Loop. Uses a Y-combinator to create stable resonant orbits for lambda states."
relations:
  concept: ["Standing Wave", "Echo Memory"]
---

## GREEN (G)

RESONATOR: Active Toroidal Memory Loop based on the Y-combinator (Fixed-point
operator). Creates a stable standing wave by infinitely passing state through a
transform. Used for state persistence in the non-local wave network.

## BLUE (B)

```typescript
export const Y = () => (f: any) =>
  ((x: any) => f((v: any) => x(x)(v)))((x: any) => f((v: any) => x(x)(v)));

/**
 * Creates a resonant orbit for a state 's' using transform 'f'.
 */
export const ORBIT = ({ siblings: { Y } }) => (f: any) => (s: any) => Y(f)(s);

export const ATOM = () => ({
  Y,
  ORBIT,
});
```
