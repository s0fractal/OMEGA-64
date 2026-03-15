// SSoT: src/ontology/memory/get_hive_balance.md
import { HIVE_BALANCE_OFF } from "../01/mod";

@inline
export function get_hive_balance(): i32 {
return atomic.load<i32>(HIVE_BALANCE_OFF);
}
