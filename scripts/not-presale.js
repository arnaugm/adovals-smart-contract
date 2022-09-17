const { ethers } = require('hardhat');
const { address } = require('./constants');

async function main() {
  const Adovals = await ethers.getContractFactory('Adovals');
  const contract = await Adovals.attach(address);

  const result = await contract.presale(false);
  console.log(result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
