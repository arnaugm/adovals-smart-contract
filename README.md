# Adovals Smart Contract

Smart Contract for Adovals NFT collection

https://adovals.com/

## Utilities

### Gas cost estimation

Calculate with current conversion rates, the value in ETH and USD of a given amount of gas units.

```bash
npm run cost -- -g 3712560
```

### Random address generator

Create a list of random addresses

```bash
npm run addrs -- -n 100
```

### Calculate Merkle Tree

Calculates the Merkle Tree of the allowlist and returns the Merkle root

```bash
npm run merkle-root -- -f allowlist-test.json    // default value: allowlist.json
```

### Hash allowlist

Apply `keccak256` algorithm to the list of addresses in `allowlist.json`.

```bash
npm run hash -- -f allowlist-test.json    // default value: allowlist.json
```

### Contract deployment script

Deploy the contract to a local Hardhat Network.

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Interact with local contract

* Enable the contract after being deployed to the hardhat network

```bash
npx hardhat run --network localhost ./scripts/enable.js 
```

* Set the contract in public mint state

```bash
npx hardhat run --network localhost ./scripts/not-presale.js 
```

* Set the contract in presale state

```bash
npx hardhat run --network localhost ./scripts/presale.js 
```
