#!/usr/bin/env node

/* eslint-disable no-console */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { argv } = yargs(hideBin(process.argv));

const addressGenerator = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
    .padStart(size + 2, '0x');

const addressCollection = (num) => {
  const collection = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < num; i++) {
    const addr = addressGenerator(40);
    collection.push(addr);
  }
  console.log(collection);
};

addressCollection(argv.n);
