// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title PredictionPool Game - Chainlink Price Feeds & Chainlink Automation
 * @author Siegfried Bozza
 */

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {AggregatorV3Interface} from "@chainlink/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/interfaces/AutomationCompatibleInterface.sol";

error PredictionPool_CanBetOnlyOncePerRound();
error PredictionPool_RoundIsNotActive();
error PredictionPool_InvalidValue();
error PredictionPool_InvalidFeed();
error PredictionPool_InvalidDuration();
error PredictionPool_AlreadyResolved();
error PredictionPool_TooEarlyTooResolve();
error PredictionPool_InvalidChainlinkDecimals(uint8 decimals);
error PredictionPool_NegativeChainlinkPrice();
error PredictionPool_RoundNotResolved();
error PredictionPool_AlreadyClaimed();
error PredictionPool_NotAWinner();
error PredictionPool_RewardTransferFailed();
error PredictionPool_ZeroAddressNotAllowed();

contract PredictionPool is Ownable, AutomationCompatibleInterface, ReentrancyGuard {
    /**
     * events
     */
    event PredictionPool_RoundCreated(
        uint256 indexed roundId, address indexed player, uint256 indexed value, BetSide betSide, uint256 end
    );
    event PredictionPool_NewBet(
        uint256 indexed roundId, address indexed player, uint256 indexed value, BetSide betSide, uint256 playTime
    );
    event PredictionPool_NewRoundStatus(uint256 indexed roundId, RoundStatus indexed status);
    event PredictionPool_RoundResolved(uint256 indexed roundId, address indexed creator, bool indexed creatorIsWinner);
    event PredictionPool_PriceFeedToggled(address indexed feed, bool indexed enabled);
    event PredictionPool_RewardClaimed(uint256 indexed roundId, address indexed player, uint256 indexed value);
    event PredictionPool_NewMinRoundDuration(uint256 indexed duration);

    /**
     *  constants
     */
    uint256 public constant STRICT_MIN_ROUND_DURATION = 2 minutes;

    /**
     *  storage
     */
    uint256 public minRoundDuration;
    uint256 public nextRoundId;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => Bet)) public roundToPlayerBet;
    mapping(uint256 => address[]) roundToGtePlayers;
    mapping(uint256 => address[]) roundToLtPlayers;
    mapping(uint256 => mapping(address => bool)) public isRoundWinner;
    mapping(address => bool) public allowedDataFeeds; // allowed chainlink pairs priceFeeds
    address[] public allowedDataFeedsList;

    /**
     * types
     */
    struct Round {
        uint256 id;
        address creator;
        RoundStatus status;
        uint256 gteTotal; // total ETH bet by gtePlayers
        uint256 ltTotal; // total ETH bet by ltPlayers
        address priceFeed; // address of the chainlink pair priceFeed for this round
        uint256 target; // target price
        uint256 end; // timestamp when round ends
    }

    struct Bet {
        uint256 amount; // eth amount placed for this bet
        uint256 time; // timestamp when user placed its bet on roundId
        bool claimed;
    }

    enum BetSide {
        Lt, // 0
        Gte // 1
    }

    enum RoundStatus {
        NotStarted,
        Active,
        Ended,
        Resolved
    }

    /**
     * Allows interaction only if round is Active
     * note possibly mutate the state : transitions from Active to Ended if time passed.
     */
    modifier roundIsActive(uint256 _roundId) {
        Round storage round = rounds[_roundId];

        if (round.status == RoundStatus.Active && block.timestamp >= round.end) {
            round.status = RoundStatus.Ended;
            emit PredictionPool_NewRoundStatus(_roundId, round.status);
        }

        if (round.status != RoundStatus.Active) {
            revert PredictionPool_RoundIsNotActive();
        }
        _;
    }

    modifier betOnlyOncePerRound(uint256 _roundId) {
        if (roundToPlayerBet[_roundId][msg.sender].time != 0) {
            revert PredictionPool_CanBetOnlyOncePerRound();
        }
        _;
    }

    modifier isValidFeed(address _feed) {
        if (!allowedDataFeeds[_feed]) {
            revert PredictionPool_InvalidFeed();
        }
        _;
    }

    modifier isValidValue() {
        if (msg.value == 0) {
            revert PredictionPool_InvalidValue();
        }
        _;
    }

    modifier isValidDuration(uint256 _duration) {
        if (_duration < minRoundDuration) {
            revert PredictionPool_InvalidDuration();
        }
        _;
    }

    /**
     * @param _allowedDataFeeds the allowed chainlink price feeds (i.e. allowed pairs on which to play)
     */
    constructor(address[] memory _allowedDataFeeds, uint256 _minRoundDuration) Ownable() {
        for (uint256 i = 0; i < _allowedDataFeeds.length; i++) {
            address _dataFeed = _allowedDataFeeds[i];
            if (_dataFeed == address(0)) {
                revert PredictionPool_ZeroAddressNotAllowed();
            }
            allowedDataFeeds[_dataFeed] = true;
            allowedDataFeedsList.push(_dataFeed);
        }

        if (_minRoundDuration < STRICT_MIN_ROUND_DURATION) {
            revert PredictionPool_InvalidDuration();
        }
        minRoundDuration = _minRoundDuration;
    }

    /**
     * @param _roundId the round for upon which to check status
     * returns whether the round’s time has ended and has status set to active || ended
     */
    function roundIsReadyForUpkeep(uint256 _roundId) public view returns (bool) {
        Round storage round = rounds[_roundId];

        return (round.status == RoundStatus.Active || round.status == RoundStatus.Ended) && block.timestamp >= round.end;
    }

    /**
     * @notice Called by Chainlink Automation to check if any rounds need upkeep.
     * note checkData param - Unused parameter that can be used for custom data if needed.
     * @return upkeepNeeded - Boolean indicating whether upkeep is required.
     * @return performData - Encoded data (round IDs) to be passed to `performUpkeep` if upkeep is needed.
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Create a temporary array to store candidate round IDs that might need upkeep.
        // Size is 'nextRoundId' because rounds are identified from 0 up to nextRoundId - 1.
        uint256[] memory rawRoundIdsToUpkeep = new uint256[](nextRoundId);

        // Counter to keep track of how many rounds actually need upkeep.
        uint256 count = 0;

        // Iterate over all existing rounds.
        for (uint256 i = 0; i < nextRoundId; ++i) {
            // Check if round with id 'i' is ready to be resolved
            if (roundIsReadyForUpkeep(i)) {
                rawRoundIdsToUpkeep[count] = i;
                count++;
            }
        }

        // If no rounds need upkeep, return false and empty performData.
        if (count == 0) {
            upkeepNeeded = false;
            performData = "";
        } else {
            // If some rounds need upkeep, create a trimmed array containing only those rounds.
            uint256[] memory roundIdsToUpkeep = new uint256[](count);
            for (uint256 j = 0; j < count; ++j) {
                roundIdsToUpkeep[j] = rawRoundIdsToUpkeep[j];
            }

            // Mark upkeep as needed & encode the round IDs for performUpkeep.
            upkeepNeeded = true;
            performData = abi.encode(roundIdsToUpkeep);
        }
    }

    /**
     * @notice Called by Chainlink Automation to perform upkeep on rounds that are ready.
     * @param performData - Encoded round IDs that were returned by `checkUpkeep`.
     */
    function performUpkeep(bytes calldata performData) external override {
        // Decode the array of round IDs from params
        uint256[] memory roundIdsFromData = abi.decode(performData, (uint256[]));

        // Check - Iterate through each round ID & check if actually requires upkeep.
        for (uint256 i = 0; i < roundIdsFromData.length; ++i) {
            uint256 roundId = roundIdsFromData[i];

            if (roundIsReadyForUpkeep(roundId)) {
                // Resolve the round
                _resolveRound(roundId);
            }
        }
    }

    function createRound(address _feed, uint256 _target, BetSide _betSide, uint256 _duration)
        public
        payable
        isValidValue
        isValidFeed(_feed)
        isValidDuration(_duration)
    {
        // create new round
        uint256 end = block.timestamp + _duration;

        Round storage round = rounds[nextRoundId];
        round.id = nextRoundId;
        round.creator = msg.sender;
        round.status = RoundStatus.Active;
        round.priceFeed = _feed;
        round.target = _target;
        round.end = end;

        if (_betSide == BetSide.Gte) {
            round.gteTotal = msg.value;
            roundToGtePlayers[nextRoundId].push(msg.sender);
        } else {
            round.ltTotal = msg.value;
            roundToLtPlayers[nextRoundId].push(msg.sender);
        }

        // attach msg.sender to a new bet for this round
        Bet storage newBet = roundToPlayerBet[nextRoundId][msg.sender];
        newBet.amount = msg.value;
        // newBet.side = _betSide;
        newBet.time = block.timestamp;

        emit PredictionPool_RoundCreated(nextRoundId, msg.sender, msg.value, _betSide, end);
        emit PredictionPool_NewBet(nextRoundId, msg.sender, msg.value, _betSide, block.timestamp);

        nextRoundId++;
    }

    function betOn(uint256 _roundId, BetSide _betSide)
        public
        payable
        isValidValue
        roundIsActive(_roundId)
        betOnlyOncePerRound(_roundId)
    {
        Round storage round = rounds[_roundId];

        if (_betSide == BetSide.Gte) {
            round.gteTotal += msg.value;
            roundToGtePlayers[_roundId].push(msg.sender);
        } else {
            round.ltTotal += msg.value;
            roundToLtPlayers[_roundId].push(msg.sender);
        }

        Bet storage newBet = roundToPlayerBet[_roundId][msg.sender];
        newBet.amount = msg.value;
        // newBet.side = _betSide;
        newBet.time = block.timestamp;

        emit PredictionPool_NewBet(_roundId, msg.sender, msg.value, _betSide, block.timestamp);
    }

    /**
     * triggered by ChainLink Keepers
     */
    function _resolveRound(uint256 _roundId) private {
        Round storage round = rounds[_roundId];

        round.status = RoundStatus.Resolved;
        emit PredictionPool_NewRoundStatus(_roundId, round.status);

        uint256 normalizedPrice = getChainlinkDataFeedNormalizedPrice(round.priceFeed);
        bool isGteTarget = round.target <= normalizedPrice;

        // set winners
        address[] memory winners = isGteTarget ? roundToGtePlayers[_roundId] : roundToLtPlayers[_roundId];
        for (uint256 i = 0; i < winners.length; ++i) {
            isRoundWinner[_roundId][winners[i]] = true;
        }

        // check if round creator is winner
        address roundCreator = round.creator;
        bool roundCreatorIsWinner = isRoundWinner[_roundId][roundCreator];

        emit PredictionPool_RoundResolved(_roundId, roundCreator, roundCreatorIsWinner);
    }

    function claimReward(uint256 _roundId) public nonReentrant {
        Round storage round = rounds[_roundId];
        Bet storage bet = roundToPlayerBet[_roundId][msg.sender];

        if (round.status != RoundStatus.Resolved) {
            revert PredictionPool_RoundNotResolved();
        }

        if (bet.claimed) {
            revert PredictionPool_AlreadyClaimed();
        }

        // Check if winner
        bool isWinner = isRoundWinner[_roundId][msg.sender];

        if (!isWinner) {
            revert PredictionPool_NotAWinner();
        }

        // Calculate payout
        uint256 playerWeight = getBetWeight(_roundId, msg.sender);
        uint256 totalWeight = getTotalWeight(_roundId);

        uint256 rewardPool = round.gteTotal + round.ltTotal;
        uint256 payout = (rewardPool * playerWeight) / totalWeight;

        // Mark as claimed and send funds
        bet.claimed = true;

        emit PredictionPool_RewardClaimed(_roundId, msg.sender, payout);

        (bool success,) = msg.sender.call{value: payout}("");
        if (!success) {
            revert PredictionPool_RewardTransferFailed();
        }
    }

    /**
     * Returns the latest Chainlink normalizedPrice.
     */
    function getChainlinkDataFeedNormalizedPrice(address _dataFeed)
        public
        view
        isValidFeed(_dataFeed)
        returns (uint256 normalizedPrice)
    {
        uint8 decimals = AggregatorV3Interface(_dataFeed).decimals();

        if (decimals > 18) {
            revert PredictionPool_InvalidChainlinkDecimals(decimals);
        }

        int256 price = _getChainlinkDataFeedLatestAnswer(_dataFeed);

        if (price <= 0) {
            revert PredictionPool_NegativeChainlinkPrice();
        }

        normalizedPrice = uint256(price) * (10 ** (18 - decimals));
    }

    function getRound(uint256 _roundId) public view returns (Round memory) {
        return rounds[_roundId];
    }

    /**
     * Returns the latest Chainlink answer.
     */
    function _getChainlinkDataFeedLatestAnswer(address _dataFeed) private view returns (int256) {
        AggregatorV3Interface dataFeed = AggregatorV3Interface(_dataFeed);
        // prettier-igNore
        (
            /* uint80 roundId */
            ,
            int256 answer,
            /*uint256 startedAt*/
            ,
            /*uint256 updatedAt*/
            ,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    /**
     * Returns the bet weight for a round - player
     */
    function getBetWeight(uint256 _roundId, address player) public view returns (uint256) {
        Bet storage bet = roundToPlayerBet[_roundId][player];
        Round storage round = rounds[_roundId];

        // earlier bet = higher weight; linearly scaled
        uint256 timeFactor = ((round.end - bet.time) * 1e18) / minRoundDuration; // normalized to 1e18

        return (bet.amount * timeFactor) / 1e18; // weight also normalized
    }

    /**
     * Returns the total bet weight for a round
     */
    function getTotalWeight(uint256 _roundId) public view returns (uint256 totalWeight) {
        address[] memory gtePlayers = roundToGtePlayers[_roundId];
        address[] memory ltPlayers = roundToLtPlayers[_roundId];

        for (uint256 i = 0; i < gtePlayers.length; ++i) {
            totalWeight += getBetWeight(_roundId, gtePlayers[i]);
        }

        for (uint256 i = 0; i < ltPlayers.length; ++i) {
            totalWeight += getBetWeight(_roundId, ltPlayers[i]);
        }
    }

    /**
     * onlyOwner
     * Note centralization issue
     */
    function toggleAllowPriceFeed(address _dataFeed) public onlyOwner {
        bool enabled = allowedDataFeeds[_dataFeed];

        if (_dataFeed == address(0)) {
            revert PredictionPool_ZeroAddressNotAllowed();
        }

        if (enabled) {
            delete allowedDataFeeds[_dataFeed];

            uint256 len = allowedDataFeedsList.length;
            for (uint256 i = 0; i < len; ++i) {
                if (allowedDataFeedsList[i] == _dataFeed) {
                    allowedDataFeedsList[i] = allowedDataFeedsList[len - 1];
                    allowedDataFeedsList.pop();
                    break;
                }
            }
        } else {
            allowedDataFeeds[_dataFeed] = true;
            allowedDataFeedsList.push(_dataFeed);
        }

        emit PredictionPool_PriceFeedToggled(_dataFeed, !enabled);
    }

    /**
     * onlyOwner
     * Note centralization issue
     */
    function setRoundDuration(uint256 _duration) public onlyOwner {
        if (_duration < STRICT_MIN_ROUND_DURATION) {
            revert PredictionPool_InvalidDuration();
        }
        minRoundDuration = _duration;

        emit PredictionPool_NewMinRoundDuration(_duration);
    }
}
