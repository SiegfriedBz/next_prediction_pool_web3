"use client";

import { useMemo } from "react";
import { usePlayerBetsAndWinsOnResolvedRounds } from "./use-player-bets-and-wins-on-resolved-rounds";
import { usePlayerBetsOnRounds } from "./use-player-bets-on-rounds";
import { useResolvedRounds } from "./use-resolved-rounds";
import type { ResolvedRoundsWithPlayerDataContextT } from "./use-resolved-rounds-with-player-data-context";

type ReturnType = ResolvedRoundsWithPlayerDataContextT;

export const useResolvedRoundsWithPlayerData = (): ReturnType => {
	// 1. Fetch all rounds data & filter resolved rounds
	const { resolvedRounds, isLoadingRounds, errorFetchingRounds } =
		useResolvedRounds();

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
		isLoadingRounds,
		errorFetchingRounds,
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
