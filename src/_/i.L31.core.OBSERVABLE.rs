pub struct Observable<T> {
    pub subscribe: Box<dyn Fn(Box<dyn Fn(T)>)>,
}
