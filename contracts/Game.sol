/// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Contract to handle game state


contract Game is ERC20 {
  // Player addresses
  address public p1;
  address public p2;

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

  GamePhases public currentPhase;

  /**
   * @dev Sets values for {name}, {symbol}, and {totalSupply} when 
   * the contract is deployed. Also, set total supply to contract creator
   *
   * @param _name Token name (string)
   * @param _symbol Token symbol (string)
   * @param _totalSupply Total supply of tokens
   */
  constructor(string memory _name, string memory _symbol, uint256 _totalSupply) ERC20(_name, _symbol) {
    _mint(msg.sender, _totalSupply);
  }

  // Functions called by frontend to send account address of each player
  function setP1(address memory _address) public {
    p1 = _address;
  }

  function setP2(address memory _address) public {
    p2 = _address;
  }

  // Functions called by frontend to send result of rounds and game to backend
  // _result is 1 if p1 wins, 2 if p2 wins, 0 if draw
  function setR1Result(uint memory _result) public notGameOver() isR1() updateScores(_result) {
    r1Result = _result;
    currentPhase = GamePhases.r2;
  }
  
  function setR2Result(uint memory _result) public notGameOver() isR2() updateScores(_result) {
    r2Result = _result;
    // Before the third round, first player to 2 points wins
    if (p1Score == 2) {
      gameResult == 1;
      currentPhase = GamePhases.gameOver;
    } else if (p2Score == 2) {
      gameResult == 2;
      currentPhase = GamePhases.gameOver;
    } else {
      currentPhase = GamePhases.r3;
    }
  }

  function setR3Result(uint memory _result) public notGameOver() isR3() updateScores(_result) {
    r3Result = _result;
    // After the third round, player with higher points wins
    if (p1Score > p2Score) {
      gameResult == 1;
      currentPhase = GamePhases.gameOver;
    } else if (p2Score > p1Score) {
      gameResult == 2;
      currentPhase = GamePhases.gameOver;
    } else {
      gameResult == 0;
      currentPhase = GamePhases.gameOver;
    } 
  }

  function setGameResult(uint memory _result) public {
    gameResult = _result;
  }

  modifier updateScores(string memory _result) {
    // If p1 wins add a point to p1
    if (_result == 1) {
        p1++;
    // If p2 wins add a point to p2
    } else if (_result == 2) {
        p2++;
    }
    _;
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
    require(currentPhase != GamePhases.gameOver, "This action cannot be performed after the game is over");
    _;
  }
}