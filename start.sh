
#!/bin/bash

# Script to prompt for bets
echo "Player 1 enter your address"
read p1addr
echo "Enter your bet (in ETH):"
read p1bet
echo "Player 2 enter your address"
read p2addr
echo "Enter your bet (in ETH):"
read p2bet

if [ $p1bet -ne $p2bet ]
then
    echo "Players must bet the same amount. Exiting."
else
    # Compile ts to build folder
    npx tsc

    # Deploy contracts for a new game
    node build/index.js start $p1addr $p2addr $p1bet $p2bet
fi
