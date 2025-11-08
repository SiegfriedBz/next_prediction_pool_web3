"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { createContext, useContext } from "react";
import type { Round } from "../../_types";
import type { RefetchType } from "../type";

export type RoundsContextT = {
	// Data layers
	rounds: Round[];

	// Individual loading & error states
	isLoadingRounds: boolean;
	errorFetchingRounds: ReadContractsErrorType | null;

	// Refetch
	refetchRounds: RefetchType<ReadContractsErrorType>;
};

export const RoundsContext =
	createContext<RoundsContextT | null>(null);

export const useRoundsContext = () => {
	const ctx = useContext(RoundsContext);
	if (!ctx)
		throw new Error(
			"useRoundsContext must be used inside RoundsProvider",
		);
	return ctx;
};
