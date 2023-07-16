/// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

/// @title Escrow contract
/// This contract locks ETH until a winner event is triggered

contract Escrow{
    address public manager;     // game manager address (acc0)
    address public p1;          // player 1 address (acc1)
    address public p2;          // player 2 address (acc2)
    address public oracle;      // Oracle address
    uint256 public totalBet;    // total bet amount from both players
    bool public inUse;          // Contract in use

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
    }

    function winnerStatus(address winner) public {
        require(msg.sender == oracle);

        emit WinnerStatus(winner);

        if (winner != address(0)) {
            // winner receives whole balance in this contract
            payable(winner).transfer(address(this).balance);
        }
        else {
            // return bets to both players
            emit ReturnBets(p1, p2);
            payable(p1).transfer(address(this).balance/2);
            payable(p2).transfer(address(this).balance/2);
        }

        inUse = false;
    }
}

