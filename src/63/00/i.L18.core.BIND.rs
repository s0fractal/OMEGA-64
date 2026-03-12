pub fn bind<U, F>(self, f: F) -> Maybe<U> 
    where F: FnOnce(T) -> Maybe<U> {
        match self {
            Maybe::Just(x) => f(x),
            Maybe::Nothing => Maybe::Nothing,
        }
    }
