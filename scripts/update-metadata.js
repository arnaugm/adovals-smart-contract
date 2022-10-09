#!/usr/bin/env node

const fs = require('fs');

const name = 'Adovals-goerli';
const description =
  'A collection of 1500 hand drawn, randomly generated, unique and limited edition NFT oval face avatars, living on the Ethereum Blockchain!';
const promoTokens = 5;
const promoImageBaseURI =
  'ipfs://bafybeieywzrzfnljsw5widzxi6tqdsilam6dj7ssdz7r6l2zsdtr26tvby/';
const imageBaseURI =
  'ipfs://bafybeig5ncn75o5guwdttkl3dunivhvthkyb3hnigx5vomx5fjt23lvrve/';

const promoBasePath = `${process.cwd()}/test-assets/promo-metadata/`;
const basePath = `${process.cwd()}/test-assets/metadata/`;

const updateMetadata = (path) => {
  const files = fs.readdirSync(path);

  files.forEach((fileName) => {
    const data = fs.readFileSync(path + fileName);
    const item = JSON.parse(data);
    const itemNum = parseInt(fileName.replace('.json', ''), 10);
    const imageURI = itemNum <= promoTokens ? promoImageBaseURI : imageBaseURI;

    const newItem = {
      name: `${name} #${itemNum}`,
      description,
      image: `${imageURI + itemNum}.png`,
      attributes: item.attributes,
    };

    fs.writeFileSync(path + fileName, JSON.stringify(newItem, null, 2));
    console.log(`Updated file ${fileName}`);
  });
};

updateMetadata(promoBasePath);
updateMetadata(basePath);
