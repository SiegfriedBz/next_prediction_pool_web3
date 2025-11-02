"use client";

import { type FC, type PropsWithChildren, useMemo } from "react";
import { useResolvedRoundsWithPlayerBetsAndWins } from "../_hooks/use-resolved-rounds-with-player-bets-and-wins";
import { ResolvedRoundsWithPlayerBetsAndWinsContext } from "../_hooks/use-resolved-rounds-with-player-bets-and-wins-context";
import { useRounds } from "../_hooks/use-rounds";

export const ResolvedRoundsWithPlayerBetsAndWinsProvider: FC<
	PropsWithChildren
> = (props) => {
	const { children } = props;

	// fetch all rounds
	const { rounds, isLoadingRounds, errorFetchingRounds } = useRounds();

	// fetch and extend rounds with player Bets And Wins
	const {
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
	} = useResolvedRoundsWithPlayerBetsAndWins({
		rounds,
		isLoadingRounds,
		errorFetchingRounds,
	});

	const value = useMemo(() => {
		return {
			// Data layers
			rounds,
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
	}, [
		rounds,
		resolvedRounds,
		resolvedRoundsWithPlayerBets,
		resolvedRoundsWithPlayerBetsAndWins,

		isLoadingRounds,
		errorFetchingRounds,
		isLoadingResolvedRoundsWithPlayerBets,
		errorFetchingResolvedRoundsWithPlayerBets,
		isLoadingResolvedRoundsWithPlayerBetsAndWins,
		errorFetchingResolvedRoundsWithPlayerBetsAndWins,

		isLoadingResolvedRoundsWithPlayerData,
		errorFetchingResolvedRoundsWithPlayerData,

		refetchResolvedRoundsWithPlayerBets,
	]);

	return (
		<ResolvedRoundsWithPlayerBetsAndWinsContext.Provider value={value}>
			{children}
		</ResolvedRoundsWithPlayerBetsAndWinsContext.Provider>
	);
};
