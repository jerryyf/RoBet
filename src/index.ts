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
 * Deploys the game contract given:
 * @param {typeof Web3} web3 Web3 provider
 * @param {number} player1 player 1 address
 * @param {number} player2 player 2 address
 */
const deployGame = async (web3: typeof Web3, player1: string, player2: string, escrowAddress: string) => {
    const buildPath = path.resolve(__dirname, '')
    const accountName = "acc0" // manager account deploys
    const contractName = "Game"

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
    const args = [player1, player2, escrowAddress]

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
 * Create and deploy an escrow contract holding ETH
 * @param {typeof Web3} web3 Web3 provider
 * @param {string} player1 address of player 1 in the game
 * @param {string} player2 address of player 2 in the game
 * @param {number} totalBet total bet amount
 * @returns address of deployed contract
 */
const deployEscrow = async (web3: typeof Web3, player1: string, player2: string, totalBet: number) => {
    const buildPath = path.resolve(__dirname, '');
    const accountName = "acc0" // manager account deploys
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
    const args = [player1, player2, totalBet]

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
 * Create an escrow between player 1 and 2 with the given supply
 * as the total of bets
 * 
 * @param {typeof Web3} Web3 Web3 provider 
 * @param {string} player1 address of player 1 in the game
 * @param {string} player2 address of player 2 in the game
 * @param {number} bet1 bet amount of player 1
 * @param {number} bet1 bet amount of player 2
 */
const startGameBet = async (web3: typeof Web3, player1: string, player2: string, bet1: number, bet2: number) => {
    // deploy the escrow contract
    if (bet1 != bet2) throw Error;
    const escrowAddress = await deployEscrow(web3, player1, player2, bet1+bet2)
    const gameAddress = await deployGame(web3, player1, player2, escrowAddress)
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

    if (cmdArgs[0] == 'start') {
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
