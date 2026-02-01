pub trait Isomorphism<A, B> {
    fn forward(a: A) -> B;
    fn backward(b: B) -> A;
}
