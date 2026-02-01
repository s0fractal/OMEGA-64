
use std::thread;

/// [JOIN]: Синхронізує потоки та об'єднує результати [cite: 402]
pub fn join<T, M>(handles: (thread::JoinHandle<T>, thread::JoinHandle<T>), merger: M) -> T
where
    M: FnOnce(T, T) -> T,
{
    let res_f = handles.0.join().expect("Thread F collapsed");
    let res_g = handles.1.join().expect("Thread G collapsed");
    
    merger(res_f, res_g)
}
