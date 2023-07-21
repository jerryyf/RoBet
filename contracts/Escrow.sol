/// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// import breaks deployment at the moment
// import "./Game.sol";

/// @title Escrow contract
/// This contract locks ETH until a winner event is triggered

contract Escrow {
    address public manager;     // game manager address (acc0)
    address public p1;          // player 1 address (acc1)
    address public p2;          // player 2 address (acc2)
    address public oracle;      // Oracle address
    uint256 public totalBet;    // total bet amount from both players
    bool public inUse;          // Contract in use
    address gameAddress;        // Game contract address
    // Game public gameContract;   // Game object

    // Events informing contract activities
    event CheckDelivery(address funder, address beneficiary);
    event DeliveryStatus(bool status);
    event WinnerStatus(address winner);
    event ReturnBets(address p1, address p2);

    /**
     * @dev Constructor. Accept ETH as payment
     *
     * @param _player1 player 1 address
     * @param _player2 player 2 address
     * @param _totalSupply total bet amount
     */
    constructor (string memory _player1, string memory _player2, uint256 _totalSupply) payable {
        p1 = address(bytes20(bytes(_player1)));
        p2 = address(bytes20(bytes(_player2)));
        totalBet = _totalSupply;
        inUse = true;                   // Contract in use
        // gameAddress = _gameAddr;
        // gameContract = Game(_gameAddr);

    }

    function winnerStatus(address winner) public returns (bool) {

        if (winner != address(0)) {
            // winner receives whole balance in this contract and terminates
            inUse = false;
            return true;
        }
        else {
            // no winner, so contract is still in use
            return false;
        }
    }

    function payoutWinner(address winner) public returns (bool) {
        payable(winner).transfer(address(this).balance);
        return true;
    }

    function returnBets() public returns (bool) {
        payable(p1).transfer(address(this).balance/2);
        payable(p2).transfer(address(this).balance/2);
        return true;
    }
}

