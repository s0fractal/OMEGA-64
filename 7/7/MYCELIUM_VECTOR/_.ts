
/**
 * [7/7/MYCELIUM_VECTOR/_.ts]
 * Inverted from Legacy L00.
 */
export const ATOM = () => (t: any) => (m: any) => ({ 
    cohere: t?.cohere ?? 0, 
    remember: t?.remember ?? 0, 
    flow: t?.flow ?? 0, 
    tension: m?.tension ?? 0 
});
