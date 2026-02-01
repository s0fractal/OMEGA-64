pub fn not<F, T, U>(b: F, t_val: T, f_val: U) -> U 
where 
    F: Fn(U, T) -> U
{
    b(f_val, t_val)
}
