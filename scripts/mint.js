#!/usr/bin/env node

/* eslint-disable no-console */

const { ethers } = require('hardhat');
const { address } = require('./constants');

const mint = async () => {
  const Adovals = await ethers.getContractFactory('Adovals');
  const contract = await Adovals.attach(address);

  const amount = 10;

  const result = await contract.mint(amount, []);
  console.log(result);
};

mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
