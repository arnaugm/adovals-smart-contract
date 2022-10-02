const { ethers } = require('hardhat');
const { address } = require('./constants');

const merkleRoot =
  '0x8225874fffeeb3d6877806ae1cc7290f5660f5229d0de509fe96ecac70008c25';

async function main() {
  const Adovals = await ethers.getContractFactory('Adovals');
  const contract = await Adovals.attach(address);

  const result = await contract.setMerkleRoot(merkleRoot);
  console.log(result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
