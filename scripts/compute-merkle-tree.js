#!/usr/bin/env node

/* eslint-disable no-console */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { generateMerkleTree } = require('./merkle-tree');

const { argv } = yargs(hideBin(process.argv));

const computeMerkleTree = async (filename = 'allowlist.json') => {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const allowlist = require(`./${filename}`);
  return generateMerkleTree(allowlist);
};

computeMerkleTree(argv.f)
  .then((merkleRoot) => {
    console.log(`Merkle root: ${merkleRoot}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
