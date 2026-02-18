pub fn k<T, U>(x: T) -> Box<dyn Fn(U) -> T + Send + Sync> 
where 
    T: Clone + 'static + Send + Sync,
    U: 'static 
{
    Box::new(move |_y: U| x.clone())
}
