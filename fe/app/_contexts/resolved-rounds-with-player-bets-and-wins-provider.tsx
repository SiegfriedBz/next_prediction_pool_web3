"use client";

import { type FC, type PropsWithChildren, useMemo } from "react";
import { useResolvedRoundsWithPlayerBetsAndWins } from "../_hooks/rounds/use-resolved-rounds-with-player-bets-and-wins";
import { ResolvedRoundsWithPlayerBetsAndWinsContext } from "../_hooks/rounds/use-resolved-rounds-with-player-bets-and-wins-context";
import { useRoundsContext } from "../_hooks/rounds/use-rounds-context";

export const ResolvedRoundsWithPlayerBetsAndWinsProvider: FC<
	PropsWithChildren
> = (props) => {
	const { children } = props;

	// fetch all rounds
	const { rounds, isLoadingRounds, errorFetchingRounds } = useRoundsContext();

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
	}, [
		resolvedRounds,
		resolvedRoundsWithPlayerBets,
		resolvedRoundsWithPlayerBetsAndWins,

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
