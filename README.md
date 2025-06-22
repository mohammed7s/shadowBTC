<div align="center">
  <img src="logo.png" alt="ShadowBTC Logo" width="200" height="200">
</div>
<br />




# shadowBTC 

An experimental project in private Bitcoin Transactions. 

Design: Privacy Pools bitcoin L2 allowing for 1:1 mapping of Bitcoin script spending rules, only in private.  

### key ingredients 

1. bitcoin-script.nr : Verify Bitcoin UTXO spend logic in Noir zk circuit   
2. rollup : State is two trees. A UTXO tree and a nullifier tree. 

### The Bridge 
The bridge is outside of current scope. However, the bitvm2 bridge is a groth16 verifier hence our circuits will compile to a groth16 proof. In fact the Noir lang allows for substituting multiple proving systems allowing for further experimentation with Starks and modern Honk based proofs. 

### User Journey  

1. Deposit 
    - User locks a bitcoin UTXO to bridge 
    - User mints private UTXO with same balance 
2. Spend UTXO in private   
        - User spends the UTXO by proving valid execution of bitcoin script 
        - New UTXO locked to a standard bitcoin public key (any of: P2PKH, P2PK, P2TR..etc.) in shielded state. New UTXO commitment inserted into UTXO tree. 

### Specification

Commitment = poseidon (p2pk | randomness )



## to run 

1. from root/ 
```nargo compile``` 

2. ```nargo test```

3. from js/ 
```yarn test```
```yarn run-main``` 
to run main.nr p2pk proof generation. 