/* eslint-disable no-console */
const { ethers } = require('hardhat');

async function main() {
  const Adovals = await ethers.getContractFactory('Adovals');

  // Start deployment, returning a promise that resolves to a contract object
  const adovals = await Adovals.deploy(
    'Adovals',
    'ADV',
    'ipf://base-url.com/',
    '0xa171a3d6781c78d78bab31e28cd2988c7cd3e620b473cb903a5afbcd65d552dd',
  );
  await adovals.deployed();
  console.log('Contract deployed to address:', adovals.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
