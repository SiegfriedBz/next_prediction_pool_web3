"use client";

import { watchContractEvent } from "@wagmi/core";
import {
	BadgeCheckIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { decodeEventLog, parseAbiItem } from "viem";
import { useChainId } from "wagmi";
import { TokenImage } from "../../../_components/token-image";
import { wagmiWsConfig } from "../../../_config/wagmi";
import { getPredictionPoolTokenContractConfig } from "../../../_contracts/prediction-pool-token";
import { PPoolTokenEvents, PPoolTokenEventsT, SCEventToast } from "../types";

const PPoolTokenEventsRecord: Record<PPoolTokenEventsT, SCEventToast> = {
	[PPoolTokenEvents.enum.NewNFTMinted]: 
		{
			eventName: "PredictionPoolToken_Mint",
			eventDefinition:
				"event PredictionPoolToken_Mint(address indexed winner, uint256 indexed tokenId)",
			icon: BadgeCheckIcon,
		},
}

type UsePPoolTokenEventsToastsParams = {
	key: PPoolTokenEventsT;
};

// Real Time Listener for On-Chain Events emitted from PredictionPoolToken SC 
// Display corresponding Toasts
// Switched on/off manually by user on GameListenerToastsSwitch
export const usePPoolTokenEventsToasts = (params: UsePPoolTokenEventsToastsParams) => {
	const { key } = params;

	const chainId = useChainId();

	const eventConfig = useMemo(() => {
		const cfg = PPoolTokenEventsRecord[key];
		if (!cfg) return null;

		return {
			...cfg,
			contractConfig: getPredictionPoolTokenContractConfig(chainId),
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
				console.log("📡 usePPoolTokenEventsToasts - Event logs :", logs);

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
						<div className="flex items-center gap-x-2">
							<TokenImage tokenId={tokenId.toString()} />
							<span className="text-sm sm:text-base">{message}</span>
						</div>,
					);
				} else if (displayName != null) {
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