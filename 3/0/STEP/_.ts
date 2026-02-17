
/**
 * [3/0/STEP/_.ts]
 * Machine step transition
 */
export const ATOM = ({ siblings: { MACHINE } }) => (m: any) => (input: any) => 
    m((transition: any) => (state: any) => 
        MACHINE(transition)(transition(state)(input))
    );
