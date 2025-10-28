// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PredictionPool} from "../src/PredictionPool.sol";
import {Constants_PredictionPool} from "./Constants_PredictionPool.sol";

contract PredictionPoolScript is Script, Constants_PredictionPool {
    PredictionPool public pool;

    address[] allowedDataFeeds = new address[](4);
    uint256 minRoundDuration;

    function setUp() public {
        allowedDataFeeds[0] = SEPOLIA_LINK_USD;
        allowedDataFeeds[1] = SEPOLIA_ETH_USD;
        allowedDataFeeds[2] = SEPOLIA_BTC_USD;
        allowedDataFeeds[3] = SEPOLIA_DAI_USD;

        minRoundDuration = MIN_ROUND_DURATION;
    }

    function run() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        pool = new PredictionPool(allowedDataFeeds, minRoundDuration);

        vm.stopBroadcast();

        console.log("PredictionPool address", address(pool));
    }
}
