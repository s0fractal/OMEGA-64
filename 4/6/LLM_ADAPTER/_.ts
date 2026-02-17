
/**
 * [4/6/LLM_ADAPTER/_.ts]
 * Component of VOID (L38).
 */
export const ATOM = () => {
    return {
        query: async (context: string) => `MOCK_VOID_JUDGEMENT: ALLOW [${context.slice(0, 20)}...]`
    };
};
