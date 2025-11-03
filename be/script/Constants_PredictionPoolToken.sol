// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Constants_PredictionPoolToken {
    string internal constant TOKEN_URI = "ipfs://bafybeif32isnf32jqeppqxzu42jk4vec6ltt7zcy3hozpymgv2a2o3o5ru/";
    uint256 internal constant MAX_TOKEN_ID = 3;

    address public constant SEPOLIA_LINK_TOKEN = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address public constant SEPOLIA_VRF_COORDINATOR = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    uint256 public constant SEPOLIA_VRF_SUB_ID =
        89100369970316042927602179798940854800623608430520766999813944604727008969812;
    bytes32 public constant SEPOLIA_VRF_500GweiKeyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
}
