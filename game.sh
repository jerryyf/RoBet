
#!/bin/bash

# Script to prompt for bets
echo "Enter player number (1 or 2):"
read playerNum
echo "Enter your bet (in ETH):"
read playerBet

# Compile ts to build folder
npx tsc

# Deploy game contract
node build/escrow.js start 0xcf389bef5486e62a0fd1b31686394264773fe3cd54b6ed3346a33efe228b872a 0xcb9f0700855870a3fc13fe437b89c56e44b812e8b34113a1d9772025d0f4e383 $bet1 $bet2