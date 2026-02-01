pub fn sem_wrap<T>(value: T, tag: &str) -> Meaning<T> {
    Meaning {
        value,
        tag: tag.to_string(),
    }
}
