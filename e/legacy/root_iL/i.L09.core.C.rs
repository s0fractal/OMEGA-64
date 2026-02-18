pub fn c<F, T, U, V>(x: F, y: U, z: T) -> V
where
    F: Fn(T) -> Box<dyn Fn(U) -> V>,
{
    (x(z))(y)
}
