"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import type { Abi } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { getPredictionPoolContractConfig } from "@/app/_contracts/prediction-pool";
import type {
	RoundWithPlayerBet,
	RoundWithPlayerBetAndWins,
} from "@/app/_types";
import type { RefetchType } from "../type";

type Params = {
	resolvedRoundsWithPlayerBets: RoundWithPlayerBet[];
};

type ReturnType = {
	resolvedRoundsWithPlayerBetsAndWins: RoundWithPlayerBetAndWins[];
	isLoadingResolvedRoundsWithPlayerBetsAndWins: boolean;
	errorFetchingResolvedRoundsWithPlayerBetsAndWins: ReadContractsErrorType | null;
	refetchResolvedRoundsWithPlayerBetsAndWins: RefetchType<ReadContractsErrorType>;
};

export const usePlayerBetsAndWinsOnResolvedRounds = (
	params: Params,
): ReturnType => {
	const { resolvedRoundsWithPlayerBets } = params;

	const { address } = useAccount();
	const chainId = useChainId();

	const contractConfig = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// prepare contract calls
	const roundToIsWinnerCalls = useMemo(() => {
		if (!address || resolvedRoundsWithPlayerBets.length === 0) return [];

		return resolvedRoundsWithPlayerBets
			.map((round) => {
				if (!round.playerBet) return null;
				return {
					...contractConfig,
					functionName: "isRoundWinner",
					args: [round.id, address],
				};
			})
			.filter(Boolean) as readonly {
			abi?: Abi;
			functionName?: string;
			args?: readonly unknown[];
			address?: `0x${string}`;
			chainId?: number;
		}[];
	}, [resolvedRoundsWithPlayerBets, contractConfig, address]);

	// Read isWinner result for each round
	const {
		data: roundToIsWinnerData,
		error,
		isLoading,
		refetch,
	} = useReadContracts({
		contracts: roundToIsWinnerCalls,
		query: {
			enabled: roundToIsWinnerCalls.length > 0 && !!address,
		},
	});

	// Combine with isWinner
	const resolvedRoundsWithPlayerBetsAndWins = useMemo(() => {
		let winnerIndex = 0;

		return resolvedRoundsWithPlayerBets.map((round) => {
			const playerIsWinner =
				round.playerBet && roundToIsWinnerData?.[winnerIndex]?.result === true;

			if (round.playerBet) winnerIndex++;

			return {
				...round,
				playerBet: round.playerBet,
				playerIsWinner: playerIsWinner ?? false,
			};
		});
	}, [resolvedRoundsWithPlayerBets, roundToIsWinnerData]);

	return {
		resolvedRoundsWithPlayerBetsAndWins,
		isLoadingResolvedRoundsWithPlayerBetsAndWins: isLoading,
		errorFetchingResolvedRoundsWithPlayerBetsAndWins: error,
		refetchResolvedRoundsWithPlayerBetsAndWins: refetch,
	};
};
