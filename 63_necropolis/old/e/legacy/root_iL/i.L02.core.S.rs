pub fn s<F, G, T, U, V>(x: F, y: G, z: T) -> V
where
    F: Fn(T) -> Box<dyn Fn(U) -> V>,
    G: Fn(T) -> U,
    T: Clone,
{
    (x(z.clone()))(y(z))
}
