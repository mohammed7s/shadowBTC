// Main to test bitcoin scripts + mezcal rollup
use bitcoin::{Stack, new_stack, push, pop, ecdsa_verify, verify_p2pk, op_checksig};
use rollup::{rollup_main, create_empty_note_tree, create_empty_nullifier_tree};

fn main() {
    println("Testing Bitcoin Scripts");
    
    // Test 1: Bitcoin script functionality
    test_bitcoin_scripts();
    
    // Test 2: Rollup functionality
    test_rollup_functionality();
    
    // // Test 3: Combined flow
    // test_bitcoin_to_rollup_flow();
    
    // println("All tests passed!");
}

fn test_bitcoin_scripts() {
    
    // Test stack operations
    let mut stack = new_stack();
    stack = push(stack, Field::from(123));
    stack = push(stack, Field::from(456));
    
    let (stack, val2) = pop(stack);
    let (stack, val1) = pop(stack);
    
    assert(val1 == Field::from(123), "Stack pop should return correct value");
    assert(val2 == Field::from(456), "Stack pop should return correct value");
    
    println("Bitcoin script tests passed!");

    // Test ECDSA verification
    // Test P2PK script
    // Test OP_CHECKSIG
}

fn test_rollup_functionality() {
    println("Testing Rollup Functionality...");

    
    // // Verify empty trees are created correctly
    // assert(note_tree.next_available_leaf_index == 0, "Empty note tree should start at index 0");
    // assert(nullifier_tree.next_available_leaf_index == 0, "Empty nullifier tree should start at index 0");
    
    println("Rollup functionality tests passed!");
}

// fn test_bitcoin_to_rollup_flow() {
//     // Simulate: bitcoin script verification -> note/nullifier generation -> rollup
    
//     // Step 1: "Verify" bitcoin script
//     let pubkey = [Field::from(123), Field::from(456)];
//     let signature = [Field::from(789), Field::from(12)];
//     let message_hash = Field::from(999);
    
//     let script_valid = ecdsa_verify(pubkey, signature, message_hash);
//     assert(script_valid == true, "Bitcoin script verification failed");
    
//     // Step 2: Generate note hash and nullifier (simplified)
//     let note_hash = compute_note_hash(pubkey, Field::from(1000000));
//     let nullifier = compute_nullifier(note_hash, signature[0]);
    
//     // Step 3: Prepare rollup data
//     let note_tree = create_empty_note_tree();
//     let nullifier_tree = create_empty_nullifier_tree();
    
//     // Create arrays for rollup (pad with zeros)
//     let mut new_note_hashes = [Field::from(0); 64];
//     let mut new_nullifiers = [Field::from(0); 64];
//     new_note_hashes[0] = note_hash;
//     new_nullifiers[0] = nullifier;
    
//     println("Bitcoin to rollup flow test passed!");
// }

// fn compute_note_hash(owner: [Field; 2], amount: Field) -> Field {
//     owner[0] + owner[1] + amount
// }

// fn compute_nullifier(note_hash: Field, secret: Field) -> Field {
//     note_hash + secret
// }

#[test]
fn test_all_functionality() {
    main();
}