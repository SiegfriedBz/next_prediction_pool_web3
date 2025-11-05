"use client";

import { watchContractEvent } from "@wagmi/core";
import {
	BadgeCheckIcon,
	CheckCircle2Icon,
	CoinsIcon,
	type LucideIcon,
	SparklesIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { decodeEventLog, parseAbiItem } from "viem";
import { useChainId } from "wagmi";
import { z } from "zod";
import { TokenImage } from "../_components/token-image";
import { wagmiWsConfig } from "../_config/wagmi";
import { getPredictionPoolContractConfig } from "../_contracts/prediction-pool";
import { getPredictionPoolTokenContractConfig } from "../_contracts/prediction-pool-token";
import type { ContractConfigT } from "../_contracts/types";

const EventsList = z.enum([
	"RoundCreated",
	"NewBet",
	"RoundResolved",
	"NewNFTMinted",
]);
export type EventsListT = z.infer<typeof EventsList>;

type EventsMapReturn = {
	eventName: string;
	eventDefinition: string;
	displayName?: string;
	icon: LucideIcon;
	contractConfig: (chainId: number) => ContractConfigT;
};

const EventsConfigMap = new Map<EventsListT, EventsMapReturn>([
	[
		EventsList.enum.RoundCreated,
		{
			eventName: "PredictionPool_RoundCreated",
			eventDefinition:
				"event PredictionPool_RoundCreated(uint256 indexed roundId, address indexed player, uint256 indexed value, BidSide bidSide, uint256 end)",
			displayName: "New Game!",
			icon: SparklesIcon,
			contractConfig: getPredictionPoolContractConfig,
		},
	],
	[
		EventsList.enum.NewBet,
		{
			eventName: "PredictionPool_NewBet",
			eventDefinition:
				"event PredictionPool_NewBet(uint256 indexed roundId, address indexed player, uint256 indexed value, BidSide bidSide, uint256 playTime)",
			displayName: "New Bet!",
			icon: CoinsIcon,
			contractConfig: getPredictionPoolContractConfig,
		},
	],
	[
		EventsList.enum.RoundResolved,
		{
			eventName: "PredictionPool_RoundResolved",
			eventDefinition:
				"event PredictionPool_RoundResolved(uint256 indexed roundId, address indexed creator, bool indexed creatorIsWinner)",
			displayName: "Game resolved!",
			icon: CheckCircle2Icon,
			contractConfig: getPredictionPoolContractConfig,
		},
	],
	[
		EventsList.enum.NewNFTMinted,
		{
			eventName: "PredictionPoolToken_Mint",
			eventDefinition:
				"event PredictionPoolToken_Mint(address indexed winner, uint256 indexed tokenId)",
			icon: BadgeCheckIcon,
			contractConfig: getPredictionPoolTokenContractConfig,
		},
	],
]);

type Params = {
	key: EventsListT;
};

export const useEvents = (params: Params) => {
	const { key } = params;

	const chainId = useChainId();

	const eventConfig = useMemo(() => {
		const cfg = EventsConfigMap.get(key);
		if (!cfg) return null;
		return {
			...cfg,
			contractConfig: cfg.contractConfig(chainId),
		};
	}, [key, chainId]);

	useEffect(() => {
		if (!eventConfig || !eventConfig.contractConfig.address) return;

		const {
			eventName,
			eventDefinition,
			displayName,
			icon: Icon,
			contractConfig: { address, abi },
		} = eventConfig;

		const unwatch = watchContractEvent(wagmiWsConfig, {
			address,
			abi,
			eventName,
			onLogs(logs) {
				console.log("📡 Event logs:", logs);

				if (eventName === "PredictionPoolToken_Mint") {
					const eventAbi = parseAbiItem(eventDefinition);
					const decoded = decodeEventLog({
						abi: [eventAbi],
						data: logs[0].data,
						topics: logs[0].topics,
					});

					const { winner, tokenId } = decoded.args as {
						winner: string;
						tokenId: bigint;
					};

					const shortWinner = `${winner.slice(0, 6)}...${winner.slice(-4)}`;
					const message = `NFT Minted to: ${shortWinner}`;

					toast(
						<div className="flex items-center gap-1">
							<TokenImage tokenId={tokenId.toString()} />
							<span>{message}</span>
						</div>,
					);
				} else if (displayName != null) {
					toast(
						<div className="flex items-center gap-2">
							<Icon className="w-5 h-5 text-chart-2" />
							<span>{displayName}</span>
						</div>,
					);
				}
			},
		});

		return () => {
			console.log("======> unwatch");
			unwatch();
		};
	}, [eventConfig]);

	return null;
};
