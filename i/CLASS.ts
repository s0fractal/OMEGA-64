import { OBJECT } from "./OBJECT.ts";

export const CLASS = (factory: any) => (init: any) => OBJECT(factory(init));
