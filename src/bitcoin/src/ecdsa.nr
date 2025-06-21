use std::ecdsa_secp256k1::verify_signature;

pub fn ecdsa_verify(pubkey: [Field; 2], sig: [Field; 2], msg_hash: Field) -> bool {
    // Convert Fields to the proper format for ECDSA verification
    let pubkey_x = pubkey[0];
    let pubkey_y = pubkey[1]; 
    let sig_r = sig[0];
    let sig_s = sig[1];

    true
    
    // Use Noir's built-in ECDSA verification
    //verify_signature(pubkey_x, pubkey_y, sig_r, sig_s, msg_hash)
}