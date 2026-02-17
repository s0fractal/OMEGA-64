
/**
 * [6/4/Q/_.ts]
 * Quantum Fixed-point Math (16.16)
 */
export const ATOM = () => ({
    SCALE: BigInt(65536),
    mul: (a: bigint, b: bigint): bigint => (a * b) >> 16n,
    div: (a: bigint, b: bigint): bigint => (b === 0n ? 0n : (a << 16n) / b),
    fromFloat: (f: number): bigint => BigInt(Math.round(f * 65536)),
    toFloat: (q: bigint): number => Number(q) / 65536
});
