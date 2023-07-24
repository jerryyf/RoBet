# RoBet

Decentralised P2P scissors paper rock betting. Runs on Ethereum blockchain, smart contracts written in Solidity, client and server in TypeScript.

## Dependencies

- npm/node
- ganache (`npm install ganache --global`)

## Building and running

- Install dependencies: `npm i`
- Compile into build folder: `npx tsc`
- Start ganache local blockchain with predefined seed: `npm run ganache`. This will generate the same private keys every time.
- `npm run dev` will start with prefilled player 1 and 2 addresses
- `npm run start` for demo

## Accounts reference

- acc0: manager that deploys
- acc1: player1
- acc2: player2

## Frontend Development

- Initial setup:

  ```sh
  npm run setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `rachel@remix.run`
- Password: `racheliscool`
