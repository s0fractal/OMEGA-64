/** SSoT: {@link ../../ontology/memory/add_hive_balance.md} */
import { HIVE_BALANCE_OFF } from "../01/mod";

@inline
export function add_hive_balance(val: i32): i32 {
return atomic.add<i32>(HIVE_BALANCE_OFF, val);
}
