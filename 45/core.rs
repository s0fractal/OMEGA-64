// 🛡️ Level 46 Logic (Metallic: Flow Control)

pub enum Maybe<T> {
    Just(T),
    Nothing,
}

pub enum Either<L, R> {
    Left(L),
    Right(R),
}

impl<T> Maybe<T> {
    pub fn bind<U, F>(self, f: F) -> Maybe<U> 
    where F: FnOnce(T) -> Maybe<U> {
        match self {
            Maybe::Just(x) => f(x),
            Maybe::Nothing => Maybe::Nothing,
        }
    }
}

// Atoms for this level are transfused. (lvl: 46)
