pub fn cons<T, U, F, V>(x: T, y: U) -> Box<dyn Fn(F) -> V>
where
    T: Clone + 'static,
    U: Clone + 'static,
    F: Fn(T, U) -> V + 'static,
{
    Box::new(move |f: F| f(x.clone(), y.clone()))
}
