import { MACHINE } from "./MACHINE.ts";

export const STEP = (m: any) => (input: any) => m((transition: any) => (state: any) => MACHINE(transition)(transition(state)(input)));
