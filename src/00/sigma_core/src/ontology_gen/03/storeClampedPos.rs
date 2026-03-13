use super::super::L02::*;

pub fn storeClampedPos(idx: i32, x: i32, y: i32) -> () {
    // Requires mutable pointer to the SharedArray lattice not naturally bound to pure_fns yet.
    // TODO: Extend DAG to inject &mut [i8] for memory mutating commands.
    ()
}
