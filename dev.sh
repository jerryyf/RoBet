#!/bin/bash

# Script to prompt for bets
echo "Enter p1 bet (in ETH):"
read p1bet
echo "Enter p2 bet (in ETH):"
read p2bet

if [ $p1bet -ne $p2bet ]
then
    echo "Players must bet the same amount. Exiting."
else
    # Compile ts to build folder
    npx tsc

    # Deploy contracts for a new game
    node build/index.js start 0x927DBCFc80f7Bae8f9D0Db608EA5f628737A0511 0x7b452A989E57681699a1CC520E23572a423EEEF6 $p1bet $p2bet
fi
