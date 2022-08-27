# Adovals Smart Contract

Smart Contract for Adovals NFT collection

https://adovals.com/

## Utilities

### Gas cost estimation

Calculate with current conversion rates, the value in ETH and USD of a given amount of gas units.

```bash
npm run cost -- -g 3712560
```

### Hash allowlist

Apply `keccak256` algorithm to the list of addresses in `allowlist.json`.

```bash
npm run hash
```

### Contract deployment script

Deploy the contract to a local Hardhat Network.

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Interact with local contract

Enable the contract after being deployed to the hardhat network

```bash
npx hardhat run --network localhost ./scripts/enable.js 
```