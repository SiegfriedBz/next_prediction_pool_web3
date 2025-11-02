"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { getPredictionPoolContractConfig } from "@/app/_contracts/prediction-pool";
import type { Bet, RawBet, Round, RoundWithPlayerBet } from "@/app/_types";
import type { RefetchType } from "./type";

type Params = {
	resolvedRounds: Round[];
};

type ReturnType = {
	resolvedRoundsWithPlayerBets: RoundWithPlayerBet[];
	isLoadingResolvedRoundsWithPlayerBets: boolean;
	errorFetchingResolvedRoundsWithPlayerBets: ReadContractsErrorType | null;
	refetchResolvedRoundsWithPlayerBets: RefetchType<ReadContractsErrorType>;
};

export const usePlayerBetsOnResolvedRounds = (params: Params): ReturnType => {
	const { resolvedRounds } = params;

	const { address } = useAccount();
	const chainId = useChainId();

	const contractConfig = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// prepare contract calls
	const roundToPlayerBetCalls = useMemo(() => {
		if (!address || resolvedRounds.length === 0) return [];

		return resolvedRounds.map((round) => ({
			...contractConfig,
			functionName: "roundToPlayerBet",
			args: [round.id, address],
			query: {
				queryKey: ["round-to-player-bet", `${round.id}-${address}`], // unique per round / user
			},
		}));
	}, [address, resolvedRounds, contractConfig]);

	// execute contract calls : get all player's bets on all resolved rounds concurrently
	const { data, isLoading, error, refetch } = useReadContracts({
		contracts: roundToPlayerBetCalls,
		query: { enabled: roundToPlayerBetCalls.length > 0 && !!address },
	});

	// compute rounds With Player Bets
	const roundsWithPlayerBets = useMemo(() => {
		if (!resolvedRounds || !data) return [];

		return resolvedRounds.map((round, i) => {
			const raw = data[i]?.result;
			const playerBet = Array.isArray(raw) ? parseBet(raw as RawBet) : null;
			return { ...round, playerBet };
		});
	}, [resolvedRounds, data]);

	return {
		resolvedRoundsWithPlayerBets: roundsWithPlayerBets,
		isLoadingResolvedRoundsWithPlayerBets: isLoading,
		errorFetchingResolvedRoundsWithPlayerBets: error,
		refetchResolvedRoundsWithPlayerBets: refetch,
	};
};

// helper
const parseBet = (betArray: RawBet): Bet => {
	return {
		amount: betArray[0],
		time: betArray[1],
		claimed: betArray[2],
	};
};
