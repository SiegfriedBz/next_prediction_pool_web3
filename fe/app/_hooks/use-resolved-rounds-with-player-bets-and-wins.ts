"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import type {
	Round,
	RoundWithPlayerBet,
	RoundWithPlayerBetAndWins,
} from "../_types";
import type { RefetchType } from "./type";
import { usePlayerBetsAndWinsOnResolvedRounds } from "./use-player-bets-and-wins-on-resolved-rounds";
import { usePlayerBetsOnRounds } from "./use-player-bets-on-rounds";
import { useResolvedRounds } from "./use-resolved-rounds";

type Params = {
	rounds: Round[];
	isLoadingRounds: boolean;
	errorFetchingRounds: ReadContractsErrorType | null;
};

type ReturnType = {
	// Data layers
	resolvedRounds: Round[];
	resolvedRoundsWithPlayerBets: RoundWithPlayerBet[];
	resolvedRoundsWithPlayerBetsAndWins: RoundWithPlayerBetAndWins[];

	// Individual loading & error states
	isLoadingResolvedRoundsWithPlayerBets: boolean;
	errorFetchingResolvedRoundsWithPlayerBets: ReadContractsErrorType | null;
	isLoadingResolvedRoundsWithPlayerBetsAndWins: boolean;
	errorFetchingResolvedRoundsWithPlayerBetsAndWins: ReadContractsErrorType | null;

	// Combined loading & error states
	isLoadingResolvedRoundsWithPlayerData: boolean;
	errorFetchingResolvedRoundsWithPlayerData: ReadContractsErrorType | null;

	// Refetch
	refetchResolvedRoundsWithPlayerBets: RefetchType<ReadContractsErrorType>;
};

export const useResolvedRoundsWithPlayerBetsAndWins = (
	params: Params,
): ReturnType => {
	const { rounds, isLoadingRounds, errorFetchingRounds } = params;

	// 1. filter resolved rounds
	const { resolvedRounds } = useResolvedRounds({ rounds });

	// 2. Fetch all player's bets on all resolved rounds & Combine rounds with player's bet
	const {
		roundsWithPlayerBets: resolvedRoundsWithPlayerBets,
		isLoading: isLoadingResolvedRoundsWithPlayerBets,
		error: errorFetchingResolvedRoundsWithPlayerBets,
		refetch: refetchResolvedRoundsWithPlayerBets,
	} = usePlayerBetsOnRounds({ rounds: resolvedRounds });

	// 3. Fetch user win status and extend resolvedRoundsWithPlayerBets
	const {
		resolvedRoundsWithPlayerBetsAndWins,
		isLoadingResolvedRoundsWithPlayerBetsAndWins,
		errorFetchingResolvedRoundsWithPlayerBetsAndWins,
	} = usePlayerBetsAndWinsOnResolvedRounds({ resolvedRoundsWithPlayerBets });

	// Combined loading & error states
	const isLoadingResolvedRoundsWithPlayerData = useMemo(() => {
		return (
			isLoadingRounds ||
			isLoadingResolvedRoundsWithPlayerBets ||
			isLoadingResolvedRoundsWithPlayerBetsAndWins
		);
	}, [
		isLoadingRounds,
		isLoadingResolvedRoundsWithPlayerBets,
		isLoadingResolvedRoundsWithPlayerBetsAndWins,
	]);

	const errorFetchingResolvedRoundsWithPlayerData = useMemo(() => {
		return (
			errorFetchingRounds ||
			errorFetchingResolvedRoundsWithPlayerBets ||
			errorFetchingResolvedRoundsWithPlayerBetsAndWins
		);
	}, [
		errorFetchingRounds,
		errorFetchingResolvedRoundsWithPlayerBets,
		errorFetchingResolvedRoundsWithPlayerBetsAndWins,
	]);

	return {
		// Data layers
		resolvedRounds,
		resolvedRoundsWithPlayerBets,
		resolvedRoundsWithPlayerBetsAndWins,

		// Individual loading & error states
		isLoadingResolvedRoundsWithPlayerBets,
		errorFetchingResolvedRoundsWithPlayerBets,
		isLoadingResolvedRoundsWithPlayerBetsAndWins,
		errorFetchingResolvedRoundsWithPlayerBetsAndWins,

		// Combined loading & error states
		isLoadingResolvedRoundsWithPlayerData,
		errorFetchingResolvedRoundsWithPlayerData,

		// Refetch
		refetchResolvedRoundsWithPlayerBets,
	};
};
