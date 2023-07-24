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

## Accounts reference

- acc0: manager that deploys
- acc1: player1
- acc2: player2

## Frontend Development

- Initial setup:

  ```sh
  npm install
  ```
  ```sh
  npx prisma db push
  ```
  ```sh
  npx prisma db seed
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `rachel@remix.run`
- Password: `racheliscool`
