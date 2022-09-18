const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');

const generateMerkleTree = (addresses) => {
  const leaves = addresses.map((addr) => keccak256(addr));

  const merkleTree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
  });

  return `0x${merkleTree.getRoot().toString('hex')}`;
};

module.exports = {
  generateMerkleTree,
};
