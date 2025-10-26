# Betedra Lotto

## Contract Testnet
- Mock WHBAR: [0.0.6787305](https://hashscan.io/testnet/contract/0.0.6787305)
- PrngSystemContract: [0.0.6787310](https://hashscan.io/testnet/contract/0.0.6787310)
- BetedraLottory: [0.0.6787511](https://hashscan.io/testnet/contract/0.0.6787511)


Ticket is set at 5 HBAR per ticket

```
  const res = await contract.buyTickets(lotteryId, ticketNumbers, {
    value: ethers.parseUnits("5", 18),
  });
  ```