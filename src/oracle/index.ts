/// SPDX-License-Identifier: UNLICENSED

/// @title Interact with Escrow contract as oracle

import { GasHelper } from '../util'
const { Web3, ETH_DATA_FORMAT, DEFAULT_RETURN_FORMAT } = require('web3')
import type { Web3BaseProvider, AbiStruct } from 'web3-types'
const axios = require('axios').default
let fs = require('fs')
import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';

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

// Get command line arguments
const cmdArgs = process.argv.slice(2)
if (cmdArgs.length < 1) {
    console.error("node programName cmd, e.g. node build/index.js escrow")
    process.exit(1)
}

(async () => {
    const accountName = 'acc2'
    // const buildPath = path.resolve(__dirname, '')
    const country = 'Australia'
    const city = 'Sydney'
    let web3Provider: Web3BaseProvider
    let web3: typeof Web3

    // Read command line arguments
    const contractAddress = cmdArgs[0]

    // Init Web3 provider
    try {
        web3Provider = initProvider()
        web3 = new Web3(web3Provider)
    } catch (error) {
        console.error(error)
        throw 'Web3 cannot be initialised.'
    }
    console.log('---- Oracle ----\nConnected to Web3 provider.')

    // Create an account object using private key
    try {
        getAccount(web3, accountName)
    } catch (error) {
        console.error(error)
        throw 'Cannot access accounts'
    }
    const from = web3.eth.accounts.wallet[0].address
    console.log(`Oracle running as account ${accountName} with address ${from}`)

    // Subscribe to events from Escrow contract
    // Subscribe to CheckDelivery event
    const optionsCheckDelivery = {
        address: contractAddress,
        topics: [web3.utils.sha3('CheckDelivery(address,address)')]
    }
    const jsonInterfaceCheckDelivery = [{
        type: 'address',
        name: 'funder'
    }, {
        type: 'address',
        name: 'beneficiary'
    }]

    const subscriptionCheckDelivery = await web3.eth.subscribe('logs', optionsCheckDelivery)
    subscriptionCheckDelivery.on('data', async (event: any) => {
        const eventData = web3.eth.abi.decodeLog(jsonInterfaceCheckDelivery, event.data, event.topics)
        console.log(`Event CheckDelivery received with funder ${eventData.funder} and beneficiary: ${eventData.beneficiary}`)

        const rl = readline.createInterface({
            input: stdin,
            output: stdout,
            prompt: 'Is the asset delivered?'
        })
        rl.prompt()

        rl.on('line', async (line) => {
            let deliveryStatus: boolean
            switch (line.trim()) {
                case 'yes':
                case 'Yes':
                    deliveryStatus = true
                    break
                default:
                    deliveryStatus = false
                    break
            }

            const jsonInterfaceDeliveryStatus = {
                name: 'deliveryStatus',
                type: 'function',
                inputs: [{
                    type: 'bool',
                    name: 'isDelivered'
                }]
            }
            const dataDeliveryStatus = web3.eth.abi.encodeFunctionCall(jsonInterfaceDeliveryStatus, [deliveryStatus])

            try {
                const gasPrice = await web3.eth.getGasPrice(ETH_DATA_FORMAT)
                const gasLimit = await web3.eth.estimateGas({
                    from,
                    to: contractAddress,
                    data: dataDeliveryStatus
                })
                const tx = await web3.eth.sendTransaction({
                    from,
                    to: contractAddress,
                    data: dataDeliveryStatus,
                    gasPrice,
                    gas: GasHelper.gasPay(gasLimit)
                })
                console.log(`Submitted delivery status as ${deliveryStatus}`)
            } catch (error) {
                console.error('Error while calling deliveryStatus.')
                console.error(error)
            }
        })
    })
    subscriptionCheckDelivery.on('error', async (error: any) =>
        console.log('Error when subscribing to CheckDelivery event: ', error),
    )

    // Subscribe to CheckTimeout event
    const optionsCheckTimeout = {
        address: contractAddress,
        topics: [web3.utils.sha3('CheckTimeout(uint256)')]
    }
    const jsonInterfaceCheckTimeout = [{
        type: 'uint256',
        name: 'time'
    }]

    const subscriptionCheckTimeout = await web3.eth.subscribe('logs', optionsCheckTimeout)
    subscriptionCheckTimeout.on('data', async (event: any) => {
        const eventData = web3.eth.abi.decodeLog(jsonInterfaceCheckTimeout, event.data, event.topics)
        console.log(`Event CheckTimeout received with timeout ${eventData.time}`)
        // Get current time from 3rd party API
        const url = `http://worldtimeapi.org/api/timezone/${country}/${city}`
        try {
            const response = await axios.get(url)

            let timeoutStatus: boolean
            if (response.data.unixtime > eventData.time)
                timeoutStatus = true
            else
                timeoutStatus = false

            const jsonInterfaceTimeoutStatus = {
                name: 'timeoutStatus',
                type: 'function',
                inputs: [{
                    type: 'bool',
                    name: 'isTimeout'
                }]
            }
            const dataTimeoutStatus = web3.eth.abi.encodeFunctionCall(jsonInterfaceTimeoutStatus, [timeoutStatus])

            try {
                const gasPrice = await web3.eth.getGasPrice(ETH_DATA_FORMAT)
                const gasLimit = await web3.eth.estimateGas({
                    from,
                    to: contractAddress,
                    data: dataTimeoutStatus
                })
                const tx = await web3.eth.sendTransaction({
                    from,
                    to: contractAddress,
                    data: dataTimeoutStatus,
                    gasPrice,
                    gas: GasHelper.gasPay(gasLimit)
                })
                console.log(`Submitted timeout status as ${timeoutStatus}`)
            } catch (error) {
                console.error('Error while calling timeoutStatus.')
                console.error(error)
            }
        } catch (error) {
            console.error(error)
        }
    })
    subscriptionCheckTimeout.on('error', async (error: any) =>
        console.log('Error listening on event: ', error),
    )

})()