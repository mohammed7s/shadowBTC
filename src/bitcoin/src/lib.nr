// Declare all modules
pub mod stack;
pub mod op_checksig;
pub mod ecdsa;
pub mod p2pk;

// Re-export commonly used items
pub use stack::{Stack, new_stack, push, pop};
pub use op_checksig::op_checksig;
pub use ecdsa::ecdsa_verify;
pub use p2pk::verify_p2pk;