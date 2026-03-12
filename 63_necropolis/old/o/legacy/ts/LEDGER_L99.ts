
/**
 * [8/0/LEDGER/_.ts]
 * Experimental State Ledger.
 */
export const ATOM = () => {
    const events: any[] = [];
    return {
        record: (event: any) => { events.push(event); },
        size: () => events.length
    };
};
