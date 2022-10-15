#!/usr/bin/env node

const fs = require('fs');

const prodMetadata = {
  name: 'Adovals',
  description:
    'A collection of 1500 hand drawn, randomly generated, unique and limited edition NFT oval face avatars, living on the Ethereum Blockchain! The latest publications will be the rarest! Pintamones is the artist behind each of these funny characters, created with a lot of love. This project is carried out by a team of 3 people and we have created a smart contract solely for this collection. 15% of the profits from this project will go to Social Foundations in Barcelona.',
  totalTokens: 1500,
  promoTokens: 25,
  reservedTokens: 10,
  promoImageBaseURI: 'ipfs://xxx/',
  imageBaseURI: 'ipfs://xxx/',
  reservedImageBaseURI: 'ipfs://xxxx/',
};

const testMetadata = {
  name: 'Adovals-goerli',
  description:
    'A collection of 1500 hand drawn, randomly generated, unique and limited edition NFT oval face avatars, living on the Ethereum Blockchain!',
  totalTokens: 15,
  promoTokens: 5,
  reservedTokens: 1,
  promoImageBaseURI: 'ipfs://xxx/',
  imageBaseURI: 'ipfs://xxx/',
  reservedImageBaseURI: 'ipfs://xxxx/',
};

const metadata = prodMetadata;

const promoBasePath = `${process.cwd()}/test-assets/promo-metadata/`;
const basePath = `${process.cwd()}/test-assets/metadata/`;
const reservedBasePath = `${process.cwd()}/test-assets/reserved-metadata/`;

const updateMetadata = (path) => {
  const files = fs.readdirSync(path);

  files.forEach((fileName) => {
    const data = fs.readFileSync(path + fileName);
    const item = JSON.parse(data);
    const itemNum = parseInt(fileName.replace('.json', ''), 10);
    let imageURI =
      itemNum < metadata.promoTokens
        ? metadata.promoImageBaseURI
        : metadata.imageBaseURI;
    imageURI =
      itemNum < metadata.totalTokens - metadata.reservedTokens
        ? imageURI
        : metadata.reservedImageBaseURI;

    const newItem = {
      name: `${metadata.name} #${itemNum}`,
      description: metadata.description,
      image: `${imageURI + itemNum}.png`,
      attributes: item.attributes,
    };

    fs.writeFileSync(path + fileName, JSON.stringify(newItem, null, 2));
    console.log(`Updated file ${fileName}`);
  });
};

updateMetadata(promoBasePath);
updateMetadata(basePath);
updateMetadata(reservedBasePath);
