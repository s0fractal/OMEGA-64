---
eigenvalue: "0xDAC65AC96E59FBAC"
vector: 06.02.00
symbol: "INTERFERENCE"
desc: "Wave Interference mechanics. Superposition and Tension."
---

## GREEN (G)

Wave Interference. Handles the interaction between two wave packets. `superpose`
calculates the resulting intensity in a point. `getTension` calculates the
semantic or physical conflict between two phases.

## BLUE (B)

```typescript
/**
 * INTERFERENCE: Phase interaction
 */
export const ATOM = ({ siblings: { WAVE_SIGNAL } }) => ({
  superpose: (p1: any, p2: any, r: number): number => {
    const a1 = p1.amplitude || 1.0;
    const a2 = p2.amplitude || 1.0;
    const deltaPhi = p1.phase - p2.phase;
    const intensity = a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(deltaPhi);
    return Math.sqrt(Math.max(0, intensity));
  },
  getTension: (p1: any, p2: any): number => {
    const overlap = Math.exp(-Math.pow(p1.center - p2.center, 2) / 2.0);
    const phaseConflict = (1 - Math.cos(p1.phase - p2.phase)) / 2;
    return overlap * phaseConflict;
  },
});
```
