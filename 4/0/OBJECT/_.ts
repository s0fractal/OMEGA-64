
/**
 * [4/0/OBJECT/_.ts]
 * Object representation
 * (methods) (msg) = msg(methods)
 */
export const ATOM = () => (methods: any) => (msg: any) => msg(methods);
