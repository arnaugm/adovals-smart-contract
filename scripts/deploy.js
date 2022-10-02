/* eslint-disable no-console,no-unused-vars */

const { ethers } = require('hardhat');

const allowlist = require('./allowlist.json');
const { generateMerkleTree } = require('./merkle-tree');

const localData = {
  initPromoBaseURI: 'ipf://promo-base-url.com/',
  initBaseURI: 'ipf://base-url.com/',
  initNotRevealedURI: 'ipf://not-revealed-url.com/hidden.json',
};

const testnetData = {
  initPromoBaseURI: '',
  initBaseURI: '',
  initNotRevealedURI: '',
};

const mainnetData = {
  initPromoBaseURI: '',
  initBaseURI: '',
  initNotRevealedURI: '',
};

const deploymentData = {
  name: 'Adovals',
  symbol: 'ADV',
  ...localData,
};

const main = async () => {
  const Adovals = await ethers.getContractFactory('Adovals');

  const merkleRoot = generateMerkleTree(allowlist);

  // Start deployment, returning a promise that resolves to a contract object
  const adovals = await Adovals.deploy(
    deploymentData.name,
    deploymentData.symbol,
    deploymentData.initPromoBaseURI,
    deploymentData.initBaseURI,
    deploymentData.initNotRevealedURI,
    merkleRoot,
  );
  await adovals.deployed();
  console.log(`Contract deployed to address: ${adovals.address}`);
  console.log(`Allowlist: ${allowlist}`);
  console.log(`Merkle root: ${merkleRoot}`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
