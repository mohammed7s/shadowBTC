use crate::stack::{Stack, pop, push};
use crate::ecdsa::ecdsa_verify;

pub fn op_checksig(stack: Stack, z: Field) -> Stack {
    let (stack1, pubkey_y) = pop(stack);
    let (stack2, pubkey_x) = pop(stack1);
    let (stack3, sig_s) = pop(stack2);
    let (stack4, sig_r) = pop(stack3);

        // Reconstruct arrays from individual Field elements
    let pubkey = [pubkey_x, pubkey_y];
    let sig = [sig_r, sig_s];

    let valid = ecdsa_verify(pubkey, sig, z);
    assert(valid == true);

    push(stack4, 1)
}

