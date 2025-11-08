"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { createContext, useContext } from "react";
import type {  RoundWithPlayerBet } from "../../_types";
import type { RefetchType } from "../type";

export type ActiveRoundsWithPlayerBetsContextT = {
	// Data layers
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
