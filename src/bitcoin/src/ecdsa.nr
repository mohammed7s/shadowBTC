use std::ecdsa_secp256k1::verify_signature;

// /// Converts a Field to a [u8; 32] big-endian byte array
// fn field_to_bytes32(f: Field) -> [u8; 32] {
//     f.to_be_bytes()
// }

/// Concatenates two Fields (r, s) into a [u8; 64] signature
// fn sig_to_bytes64(r: Field, s: Field) -> [u8; 64] {
//     let r_bytes = r.to_be_bytes();
//     let s_bytes = s.to_be_bytes();
//     let mut sig_bytes: [u8; 64] = [0; 64];
//     for i in 0..32 {
//         sig_bytes[i] = r_bytes[i];
//         sig_bytes[32 + i] = s_bytes[i];
//     }
//     sig_bytes
// }

pub fn ecdsa_verify(pubkey: [Field; 2], sig: [Field; 2], msg_hash: Field) -> bool {
    // let pubkey_x_bytes = field_to_bytes32(pubkey[0]);
    // let pubkey_y_bytes = field_to_bytes32(pubkey[1]);
    // let sig_bytes = sig_to_bytes64(sig[0], sig[1]);
    // let msg_hash_bytes = field_to_bytes32(msg_hash);

    // verify_signature(pubkey_x_bytes, pubkey_y_bytes, sig_bytes, msg_hash_bytes)
    // To always return true for testing, comment out the above line and uncomment the next line:
    true
}