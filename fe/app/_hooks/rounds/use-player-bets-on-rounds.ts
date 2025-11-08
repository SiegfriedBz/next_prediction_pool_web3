"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { getPredictionPoolContractConfig } from "@/app/_contracts/prediction-pool";
import type { RawBet, Round, RoundWithPlayerBet } from "@/app/_types";
import type { RefetchType } from "../type";
import { parseBet } from "../utils/parse-bet";

type Params = {
	rounds: Round[];
};

type ReturnType = {
	roundsWithPlayerBets: RoundWithPlayerBet[];
	isLoading: boolean;
	error: ReadContractsErrorType | null;
	refetch: RefetchType<ReadContractsErrorType>;
};

export const usePlayerBetsOnRounds = (params: Params): ReturnType => {
	const { rounds } = params;

	const { address } = useAccount();
	const chainId = useChainId();

	const contractConfig = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// prepare contract calls
	const roundToPlayerBetCalls = useMemo(() => {
		if (!address || rounds.length === 0) return [];

		return rounds.map((round) => ({
			...contractConfig,
			functionName: "roundToPlayerBet",
			args: [round.id, address],
			query: {
				queryKey: ["round-to-player-bet", `${round.id}-${address}`], // unique per round / user
			},
		}));
	}, [address, rounds, contractConfig]);

	// execute contract calls : get all player's bets on all rounds concurrently
	const { data, isLoading, error, refetch } = useReadContracts({
		contracts: roundToPlayerBetCalls,
		query: { enabled: roundToPlayerBetCalls.length > 0 && !!address },
	});

	// compute rounds With Player Bets
	const roundsWithPlayerBets = useMemo(() => {
		if (!rounds || !data) return [];

		return rounds.map((round, i) => {
			const raw = data[i]?.result;
			const playerBet = Array.isArray(raw) ? parseBet(raw as RawBet) : null;
			return { ...round, playerBet };
		});
	}, [rounds, data]);

	return {
		roundsWithPlayerBets,
		isLoading,
		error,
		refetch,
	};
};
