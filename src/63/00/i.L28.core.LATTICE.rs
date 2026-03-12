pub trait Lattice<T> {
    fn join(a: T, b: T) -> T;
    fn meet(a: T, b: T) -> T;
}
