use crate::stack::{Stack, new_stack, push};
use crate::op_checksig::op_checksig;

pub fn verify_p2pk(
    sig: [Field; 2],      // [r, s]
    pubkey: [Field; 2],   // [x, y]
    msg_hash: Field       // double SHA256 of tx preimage
) {
    let mut stack = new_stack();
    // Push individual elements, not arrays
    stack = push(stack, sig[0]);      // sig_r
    stack = push(stack, sig[1]);      // sig_s  
    stack = push(stack, pubkey[0]);   // pubkey_x
    stack = push(stack, pubkey[1]);   // pubkey_y

    // Script: <sig> <pubkey> OP_CHECKSIG
    stack = op_checksig(stack, msg_hash);
}
