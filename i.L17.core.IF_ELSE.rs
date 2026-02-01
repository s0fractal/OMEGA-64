pub fn if_else<B, T>(b: B, true_val: T, false_val: T) -> T
where
    B: Fn(T, T) -> T,
{
    b(true_val, false_val)
}
