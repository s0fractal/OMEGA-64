pub fn car<P, T, U>(p: P) -> T
where
    P: Fn(Box<dyn Fn(T, U) -> T>) -> T,
{
    p(Box::new(|x: T, _y: U| x))
}
