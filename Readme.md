# Betedra

_Fast, Fair, and Fun Betting Games on Hedera_

Betedra brings transparency, trust, and entertainment to Web3 gaming by enabling millions of African players to experience instant, provably fair prediction and lottery games built on the Hedera network.

**Live dapp:** [https://betedra.fun](https://betedra.fun)  
**Hackathon Track:** Gaming & NFTs → Play-to-Earn Gaming  
**Tech:** Hedera, Pyth Oracle, IPrngSystemContract (PRNG), Next.js, Hardhat, Mirror Node

## What is Betedra?

Betedra is a fast, arcade-style dapp on Hedera that lets anyone play two simple games:

- **Prediction:** every **5 minutes**, pick whether the **HBAR/USDC** price will go **UP** or **DOWN**. Settlement uses **Pyth** prices at lock/close.
- **Lotto:** buy entries for a provably fair on-chain draw. Randomness uses Hedera’s **IPrngSystemContract**.

Our vision is to provide transparent, low-fee, instant on-chain play that feels fun and fair—tailored for mobile-first players and emerging markets where payout trust and micro-stakes matter.

## Monorepo Structure

```
betedra-monorepo/
├─ dapp/                   # Next.js front-end (Vercel)
├─ images/                         # Assets & diagrams (PNG/SVG)
├─ lottery-contract/       # Lotto contracts (Hardhat + Ignition)
├─ prediction-contract/    # Prediction contracts (Hardhat + Ignition)
├─ prediction-cron/        # Cron worker (executeRound + Pyth updates)
└─ README.md
```

## Pitch Deck

<https://drive.google.com/file/d/1ZDOBDLiOuTLQ53PIs6QCbqS5VbAubHM_/view?usp=sharing>

## Hedera Certification Link

<https://drive.google.com/file/d/1i13FB7eikBzQLpnLIse9igqIYVark5Zp/view?usp=drivesdk>

## Contracts — Testnet (verified)

| Component                        | Hedera ID     | HashScan                                                                                             |
| -------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| **Pyth Oracle (HBAR/USDC feed)** | `0.0.3042133` | [https://hashscan.io/testnet/contract/0.0.3042133](https://hashscan.io/testnet/contract/0.0.3042133) |
| **PrngSystemContract**           | `0.0.6787310` | [https://hashscan.io/testnet/contract/0.0.6787310](https://hashscan.io/testnet/contract/0.0.6787310) |
| **Prediction Contract**          | `0.0.6879645` | [https://hashscan.io/testnet/contract/0.0.6879645](https://hashscan.io/testnet/contract/0.0.6879645) |
| **Lotto Contract**               | `0.0.6787511` | [https://hashscan.io/testnet/contract/0.0.6787511](https://hashscan.io/testnet/contract/0.0.6787511) |

## Cron (prediction-cron-main)

Performs two key jobs:

1. **Execute rounds** — calls `executeRound()` on **BetedraPrediction** exactly **every 5 minutes** (288 rounds/day).
2. **Keep oracle fresh** — every **2 minutes** it fetches `updateData` and runs:

   - `pythContract.getUpdateFee(updateData)`
   - `pythContract.updatePriceFeeds{ value: fee }(updateData)`

This prevents stale Pyth prices and keeps settlement fair.

**Environment (.env example)**

```
NETWORK=testnet
RPC_URL=https://testnet.hashio.io/api
PREDICTION_CONTRACT=0x...      # maps to 0.0.6879645
PYTH_FEED=0x...                # maps to 0.0.3042133
ROUND_INTERVAL_MIN=5
PYTH_REFRESH_MIN=2
PRIVATE_KEY=0xabcdef...        # operator for txs
```

## Prediction (HBAR/USDC)

- **Cadence:** every **5 minutes**; pipelines **Next → Live → Later**.
- **Lock:** record `lockPrice` from **Pyth**; freshness & confidence checks enforced.
- **Close & Settle:** record `closePrice` from **Pyth**; `close ≥ lock` → **UP** wins, else **DOWN**; split pool; emit events.
- **Guards:** small **buffers** around lock/close; **cancel** if no valid oracle update.

### Architecture Illustration

#### Normal Operation

![normal](/prediction-contract/images/normal-round.png)

#### Missing Round Operation

![missing](/prediction-contract/images/missing-round.png)

## Lotto

- **Tickets:** users buy entries during an open window (e.g., 5 HBAR each).
- **Draw:** contract calls **IPrngSystemContract** for a seed; winners derived on-chain; emits `LottoWin`.
- **Payouts:** winners claim from the contract; unmatched pools follow configured rollover rules.

## Leaderboard

- Mirror-Node indexer aggregates `RoundSettled`, `UserPayout`, `LottoWin` into **Top PnL**, **Win Rate**, **Longest Streak**, **Most Active**.

---

## Why Hedera

- **Instant, low-cost gameplay:** sub-cent fees + fast finality make 5-minute rounds viable and fun.
- **Native trust primitives:** **Pyth** provides settlement prices; **IPrngSystemContract** supplies unbiased randomness—fully on-chain.
- **Transparent & composable:** events + oracle data make outcomes reproducible and reusable for other Hedera games.
- **Fit for mobile-first, micro-stakes users:** predictable fees and instant payouts support casual play at scale.

## Deployment

Ensure `config.js`/Ignition modules have correct network & addresses. In each Hardhat package, set your key for live deploys.

```
export PK=YOUR_PRIVATE_KEY
```

### Deploy Prediction (prediction-contract-main)

```
# Install deps
cd prediction-contract-main
npm i

# Deploy
npx hardhat run scripts/deploy-prediction.js --network hedera-testnet
```

### Deploy Lotto (lottery-contract-main)

```
# Install deps
cd lottery-contract-main
npm i

# Deploy
npx hardhat run scripts/deploy-prng.js --network hedera-testnet
npx hardhat run scripts/deploy-whbar.js --network hedera-testnet

# Edit deployed PRNG contract and whbar scripts/deploy-lotto.js
npx hardhat run scripts/deploy-lotto.js --network hedera-testnet
```

### Operation (round timings)

When a round starts, the contract sets:

```
lockBlock  = current block + intervalBlocks
closeBlock = current block + (intervalBlocks * 2)
```

**Kick-start rounds**

```
startGenesisRound()
(wait x blocks)
lockGenesisRound()
(wait x blocks)
executeRound()
```

**Continue running**

```
executeRound()
(wait x blocks)
executeRound()
(wait x blocks)
```

**Resume after errors**

```
pause()            # users can’t bet; withdrawals OK
unpause()
startGenesisRound()
(wait x blocks)
lockGenesisRound()
(wait x blocks)
executeRound()
```

## Front-end (dapp-main)

- Next.js (Vercel), responsive UI; wallets: HashPack, MetaMask (Hedera EVM).
- Shows Prediction rounds, claims, Lotto entry, **Pyth**/**PRNG** trust badges.

**`.env.local` (example)**

```
NEXT_PUBLIC_NETWORK=testnet
# use 0x EVM addresses copied from HashScan → "Show EVM Address"
NEXT_PUBLIC_PYTH_FEED=0x...         # maps to 0.0.3042133
NEXT_PUBLIC_PREDICTION=0x...        # maps to 0.0.6879645
NEXT_PUBLIC_LOTTO=0x...             # maps to 0.0.6787511
```

**Run**

```
yarn --cwd dapp-main dev
# open http://localhost:3000
```

## Architecture

![Betedra E2E](/images/betedra_end_to_end_flows.svg)
![Betedra Architecture](/images/betedra_arch_poster.svg)

## Market & Value

- **Audience:** mobile-first gamers, DeFi-curious users; emphasis on instant payouts and fairness.
- **Business model:** protocol fee (e.g., ~3%) on Prediction & Lotto rounds, routed to treasury/community rewards.
- **Impact:** frequent rounds/draws and leaderboards create sticky play-to-earn loops and daily active wallets.

## Traction & Roadmap

- Created docs <https://betedra.gitbook.io/docs/>
- Hackathon MVP (Live on Testnet):
- Prediction Game Live: 5-minute HBAR/USDC rounds, instant on-chain payouts.
- Lottery Game Live: 6-digit ticket draws using Hedera’s PRNG for provable randomness.
- Wallet Integration: MetaMask
- Functional Web App: Real-time timers and responsive UI
- Live Leaderboard & History Tracking: Users can track rounds, view stats, and claim rewards.
- 23 beta testers
