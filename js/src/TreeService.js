// TreeService.js - ESM version
import { Fr } from "@aztec/aztec.js";
import { StandardTree, newTree, Poseidon, StandardIndexedTreeWithAppend } from "@aztec/merkle-tree";
import { NullifierLeaf, NullifierLeafPreimage } from "@aztec/stdlib/trees";
import { AztecLmdbStore } from "@aztec/kv-store/lmdb";


// Constants matching your Noir implementation
const NOTE_HASH_TREE_HEIGHT = 40;
const NULLIFIER_TREE_HEIGHT = 40;
const MAX_NOTES_PER_ROLLUP = 64;
const MAX_NULLIFIERS_PER_ROLLUP = 64;
const NOTE_HASH_SUBTREE_HEIGHT = 6;
const NULLIFIER_SUBTREE_HEIGHT = 6;

class TreeService {
  constructor() {
    this.noteHashIndex = 0;
    this.nullifierIndex = 0;
    this.initialized = false;
  }

  async initializeTrees() {
    if (this.initialized) return;

    // Initialize Note Hash Tree
    const store1 = AztecLmdbStore.open();
    this.noteHashTree = await newTree(
      StandardTree,
      store1,
      new Poseidon(),
      "note-hash-tree",
      Fr,
      NOTE_HASH_TREE_HEIGHT
    );

    // Initialize Nullifier Tree with canonical nullifiers
    const store2 = AztecLmdbStore.open();
    this.nullifierTree = await newTree(
      StandardIndexedTreeWithAppend,
      store2,
      new Poseidon(),
      "nullifier-tree",
      Fr,
      NULLIFIER_TREE_HEIGHT,
      0n,
      NullifierLeafPreimage,
      NullifierLeaf
    );

    // Add canonical nullifiers (like mezcal)
    const canonicalNullifiers = [new Fr(1n)].concat(
      Array(MAX_NULLIFIERS_PER_ROLLUP - 1).fill(new Fr(0n))
    );
    await this.nullifierTree.batchInsert(
      canonicalNullifiers.map(n => n.toBuffer()),
      NULLIFIER_SUBTREE_HEIGHT
    );
    await this.nullifierTree.commit();
    
    this.initialized = true;
  }

  // Get current tree roots (for Noir circuits)
  async getTreeRoots() {
    await this.initializeTrees();
    return {
      note_hash_root: this.noteHashTree.getRoot().toString(),
      nullifier_root: this.nullifierTree.getRoot().toString(),
    };
  }

  // Add note hash to tree
  async addNoteHash(noteHash) {
    await this.initializeTrees();
    const fr = new Fr(BigInt(noteHash));
    await this.noteHashTree.appendLeaves([fr]);
    await this.noteHashTree.commit();

    const index = this.noteHashIndex;
    const siblingPath = await this.noteHashTree.getSiblingPath(index);
    
    this.noteHashIndex++;
    
    return {
      index,
      siblingPath: siblingPath.toTuple().map(x => x.toString())
    };
  }

  // Add nullifier to tree
  async addNullifier(nullifier) {
    await this.initializeTrees();
    const fr = new Fr(BigInt(nullifier));
    await this.nullifierTree.batchInsert([fr.toBuffer()], NULLIFIER_SUBTREE_HEIGHT);
    await this.nullifierTree.commit();

    const index = await this.nullifierTree.findLeafIndex(fr.toBuffer());
    const siblingPath = await this.nullifierTree.getSiblingPath(index);
    
    return {
      index,
      siblingPath: siblingPath.toTuple().map(x => x.toString())
    };
  }

  // Get note consumption inputs (for Noir circuits)
  async getNoteConsumptionInputs(noteHash) {
    await this.initializeTrees();
    const fr = new Fr(BigInt(noteHash));
    const index = this.noteHashTree.findLeafIndex(fr);
    
    if (index === null) {
      throw new Error(`Note hash ${noteHash} not found in tree`);
    }

    const siblingPath = await this.noteHashTree.getSiblingPath(index);
    
    return {
      note_sibling_path: siblingPath.toTuple().map(x => x.toString()),
      note_index: index.toString(),
    };
  }

  // Get nullifier witness (for Noir circuits)
  async getNullifierWitness(nullifier) {
    await this.initializeTrees();
    const fr = new Fr(BigInt(nullifier));
    const keyAsBigInt = fr.toBigInt();
    
    const lowLeafIndexData = this.nullifierTree.findIndexOfPreviousKey(keyAsBigInt);
    
    if (lowLeafIndexData === null) {
      throw new Error(`Low leaf not found for nullifier: ${nullifier}`);
    }
    
    if (lowLeafIndexData.alreadyPresent) {
      throw new Error(`Nullifier already present: ${nullifier}`);
    }

    const lowLeafIndex = lowLeafIndexData.index;
    const lowLeafSiblingPath = await this.nullifierTree.getSiblingPath(lowLeafIndex);
    const lowLeafPreimage = this.nullifierTree.getLatestLeafPreimageCopy(lowLeafIndex);

    if (lowLeafPreimage === null) {
      throw new Error("Leaf preimage not found");
    }

    return {
      key: keyAsBigInt.toString(),
      low_leaf_preimage: {
        nullifier: lowLeafPreimage.getKey().toString(),
        next_nullifier: lowLeafPreimage.getNextKey().toString(),
        next_index: lowLeafPreimage.getNextIndex().toString(),
      },
      low_leaf_membership_witness: {
        leaf_index: lowLeafIndex.toString(),
        sibling_path: lowLeafSiblingPath.toFields().map(x => x.toBigInt().toString()),
      },
    };
  }

  // Check if note exists and is not nullified
  async noteExistsAndNotNullified(noteHash, nullifier) {
    try {
      await this.initializeTrees();
      const noteIndex = this.noteHashTree.findLeafIndex(new Fr(BigInt(noteHash)));
      if (noteIndex === null) {
        return false; // Note doesn't exist
      }

      const nullifierIndex = await this.nullifierTree.findLeafIndex(new Fr(BigInt(nullifier)).toBuffer());
      if (nullifierIndex !== null) {
        return false; // Note is nullified
      }

      return true; // Note exists and is not nullified
    } catch {
      return false;
    }
  }

  // Get tree snapshots (for Noir circuits)
  async getTreeSnapshots() {
    await this.initializeTrees();
    return {
      noteTree: {
        root: this.noteHashTree.getRoot().toString(),
        next_available_leaf_index: this.noteHashTree.getNumLeaves().toString(),
      },
      nullifierTree: {
        root: this.nullifierTree.getRoot().toString(),
        next_available_leaf_index: this.nullifierTree.getNumLeaves().toString(),
      },
    };
  }

  // Simulate rollup batch processing
  async processRollupBatch(newNoteHashes, newNullifiers) {
    await this.initializeTrees();
    
    // Add note hashes
    const notePaths = [];
    for (const noteHash of newNoteHashes) {
      if (noteHash !== "0") {
        const { siblingPath } = await this.addNoteHash(noteHash);
        notePaths.push(siblingPath);
      }
    }

    // Add nullifiers
    const nullifierWitnesses = [];
    for (const nullifier of newNullifiers) {
      if (nullifier !== "0") {
        const witness = await this.getNullifierWitness(nullifier);
        nullifierWitnesses.push(witness);
      }
    }

    const snapshots = await this.getTreeSnapshots();

    return {
      newNoteTree: snapshots.noteTree,
      newNullifierTree: snapshots.nullifierTree,
      notePaths,
      nullifierWitnesses,
    };
  }

  // Reset trees for testing
  async reset() {
    this.initialized = false;
    this.noteHashIndex = 0;
    this.nullifierIndex = 0;
    await this.initializeTrees();
  }
}

export { TreeService };