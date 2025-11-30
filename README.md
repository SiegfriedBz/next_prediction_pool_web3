# 🎲 Bet2Gether

**Bet2Gether is a trustless prediction game where users bet on crypto price movements, with automated payouts and NFT rewards—powered by Ethereum, Solidity, Chainlink and Tenderly.**

## 🚀 Quick Start

1. **Try the Demo**: [🌐 Live Demo ✨](https://bet2gether-alpha.vercel.app/)
2. **Get Testnet ETH**: [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
3. Connect your wallet to the DApp
4. **Create a Game**: Pick an asset, predict its price, bet ETH, claim rewards and win NFTs!

---

<div align="center">
  <img src="./assets/bet2gether-01.gif" alt="Game creation flow (1/2)" width="600"/>
  <p><em>Game creation flow (1/2)</em></p>
</div>

<div align="center">
  <img src="./assets/bet2gether-02.gif" alt="Game creation flow (2/2)" width="600"/>
  <p><em>Game creation flow (2/2)</em></p>
</div>

---
  

## 🎮 How It Works

### For Players

1. **Create**: Pick an asset (LINK/ETH/BTC/DAI), predict price movement (↑/↓) against USD, set duration, and bet ETH.
2. **Bet**: Join active games by predicting outcomes and betting ETH.
3. **Win**: Claim ETH rewards if your bet was correct (weighted by bet size/timing).
4. **Earn NFTs**: Game creators who win also receive a **random ERC-1155 NFT**.

> **How It’s Trustless**:
>
> - **Prices**: **Chainlink Price Feeds** (tamper-proof, decentralized).
> - **Game Resolution**: **Chainlink Keepers** (automated, no admin).
> - **Rewards**: **Chainlink VRF** (provably fair randomness).

### For Developers

- **Tech Stack**: **Next.js** + **Solidity** + **Chainlink** + **Tenderly Web3 Actions**.
- **Why It’s Unique**:
  - Fully on-chain (*except* Tenderly Web3 Actions for NFT minting—*temporary off-chain logic experiments*).
  - **Automated**, **transparent**, and **no admin control** over game outcomes.

---

## ✨ Key Features

 | Feature | Details |
 |-----------------------|-------------------------------------------------------------------------|
 | **Prediction Games**  | Bet on ETH/BTC/LINK/DAI price movements (↑/↓) against USD                               |
 | **Fair Pricing**      | Powered by **Chainlink Price Feeds** ensure tamper-proof, decentralized asset prices     |
 | **Auto-Resolution**   | **Chainlink Keepers** trigger resolution at deadline—no admin intervention                  |
 | **NFT Rewards**       | Winning creators receive **randomized ERC-1155 NFTs** (via **Chainlink VRF**)    |
 | **Real-Time UI**      | **Alchemy WebSockets** for live updates (new games, bets, resolutions, NFT rewards)           |

---

## 🛠️ Tech Stack

### Frontend

| Technology                   | Purpose                         |
| ---------------------------- | ------------------------------- |
| Next.js + TypeScript         | Core framework              |
| Tailwind + shadcn/ui     | UI styling and components       |
| Zod + React Hook Form        | Form validation and type safety |
 | React Context         | State management (isolated providers for games/bets) |
 | Custom Hooks          | `usePPoolNewBetEvent`, `usePPoolNewStatusEvent` (on-chain event-driven refetching) |
| TanStack Query (React Query) | Caching and data sync           |
| TanStack Table               | Interactive and sortable tables |
| **Wagmi** + RainbowKit           | Web3 wallet connection & hooks  |
| pnpm                     | Frontend package manager       |

### Backend

| Layer          | Technologies                     |
 |----------------|----------------------------------|
 | Contracts  | **Solidity**, **Foundry**, ***Sepolia***      |
 | Testing    | **Foundry tests**          |
 | Oracles     | **Chainlink** Price Feeds / Keepers (Automation) / VRF (Randomness) |
 | Storage    | IPFS (NFT metadata)             |
 | Blockchain Access        | **Alchemy** (HTTP + WebSocket)       |
 | Off-Chain Logic  | **Tenderly Web3 Actions** (NFT minting)          |
 | Package Manager | forge |

---

## 📚 Technical Details

### Frontend details

- **React Context Providers**:
  - `RoundsProvider`: Manages active/resolved rounds.
  - `ActiveRoundsWithPlayerBetsProvider`: Tracks user bets in active games.
  - `ResolvedRoundsWithPlayerBetsAndWinsProvider`: Tracks resolved games and claimable rewards.
  - **Performance**: Independent providers minimize re-renders; shared React Query client ensures cache consistency.
- **Real-Time Updates**:
  - **Alchemy WebSockets** → wagmi `watchContractEvent` → selective query refetching.

### Backend details

- **Chainlink Workflow**:
  - **Price Feeds**: Fetch real-time prices for game creation (by user) / resolution (automated).
    - Supported Price Feeds:
      - `LINK/USD`, `ETH/USD`, `BTC/USD`, `DAI/USD`
      - A game on *Sepolia* uses the following [Chainlink Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses?page=1&testnetPage=1&networkType=testnet&search=&testnetSearch=).
  - **Keepers**: Auto-resolve rounds at deadline.
  - **VRF**: Randomize NFT pick for winners (among 3 possible NFTs).
  - **ERC-1155**: Winners receive **unique NFTs** (randomized via Chainlink VRF) and can own multiple copies.
  
- **Tenderly Logic**:
  - Listens for `PredictionPool_RoundResolved` event → mints NFTs via `PredictionPoolToken` for game creator if is among winner(s).
  - **Future**: Migrate to on-chain for full transparency.

### Flow Diagrams

#### 1️⃣ Round Creation & Betting

- Users create games ("*rounds*") on a given pair, with a target price, their prediction — whether the final price will be Less Than (LT) or Greater Than or Equal (GTE) to the target — as well as the bet amount and round duration.
- When creating a game ("*round*"), after selecting a pair, the current price for this pair is fetched from **Chainlink Price Feeds** and displayed.
- Other users can place bets on an active game by choosing a side.

```mermaid
sequenceDiagram
    participant User as Next.js App (wagmi, rainbow kit)
    participant Pool as PredictionPool Contract

    %% Creating a round
    User ->> Pool: createRound(feed, target, betSide, duration, payable)
    Pool ->> Pool: emit RoundCreated
    Pool ->> Pool: emit NewBet

    %% Placing a bet
    User ->> Pool: betOn(roundId, betSide, public, payable)
    Pool ->> Pool: emit NewBet
```

*Diagram: [Round Creation & Betting] Flow*

#### 2️⃣ Chainlink Automation & Game Resolution

- **Chainlink Automation** periodically checks for  games ("*rounds*") ready to resolve.
- `_resolveRound` fetches the final price, computes winners, and emits a `RoundResolved` event.

```mermaid
sequenceDiagram
    participant Pool as PredictionPool Contract
    participant ChainlinkAuto as Chainlink Automation
    participant ChainlinkFeed as Chainlink PriceFeed

    %% Chainlink Automation: Upkeep
    ChainlinkAuto ->> Pool: checkUpkeep(checkData)
    Pool ->> ChainlinkAuto: performData = abi.encode(roundIdsToUpkeep)
    ChainlinkAuto ->> Pool: performUpkeep(performData)
    Pool ->> Pool: call _resolveRound(roundId)

    %% Resolving a round with PriceFeed
    Pool ->> ChainlinkFeed: get price
    ChainlinkFeed -->> Pool: return price
    Pool ->> Pool: compute winners
    Pool ->> Pool: emit RoundResolved(roundId, roundCreator, roundCreatorIsWinner)
```

*Diagram: [Chainlink Automation & Game Resolution] Flow*

#### 3️⃣ Reward Claiming

- Users claim rewards using `claimReward()`.
- Rewards are proportional to the bet amount and time of bet.
- Early bets have a higher potential reward if the side is correct.

```mermaid
sequenceDiagram
    participant User as Next.js App (wagmi, rainbow kit)
    participant Pool as PredictionPool Contract

    %% Round resolved event
    Pool ->> Pool: emit RoundResolved(roundId, roundCreator, roundCreatorIsWinner)

    %% Claiming reward
    User ->> Pool: claimReward(_roundId)
    Pool ->> Pool: computes + transfer reward
    Pool ->> Pool: emit RewardClaimed
```

*Diagram: [Reward Claiming] Flow*

#### 4️⃣ Reward ERC1155 Minting for Round Creator

- If the round creator wins, they receive a random (using **Chainlink VRF** in the `PredictionPoolToken` contract) ERC1155 NFT.
- Currently handled via **Tenderly Web3 Actions**.

⚠️ This could be implemented on-chain in `_resolveRound` for full transparency and immutability.

```mermaid
  sequenceDiagram
    participant Pool as PredictionPool Contract
    participant Token as PredictionPool Token ERC1155
    participant Tenderly as Tenderly Web3 Actions
    participant ChainlinkVRF as Chainlink VRF

    %% Round resolved event
    Pool ->> Pool: emit RoundResolved(roundId, roundCreator, roundCreatorIsWinner)
    %% Mint ERC1155 Token via Tenderly if roundCreator wins
    Pool ->> Tenderly: if roundCreatorIsWinner
    Tenderly ->> Token: mint(to)
    Token ->> ChainlinkVRF: _requestRandomWords(winner)
    ChainlinkVRF -->> Token: fulfillRandomWords(requestId, randomWords)
    Token ->> Token: _mint(winner, tokenId, 1, hex"")
    Token ->> Token: emit Mint(winner, tokenId)
```

*Diagram: [Reward ERC1155 Minting for Round Creator] Flow*

---

### 📘 Contracts

#### 1️⃣ PredictionPool

Handles core game logic, all ETH-based prediction games, allowing users to bet on whether an asset’s price (via Chainlink Price Feed) will rise or fall by each game’s end.

#### 2️⃣ PredictionPoolToken (ERC-1155 NFT)

Manages NFT rewards for game creators who win their own rounds.

| Contract               | Address (Sepolia)                                  | Purpose                          |
|------------------------|---------------------------------------------------|----------------------------------|
| PredictionPool         | [0x51A0a7561dEbA056C1cDF5aB4c369Db686c77EF6](https://sepolia.etherscan.io/address/0x51A0a7561dEbA056C1cDF5aB4c369Db686c77EF6) | Core game logic                 |
| PredictionPoolToken    | [0xddd3c73caE8541FC6Ea119C1BffC5B6547D33eCf](https://sepolia.etherscan.io/address/0xddd3c73caE8541FC6Ea119C1BffC5B6547D33eCf) | ERC-1155 NFT rewards            |

---

### 🚀 Setup & Deployment

#### Backend setup

All deployment parameters (e.g., LINK Token, VRF Coordinator, Subscription ID, Key Hash, ...) can be found in the Foundry project under:

```bash
be/script/Constants_PredictionPool.sol
be/script/Constants_PredictionPoolToken.sol
```

##### 1. (be) Environment Variables

```bash
# Backend
ALCHEMY_SEPOLIA_RPC_URL=
ETHERSCAN_API_KEY=
PRIVATE_KEY=
```

##### 2. Deploy (and get verified) contracts on *Sepolia* Testnet

```bash
# Backend
cd be 
# Deploy PredictionPool
forge script script/PredictionPoolScript.s.sol --rpc-url \$RPC_URL --broadcast --verify
# Deploy PredictionPoolToken
forge script script/PredictionPoolTokenScript.s.sol --rpc-url \$RPC_URL --broadcast --verify
```

#### Tenderly Setup

1. **Configure**
   - Update `web3-actions/` with deployed contract addresses/ABIs.
   - Set secret variables (Tenderly API key, RPC URL).

2. **Deploy**

   ```bash
   cd web3-actions && tenderly actions deploy
   ```

3. **Monitor**

View logs/transactions in the Tenderly Dashboard.

Example Tenderly Action Log:

![Tenderly Web3 Action Log](./assets/tenderly-action-logs.png)

> **Note**:
> Tenderly is **temporarily** used for NFT minting to:
>
> - Experiment with off-chain automation.
> - Reduce gas costs for users during testing.
> *Future*: All logic will migrate on-chain.

#### Frontend setup

##### 1. (fe) Environment Variables

```bash
# Frontend
NEXT_PUBLIC_ETH_SEPOLIA_ALCHEMY_HTTP_URL=
NEXT_PUBLIC_ETH_SEPOLIA_ALCHEMY_WS_URL=   # 🔧 For live updates
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

##### 2. Set deployed contracts addresses & ABIs

- Update `/fe/app/_contracts/` with the latest ABIs and addresses from Sepolia.

##### 3. Install dependencies & run locally

```bash
# Frontend
cd fe && pnpm install && pnpm dev
```

#### 📖 See Docs
>
>
> - [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds)
> - [Chainlink Keepers](https://docs.chain.link/chainlink-automation)
> - [Chainlink VRF](https://docs.chain.link/vrf)
> - [Tenderly Web3 Actions](https://docs.tenderly.co/web3-actions)
> - [Alchemy WebSockets](<https://docs.alchemy.com/alchemy/guides/ethereum-websockets>)

### 🧪 Testing - Contracts

- **Current Coverage**:

| Contract               | Lines (%)      | Statements (%) | Branches (%)   | Functions (%)  |
|------------------------|----------------|----------------|----------------|-----------------|
| `PredictionPool`       | 89.53% (154/172) | 86.81% (158/182) | 77.78% (21/27)  | 96.00% (24/25)  |
| `PredictionPoolToken`  | 85.71% (36/42)  | 87.18% (34/39)  | 25.00% (1/4)    | 87.50% (7/8)    |
| **Total**              | **77.97%**     | **76.47%**     | **46.30%**      | **81.48%**      |

### **Detailed Coverage Breakdown**
- **`PredictionPool.sol`**: **89.53%** (154/172 lines) — Core logic + edge cases.
  - **Branches**: **77.78%** (21/27) — To improve.
  - **Functions**: **96.00%** (24/25) — Nearly full function coverage.

- **`PredictionPoolToken.sol`**: **85.71%** (36/42 lines) — Minting + VRF tests.
  - **Branches**: **25.00%** (1/4) — To improve.
  - **Functions**: **87.50%** (7/8) — Strong function coverage.

- **Run locally**

  ```bash
  cd be
  forge test
  forge coverage
  ```

---

## 🪙 Rewards & Tokenomics

The DApp supports two types of rewards:

### 1️⃣ Player Rewards

Players share the total round pot based on:

- Total ETH bet on the given game
- Bet timing (earlier = higher weight)

Rewards claimed via `claimReward(roundId)`

### 2️⃣ Creator NFT Rewards

If a round creator wins their own prediction,
they receive a random ERC-1155 NFT reward.

Currently handled off-chain (Tenderly), but easily portable on-chain.

---

## 🔮 Future Improvements

### DAO & Governance Expansion

A future iteration of Bet2Gether could introduce a **Bet2GetherDAO smart contract** to decentralize key decisions across the platform.

Game creators who earn PredictionPoolToken NFTs could use them as governance tokens, granting voting power within the DAO.

DAO members would collectively decide on key parameters such as:

- Platform fees for game creation or betting (currently unset).
- Which Chainlink Price Feeds are authorized for new rounds.
- The allocation and use of any protocol treasury or revenue.

This governance layer would evolve Bet2Gether from a prediction DApp into a community-owned prediction ecosystem, where active participation directly shapes the platform’s future.

### Long-Term Vision

Beyond governance, Bet2Gether aims to evolve into a fully community-driven ecosystem where:

- A DAO Treasury accumulates a portion of platform fees and funds new feature proposals.
- Staking mechanisms reward long-term participants and DAO contributors.
- Cross-chain integrations extend prediction rounds to multiple EVM networks.
- The NFT collection gains utility in governance, staking, or reputation scoring, reflecting players’ and creators’ historical performance.

## 👨‍💻 Author

Siegfried Bozza
Full-Stack Web Developer | Blockchain Enthusiast

🐙 [GitHub](https://github.com/SiegfriedBz)
