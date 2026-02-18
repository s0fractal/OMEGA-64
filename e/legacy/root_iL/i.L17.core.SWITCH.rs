pub fn switch<T, F>(_cases: Vec<(F, T)>, default: T) -> T 
where F: Fn() -> bool
{
    default
}
