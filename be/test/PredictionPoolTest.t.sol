// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {
    PredictionPool,
    Ownable,

    // errors
    PredictionPool_InvalidValue,
    PredictionPool_InvalidFeed,
    PredictionPool_InvalidDuration,
    PredictionPool_RoundIsNotActive,
    PredictionPool_CanBetOnlyOncePerRound,
    PredictionPool_ZeroAddressNotAllowed,
    PredictionPool_NotAWinner,
    PredictionPool_RoundNotResolved,
    PredictionPool_AlreadyClaimed
} from "../src/PredictionPool.sol";
import {PredictionPoolScript} from "../script/PredictionPoolScript.s.sol";
import {Constants_PredictionPool} from "../script/Constants_PredictionPool.sol";
import {MockOffchainAggregator} from "./mocks/MockOffchainAggregator.sol";

contract PredictionPoolTest is Test, Constants_PredictionPool {
    PredictionPool public pPool;
    MockOffchainAggregator public mockPriceFeed;

    address OWNER = vm.envAddress("MY_ADDRESS");
    address PLAYER_01 = makeAddr("PLAYER_01");
    address PLAYER_02 = makeAddr("PLAYER_02");
    uint256 BET_VALUE = 0.1 ether;
    uint256 BET_ON_VALUE = BET_VALUE / 2;
    uint256 ZERO_BET = 0;
    address ZERO_ADDRESS = address(0);

    function setUp() public {
        // 1. deploy PredictionPoolScript (PredictionPool deployer)
        PredictionPoolScript predictionPoolDeployer = new PredictionPoolScript();
        // 2. deploy PredictionPool
        pPool = predictionPoolDeployer.run();

        // 3. deploy MockOffchainAggregator (Chainlink Price Feeds)
        // constructor(uint8 _decimals, int256 _initialAnswer)
        mockPriceFeed = new MockOffchainAggregator(18, 1_000);
    }

    // === deployment Tests ===
    function test_deployment() public view {
        // happy path
        assertEq(pPool.owner(), OWNER);
        assertEq(pPool.minRoundDuration(), MIN_ROUND_DURATION);
        assertEq(pPool.allowedDataFeeds(SEPOLIA_LINK_USD), true);
        assertEq(pPool.allowedDataFeeds(SEPOLIA_ETH_USD), true);
        assertEq(pPool.allowedDataFeeds(SEPOLIA_BTC_USD), true);
        assertEq(pPool.allowedDataFeeds(SEPOLIA_DAI_USD), true);

        // "un-happy" path
        assertEq(pPool.allowedDataFeeds(0xC59e3633BAAc79493d908E63626716E204a45eAa), false);
    }

    // === getRound Tests ===
    function test_getRound() public {
        uint256 timestamp = block.timestamp;

        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1_000);
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);

        PredictionPool.Round memory round = pPool.getRound(0);

        assertEq(round.creator, PLAYER_01);
        assertEq(round.priceFeed, feed);
        assertEq(round.target, target);
        assertEq(round.gteTotal, BET_VALUE);
        assertEq(round.ltTotal, 0);
        assertEq(uint8(round.status), uint8(PredictionPool.RoundStatus.Active));
        assertEq(round.end, timestamp + duration);
    }

    function test_getRound_ReturnsDefaultRound_IfNotExist() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1_000);
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);

        PredictionPool.Round memory round = pPool.getRound(1);

        assertEq(round.creator, ZERO_ADDRESS);
        assertEq(round.priceFeed, ZERO_ADDRESS);
        assertEq(round.target, 0);
        assertEq(round.gteTotal, 0);
        assertEq(round.ltTotal, 0);
        assertEq(uint8(round.status), uint8(PredictionPool.RoundStatus.NotStarted));
        assertEq(round.end, 0);
    }

    // === createRound Tests ===
    function test_createRound() public {
        uint256 timestamp = block.timestamp;

        (PredictionPool.Round memory round, address feed, uint256 target, uint256 duration) = _player01_createRound();

        assertEq(round.creator, PLAYER_01);
        assertEq(round.priceFeed, feed);
        assertEq(round.target, target);
        assertEq(round.gteTotal, BET_VALUE);
        assertEq(round.ltTotal, 0);
        assertEq(uint8(round.status), uint8(PredictionPool.RoundStatus.Active));
        assertEq(round.end, timestamp + duration);
    }

    function test_createRound_Emits_RoundCreated_Event() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = 1_000;
        uint256 duration = 2 minutes;

        hoax(PLAYER_01);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_RoundCreated(
            0, PLAYER_01, BET_VALUE, PredictionPool.BetSide.Gte, block.timestamp + duration
        );

        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_createRound_Emits_NewBet_Event() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = 1_000;
        uint256 duration = 2 minutes;

        hoax(PLAYER_01);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_NewBet(0, PLAYER_01, BET_VALUE, PredictionPool.BetSide.Gte, block.timestamp);

        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_createRound_RevertWhen_OutOfFunds() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1_000);
        uint256 duration = 2 minutes;

        // Ensure the sender has no funds
        vm.prank(PLAYER_01);
        vm.deal(PLAYER_01, 0);

        // Use try/catch to check for OutOfFunds
        bool reverted = false;
        try pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration) {
            // If this block executes, the call did not revert
            assertFalse(true, "Expected OutOfFunds but call succeeded");
        } catch Error(string memory reason) {
            // Check if the error is OutOfFunds
            assertTrue(keccak256(bytes(reason)) == keccak256(bytes("OutOfFunds")), "Expected OutOfFunds");
            reverted = true;
        } catch {
            // Catch any other low-level error (e.g., OutOfFunds)
            reverted = true;
        }

        assertTrue(reverted, "Expected OutOfFunds but call succeeded");
    }

    function test_createRound_RevertWhen_BetValueIsZero() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1_000);
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);

        vm.expectRevert(PredictionPool_InvalidValue.selector);
        pPool.createRound{value: ZERO_BET}(feed, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_createRound_RevertWhen_InvalidFeed() public {
        address INVALID_FEED = ZERO_ADDRESS;
        uint256 target = uint256(1_000);
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);

        vm.expectRevert(PredictionPool_InvalidFeed.selector);
        pPool.createRound{value: BET_VALUE}(INVALID_FEED, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_createRound_RevertWhen_InvalidDuration() public {
        uint256 INVALID_DURATION = 10 seconds; // 15 seconds
        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1_000);

        // hoax => prank & fund
        hoax(PLAYER_01);

        vm.expectRevert(PredictionPool_InvalidDuration.selector);
        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, INVALID_DURATION);
    }

    // === betOn Tests ===
    function test_betOn() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_createRound();

        // 2. PLAYER_02 bets on round
        hoax(PLAYER_02);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);

        // 3. fetch round
        PredictionPool.Round memory updatedRound = pPool.getRound(round.id);

        assertEq(updatedRound.gteTotal, BET_VALUE);
        assertEq(updatedRound.ltTotal, BET_ON_VALUE);
    }

    function test_betOn_Emits_NewBet_Event() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_createRound();

        // 2. PLAYER_02 bets on round
        hoax(PLAYER_02);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_NewBet(
            0, PLAYER_02, BET_ON_VALUE, PredictionPool.BetSide.Lt, block.timestamp
        );

        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);
    }

    function test_betOn_RevertWhen_BetValueIsZero() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_createRound();

        // 2. PLAYER_02 bets on round without sending value
        hoax(PLAYER_02);

        vm.expectRevert(PredictionPool_InvalidValue.selector);
        pPool.betOn{value: ZERO_BET}(round.id, PredictionPool.BetSide.Lt);
    }

    function test_betOn_RevertWhen_RoundNotActive() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_createRound();

        // 2. Fwd Time travel - Sets block.timestamp.
        vm.warp(round.end + 1);

        // 3. PLAYER_02 tries betting on non-active round
        hoax(PLAYER_02);

        vm.expectRevert(PredictionPool_RoundIsNotActive.selector);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);
    }

    function test_betOn_RevertWhen_PlayerAlreadyBetOnRound() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_createRound();

        // 2. PLAYER_02 bets on round
        hoax(PLAYER_02);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);

        // 3. PLAYER_02 tries betting again
        vm.prank(PLAYER_02);
        vm.expectRevert(PredictionPool_CanBetOnlyOncePerRound.selector);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);
    }

    // === claimReward Tests ===
    /// test_claimReward_When_Winner
    /// @dev Tests that a winner can claim their reward when their prediction is correct.
    ///      - Mock price feed is set to 100.
    ///      - Player predicts target = 10 and Gte (price ≥ 10), so they win because 100 ≥ 10.
    function test_claimReward_When_Winner() public {
        // 1. add mockPriceFeed to simulate price feed
        _addMockPriceFeed(address(pPool));

        // 1.1. set mockPriceFeed return value
        mockPriceFeed.updateAnswer(100);

        /**
         * 2. PLAYER_01 create a round on mockPriceFeed
         * - predict target price < mockPriceFeed (=> 100)
         * - predict upside
         */
        address feed = address(mockPriceFeed);
        uint256 target = 10;
        PredictionPool.BetSide betSide = PredictionPool.BetSide.Gte;
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(feed, target, betSide, duration);

        PredictionPool.Round memory round = pPool.getRound(0);

        // 3. Resolve the round (simulate Chainlink Automation calling performUpkeep - here bypassing checkUpkeep)
        vm.warp(round.end + 1);
        uint256[] memory roundIds = new uint256[](1);
        roundIds[0] = round.id;

        vm.expectEmit();
        emit PredictionPool.PredictionPool_RoundResolved(round.id, PLAYER_01, true);
        pPool.performUpkeep(abi.encode(roundIds));

        // 3.1. Verify the Round is Resolved
        PredictionPool.Round memory resolvedRound = pPool.getRound(round.id);
        assertEq(uint8(resolvedRound.status), uint8(PredictionPool.RoundStatus.Resolved));

        // 4. Claim reward as a winner
        vm.prank(PLAYER_01);
        vm.expectEmit();
        emit PredictionPool.PredictionPool_RewardClaimed(round.id, PLAYER_01, BET_VALUE);
        pPool.claimReward(round.id);

        // 4.1. Verify the reward was claimed
        (,, bool claimed) = pPool.roundToPlayerBet(round.id, PLAYER_01);
        assertEq(claimed, true);
    }

    /// @dev Tests that rewards are split correctly between multiple winners.
    function test_claimReward_MultipleWinners_RewardSplit() public {
        _addMockPriceFeed(address(pPool));
        mockPriceFeed.updateAnswer(100); // Price = 100

        // PLAYER_01 creates a round and bets Gte (target = 10, so they win)
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(address(mockPriceFeed), 10, PredictionPool.BetSide.Gte, 2 minutes);

        // PLAYER_02 bets Gte (also wins)
        hoax(PLAYER_02);
        pPool.betOn{value: BET_ON_VALUE}(0, PredictionPool.BetSide.Gte);

        // Resolve the round
        vm.warp(block.timestamp + 2 minutes + 1);
        uint256[] memory roundIds = new uint256[](1);
        roundIds[0] = 0;
        pPool.performUpkeep(abi.encode(roundIds));

        // Calculate expected rewards
        uint256 totalPool = BET_VALUE + BET_ON_VALUE;
        uint256 p1Weight = pPool.getBetWeight(0, PLAYER_01);
        uint256 p2Weight = pPool.getBetWeight(0, PLAYER_02);
        uint256 totalWeight = p1Weight + p2Weight;
        uint256 p1Reward = (totalPool * p1Weight) / totalWeight;
        uint256 p2Reward = (totalPool * p2Weight) / totalWeight;

        // Claim rewards
        vm.prank(PLAYER_01);
        vm.expectEmit();
        emit PredictionPool.PredictionPool_RewardClaimed(0, PLAYER_01, p1Reward);
        pPool.claimReward(0);

        vm.prank(PLAYER_02);
        vm.expectEmit();
        emit PredictionPool.PredictionPool_RewardClaimed(0, PLAYER_02, p2Reward);
        pPool.claimReward(0);
    }

    /// test_claimReward_RevertWhen_WrongPrediction
    /// Wrong Prediction 01
    /// @dev Tests that a player cannot claim a reward when their prediction is incorrect.
    ///      - Mock price feed is set to 100.
    ///      - Player predicts target = 1_000 and Gte (price ≥ 1_000), but 100 < 1_000, so they lose.
    function test_claimReward_RevertWhen_WrongPrediction() public {
        // 1. add mockPriceFeed to simulate price feed
        _addMockPriceFeed(address(pPool));

        // 1.1. set mockPriceFeed return value
        mockPriceFeed.updateAnswer(100);

        /**
         * 2. PLAYER_01 create a round on mockPriceFeed
         * - predict target price > mockPriceFeed (=> 100)
         * - predict upside
         */
        address feed = address(mockPriceFeed);
        uint256 target = 1_000;
        PredictionPool.BetSide betSide = PredictionPool.BetSide.Gte;
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(feed, target, betSide, duration);

        PredictionPool.Round memory round = pPool.getRound(0);

        // 3. Resolve the round (simulate Chainlink Automation calling performUpkeep - here bypassing checkUpkeep)
        vm.warp(round.end + 1);
        uint256[] memory roundIds = new uint256[](1);
        roundIds[0] = round.id;

        vm.expectEmit();
        emit PredictionPool.PredictionPool_RoundResolved(round.id, PLAYER_01, false);
        pPool.performUpkeep(abi.encode(roundIds));

        // 3.1. Verify the Round is Resolved
        PredictionPool.Round memory resolvedRound = pPool.getRound(round.id);
        assertEq(uint8(resolvedRound.status), uint8(PredictionPool.RoundStatus.Resolved));

        // 4. Claim reward as a NOT-winner
        vm.prank(PLAYER_01);
        vm.expectRevert(PredictionPool_NotAWinner.selector);
        pPool.claimReward(round.id);

        // 4.1. Verify the reward was NOT claimed
        (,, bool claimed) = pPool.roundToPlayerBet(round.id, PLAYER_01);
        assertEq(claimed, false);
    }

    /// test_claimReward_RevertWhen_WrongPredictionBis
    /// Wrong Prediction 02
    /// @dev Tests that a player cannot claim a reward when their prediction is incorrect.
    ///      - Mock price feed is set to 100.
    ///      - Player predicts target = 10 and Lt (price < 10), but 10 < 1_000, so they lose.

    function test_claimReward_RevertWhen_WrongPredictionBis() public {
        // 1. add mockPriceFeed to simulate price feed
        _addMockPriceFeed(address(pPool));

        // 1.1. set mockPriceFeed return value
        mockPriceFeed.updateAnswer(100);

        /**
         * 2. PLAYER_01 create a round on mockPriceFeed
         * - predict target price < mockPriceFeed (=> 100)
         * - predict downside
         */
        address feed = address(mockPriceFeed);
        uint256 target = 10;
        PredictionPool.BetSide betSide = PredictionPool.BetSide.Lt;
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(feed, target, betSide, duration);

        PredictionPool.Round memory round = pPool.getRound(0);

        // 3. Resolve the round (simulate Chainlink Automation calling performUpkeep - here bypassing checkUpkeep)
        vm.warp(round.end + 1);
        uint256[] memory roundIds = new uint256[](1);
        roundIds[0] = round.id;

        vm.expectEmit();
        emit PredictionPool.PredictionPool_RoundResolved(round.id, PLAYER_01, false);
        pPool.performUpkeep(abi.encode(roundIds));

        // 3.1. Verify the Round is Resolved
        PredictionPool.Round memory resolvedRound = pPool.getRound(round.id);
        assertEq(uint8(resolvedRound.status), uint8(PredictionPool.RoundStatus.Resolved));

        // 4. Claim reward as a NOT-winner
        vm.prank(PLAYER_01);
        vm.expectRevert(PredictionPool_NotAWinner.selector);
        pPool.claimReward(round.id);

        // 4.1. Verify the reward was NOT claimed
        (,, bool claimed) = pPool.roundToPlayerBet(round.id, PLAYER_01);
        assertEq(claimed, false);
    }

    function test_claimReward_RevertWhen_RoundNotResolved() public {
        // 1. add mockPriceFeed to simulate price feed
        _addMockPriceFeed(address(pPool));

        // 1.1. set mockPriceFeed return value
        mockPriceFeed.updateAnswer(100);

        /**
         * 2. PLAYER_01 create a round on mockPriceFeed
         * - predict target price < mockPriceFeed (=> 100)
         * - predict upside
         */
        address feed = address(mockPriceFeed);
        uint256 target = 10;
        PredictionPool.BetSide betSide = PredictionPool.BetSide.Gte;
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(feed, target, betSide, duration);

        PredictionPool.Round memory round = pPool.getRound(0);

        // 3. Verify the Round is NOT Resolved
        vm.warp(round.end - 10);
        PredictionPool.Round memory resolvedRound = pPool.getRound(round.id);
        assertEq(uint8(resolvedRound.status), uint8(PredictionPool.RoundStatus.Active));

        // 4. Claim reward as a winner
        vm.prank(PLAYER_01);
        vm.expectRevert(PredictionPool_RoundNotResolved.selector);
        pPool.claimReward(round.id);

        // 4.1. Verify the reward was NOT claimed
        (,, bool claimed) = pPool.roundToPlayerBet(round.id, PLAYER_01);
        assertEq(claimed, false);
    }

    function test_claimReward_RevertWhen_WinnerAlreadyClaimed() public {
        // 1. add mockPriceFeed to simulate price feed
        _addMockPriceFeed(address(pPool));

        // 1.1. set mockPriceFeed return value
        mockPriceFeed.updateAnswer(100);

        /**
         * 2. PLAYER_01 create a round on mockPriceFeed
         * - predict target price < mockPriceFeed (=> 100)
         * - predict upside
         */
        address feed = address(mockPriceFeed);
        uint256 target = 10;
        PredictionPool.BetSide betSide = PredictionPool.BetSide.Gte;
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);
        pPool.createRound{value: BET_VALUE}(feed, target, betSide, duration);

        PredictionPool.Round memory round = pPool.getRound(0);

        // 3. Resolve the round (simulate Chainlink Automation calling performUpkeep - here bypassing checkUpkeep)
        vm.warp(round.end + 1);
        uint256[] memory roundIds = new uint256[](1);
        roundIds[0] = round.id;
        pPool.performUpkeep(abi.encode(roundIds));

        // 3.1. Verify the Round is Resolved
        PredictionPool.Round memory resolvedRound = pPool.getRound(round.id);
        assertEq(uint8(resolvedRound.status), uint8(PredictionPool.RoundStatus.Resolved));

        // 4. Claim reward as a winner
        vm.prank(PLAYER_01);
        vm.expectEmit();
        emit PredictionPool.PredictionPool_RewardClaimed(round.id, PLAYER_01, BET_VALUE);
        pPool.claimReward(round.id);

        // 4.1. Verify the reward was claimed
        (,, bool claimed) = pPool.roundToPlayerBet(round.id, PLAYER_01);
        assertEq(claimed, true);

        // 5. Try to Claim reward again
        vm.prank(PLAYER_01);
        vm.expectRevert(PredictionPool_AlreadyClaimed.selector);
        pPool.claimReward(round.id);

        // 4.1. Verify the reward is still marked as claimed
        (,, claimed) = pPool.roundToPlayerBet(round.id, PLAYER_01);
        assertEq(claimed, true);
    }

    // === getBetWeight Tests ===
    /// @dev Tests that getBetWeight returns the correct weight for a bet.
    function test_getBetWeight() public {
        // 1. Create a round
        (PredictionPool.Round memory round,,,) = _player01_createRound();

        // 2. Get the bet for PLAYER_01
        (
            uint256 betAmount, // eth amount placed for this bet
            uint256 betTime, // timestamp when user placed its bet on roundId
            // bool claimed
        ) = pPool.roundToPlayerBet(round.id, PLAYER_01);

        // 3. Get the bet weight for PLAYER_01
        uint256 weight = pPool.getBetWeight(round.id, PLAYER_01);

        // 4. Verify the weight is non-zero
        assertGt(weight, 0);

        // 5. Verify the weight is calculated correctly
        uint256 expectedTimeFactor = ((round.end - betTime) * 1e18) / pPool.minRoundDuration();
        uint256 expectedWeight = (betAmount * expectedTimeFactor) / 1e18;
        assertEq(weight, expectedWeight);
    }

    // === getTotalWeight Tests ===
    /// @dev Tests that getTotalWeight returns the correct total weight for a round.
    function test_getTotalWeight() public {
        // 1. Create a round
        (PredictionPool.Round memory round,,,) = _player01_createRound();

        // 2. Add a second player's bet
        hoax(PLAYER_02);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);

        // 3. Get the total weight
        uint256 totalWeight = pPool.getTotalWeight(round.id);

        // 4. Verify the total weight is the sum of individual weights
        uint256 p1Weight = pPool.getBetWeight(round.id, PLAYER_01);
        uint256 p2Weight = pPool.getBetWeight(round.id, PLAYER_02);
        assertEq(totalWeight, p1Weight + p2Weight);
    }

    // === toggleAllowPriceFeed Tests ===
    /// @dev Tests that toggleAllowPriceFeed adds a new feed if not in list.
    function test_toggleAllowPriceFeed_AddNewFeed() public {
        address newFeed = makeAddr("NEW_FEED");

        // Check before
        bool allowed = pPool.allowedDataFeeds(newFeed);
        assertEq(allowed, false);

        // *Add*
        vm.prank(OWNER);
        pPool.toggleAllowPriceFeed(newFeed);

        // Check after
        allowed = pPool.allowedDataFeeds(newFeed);
        assertEq(allowed, true);
    }

    function test_toggleAllowPriceFeed_Add_Emits_PriceFeedToggled_Event() public {
        // *Add*
        address newFeed = makeAddr("NEW_FEED");
        bool enabled = true;
        vm.prank(OWNER);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_PriceFeedToggled(newFeed, enabled);

        pPool.toggleAllowPriceFeed(newFeed);
    }

    /// @dev Tests that toggleAllowPriceFeed removes a feed if was in list.
    function test_toggleAllowPriceFeed_RemoveExistingFeed() public {
        // Check before
        bool allowed = pPool.allowedDataFeeds(SEPOLIA_LINK_USD);
        assertEq(allowed, true);

        // *Remove*
        vm.prank(OWNER);
        pPool.toggleAllowPriceFeed(SEPOLIA_LINK_USD);

        // Check after
        allowed = pPool.allowedDataFeeds(SEPOLIA_LINK_USD);
        assertEq(allowed, false);
    }

    function test_toggleAllowPriceFeed_Remove_Emits_PriceFeedToggled_Event() public {
        // *Remove*
        bool enabled = false;
        vm.prank(OWNER);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_PriceFeedToggled(SEPOLIA_LINK_USD, enabled);

        pPool.toggleAllowPriceFeed(SEPOLIA_LINK_USD);
    }

    function test_toggleAllowPriceFeed_RevertWhen_NotOwner() public {
        // Not-Owner tries to toggle Allow PriceFeed
        vm.prank(PLAYER_01);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, PLAYER_01));
        pPool.toggleAllowPriceFeed(SEPOLIA_LINK_USD);
    }

    function test_toggleAllowPriceFeed_RevertWhen_AddZeroAddress() public {
        vm.prank(OWNER);
        vm.expectRevert(PredictionPool_ZeroAddressNotAllowed.selector);
        pPool.toggleAllowPriceFeed(ZERO_ADDRESS);
    }

    // === setRoundDuration Tests ===
    /// @dev Tests that setRoundDuration sets a new round duration when called by OWNER.
    function test_setRoundDuration() public {
        // Check before
        uint256 minRoundDuration = pPool.minRoundDuration();
        assertEq(minRoundDuration, MIN_ROUND_DURATION);

        // Owner change minRoundDuration
        vm.prank(OWNER);
        uint256 newDuration = 10 minutes;
        pPool.setRoundDuration(newDuration);

        // Check after
        minRoundDuration = pPool.minRoundDuration();
        assertEq(minRoundDuration, newDuration);
    }

    function test_setRoundDuration_Emits_NewMinRoundDuration_Event() public {
        // Owner change minRoundDuration
        uint256 newDuration = 10 minutes;
        vm.prank(OWNER);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_NewMinRoundDuration(newDuration);

        pPool.setRoundDuration(newDuration);
    }

    function test_setRoundDuration_RevertWhen_NotOwner() public {
        // Not-Owner tries to change minRoundDuration
        uint256 newDuration = 10 minutes;
        vm.prank(PLAYER_01);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, PLAYER_01));
        pPool.setRoundDuration(newDuration);
    }

    function test_setRoundDuration_RevertWhen_InvalidDuration() public {
        // Owner tries to change set minRoundDuration below STRICT_MIN_ROUND_DURATION
        uint256 newDuration = 1 minutes;
        vm.prank(OWNER);
        vm.expectRevert(PredictionPool_InvalidDuration.selector);
        pPool.setRoundDuration(newDuration);
    }

    // === Helpers ===
    function _player01_createRound()
        internal
        returns (PredictionPool.Round memory round, address feed, uint256 target, uint256 duration)
    {
        feed = SEPOLIA_LINK_USD;
        target = uint256(1_000_000);
        duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);

        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);

        round = pPool.getRound(0);
    }

    /**
     * simulate Chainlink Price Feeds
     */
    function _addMockPriceFeed(address _pPoolAddress) internal {
        // add mockPriceFeed to pPool allowed PriceFeeds list
        vm.prank(OWNER);
        PredictionPool(_pPoolAddress).toggleAllowPriceFeed(address(mockPriceFeed));
    }
}

