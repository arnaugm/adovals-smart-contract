/* eslint-disable no-console */

const { ethers } = require('hardhat');
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');

const whitelist = require('./whitelist.json');

const generateMerkleTree = (addresses) => {
  const leaves = addresses.map((addr) => keccak256(addr));

  const merkleTree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
  });

  return `0x${merkleTree.getRoot().toString('hex')}`;
};

async function main() {
  const Adovals = await ethers.getContractFactory('Adovals');

  const merkleRoot = generateMerkleTree(whitelist);

  // Start deployment, returning a promise that resolves to a contract object
  const adovals = await Adovals.deploy(
    'Adovals',
    'ADV',
    'ipf://base-url.com/',
    'ipf://not-revealed-url.com/hidden.json',
    merkleRoot,
  );
  await adovals.deployed();
  console.log(`Contract deployed to address: ${adovals.address}`);
  console.log(`Whitelist: ${whitelist}`);
  console.log(`Merkle root: ${merkleRoot}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
