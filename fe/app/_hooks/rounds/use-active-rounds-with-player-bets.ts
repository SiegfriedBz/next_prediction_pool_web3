"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import type { Round, RoundWithPlayerBet } from "../../_types";
import type { RefetchType } from "../type";
import { useActiveRounds } from "./use-active-rounds";
import { usePlayerBetsOnRounds } from "./use-player-bets-on-rounds";

type Params = {
	rounds: Round[];
	isLoadingRounds: boolean;
	errorFetchingRounds: ReadContractsErrorType | null;
};

type ReturnType = {
	// Data layers
	activeRounds: Round[];
	activeRoundsWithPlayerBets: RoundWithPlayerBet[];

	// Individual loading & error states
	isLoadingActiveRoundsWithPlayerBets: boolean;
	errorFetchingActiveRoundsWithPlayerBets: ReadContractsErrorType | null;

	// Combined loading & error states
	isLoadingActiveRoundsWithPlayerData: boolean;
	errorFetchingActiveRoundsWithPlayerData: ReadContractsErrorType | null;

	// Refetch
	refetchActiveRoundsWithPlayerBets: RefetchType<ReadContractsErrorType>;
};

export const useActiveRoundsWithPlayerBets = (params: Params): ReturnType => {
	const { rounds, isLoadingRounds, errorFetchingRounds } = params;

	// 1. filter resolved rounds
	const { activeRounds } = useActiveRounds({ rounds });

	// 2. Fetch all player's bets on all active rounds & Combine rounds with player's bet
	const {
		roundsWithPlayerBets: activeRoundsWithPlayerBets,
		isLoading: isLoadingActiveRoundsWithPlayerBets,
		error: errorFetchingActiveRoundsWithPlayerBets,
		refetch: refetchActiveRoundsWithPlayerBets,
	} = usePlayerBetsOnRounds({ rounds: activeRounds });

	// Combined loading & error states
	const isLoadingActiveRoundsWithPlayerData = useMemo(() => {
		return isLoadingRounds || isLoadingActiveRoundsWithPlayerBets;
	}, [isLoadingRounds, isLoadingActiveRoundsWithPlayerBets]);

	const errorFetchingActiveRoundsWithPlayerData = useMemo(() => {
		return errorFetchingRounds || errorFetchingActiveRoundsWithPlayerBets;
	}, [errorFetchingRounds, errorFetchingActiveRoundsWithPlayerBets]);

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
};
