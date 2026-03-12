
pub struct SemWrap<T, Tag> {
    pub value: T,
    pub tag: Tag,
}

impl<T, Tag> SemWrap<T, Tag> {
    pub fn new(value: T, tag: Tag) -> Self {
        SemWrap { value, tag }
    }
}

pub fn sem_wrap<T, Tag>(val: T, tag: Tag) -> SemWrap<T, Tag> {
    SemWrap::new(val, tag)
}
