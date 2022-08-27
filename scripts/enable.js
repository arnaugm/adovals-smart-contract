const { ethers } = require('hardhat');

const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

async function main() {
  const Adovals = await ethers.getContractFactory('Adovals');
  const contract = await Adovals.attach(address);

  const result = await contract.enable(true);
  console.log(result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
