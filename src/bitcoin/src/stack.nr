// circuits/bitcoin/script/stack.nr

pub struct Stack {
    items: [Field; 4], // max 4 items is more than enough
    top: u32,
}

pub fn new_stack() -> Stack {
    Stack {
        items: [0; 4],
        top: 0,
    }
}

pub fn push(mut self: Stack, value: Field) -> Stack {
    assert(self.top < 4);
    self.items[self.top] = value;
    self.top += 1;
    self
}

pub fn pop(mut self: Stack) -> (Stack, Field) {
    assert(self.top > 0);
    self.top -= 1;
    let v = self.items[self.top];
    (self, v)
}
