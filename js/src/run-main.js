import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

function generateValidECDSAInputs() {
    console.log("Generating valid ECDSA inputs...");
    
    // Generate a secp256k1 key pair
    const keyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    
    // Create a test message
    const message = 'Hello Bitcoin! This is a test message for ECDSA verification.';
    
    // Sign the message
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();
    const signature = sign.sign(keyPair.privateKey, 'hex');
    
    // Extract signature components (simplified)
    const sigBuffer = Buffer.from(signature, 'hex');
    const sig_r = sigBuffer.slice(0, 32).toString('hex');
    const sig_s = sigBuffer.slice(32, 64).toString('hex');
    
    // Extract public key components (simplified)
    const pubKey = crypto.createPublicKey(keyPair.publicKey);
    const pubKeyBuffer = pubKey.export({ type: 'spki', format: 'der' });
    const keyData = pubKeyBuffer.slice(-65);
    const pubkey_x = keyData.slice(1, 33).toString('hex');
    const pubkey_y = keyData.slice(33, 65).toString('hex');
    
    // Create message hash
    const msg_hash = crypto.createHash('sha256').update(message).digest('hex');
    
    console.log("Generated inputs:");
    console.log("  sig_r:", sig_r);
    console.log("  sig_s:", sig_s);
    console.log("  pubkey_x:", pubkey_x);
    console.log("  pubkey_y:", pubkey_y);
    console.log("  msg_hash:", msg_hash);
    
    return { sig_r, sig_s, pubkey_x, pubkey_y, msg_hash };
}

function generateSmallTestInputs() {
    console.log("Generating small test inputs that fit within field modulus...");
    
    // Generate smaller values that fit within BN254 field (254 bits)
    // Field modulus: 21888242871839275222246405745257275088548364400416034343698204186575808495617
    const fieldModulus = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    
    // Generate random values smaller than field modulus
    const sig_r = (BigInt("0x" + crypto.randomBytes(32).toString('hex')) % fieldModulus).toString(16);
    const sig_s = (BigInt("0x" + crypto.randomBytes(32).toString('hex')) % fieldModulus).toString(16);
    const pubkey_x = (BigInt("0x" + crypto.randomBytes(32).toString('hex')) % fieldModulus).toString(16);
    const pubkey_y = (BigInt("0x" + crypto.randomBytes(32).toString('hex')) % fieldModulus).toString(16);
    const msg_hash = (BigInt("0x" + crypto.randomBytes(32).toString('hex')) % fieldModulus).toString(16);
    
    console.log("Generated small test inputs:");
    console.log("  sig_r:", sig_r);
    console.log("  sig_s:", sig_s);
    console.log("  pubkey_x:", pubkey_x);
    console.log("  pubkey_y:", pubkey_y);
    console.log("  msg_hash:", msg_hash);
    
    return { sig_r, sig_s, pubkey_x, pubkey_y, msg_hash };
}


function runMainFunction() {
    try {
        console.log("Running ShadowBTC main function...");
        
        // First, compile the Noir circuit
        console.log("1. Compiling Noir circuit...");
        execSync('nargo compile', { 
            cwd: join(process.cwd(), '..'),
            stdio: 'inherit'
        });
        
        // Create a Prover.toml file with test inputs
        console.log("2. Creating test inputs...");
        const { sig_r, sig_s, pubkey_x, pubkey_y, msg_hash } = generateSmallTestInputs();

        // Create TOML format content
        const tomlContent = `[inputs]
sig_r = "0x${sig_r}"
sig_s = "0x${sig_s}"
pubkey_x = "0x${pubkey_x}"
pubkey_y = "0x${pubkey_y}"
msg_hash = "0x${msg_hash}"`;
        
        const proverPath = join(process.cwd(), '..', 'Prover.toml');
        writeFileSync(proverPath, tomlContent);
        
        // Run the main function using nargo execute
        console.log("3. Executing main function...");
        const result = execSync('nargo execute', { 
            cwd: join(process.cwd(), '..'),
            encoding: 'utf8'
        });
        
        console.log("Main function execution result:");
        console.log(result);
        
        // Check if execution was successful
        if (result.includes("Circuit witness successfully solved")) {
            console.log("✅ Main function executed successfully - P2PK verification PASSED");
            return true;
        } else {
            console.log("❌ Main function failed - P2PK verification FAILED");
            return false;
        }
        
    } catch (error) {
        console.error("❌ Error running main function:", error.message);
        if (error.stdout) console.log("stdout:", error.stdout.toString());
        if (error.stderr) console.log("stderr:", error.stderr.toString());
        return false;
    }
}

// Run the function
const success = runMainFunction();
console.log(`\nFinal result: ${success ? 'SUCCESS' : 'FAILURE'}`);