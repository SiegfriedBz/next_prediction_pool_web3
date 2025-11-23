// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {
    PredictionPoolToken,

    // errors
    PredictionPoolToken_NoZeroAddress,
    PredictionPoolToken_RequestAlreadyFulfilled
} from "../src/PredictionPoolToken.sol";
import {PredictionPoolTokenScript} from "../script/PredictionPoolTokenScript.s.sol";
import {Constants_PredictionPoolToken} from "../script/Constants_PredictionPoolToken.sol";
import {VRFCoordinatorV2_5Mock} from "./mocks/vrf/VRFCoordinatorV2_5Mock.sol";

contract PredictionPoolTokenTest is Test, Constants_PredictionPoolToken {
    PredictionPoolToken pPoolToken;
    VRFCoordinatorV2_5Mock public vrfCoordinatorMock;

    address owner = address(uint160(uint256(vm.envUint("MY_ADDRESS"))));
    address winner_01 = makeAddr("winner_01");
    address winner_02 = makeAddr("winner_02");
    address nonAdmin = makeAddr("nonAdmin");
    address nonMinter = makeAddr("nonMinter");
    address zeroAddress = address(0);

    bytes32 minterRole = keccak256("minterRole");

    function setUp() public {
        // Deploy PredictionPoolToken using the script
        PredictionPoolTokenScript deployer = new PredictionPoolTokenScript();
        pPoolToken = deployer.run();

        // Deploy VRF coordinator mock with zero fees for testing
        vm.prank(owner);
        vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(
            0, // Zero base fee
            0, // Zero gas price
            1 // 1 wei per unit LINK (irrelevant for native payment)
        );

        // Create a new VRF subscription
        vm.prank(owner);
        uint256 subscriptionId = vrfCoordinatorMock.createSubscription();

        // Configure the PredictionPoolToken contract with the subscription and coordinator
        vm.prank(owner);
        pPoolToken.setVrfSubscriptionId(subscriptionId);
        vm.prank(owner);
        pPoolToken.setCoordinator(address(vrfCoordinatorMock));

        // Fund the subscription with 1 LINK
        vm.prank(owner);
        vrfCoordinatorMock.fundSubscription(subscriptionId, 1);

        // Add the PredictionPoolToken contract as a consumer to the subscription
        vm.prank(owner);
        vrfCoordinatorMock.addConsumer(subscriptionId, address(pPoolToken));

        // assertTrue(vrfCoordinatorMock.consumerIsAdded(subscriptionId, address(PredictionPoolToken)));
    }

    // === deployment Tests ===
    function test_deployment() public view {
        assertEq(pPoolToken.owner(), owner);
        assertTrue(pPoolToken.hasRole(pPoolToken.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(pPoolToken.hasRole(pPoolToken.MINTER_ROLE(), owner));
        assertEq(pPoolToken.i_maxTokenId(), MAX_TOKEN_ID);
        assertEq(pPoolToken.i_vrf_keyHash(), SEPOLIA_VRF_500GweiKeyHash);
        assertEq(pPoolToken.i_linkToken(), SEPOLIA_LINK_TOKEN);
    }

    // === Mint Tests ===
    function test_mint_Emits_RequestSent_Event() public {
        // Mint a pPoolToken as owner
        vm.expectEmit();
        emit PredictionPoolToken.PredictionPoolToken_RequestSent(winner_01, 1);

        vm.prank(owner);
        pPoolToken.mint(winner_01); // => Request ID = 1
    }

    function test_mint_StoresRequest() public {
        // Mint a pPoolToken as owner
        vm.prank(owner);
        pPoolToken.mint(winner_01);

        // Verify the request is stored
        (address requestTo, bool requestFulfilled, bool requestExists) = pPoolToken.s_requests(1);
        assertEq(requestTo, winner_01);
        assertFalse(requestFulfilled);
        assertTrue(requestExists);
    }

    function test_mint_WhenFulfilledRequest_Emits_Mint_Event() public {
        // Mint a pPoolToken as owner
        vm.prank(owner);
        pPoolToken.mint(winner_01); // => Request ID = 1

        // Simulate VRF fulfillment with a fixed random number
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 42;
        uint256 expectedTokenId = 42 % MAX_TOKEN_ID;

        vm.expectEmit();
        emit PredictionPoolToken.PredictionPoolToken_Mint(winner_01, expectedTokenId);

        hoax(owner);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(1, address(pPoolToken), randomWords);
    }

    function test_multipleMints() public {
        hoax(owner);
        pPoolToken.mint(winner_01); // => Request ID = 1
        hoax(owner);
        pPoolToken.mint(winner_02); // => Request ID = 2

        // Fulfill both requests
        uint256[] memory randomWords_01 = new uint256[](1);
        randomWords_01[0] = 42;
        uint256 expectedTokenId_01 = 42 % MAX_TOKEN_ID;

        uint256[] memory randomWords_02 = new uint256[](1);
        randomWords_02[0] = 24;
        uint256 expectedTokenId_02 = 24 % MAX_TOKEN_ID;

        // Fullfill & Verify Mint Events
        vm.expectEmit();
        emit PredictionPoolToken.PredictionPoolToken_Mint(winner_01, expectedTokenId_01);
        hoax(owner);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(1, address(pPoolToken), randomWords_01);

        vm.expectEmit();
        emit PredictionPoolToken.PredictionPoolToken_Mint(winner_02, expectedTokenId_02);
        hoax(owner);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(2, address(pPoolToken), randomWords_02);

        // Verify tokens were minted
        assertEq(pPoolToken.balanceOf(winner_01, expectedTokenId_01), 1);
        assertEq(pPoolToken.balanceOf(winner_02, expectedTokenId_02), 1);
    }

    function test_mint_RevertWhen_NotMinter() public {
        // Try to mint as a non-minter
        vm.prank(nonMinter);
        vm.expectRevert();
        pPoolToken.mint(winner_01);
    }

    function test_mint_RevertWhen_MintToZeroAddress() public {
        // Try to mint to zero address
        vm.prank(owner);
        vm.expectRevert(PredictionPoolToken_NoZeroAddress.selector);
        pPoolToken.mint(zeroAddress);
    }

    // === uri Tests ===
    function test_uri() public view {
        string memory uri = pPoolToken.uri(1);
        assertEq(uri, string.concat(TOKEN_URI, "1"));
    }

    // === setVrfSubscriptionId Tests ===
    function test_setVrfSubscriptionId() public {
        uint256 newSubId = 42;
        vm.prank(owner);
        pPoolToken.setVrfSubscriptionId(newSubId);

        assertEq(pPoolToken.s_vrf_subId(), newSubId);
    }

    function test_setVrfSubscriptionId_RevertWhen_NotAdmin() public {
        uint256 newSubId = 42;
        vm.prank(nonAdmin);
        vm.expectRevert();
        pPoolToken.setVrfSubscriptionId(newSubId);
    }

    // === updateVrfSettings Tests ===
    function test_updateVrfSettings() public {
        uint16 requestConfirmations = 12;
        uint32 callbackGasLimit = 24;

        vm.prank(owner);
        vm.expectEmit();
        emit PredictionPoolToken.PredictionPoolToken_UpdateVrfSettings(requestConfirmations, callbackGasLimit);
        pPoolToken.updateVrfSettings(requestConfirmations, callbackGasLimit);

        assertEq(pPoolToken.s_vrf_requestConfirmations(), requestConfirmations);
        assertEq(pPoolToken.s_vrf_callbackGasLimit(), callbackGasLimit);
    }

    function test_updateVrfSettings_RevertWhen_NotAdmin() public {
        uint16 requestConfirmations = 12;
        uint32 callbackGasLimit = 24;

        vm.prank(nonAdmin);
        vm.expectRevert();
        pPoolToken.updateVrfSettings(requestConfirmations, callbackGasLimit);
    }

    // === grantRole Tests ===
    function test_grantRole_SetMinterRole() public {
        vm.prank(owner);
        pPoolToken.grantRole(minterRole, winner_01);

        assertTrue(pPoolToken.hasRole(minterRole, winner_01));
    }

    function test_grantRole__RevertWhen_NotAdmin() public {
        vm.prank(nonAdmin);
        vm.expectRevert();
        pPoolToken.grantRole(minterRole, winner_01);

        assertFalse(pPoolToken.hasRole(minterRole, winner_01));
    }

    // === VRF Fulfillment Tests ===
    function test_fulfillRandomWords() public {
        // Mint a pPoolToken to trigger a VRF request
        hoax(owner);
        pPoolToken.mint(winner_01); // => Request ID = 1

        // Simulate VRF fulfillment with a fixed random number
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 42;

        vm.expectEmit();
        emit PredictionPoolToken.PredictionPoolToken_RequestFulfilled(winner_01, 1);

        hoax(owner);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(1, address(pPoolToken), randomWords);

        // Verify the pPoolToken was minted to the winner_01
        uint256 expectedTokenId_01 = 42 % MAX_TOKEN_ID;

        assertEq(pPoolToken.balanceOf(winner_01, expectedTokenId_01), 1);
    }

    function test_fulfillRandomWords_EdgeCaseTokenIds_Zero() public {
        hoax(owner);
        pPoolToken.mint(winner_01);

        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0; // Edge case: random number = 0

        hoax(owner);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(1, address(pPoolToken), randomWords);
        assertEq(pPoolToken.balanceOf(winner_01, 0 % MAX_TOKEN_ID), 1);
    }

    function test_fulfillRandomWords_EdgeCaseTokenIds_Max() public {
        hoax(owner);
        pPoolToken.mint(winner_01);

        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = type(uint256).max; // Edge case: random number = UINT256_MAX

        hoax(owner);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(1, address(pPoolToken), randomWords);
        assertEq(pPoolToken.balanceOf(winner_01, 0 % MAX_TOKEN_ID), 1);
    }

    function test_fulfillRandomWords_RevertWhen_AlreadyFulfilled() public {
        hoax(owner);
        pPoolToken.mint(winner_01); // => Request ID = 1

        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 42;

        // Fulfill Request ID = 1
        hoax(owner);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(1, address(pPoolToken), randomWords);

        // Try to fulfill again Request ID = 1
        vm.expectRevert(VRFCoordinatorV2_5Mock.InvalidRequest.selector);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(1, address(pPoolToken), randomWords);
    }

    function test_fulfillRandomWords_RevertWhen_RequestNotFound() public {
        uint256 invalidRequestId = 999; // Non-existent request ID

        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 42;

        // MOCK
        vm.expectRevert(VRFCoordinatorV2_5Mock.InvalidRequest.selector);
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(invalidRequestId, address(pPoolToken), randomWords);
    }
}

