// test-rollup.js - ESM version
import { TreeService } from './TreeService.js';

async function testRollup() {
  console.log("Starting rollup test...");
  
  const treeService = new TreeService();
  
  try {
    // Get initial state
    const initialRoots = await treeService.getTreeRoots();
    console.log("Initial roots:", initialRoots);
    
    // Add some test data
    const noteHash1 = "123456789";
    const noteHash2 = "987654321";
    const nullifier1 = "111111111";
    
    console.log("\nAdding notes and nullifiers...");
    
    // Add notes
    await treeService.addNoteHash(noteHash1);
    await treeService.addNoteHash(noteHash2);
    
    // Add nullifier
    await treeService.addNullifier(nullifier1);
    
    // Get current state
    const roots = await treeService.getTreeRoots();
    console.log("Current roots:", roots);
    
    // Process a rollup batch
    console.log("\nProcessing rollup batch...");
    const batch = await treeService.processRollupBatch(
      [noteHash1, noteHash2],
      [nullifier1]
    );
    
    console.log("Rollup batch result:", JSON.stringify(batch, null, 2));
    
    // Get inputs for Noir circuit
    console.log("\nGetting Noir circuit inputs...");
    const noteInputs = await treeService.getNoteConsumptionInputs(noteHash1);
    const nullifierWitness = await treeService.getNullifierWitness(nullifier1);
    
    console.log("Note inputs:", JSON.stringify(noteInputs, null, 2));
    console.log("Nullifier witness:", JSON.stringify(nullifierWitness, null, 2));
    
    // Test note existence
    const exists = await treeService.noteExistsAndNotNullified(noteHash1, nullifier1);
    console.log(`Note ${noteHash1} exists and not nullified:`, exists);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the test
testRollup().then(() => {
  console.log("Test completed!");
}).catch(console.error);