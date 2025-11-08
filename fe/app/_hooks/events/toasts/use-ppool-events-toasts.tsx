"use client";

import { watchContractEvent } from "@wagmi/core";
import {
	CheckCircle2Icon,
	CoinsIcon,
	SparklesIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { wagmiWsConfig } from "../../../_config/wagmi";
import { getPredictionPoolContractConfig } from "../../../_contracts/prediction-pool";
import { PPoolEvents, PPoolEventsT, SCEventToast } from "../types";

const PPoolEventsRecord: Record<PPoolEventsT, SCEventToast> = {
	[PPoolEvents.enum.RoundCreated]:
		{
			eventName: "PredictionPool_RoundCreated",
			eventDefinition:
				"event PredictionPool_RoundCreated(uint256 indexed roundId, address indexed player, uint256 indexed value, BidSide bidSide, uint256 end)",
			displayName: "New Game!",
			icon: SparklesIcon,
		}
	,
	[PPoolEvents.enum.NewBet]:
		{
			eventName: "PredictionPool_NewBet",
			eventDefinition:
				"event PredictionPool_NewBet(uint256 indexed roundId, address indexed player, uint256 indexed value, BidSide bidSide, uint256 playTime)",
			displayName: "New Bet!",
			icon: CoinsIcon,
		}
	,
	[PPoolEvents.enum.RoundResolved]:
		{
			eventName: "PredictionPool_RoundResolved",
			eventDefinition:
				"event PredictionPool_RoundResolved(uint256 indexed roundId, address indexed creator, bool indexed creatorIsWinner)",
			displayName: "Game resolved!",
			icon: CheckCircle2Icon,
		},
}

type UsePPoolEventsToastsParams = {
	key: PPoolEventsT;
};

// Real Time Listener for On-Chain Events emitted from PredictionPool SC
// Display corresponding Toasts
// Switched on/off manually by user on GameListenerToastsSwitch
export const usePPoolEventsToasts = (params: UsePPoolEventsToastsParams) => {
	const { key } = params;

	const chainId = useChainId();

	const eventConfig = useMemo(() => {
		const cfg = PPoolEventsRecord[key];
		if (!cfg) return null;

		return {
			...cfg,
			contractConfig: getPredictionPoolContractConfig(chainId),
		};
	}, [key, chainId]);

	useEffect(() => {
		if (!eventConfig || !eventConfig.contractConfig.address) return;

		const {
			eventName,
			// eventDefinition,
			displayName,
			icon: Icon,
			contractConfig: { address, abi },
		} = eventConfig;

		const unwatch = watchContractEvent(wagmiWsConfig, {
			address,
			abi,
			eventName,
			onLogs(logs) {
				console.log("📡 usePPoolEventsToasts - Event logs :", logs);

				if (displayName != null) {
					toast(
						<div className="flex items-center gap-x-2">
							<Icon className="w-5 h-5 text-chart-2" />
							<span className="text-sm sm:text-base">{displayName}</span>
						</div>,
					);
				}
			},
		});

		return () => {
			unwatch();
		};
	}, [eventConfig]);

	return null;
};

