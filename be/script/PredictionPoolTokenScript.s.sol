// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PredictionPoolToken} from "../src/PredictionPoolToken.sol";
import {Constants_PredictionPoolToken} from "./Constants_PredictionPoolToken.sol";

contract PredictionPoolTokenScript is Script, Constants_PredictionPoolToken {
    address myAddress = address(uint160(uint256(vm.envUint("MY_ADDRESS"))));

    // function setUp() public {}

    function run() public returns (PredictionPoolToken token) {
        console.log("Deploying PredictionPoolToken...");

        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        // constructor(
        // string memory uri_,
        // uint256 _maxTokenId,
        // address _defaultAdmin,
        // address _minter,
        // address _linkToken,
        // address _vrfCoordinator,
        // uint256 _vrfSubId,
        // bytes32 _vrfKeyHash
        // )
        token = new PredictionPoolToken(
            TOKEN_URI,
            MAX_TOKEN_ID,
            myAddress,
            myAddress,
            SEPOLIA_LINK_TOKEN,
            SEPOLIA_VRF_COORDINATOR,
            SEPOLIA_VRF_SUB_ID,
            SEPOLIA_VRF_500_GWEI_KEY_HASH
        );

        vm.stopBroadcast();

        console.log("PredictionPoolToken deployed address", address(token));
    }
}
