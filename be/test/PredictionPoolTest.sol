// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {
    PredictionPool,

    // errors
    PredictionPool_InvalidValue,
    PredictionPool_InvalidFeed,
    PredictionPool_InvalidDuration,
    PredictionPool_RoundIsNotActive,
    PredictionPool_CanBetOnlyOncePerRound
} from "../src/PredictionPool.sol";
import {PredictionPoolScript} from "../script/PredictionPoolScript.s.sol";
import {Constants_PredictionPool} from "../script/Constants_PredictionPool.sol";

contract PredictionPoolTest is Test, Constants_PredictionPool {
    PredictionPool public pPool;

    address OWNER = vm.envAddress("MY_ADDRESS");
    address PLAYER_01 = makeAddr("PLAYER_01");
    address PLAYER_02 = makeAddr("PLAYER_02");
    uint256 BET_VALUE = 0.1 ether;
    uint256 BET_ON_VALUE = BET_VALUE / 2;
    uint256 ZERO_BET = 0;

    function setUp() public {
        // deploy PredictionPoolScript deployer contract
        PredictionPoolScript predictionPoolDeployer = new PredictionPoolScript();
        // call .run() on deployer contract instance => deploy PredictionPool contract
        pPool = predictionPoolDeployer.run();
    }

    // test Deployment
    function test_Deployment() public view {
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

    // test CreateRound
    function test_CreateRound() public {
        uint256 timestamp = block.timestamp;

        (PredictionPool.Round memory round, address feed, uint256 target, uint256 duration) = _player01_CreateRound();

        assertEq(round.creator, PLAYER_01);
        assertEq(round.priceFeed, feed);
        assertEq(round.target, target);
        assertEq(round.gteTotal, BET_VALUE);
        assertEq(round.ltTotal, 0);
        assertEq(uint8(round.status), uint8(PredictionPool.RoundStatus.Active));
        assertEq(round.end, timestamp + duration);
    }

    function test_CreateRound_Emits_RoundCreated_Event() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = 1000;
        uint256 duration = 2 minutes;

        hoax(PLAYER_01);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_RoundCreated(
            0, PLAYER_01, BET_VALUE, PredictionPool.BetSide.Gte, block.timestamp + duration
        );

        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_CreateRound_Emits_NewBet_Event() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = 1000;
        uint256 duration = 2 minutes;

        hoax(PLAYER_01);

        vm.expectEmit();
        emit PredictionPool.PredictionPool_NewBet(0, PLAYER_01, BET_VALUE, PredictionPool.BetSide.Gte, block.timestamp);

        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_CreateRound_RevertWhen_OutOfFunds() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1000);
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

    function test_CreateRound_RevertWhen_BetValueIsZero() public {
        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1000);
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);

        vm.expectRevert(PredictionPool_InvalidValue.selector);
        pPool.createRound{value: ZERO_BET}(feed, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_CreateRound_RevertWhen_InvalidFeed() public {
        address INVALID_FEED = address(0);
        uint256 target = uint256(1000);
        uint256 duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);

        vm.expectRevert(PredictionPool_InvalidFeed.selector);
        pPool.createRound{value: BET_VALUE}(INVALID_FEED, target, PredictionPool.BetSide.Gte, duration);
    }

    function test_CreateRound_RevertWhen_InvalidDuration() public {
        uint256 INVALID_DURATION = 10 seconds; // 15 seconds
        address feed = SEPOLIA_LINK_USD;
        uint256 target = uint256(1000);

        // hoax => prank & fund
        hoax(PLAYER_01);

        vm.expectRevert(PredictionPool_InvalidDuration.selector);
        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, INVALID_DURATION);
    }

    // test betOn

    function test_betOn() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_CreateRound();

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
        (PredictionPool.Round memory round,,,) = _player01_CreateRound();

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
        (PredictionPool.Round memory round,,,) = _player01_CreateRound();

        // 2. PLAYER_02 bets on round without sending value
        hoax(PLAYER_02);

        vm.expectRevert(PredictionPool_InvalidValue.selector);
        pPool.betOn{value: ZERO_BET}(round.id, PredictionPool.BetSide.Lt);
    }

    function test_betOn_RevertWhen_RoundNotActive() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_CreateRound();

        // 2. Fwd Time travel - Sets block.timestamp.
        vm.warp(round.end + 1);

        // 3. PLAYER_02 tries betting on non-active round
        hoax(PLAYER_02);

        vm.expectRevert(PredictionPool_RoundIsNotActive.selector);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);
    }

    function test_betOn_RevertWhen_PlayerAlreadyBetOnRound() public {
        // 1. PLAYER_01 creates new round
        (PredictionPool.Round memory round,,,) = _player01_CreateRound();

        // 2. PLAYER_02 bets on round
        hoax(PLAYER_02);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);

        // 3. PLAYER_02 tries betting again
        vm.prank(PLAYER_02);
        vm.expectRevert(PredictionPool_CanBetOnlyOncePerRound.selector);
        pPool.betOn{value: BET_ON_VALUE}(round.id, PredictionPool.BetSide.Lt);
    }

    // Helpers
    function _player01_CreateRound()
        internal
        returns (PredictionPool.Round memory round, address feed, uint256 target, uint256 duration)
    {
        feed = SEPOLIA_LINK_USD;
        target = uint256(1000);
        duration = 2 minutes;

        // hoax => prank & fund
        hoax(PLAYER_01);

        pPool.createRound{value: BET_VALUE}(feed, target, PredictionPool.BetSide.Gte, duration);

        round = pPool.getRound(0);
    }
}

