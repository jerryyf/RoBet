# RoBet

Decentralised P2P scissors paper rock betting. Runs on Ethereum blockchain, smart contracts written in Solidity, client and server in TypeScript.

## Dependencies

- npm/node
- ganache (`npm install ganache --global`)

## Building and running

- Install dependencies: `npm i`
- Compile into build folder: `npx tsc`
- Start ganache local blockchain with predefined seed: `npm run ganache`. This will generate the same private keys every time.
- Deploy contracts: `npm run dev`

## Accounts reference

- acc0: manager that deploys
- acc1: player1
- acc2: player2
- acc3: oracle