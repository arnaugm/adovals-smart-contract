#!/usr/bin/env node

/* eslint-disable no-console */

const keccak256 = require('keccak256');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { argv } = yargs(hideBin(process.argv));

const hash = async (allowlist) => {
  const hashes = allowlist.map(
    (addr) => `0x${keccak256(addr).toString('hex')}`,
  );
  console.log(`Allowlist hashes: ${JSON.stringify(hashes)}`);
};

const computeHashes = async (filename = 'allowlist.json') => {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const allowlist = require(`./${filename}`);
  return hash(allowlist);
};

computeHashes(argv.f)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
