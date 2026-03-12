pub fn resonance<T: PartialEq>(s1: &Signal<T>, s2: &Signal<T>) -> bool {
    s1.payload == s2.payload
}
