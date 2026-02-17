
/**
 * [2/2/MAYBE_CASE/_.ts]
 * Maybe Monad: Case analysis
 */
export const ATOM = () => (m: any) => (nothingCase: any) => (justCase: any) => m(nothingCase)(justCase);
