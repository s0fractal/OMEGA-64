// 🛡️ Level 40 Logic (Metallic: Flow Control)
use std::thread;

/**
 * FORK: Split execution into parallel strands.
 */
pub fn fork<F, T>(f: F) -> thread::JoinHandle<T>
where
    F: FnOnce() -> T + Send + 'static,
    T: Send + 'static,
{
    thread::spawn(f)
}

/**
 * JOIN: Synchronize parallel strands.
 */
pub fn join<T>(handle: thread::JoinHandle<T>) -> T {
    handle.join().unwrap()
}

// Atoms for this level are transfused. (lvl: 40)
