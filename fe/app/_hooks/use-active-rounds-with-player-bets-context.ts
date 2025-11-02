"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { createContext, useContext } from "react";
import type { Round, RoundWithPlayerBet } from "../_types";
import type { RefetchType } from "./type";

export type ActiveRoundsWithPlayerBetsContextT = {
	// Data layers
	rounds: Round[];
	activeRoundsWithPlayerBets: RoundWithPlayerBet[];

	// Individual loading & error states
	isLoadingRounds: boolean;
	errorFetchingRounds: ReadContractsErrorType | null;
	isLoadingActiveRoundsWithPlayerBets: boolean;
	errorFetchingActiveRoundsWithPlayerBets: ReadContractsErrorType | null;

	// Combined loading & error states
	isLoadingActiveRoundsWithPlayerData: boolean;
	errorFetchingActiveRoundsWithPlayerData: ReadContractsErrorType | null;

	// Refetch
	refetchRounds: RefetchType<ReadContractsErrorType>;
	refetchActiveRoundsWithPlayerBets: RefetchType<ReadContractsErrorType>;
};

export const ActiveRoundsWithPlayerBetsContext =
	createContext<ActiveRoundsWithPlayerBetsContextT | null>(null);

export const useActiveRoundsWithPlayerBetsContext = () => {
	const ctx = useContext(ActiveRoundsWithPlayerBetsContext);
	if (!ctx)
		throw new Error(
			"useActiveRoundsWithPlayerBetsContext must be used inside ActiveRoundsWithPlayerBetsProvider",
		);
	return ctx;
};
