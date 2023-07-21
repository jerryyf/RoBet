/// SPDX-License-Identifier: UNLICENSED

/// @title Deploy and interact with Escrow contract

import { compileSols, writeOutput } from './solc-lib'
import { GasHelper } from './util'
const { Web3, ETH_DATA_FORMAT, DEFAULT_RETURN_FORMAT } = require('web3');
import type { Web3BaseProvider, AbiStruct } from 'web3-types'

let fs = require('fs')
const path = require('path');

/**
 * Init WebSocket provider
 * @return {Web3BaseProvider} Provider
 */
const initProvider = (): Web3BaseProvider => {
    try {
        const providerData = fs.readFileSync('eth_providers/providers.json', 'utf8')
        const providerJson = JSON.parse(providerData)
        
        //Enable one of the next 2 lines depending on Ganache CLI or GUI
        // const providerLink = providerJson['provider_link_ui']
        const providerLink = providerJson['provider_link_cli']
        
        return new Web3.providers.WebsocketProvider(providerLink)
    } catch (error) {
        throw 'Cannot read provider'
    }
}

/**
 * Get an account given its name
 * @param {typeof Web3} Web3 Web3 provider
 * @param {string} name Account name 
 */
const getAccount = (web3: typeof Web3, name: string) => {
    try {
        const accountData = fs.readFileSync('eth_accounts/accounts.json', 'utf8')
        const accountJson = JSON.parse(accountData)
        const accountPvtKey = accountJson[name]['pvtKey']

        // Build an account object given private key
        web3.eth.accounts.wallet.add(accountPvtKey)
    } catch (error) {
        throw 'Cannot read account'
    }
}

/**
 * Get a ABI of given contract
 * @param {string} contractName Contract name
 * @param {string} buildPath Path of the build folder
 * @return {AbiStruct} ABI
 */
const getABI = (contractName: string, buildPath: string): AbiStruct => {
    try {
        const filePath = path.resolve(buildPath, contractName + '.json')
        const contractData = fs.readFileSync(filePath, 'utf8')
        const contractJson = JSON.parse(contractData)
        return contractJson[contractName][contractName].abi
    } catch (error) {
        throw 'Cannot read account'
    }
}

/**
 * Create and deploy an escrow contract holding ETH
 * @param {typeof Web3} web3 Web3 provider
 * @param {string} player1 address of player 1 in the game
 * @param {string} player2 address of player 2 in the game
 * @param {number} tokenTotalSupply total bet amount
 * @returns address of deployed contract
 */
const deploy = async (web3: typeof Web3, player1: string, player2: string, tokenTotalSupply: number) => {
    const buildPath = path.resolve(__dirname, '');
    const accountName = "acc0"
    const contractName = "Escrow"

    try {
        getAccount(web3, accountName)
    } catch (error) {
        console.error(error)
        throw 'Cannot access accounts'
    }
    console.log('Accessing account: ' + accountName)
    const from = web3.eth.accounts.wallet[0].address

    // Compile contract and save it into a file for future use
    let compiledContract: any
    try {
        compiledContract = compileSols([contractName])
        writeOutput(compiledContract, buildPath)
    } catch (error) {
        console.error(error)
        throw 'Error while compiling contract'
    }
    console.log('Contract compiled')

    // Deploy contract
    const contract = new web3.eth.Contract(compiledContract.contracts[contractName][contractName].abi)
    const data = compiledContract.contracts[contractName][contractName].evm.bytecode.object
    const args = [player1, player2, tokenTotalSupply]

    // Deploy contract with given constructor arguments
    try {
        const contractSend = contract.deploy({
            data,
            arguments: args
        });
        // Get current average gas price
        const gasPrice = await web3.eth.getGasPrice(ETH_DATA_FORMAT)
        const gasLimit = await contractSend.estimateGas(
            { from },
            DEFAULT_RETURN_FORMAT, // the returned data will be formatted as a bigint
        );
        const tx = await contractSend.send({
            from,
            gasPrice,
            gas: GasHelper.gasPay(gasLimit)
        })
        console.log('Contract contract deployed at address: ' + tx.options.address)

        return tx.options.address
    } catch (error) {
        console.error(error)
        throw 'Error while deploying contract'
    }

}

/**
 * Given a deployed escrow contract, transact all 
 * @param {typeof Web3} Web3 Web3 provider
 * @param {string} contractAddress address of deployed escrow contract
 */
const transact = async (web3: typeof Web3, contractAddress: string) => {
    const buildPath = path.resolve(__dirname, '')
    const contractName = "Escrow"

    const abi = getABI(contractName, buildPath)
    const contract = new web3.eth.Contract(abi, contractAddress)

    try {
        getAccount(web3, 'acc0')
        getAccount(web3, 'acc1')
        getAccount(web3, 'acc2')
    } catch (error) {
        console.error(error)
        throw 'Cannot access accounts'
    }

    // Verify token symbol
    try {
        const symbol = await contract.methods.symbol().call()
        console.log(`Token symbol is: ${symbol}`)
    } catch (error) {
        console.error('Error while checking symbol')
        console.error(error)
    }

    // Verify total token supply
    try {
        const totalSupply = await contract.methods.totalSupply().call()
        console.log(`Token supply is: ${totalSupply}`)
    } catch (error) {
        console.error('Error while checking total supply')
        console.error(error)
    }

    // Check token balance as token deployer
    let from = web3.eth.accounts.wallet[0].address
    try {
        const balance = await contract.methods.balanceOf(from).call()
        console.log(`Balance of token deployer is: ${balance}`)
    } catch (error) {
        console.error(error)
    }

    // Transfer tokens from address 0 to address 1 and check balance
    let to = web3.eth.accounts.wallet[1].address
    try {

        const gasPrice = await web3.eth.getGasPrice(ETH_DATA_FORMAT)
        const gasLimit = await contract.methods.transfer(to, 2000).estimateGas(
            { from },
            DEFAULT_RETURN_FORMAT, // the returned data will be formatted as a bigint
        );
        const tx = await contract.methods.transfer(to, 2000).send({
            from,
            gasPrice,
            gas: GasHelper.gasPay(gasLimit)
        })

        console.log(`20.00 tokens transferred from address ${from} to address ${to} in transaction ${tx.transactionHash}`)

        // Check balance as address 0 and 1
        const balance0 = await contract.methods.balanceOf(from).call()
        console.log(`Balance of address 0 is: ${balance0}`)

        const balance1 = await contract.methods.balanceOf(to).call()
        console.log(`Balance of address 1 is: ${balance1}`)

    } catch (error) {
        console.error('Error while transferring tokens and checking balance')
        console.error(error)
    }
}

/**
 * Create an escrow between player 1 and 2 with the given supply
 * as the total of bets
 * 
 * @param {typeof Web3} Web3 Web3 provider 
 * @param {string} player1 address of player 1 in the game
 * @param {string} player2 address of player 2 in the game
 * @param {number} bet1 bet of player 1 in the game
 * @param {number} bet2 bet of player 2 in the game
 */
const startGameBet = async (web3: typeof Web3, player1: string, player2: string, bet1: number, bet2: number) => {
    // deploy the escrow contract
    const contractAddress = await deploy(web3, player1, player2, bet1+bet2)
}

/**
 * Transact all tokens in the escrow contract from the loser to the winner
 * 
 * @param {typeof Web3} web3 Web3 provider
 * @param {string} contractAddress address of escrow contract of game
 * @param {string} winner address of the winner of the game
 * @param {string} loser address of the loser of the game
 */
const payoutWinner = async (web3: typeof Web3, contractAddress: string, winner: string, loser: string) => {
    const buildPath = path.resolve(__dirname, '')
    const contractName = "Escrow"

    const abi = getABI(contractName, buildPath)
    const contract = new web3.eth.Contract(abi, contractAddress)
    const totalSupply = await contract.methods.totalSupply().call()

    try {

        const gasPrice = await web3.eth.getGasPrice(ETH_DATA_FORMAT)
        const gasLimit = await contract.methods.transfer(winner, totalSupply).estimateGas(
            { loser },
            DEFAULT_RETURN_FORMAT, // the returned data will be formatted as a bigint
        );
        const tx = await contract.methods.transfer(winner, totalSupply).send({
            loser,
            gasPrice,
            gas: GasHelper.gasPay(gasLimit)
        })

        console.log(`20.00 tokens transferred from address ${loser} to address ${winner} in transaction ${tx.transactionHash}`)

        // Check balance as address 0 and 1
        const balance0 = await contract.methods.balanceOf(loser).call()
        console.log(`Balance of loser is: ${balance0}`)

        const balance1 = await contract.methods.balanceOf(winner).call()
        console.log(`Balance of winner is: ${balance1}`)

    } catch (error) {
        console.error('Error while transferring tokens and checking balance')
        console.error(error)
    }
}

// Get command line arguments
const cmdArgs = process.argv.slice(2)
if (cmdArgs.length < 1) {
    console.error("node programName cmd, e.g. node build/index.js deploy")
    process.exitCode = 1
}

(async () => {

    let web3Provider: Web3BaseProvider
    let web3: typeof Web3
    const buildPath = path.resolve(__dirname, '');

    // Init Web3 provider
    try {
        web3Provider = initProvider()
        web3 = new Web3(web3Provider)
    } catch (error) {
        console.error(error)
        throw 'Web3 cannot be initialised.'
    }
    console.log('Connected to Web3 provider.')

    if (cmdArgs[0] == 'deploy') {
        // await deploy(web3, 20000)
    } else if (cmdArgs[0] == 'transact') {
        await transact(web3, cmdArgs[2])
    } else if (cmdArgs[0] == 'start') {
        // given the two accounts and bets, create and deploy an escrow
        // contract that holds the totalSupply of the two bets
        startGameBet(web3, cmdArgs[1], cmdArgs[2], parseInt(cmdArgs[3]), parseInt(cmdArgs[4]))
    } else if (cmdArgs[0] == 'end') {
        // when the game is complete, pay out the winner the entire
        // escrow contract by transferring from the loser to the winner
        payoutWinner(web3, cmdArgs[1], cmdArgs[2], cmdArgs[3])
    }

    process.exitCode = 0

})()
