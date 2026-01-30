pub fn tell(mut self, msg: W) -> Self {
        self.log.push(msg);
        self
    }
