// SSoT: src/ontology/math/clamp_resource.md
import { RESOURCE_MAX } from "../00/mod";

@inline
export function clamp_resource(value: i64): i32 {
if (value < 0) return 0;
if (value > (RESOURCE_MAX as i64)) return RESOURCE_MAX;
return value as i32;
}
