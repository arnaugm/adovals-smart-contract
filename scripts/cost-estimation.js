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
  const gasPrice = await getGasPrice();

  const safeGasPrice = gasUsed * gasPrice.SafeGasPrice;
  const proposeGasPrice = gasUsed * gasPrice.ProposeGasPrice;
  const fastGasPrice = gasUsed * gasPrice.FastGasPrice;

  const costSafeGasPriceInEth = safeGasPrice / 1000000000;
  const costProposeGasPriceInEth = proposeGasPrice / 1000000000;
  const costFastGasPriceInEth = fastGasPrice / 1000000000;

  const conversionRate = await getEth2UsdConversionRate();

  const costSafeGasPriceInUsd = costSafeGasPriceInEth * conversionRate;
  const costProposeGasPriceInUsd = costProposeGasPriceInEth * conversionRate;
  const costFastGasPriceInUsd = costFastGasPriceInEth * conversionRate;

  console.log(`Safe: ${costSafeGasPriceInUsd.toFixed(2)}$`);
  console.log(`Proposed: ${costProposeGasPriceInUsd.toFixed(2)}$`);
  console.log(`Fast: ${costFastGasPriceInUsd.toFixed(2)}$`);
};

getEstimation(argv.g);
