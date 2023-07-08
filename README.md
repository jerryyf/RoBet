# RoBet

Decentralised P2P scissors paper rock betting. Runs on Ethereum blockchain, smart contracts written in Solidity, client and server in TypeScript.

## Dependencies

- npm/node
- ganache (`npm install ganache --global`)

## Building and running

- Start ganache: `ganache`
- install dependencies: `npm i`
- Compile into build folder: `npx tsc`
- Deploy RBT token: `node build/index.js deploy acc0 RBT "Mint RBT" RBT 20000`

