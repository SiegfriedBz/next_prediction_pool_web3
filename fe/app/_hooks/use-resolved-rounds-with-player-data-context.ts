"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { createContext, useContext } from "react";
import type {
	Round,
	RoundWithPlayerBet,
	RoundWithPlayerBetAndWins,
} from "../_types";
import type { RefetchType } from "./type";

export type ResolvedRoundsWithPlayerDataContextT = {
	// Data layers
	resolvedRounds: Round[];
	resolvedRoundsWithPlayerBets: RoundWithPlayerBet[];
	resolvedRoundsWithPlayerBetsAndWins: RoundWithPlayerBetAndWins[];

	// Individual loading & error states
	isLoadingRounds: boolean;
	errorFetchingRounds: ReadContractsErrorType | null;
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

export const ResolvedRoundsWithPlayerDataContext =
	createContext<ResolvedRoundsWithPlayerDataContextT | null>(null);

export const useResolvedRoundsWithPlayerDataContext = () => {
	const ctx = useContext(ResolvedRoundsWithPlayerDataContext);
	if (!ctx)
		throw new Error(
			"useResolvedRoundsWithPlayerDataContext must be used inside ResolvedRoundsWithPlayerDataProvider",
		);
	return ctx;
};
