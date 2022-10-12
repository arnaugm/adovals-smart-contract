#!/usr/bin/env node

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

dotenv.config();

const { argv } = yargs(hideBin(process.argv));

const { ETHERSCAN_API_KEY } = process.env;

const getGasPrice = () =>
  fetch(
    `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`,
  )
    .then((response) => response.json())
    .then((data) => data.result)
    .catch((error) => {
      console.log(`Fetch error: ${error.message}`);
    });

const getEth2UsdConversionRate = () =>
  fetch(
    `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`,
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status === '0') throw new Error(data.result);
      return Number.parseFloat(data.result.ethusd);
    })
    .catch((error) => {
      console.log(`Fetch error: ${error.message}`);
    });

const getEstimation = async (gasUsed) => {
  const gasPriceGwei = await getGasPrice();

  const safeGasPriceGwei = gasUsed * gasPriceGwei.SafeGasPrice;
  const proposeGasPriceGwei = gasUsed * gasPriceGwei.ProposeGasPrice;
  const fastGasPriceGwei = gasUsed * gasPriceGwei.FastGasPrice;

  const costSafeGasPriceInEth = safeGasPriceGwei / 1000000000;
  const costProposeGasPriceInEth = proposeGasPriceGwei / 1000000000;
  const costFastGasPriceInEth = fastGasPriceGwei / 1000000000;

  console.log('/***** Ether *****/');
  console.log(`Safe: ${costSafeGasPriceInEth.toFixed(10)} ETH`);
  console.log(`Proposed: ${costProposeGasPriceInEth.toFixed(10)} ETH`);
  console.log(`Fast: ${costFastGasPriceInEth.toFixed(10)} ETH`);

  const conversionRate = await getEth2UsdConversionRate();

  const costSafeGasPriceInUsd = costSafeGasPriceInEth * conversionRate;
  const costProposeGasPriceInUsd = costProposeGasPriceInEth * conversionRate;
  const costFastGasPriceInUsd = costFastGasPriceInEth * conversionRate;

  console.log('');
  console.log('/***** USD *****/');
  console.log(`Safe: $${costSafeGasPriceInUsd.toFixed(2)}`);
  console.log(`Proposed: $${costProposeGasPriceInUsd.toFixed(2)}`);
  console.log(`Fast: $${costFastGasPriceInUsd.toFixed(2)}`);
};

getEstimation(argv.g);
