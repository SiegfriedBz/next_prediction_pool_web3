"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { createContext, useContext } from "react";
import type {
	Round,
	RoundWithPlayerBet,
	RoundWithPlayerBetAndWins,
} from "../../_types";
import type { RefetchType } from "../type";

export type ResolvedRoundsWithPlayerBetsAndWinsContextT = {
	// Data layers
	resolvedRounds: Round[];
	resolvedRoundsWithPlayerBets: RoundWithPlayerBet[];
	resolvedRoundsWithPlayerBetsAndWins: RoundWithPlayerBetAndWins[];

	// Individual loading & error states
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

export const ResolvedRoundsWithPlayerBetsAndWinsContext =
	createContext<ResolvedRoundsWithPlayerBetsAndWinsContextT | null>(null);

export const useResolvedRoundsWithPlayerBetsAndWinsContext = () => {
	const ctx = useContext(ResolvedRoundsWithPlayerBetsAndWinsContext);
	if (!ctx)
		throw new Error(
			"useResolvedRoundsWithPlayerBetsAndWinsContext must be used inside ResolvedRoundsWithPlayerBetsAndWinsProvider",
		);
	return ctx;
};
