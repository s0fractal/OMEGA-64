pub fn t1<P, T, U, V>(p: P) -> T
where
    P: Fn(Box<dyn Fn(T, U, V) -> T>) -> T,
{
    p(Box::new(|x: T, _y: U, _z: V| x))
}
