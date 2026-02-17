import { FIELD } from "./i.L32.core.FIELD.ts";
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export interface SubjectivePosition {
  tension: number;
  momentum: number;
  proximity: number;
}

export const SUBJECTIVE = {
  projectToField: (pos: SubjectivePosition): { r: number } => {
    const r_linear = pos.tension * I16.max;
    return { r: Math.round(r_linear) };
  },
  getVisibility: (pos: SubjectivePosition) => {
    const { r } = SUBJECTIVE.projectToField(pos);
    const potential = FIELD.getPotential(r);
    return {
      r,
      potential,
      state: pos.tension < -0.5 ? "CORE_GRAVITY" : pos.tension > 0.5 ? "SURFACE_FLOW" : "EQUATOR_BALANCE",
      momentum: pos.momentum > 0 ? "ASCENDING" : "DESCENDING"
    };
  }
};
