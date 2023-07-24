
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
    node build/index.js start 0xcf389bef5486e62a0fd1b31686394264773fe3cd54b6ed3346a33efe228b872a 0xcb9f0700855870a3fc13fe437b89c56e44b812e8b34113a1d9772025d0f4e383 $p1bet $p2bet
fi
