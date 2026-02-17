
/**
 * [8/0/STATE_SNAPSHOT/_.ts]
 * Normative types and rejection reasons for OMEGA-64.
 */
export const ATOM = () => {
    return {
        REJECTION: {
            SCHEMA_INVALID: "SCHEMA_INVALID",
            TICK_MISMATCH: "TICK_MISMATCH",
            BASE_HASH_MISMATCH: "BASE_HASH_MISMATCH",
            UNKNOWN_AGENT: "UNKNOWN_AGENT",
            COST_OVER_BUDGET: "COST_OVER_BUDGET"
        }
    };
};
