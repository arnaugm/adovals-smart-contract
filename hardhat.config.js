/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-gas-reporter');

const {
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  MAINNET_API_URL,
  LEDGER_MNEMONIC,
  GOERLI_API_URL,
  REPORT_GAS,
} = process.env;

module.exports = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: GOERLI_API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    mainnet: {
      url: MAINNET_API_URL,
      accounts: {
        mnemonic: LEDGER_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: '',
      },
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    currency: 'EUR',
    enabled: REPORT_GAS === 'true',
  },
};
