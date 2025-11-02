"use client";

import { type FC, type PropsWithChildren, useMemo } from "react";
import { useResolvedRoundsWithPlayerData } from "../_hooks/use-resolved-rounds-with-player-data";
import { ResolvedRoundsWithPlayerDataContext } from "../_hooks/use-resolved-rounds-with-player-data-context";

export const ResolvedRoundsWithPlayerDataProvider: FC<PropsWithChildren> = (
	props,
) => {
	const { children } = props;
	const {
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
	} = useResolvedRoundsWithPlayerData();

	const value = useMemo(() => {
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
	}, [
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
		<ResolvedRoundsWithPlayerDataContext.Provider value={value}>
			{children}
		</ResolvedRoundsWithPlayerDataContext.Provider>
	);
};
