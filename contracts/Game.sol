/// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./Escrow.sol";

/// @title Contract to handle game state

contract Game {
  // Player addresses
  address public p1;
  address public p2;
  address public p0; // Indicating no player (default value is zero)

  // Escrow contract address and object
  address public escrowAddr;
  Escrow escrowContract;

  // Player scores
  uint public p1Score;
  uint public p2Score;

  // Results of each round
  uint public r1Result;
  uint public r2Result;
  uint public r3Result;

  // Result of game
  uint public gameResult;

  enum GamePhases {
    r1,
    r2,
    r3,
    gameOver
  }

  enum Choice {
    scissors,
    paper,
    rock
  }

  GamePhases public currentPhase;

  // Events informing phases of the game
  // event RoundOneOver();
  // event RoundTwoOver();
  event GameOver(address winner);

  /**
   * @dev set player 1 and 2 addresses
   *
   */
  constructor (string memory _player1, string memory _player2, string memory _escrowAddr) payable {
    p1 = address(bytes20(bytes(_player1)));
    p2 = address(bytes20(bytes(_player2)));
    escrowAddr = address(bytes20(bytes(_escrowAddr)));
    escrowContract = Escrow(escrowAddr);
  }

  // Functions called by frontend to send account address of each player
  function setP1(address _address) public {
    p1 = _address;
  }

  function setP2(address _address) public {
    p2 = _address;
  }

  // Functions called by frontend to send result of rounds and game to backend
  // _result is 1 if p1 wins, 2 if p2 wins, 0 if draw
  function setR1Result(uint _result) public notGameOver() isR1() updateScores(_result) {
    r1Result = _result;
    currentPhase = GamePhases.r2;
  }
  
  function setR2Result(uint _result) public notGameOver() isR2() updateScores(_result) {
    r2Result = _result;
    // Before the third round, first player to 2 points wins
    if (p1Score == 2) {
      gameResult == 1;
      emit GameOver(p1);
      currentPhase = GamePhases.gameOver;
    } else if (p2Score == 2) {
      gameResult == 2;
      emit GameOver(p2);
      currentPhase = GamePhases.gameOver;
    } else {
      currentPhase = GamePhases.r3;
    }
  }

  function setR3Result(uint _result) public notGameOver() isR3() updateScores(_result) {
    r3Result = _result;
    // After the third round, player with higher points wins
    if (p1Score > p2Score) {
      gameResult == 1;
      emit GameOver(p1);
      currentPhase = GamePhases.gameOver;
    } else if (p2Score > p1Score) {
      gameResult == 2;
      emit GameOver(p2);
      currentPhase = GamePhases.gameOver;
    } else {
      gameResult == 0;
      emit GameOver(p0);
      currentPhase = GamePhases.gameOver;
    } 
  }

  function setGameResult(uint _result) public {
    gameResult = _result;
  }

  modifier updateScores(uint _result) {
    // If p1 wins add a point to p1
    if (_result == 1) {
        p1Score++;
    // If p2 wins add a point to p2
    } else if (_result == 2) {
        p2Score++;
    }
    _;
  }

  /*
    Advances 1 round of the game. Returns 0 for draw, 1 for p1 win, 2 for p2 win.
  */
  function playGame(Choice p1choice, Choice p2choice) public returns (address) {
    address ret; // should default to address(0);
    // p1 win conditions
    if (p1choice == Choice.scissors && p2choice == Choice.paper ||
      p1choice == Choice.paper && p2choice == Choice.rock ||
      p1choice == Choice.rock && p2choice == Choice.scissors)
    {
      ret = p1;
    }

    // p2 win conditions
    if (p2choice == Choice.scissors && p1choice == Choice.paper ||
    p2choice == Choice.paper && p1choice == Choice.rock ||
    p2choice == Choice.rock && p1choice == Choice.scissors)
    {
      ret = p2;
    }
    gameOver(ret);
    return ret;
  }

  function gameOver(address winner) public returns (bool) {
    if (winner != address(0)) return escrowContract.payoutWinner(winner);
    else return escrowContract.returnBets();
  }

  modifier isR1() {
    require(currentPhase == GamePhases.r1, "The result of round 1 can only be set in round 1");
    _;
  }

  modifier isR2() {
    require(currentPhase == GamePhases.r2, "The result of round 2 can only be set in round 2");
    _;
  }
  
  modifier isR3() {
    require(currentPhase == GamePhases.r3, "The result of round 3 can only be set in round 3");
    _;
  }

  modifier notGameOver() {
    require(currentPhase != GamePhases.gameOver, "This game is over");
    _;
  }
}