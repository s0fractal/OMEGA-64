
use std::thread;
use std::sync::{Arc, Mutex};

// Визначаємо тип для обчислювального вузла Гратки
pub type LatticeNode<T> = Arc<dyn Fn(T) -> T + Send + Sync>;

/// [FORK]: Розщеплює інтент на два паралельні потоки виконання [cite: 397]
pub fn fork<T, F, G>(x: T, f: F, g: G) -> (thread::JoinHandle<T>, thread::JoinHandle<T>)
where
    T: Clone + Send + 'static,
    F: FnOnce(T) -> T + Send + 'static,
    G: FnOnce(T) -> T + Send + 'static,
{
    let x_clone = x.clone();
    
    // Створюємо два реальні системні потоки 
    let handle_f = thread::spawn(move || f(x_clone));
    let handle_g = thread::spawn(move || g(x));

    (handle_f, handle_g)
}
