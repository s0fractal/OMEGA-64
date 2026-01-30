pub trait Template<T> {
    fn produce(&self) -> Form<T>;
}
