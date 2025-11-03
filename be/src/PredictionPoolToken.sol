//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {VRFConsumerBaseV2Plus} from "./VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "./libraries/VRFV2PlusClient.sol";
/**
 * @title PredictionPool ERC1155 Token - Chainlink VRF
 * @author Siegfried Bozza
 */

contract PredictionPoolToken is ERC1155, AccessControl, VRFConsumerBaseV2Plus {
    using Strings for uint256;

    /**
     * errors
     */
    error PredictionPoolToken_MinTwoTokensToMint();
    error PredictionPoolToken_NoZeroAddress();
    error PredictionPoolToken_RequestNotFound(uint256 requestId);
    error PredictionPoolToken_RequestAlreadyFulfilled(uint256 requestId);

    /**
     * events
     */
    event PredictionPoolToken_RequestSent(address indexed winner, uint256 indexed requestId);
    event PredictionPoolToken_RequestFulfilled(address indexed winner, uint256 indexed requestId);
    event PredictionPoolToken_Mint(address indexed winner, uint256 indexed tokenId);
    event PredictionPoolToken_SetVrfSubId(uint256 indexed subId);
    event PredictionPoolToken_UpdateVrfSettings(uint16 indexed requestConfirmations, uint32 indexed callbackGasLimit);

    // constants
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // immutable
    uint256 public immutable i_maxTokenId;
    uint256 private immutable i_vrf_subId;
    bytes32 public immutable i_vrf_keyHash;
    address public immutable i_linkToken;

    // storage
    uint16 private s_vrf_requestConfirmations = 3;
    uint32 private s_vrf_callbackGasLimit = 150000;

    mapping(address => uint256[]) public s_winnerToMintedTokenIds;
    mapping(uint256 => Request) public s_requests; // requestId => Request

    struct Request {
        address to;
        bool fulfilled;
        bool exists;
    }

    constructor(
        string memory uri_,
        uint256 _maxTokenId,
        address _defaultAdmin,
        address _minter,
        address _linkToken,
        address _vrfCoordinator,
        uint256 _vrf_subId,
        bytes32 _vrf_keyHash
    ) ERC1155(uri_) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        if (_maxTokenId < 2) {
            revert PredictionPoolToken_MinTwoTokensToMint();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(MINTER_ROLE, _minter);
        i_maxTokenId = _maxTokenId;
        i_linkToken = _linkToken;
        i_vrf_subId = _vrf_subId;
        i_vrf_keyHash = _vrf_keyHash;
    }

    /**
     * @notice mint only 1 token
     * @param _to the address to mint to
     */
    function mint(address _to) external onlyRole(MINTER_ROLE) {
        if (_to == address(0)) {
            revert PredictionPoolToken_NoZeroAddress();
        }

        uint256 requestId = _requestRandomWords(_to);

        s_requests[requestId] = Request({to: _to, exists: true, fulfilled: false});
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the ERC].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256 id) public view override returns (string memory) {
        string memory baseURI = super.uri(id);

        return bytes(baseURI).length > 0 ? string.concat(baseURI, id.toString()) : "";
    }

    // Chainlink VRF
    function _requestRandomWords(address _winner) private returns (uint256) {
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_vrf_keyHash,
                subId: i_vrf_subId,
                requestConfirmations: s_vrf_requestConfirmations,
                callbackGasLimit: s_vrf_callbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true})) // new parameter
            })
        );

        emit PredictionPoolToken_RequestSent(_winner, requestId);

        return requestId;
    }

    // Chainlink VRF
    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        Request storage request = s_requests[_requestId];

        if (!request.exists) {
            revert PredictionPoolToken_RequestNotFound(_requestId);
        }
        if (request.fulfilled) {
            revert PredictionPoolToken_RequestAlreadyFulfilled(_requestId);
        }

        request.fulfilled = true;
        address winner = request.to;
        // get a valid token ID in range
        uint256 tokenId = _randomWords[0] % i_maxTokenId;
        s_winnerToMintedTokenIds[winner].push(tokenId);

        emit PredictionPoolToken_RequestFulfilled(winner, _requestId);
        emit PredictionPoolToken_Mint(winner, tokenId);

        _mint(winner, tokenId, 1, hex"");
    }

    // The following function is required by AccessControl.
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // DEFAULT_ADMIN_ROLE functions

    function updateVrfSettings(uint16 _requestConfirmations, uint32 _callbackGasLimit)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        emit PredictionPoolToken_UpdateVrfSettings(_requestConfirmations, _callbackGasLimit);

        s_vrf_requestConfirmations = _requestConfirmations;
        s_vrf_callbackGasLimit = _callbackGasLimit;
    }
}
