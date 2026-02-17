
/**
 * [7/5/VIEW/_.ts]
 * Lens viewer
 */
export const ATOM = () => (l: any) => (struct: any) => l((g: any) => (_s: any) => g(struct));
