"use client";

import { type FC, type PropsWithChildren, useMemo } from "react";
import { useActiveRoundsWithPlayerBets } from "../_hooks/rounds/use-active-rounds-with-player-bets";
import { ActiveRoundsWithPlayerBetsContext } from "../_hooks/rounds/use-active-rounds-with-player-bets-context";
import { useRoundsContext } from "../_hooks/rounds/use-rounds-context";

export const ActiveRoundsWithPlayerBetsProvider: FC<PropsWithChildren> = (
	props,
) => {
	const { children } = props;
	const { rounds, isLoadingRounds, errorFetchingRounds } =
		useRoundsContext();

	const {
		// Data layers
		activeRounds,
		activeRoundsWithPlayerBets,

		// Individual loading & error states
		isLoadingActiveRoundsWithPlayerBets,
		errorFetchingActiveRoundsWithPlayerBets,

		// Combined loading & error states
		isLoadingActiveRoundsWithPlayerData,
		errorFetchingActiveRoundsWithPlayerData,

		// Refetch
		refetchActiveRoundsWithPlayerBets,
	} = useActiveRoundsWithPlayerBets({
		rounds,
		isLoadingRounds,
		errorFetchingRounds,
	});

	const value = useMemo(() => {
		return {
			// Data layers
			activeRounds,
			activeRoundsWithPlayerBets,

			// Individual loading & error states
			isLoadingActiveRoundsWithPlayerBets,
			errorFetchingActiveRoundsWithPlayerBets,

			// Combined loading & error states
			isLoadingActiveRoundsWithPlayerData,
			errorFetchingActiveRoundsWithPlayerData,

			// Refetch
			refetchActiveRoundsWithPlayerBets,
		};
	}, [
		activeRounds,
		activeRoundsWithPlayerBets,

		isLoadingActiveRoundsWithPlayerBets,
		errorFetchingActiveRoundsWithPlayerBets,

		isLoadingActiveRoundsWithPlayerData,
		errorFetchingActiveRoundsWithPlayerData,

		refetchActiveRoundsWithPlayerBets,
	]);

	return (
		<ActiveRoundsWithPlayerBetsContext.Provider value={value}>
			{children}
		</ActiveRoundsWithPlayerBetsContext.Provider>
	);
};
