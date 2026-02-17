/**
 * [i/0/0/PURE_TEST.ts]
 * A Pure Atom. No imports.
 * Receives context (CTX) and returns a value.
 */

// export default (CTX: any) => { // Generic for now, will type later
export const ATOM = (CTX: any) => {
    // 1. Extract Dependencies from Context
    // These must be declared in PURE_TEST.yaml relations.use
    const { LOG, ADD } = CTX.siblings;

    LOG("Hello from the Silent Monad!");
    
    const result = ADD(40, 2);
    
    LOG(`Computed Result: ${result}`);
    
    return {
        message: "Success",
        value: result
    };
};
