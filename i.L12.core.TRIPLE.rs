pub fn triple<T, U, V, F, R>(x: T, y: U, z: V) -> Box<dyn Fn(F) -> R>
where
    T: Clone + 'static,
    U: Clone + 'static,
    V: Clone + 'static,
    F: Fn(T, U, V) -> R + 'static,
{
    Box::new(move |f: F| f(x.clone(), y.clone(), z.clone()))
}
