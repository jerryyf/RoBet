/// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

/// @title Escrow contract
/// This contract locks ETH until a winner event is triggered

contract Escrow {
    address public manager;     // game manager address (acc0)
    address public p1;          // player 1 address (acc1)
    address public p2;          // player 2 address (acc2)
    uint256 public totalBet;    // total bet amount from both players
    bool public inUse;          // Contract in use

    /**
     * @dev Constructor. Accept ETH as payment
     *
     * @param _player1 player 1 address
     * @param _player2 player 2 address
     * @param _totalSupply total bet amount
     */
    constructor (address _player1, address _player2, uint256 _totalSupply) payable {
        p1 = _player1;
        p2 = _player2;
        totalBet = _totalSupply;
        inUse = true;                   // Contract in use
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
        inUse = false;
        return true;
    }

    function returnBets() public returns (bool) {
        payable(p1).transfer(address(this).balance/2);
        payable(p2).transfer(address(this).balance/2);
        inUse = false;
        return true;
    }

    function getTotalBet() public view returns (uint256) {
        return totalBet;
    }

    function getUse() public view returns (bool) {
        return inUse;
    }
}

