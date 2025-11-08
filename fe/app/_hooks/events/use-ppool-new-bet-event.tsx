"use client";

import { watchContractEvent } from "@wagmi/core";
import { useEffect, useMemo } from "react";
import { useChainId } from "wagmi";
import { wagmiWsConfig } from "../../_config/wagmi";
import { getPredictionPoolContractConfig } from "../../_contracts/prediction-pool";
import { useQueryClient } from "@tanstack/react-query";
import { useRoundsContext } from "../rounds/use-rounds-context";

// Real Time Listener for On-Chain "NewBet" Event emitted from PredictionPool SC
// event PredictionPool_NewBet(uint256 indexed roundId, address indexed player, uint256 indexed value, BidSide bidSide, uint256 playTime)
export const usePPoolNewBetEvent = () => {
	const queryClient = useQueryClient()

	const chainId = useChainId();

	const contractConfig = useMemo(() => {
		return getPredictionPoolContractConfig(chainId)
	}, [chainId]);

	const { refetchRounds } = useRoundsContext();

	useEffect(() => {
		if (!contractConfig || !contractConfig.address || !contractConfig.abi) return;

		const unwatch = watchContractEvent(wagmiWsConfig, {
			address: contractConfig.address,
			abi: contractConfig.abi,
			eventName: "PredictionPool_NewBet",
			onLogs(logs) {
				const log = logs[0] as unknown as {args: {roundId: bigint}}
				const { roundId } = log.args

				// Invalidate the single round query so that this specific round's data
				// (totals, status, etc.) is refetched from the network.
				// This ensures the UI shows the updated bet totals for this round.
				queryClient.invalidateQueries({
					queryKey: ["round", roundId.toString()],
				});

				// Refetch the global rounds dataset (all statuses): required to refresh all bets amounts on betOnGames Table.
				refetchRounds();
			},
		});

		return () => {

			unwatch();
		};
	}, [contractConfig, queryClient, refetchRounds]);

	return null;
};

