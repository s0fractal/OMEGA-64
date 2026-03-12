pub fn cdr<P, T, U>(p: P) -> U
where
    P: Fn(Box<dyn Fn(T, U) -> U>) -> U,
{
    p(Box::new(|_x: T, y: U| y))
}
