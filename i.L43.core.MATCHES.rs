pub fn matches<T: PartialEq>(data: &T, form: &Form<T>) -> bool {
    data == &form.layout
}
