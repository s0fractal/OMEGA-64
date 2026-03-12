pub type Method<T, R> = Box<dyn Fn(&T) -> R>;
