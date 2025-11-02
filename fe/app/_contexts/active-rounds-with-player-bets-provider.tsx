"use client";

import { type FC, type PropsWithChildren, useMemo } from "react";
import { useActiveRoundsWithPlayerBets } from "../_hooks/use-active-rounds-with-player-bets";
import { ActiveRoundsWithPlayerBetsContext } from "../_hooks/use-active-rounds-with-player-bets-context";
import { useRounds } from "../_hooks/use-rounds";

export const ActiveRoundsWithPlayerBetsProvider: FC<PropsWithChildren> = (
	props,
) => {
	const { children } = props;
	const { rounds, isLoadingRounds, errorFetchingRounds, refetchRounds } =
		useRounds();

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
			rounds,
			activeRounds,
			activeRoundsWithPlayerBets,

			// Individual loading & error states
			isLoadingRounds,
			errorFetchingRounds,
			isLoadingActiveRoundsWithPlayerBets,
			errorFetchingActiveRoundsWithPlayerBets,

			// Combined loading & error states
			isLoadingActiveRoundsWithPlayerData,
			errorFetchingActiveRoundsWithPlayerData,

			// Refetch
			refetchRounds,
			refetchActiveRoundsWithPlayerBets,
		};
	}, [
		rounds,
		activeRounds,
		activeRoundsWithPlayerBets,

		isLoadingRounds,
		errorFetchingRounds,
		isLoadingActiveRoundsWithPlayerBets,
		errorFetchingActiveRoundsWithPlayerBets,

		isLoadingActiveRoundsWithPlayerData,
		errorFetchingActiveRoundsWithPlayerData,

		refetchRounds,
		refetchActiveRoundsWithPlayerBets,
	]);

	return (
		<ActiveRoundsWithPlayerBetsContext.Provider value={value}>
			{children}
		</ActiveRoundsWithPlayerBetsContext.Provider>
	);
};
