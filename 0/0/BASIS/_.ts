
/**
 * 4-Dimensional Complex Basis (1, i, -1, -i)
 * Each state is a selector that picks its respective argument from a 4-tuple.
 */

export const B1 = () => (a: any) => (b: any) => (c: any) => (d: any) => a;
export const BI = () => (a: any) => (b: any) => (c: any) => (d: any) => b;
export const BM1 = () => (a: any) => (b: any) => (c: any) => (d: any) => c;
export const BMI = () => (a: any) => (b: any) => (c: any) => (d: any) => d;

export const ATOM = () => ({
  B1,
  BI,
  BM1,
  BMI,
});
