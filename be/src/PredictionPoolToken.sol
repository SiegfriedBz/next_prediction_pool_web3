/**
 * @title PredictionPoolToken - ERC1155 Token with Chainlink VRF Minting
 * @author Siegfried Bozza
 * @notice An ERC1155 token where winners mint unique tokens using Chainlink VRF.
 * @dev Features:
 *      - Minting via Chainlink VRF for fairness.
 *      - Access control for minting and admin functions.
 *      - Configurable VRF settings (subscription ID, confirmations, gas limit).
 */

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/VRFV2PlusClient.sol";

error PredictionPoolToken_MinTwoTokensToMint();
error PredictionPoolToken_NoZeroAddress();
error PredictionPoolToken_RequestNotFound(uint256 requestId);
error PredictionPoolToken_RequestAlreadyFulfilled(uint256 requestId);

contract PredictionPoolToken is ERC1155, AccessControl, VRFConsumerBaseV2Plus {
    using Strings for uint256;

    /**
     * events
     */
    event PredictionPoolToken_RequestSent(address indexed winner, uint256 indexed requestId);
    event PredictionPoolToken_RequestFulfilled(address indexed winner, uint256 indexed requestId);
    event PredictionPoolToken_Mint(address indexed winner, uint256 indexed tokenId);
    event PredictionPoolToken_SetVrfSubId(uint256 indexed subId);
    event PredictionPoolToken_UpdateVrfSettings(uint16 indexed requestConfirmations, uint32 indexed callbackGasLimit);

    /**
     * constants
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // Role required to mint tokens.

    /**
     * immutable
     */
    uint256 public immutable I_MAX_TOKEN_ID; // Maximum token ID (exclusive) for this contract.
    bytes32 public immutable I_VRF_KEY_HASH; // Chainlink VRF key hash for this contract.
    address public immutable I_LINK_TOKEN; // LINK token Address for VRF payments.

    /**
     * storage
     */
    uint256 public sVrfSubId; // Current VRF subscription ID.
    uint16 public sVrfRequestConfirmations = 3; // Number of confirmations required for VRF requests.
    uint32 public sVrfCallbackGasLimit = 150000; // Gas limit for VRF callback.

    mapping(address => uint256[]) public sWinnerToMintedTokenIds; // Maps winners to their minted token IDs.
    mapping(uint256 => Request) public sRequests; // Maps VRF request IDs to their details.

    /**
     * types
     */
    /// @notice Represents a VRF request for minting a token.
    /// @dev Fields:
    ///      - `to`: Address of the winner to mint to.
    ///      - `fulfilled`: Whether the request has been fulfilled.
    ///      - `exists`: Whether the request exists.
    struct Request {
        address to;
        bool fulfilled;
        bool exists;
    }

    /**
     * constructor
     */
    /// @notice Initializes the ERC1155 token with VRF settings and access control.
    /// @dev Reverts if `_maxTokenId < 2` (minimum 2 tokens required).
    ///      Grants `DEFAULT_ADMIN_ROLE` to `_defaultAdmin` and `MINTER_ROLE` to `_minter`.
    /// @param uri_ Base URI for token metadata.
    /// @param _maxTokenId Maximum token ID (exclusive).
    /// @param _defaultAdmin Address to grant admin role.
    /// @param _minter Address to grant minter role.
    /// @param _linkToken Address of the LINK token.
    /// @param _vrfCoordinator Address of the VRF coordinator.
    /// @param _vrfSubId VRF subscription ID.
    /// @param _vrfKeyHash VRF key hash.
    constructor(
        string memory uri_,
        uint256 _maxTokenId,
        address _defaultAdmin,
        address _minter,
        address _linkToken,
        address _vrfCoordinator,
        uint256 _vrfSubId,
        bytes32 _vrfKeyHash
    ) ERC1155(uri_) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        if (_maxTokenId < 2) {
            revert PredictionPoolToken_MinTwoTokensToMint();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(MINTER_ROLE, _minter);
        I_MAX_TOKEN_ID = _maxTokenId;
        I_LINK_TOKEN = _linkToken;
        I_VRF_KEY_HASH = _vrfKeyHash;
        sVrfSubId = _vrfSubId;
    }

    /**
     * functions
     */

    /// @notice Requests a random number from Chainlink VRF to mint a token.
    /// @dev Reverts if `_to` is the zero address.
    ///      Emits `PredictionPoolToken_RequestSent` with the request ID.
    /// @param _to Address to mint the token to.
    function mint(address _to) external onlyRole(MINTER_ROLE) {
        if (_to == address(0)) {
            revert PredictionPoolToken_NoZeroAddress();
        }

        uint256 requestId = _requestRandomWords(_to);

        sRequests[requestId] = Request({to: _to, exists: true, fulfilled: false});
    }

    /// @notice Returns the metadata URI for a token.
    /// @dev Appends the token ID to the base URI (e.g., `baseURI/tokenId`).
    ///      Returns an empty string if no base URI is set.
    /// @param id Token ID.
    /// @return string Metadata URI.
    /**
     *
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

    /// @notice Requests random words from Chainlink VRF for token minting.
    /// @dev Uses `s_vrfCoordinator.requestRandomWords` with:
    ///      - `keyHash`: `I_VRF_KEY_HASH`.
    ///      - `subId`: `sVrfSubId`.
    ///      - `nativePayment`: `true` (pays in native token).
    ///      Emits `PredictionPoolToken_RequestSent`.
    /// @param _winner Address of the winner to mint to.
    /// @return uint256 VRF request ID.
    function _requestRandomWords(address _winner) private returns (uint256) {
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: I_VRF_KEY_HASH,
                subId: sVrfSubId,
                requestConfirmations: sVrfRequestConfirmations,
                callbackGasLimit: sVrfCallbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true})) // new parameter
            })
        );

        emit PredictionPoolToken_RequestSent(_winner, requestId);

        return requestId;
    }

    /// @notice Callback for Chainlink VRF to fulfill a random words request.
    /// @dev Reverts if:
    ///      - Request does not exist.
    ///      - Request is already fulfilled.
    ///      Mints a token with ID `_randomWords[0] % I_MAX_TOKEN_ID` to the winner.
    ///      Emits `PredictionPoolToken_RequestFulfilled` and `PredictionPoolToken_Mint`.
    /// @param _requestId VRF request ID.
    /// @param _randomWords Array of random words from VRF.
    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        Request storage request = sRequests[_requestId];

        if (!request.exists) {
            revert PredictionPoolToken_RequestNotFound(_requestId);
        }
        if (request.fulfilled) {
            revert PredictionPoolToken_RequestAlreadyFulfilled(_requestId);
        }

        request.fulfilled = true;
        address winner = request.to;
        // get a valid token ID in range
        uint256 tokenId = _randomWords[0] % I_MAX_TOKEN_ID;
        sWinnerToMintedTokenIds[winner].push(tokenId);

        emit PredictionPoolToken_RequestFulfilled(winner, _requestId);
        emit PredictionPoolToken_Mint(winner, tokenId);

        _mint(winner, tokenId, 1, hex"");
    }

    /// @notice Checks if the contract supports a given interface to ensure compatibility.
    /// @param interfaceId Interface ID to check.
    /// @return bool True if the interface is supported.
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Updates VRF request settings (confirmations and gas limit).
    /// @dev Emits `PredictionPoolToken_UpdateVrfSettings`.
    ///      Only callable by `DEFAULT_ADMIN_ROLE`.
    /// @param _requestConfirmations Number of confirmations required for VRF.
    /// @param _callbackGasLimit Gas limit for VRF callback.
    function updateVrfSettings(uint16 _requestConfirmations, uint32 _callbackGasLimit)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        emit PredictionPoolToken_UpdateVrfSettings(_requestConfirmations, _callbackGasLimit);

        sVrfRequestConfirmations = _requestConfirmations;
        sVrfCallbackGasLimit = _callbackGasLimit;
    }

    /// @notice Updates the VRF subscription ID.
    /// @dev Only callable by `DEFAULT_ADMIN_ROLE`.
    /// @param _subId New VRF subscription ID.
    function setVrfSubscriptionId(uint256 _subId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        sVrfSubId = _subId;
    }
}
