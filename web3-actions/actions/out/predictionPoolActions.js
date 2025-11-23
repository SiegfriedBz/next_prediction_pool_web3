"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewRoundResolved = void 0;
const ethers_1 = require("ethers");
const PredictionPool_json_1 = __importDefault(require("./abi/PredictionPool.json"));
const PredictionPoolToken_json_1 = __importDefault(require("./abi/PredictionPoolToken.json"));
const PredictionPool_Token_Address = "0xddd3c73caE8541FC6Ea119C1BffC5B6547D33eCf";
const predictionPoolIface = new ethers_1.Interface(PredictionPool_json_1.default.abi);
const predictionPoolTokenIface = new ethers_1.Interface(PredictionPoolToken_json_1.default.abi);
const eventFragment = predictionPoolIface.getEvent("PredictionPool_RoundResolved");
if (!eventFragment) {
    throw new Error("Event fragment for 'PredictionPool_RoundResolved' not found in ABI.");
}
const eventTopic = eventFragment.topicHash;
// mint predictionPoolToken
async function sendMintTransaction(provider, privateKey, to, recipient) {
    const wallet = new ethers_1.Wallet(privateKey, provider);
    const data = predictionPoolTokenIface.encodeFunctionData("mint", [recipient]);
    const tx = { to, value: 0, data, gasLimit: 500000, speed: "fast" };
    try {
        const txResponse = await wallet.sendTransaction(tx);
        console.log("ERC1155 Mint Transaction sent! Hash:", txResponse.hash);
        const receipt = await txResponse.wait();
        console.log("ERC1155 Mint Transaction mined in block", receipt);
    }
    catch (error) {
        console.error("Error sending ERC1155 Mint Transaction:", error);
    }
}
/**
 * on predictionPool PredictionPool_RoundResolved event
 *
 * @note
 * YAML triggers on an event, but doesn't pass just that event to the action —
 * it passes the whole transaction that emitted it.
 *
 * Therefore, the `event` parameter here is actually a full `TransactionEvent`,
 * not just a single contract event.
 */
const onNewRoundResolved = async (context, event) => {
    const txEvent = event;
    try {
        const rpcKey = await context.secrets.get("RPC_URL_KEY");
        const rpcUrl = `https://sepolia.gateway.tenderly.co/${rpcKey}`;
        const provider = new ethers_1.JsonRpcProvider(rpcUrl, undefined, {
            staticNetwork: true,
        });
        console.log("📦 Transaction logs received:", txEvent.logs);
        const matchingLog = txEvent.logs.find((log) => log.topics[0] === eventTopic);
        if (!matchingLog) {
            console.log("❌ No matching PredictionPool_RoundResolved event found.");
            return;
        }
        console.log("✅ Matching event log found:", matchingLog);
        const parsedLog = predictionPoolIface.parseLog(matchingLog);
        if (!parsedLog) {
            throw new Error("Error while parsing the logs");
        }
        const { roundId, creator, creatorIsWinner } = parsedLog.args;
        console.log("🎯 Event parsed successfully:");
        console.log(`  • roundId: ${roundId.toString()}`);
        console.log(`  • creator: ${creator}`);
        console.log(`  • creatorIsWinner: ${creatorIsWinner}`);
        if (creatorIsWinner) {
            const privateKey = await context.secrets.get("PRIVATE_KEY");
            await sendMintTransaction(provider, privateKey, PredictionPool_Token_Address, creator);
        }
    }
    catch (error) {
        console.error("❌ Error processing event:", error);
    }
};
exports.onNewRoundResolved = onNewRoundResolved;
//# sourceMappingURL=predictionPoolActions.js.map