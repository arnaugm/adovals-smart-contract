/* eslint-disable no-console */

const keccak256 = require('keccak256');

const allowlist = require('./allowlist.json');

async function hash() {
  const hashes = allowlist.map(
    (addr) => `0x${keccak256(addr).toString('hex')}`,
  );
  console.log(`Allowlist hashes: ${JSON.stringify(hashes)}`);
}

hash()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
