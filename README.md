# Crowdsale

## Overview

This is a crowdsale contract for Snarfcoin on the [Ethereum](https://www.ethereum.org/) blockchain.

## Requirements

* [Node.js](https://nodejs.org/en/) >= 8.9.4
* [Hardhat](https://hardhat.org/) >= 2.0.0
* [React](https://reactjs.org/) >= 17.0.1
* [Solidity](https://soliditylang.org/) >= 0.8.0

## Installation

```bash
npm install
```

## Usage

### To test on your localhost

1. Start a local Ethereum node

```bash
npx hardhat node
```

2. Deploy the contract to your local node

```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Run the frontend

```bash
node App.js
```

## Creator

* [snarfgod](https://github.com/snarfgod)