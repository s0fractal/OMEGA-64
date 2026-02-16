/**
 * @omega.vector 32.29.02
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L31.core.CLASS.ts
 * @omega.symbol CLASS
 */

import { OBJECT } from "./OBJECT.ts";

export const CLASS = (factory: any) => (init: any) => OBJECT(factory(init));
