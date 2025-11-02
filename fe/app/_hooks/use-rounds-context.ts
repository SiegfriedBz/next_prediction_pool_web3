"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { createContext, useContext } from "react";
import type { Round } from "../_types";
import type { RefetchType } from "./type";

export type RoundsContextT = {
	/** Array of Round objects (empty if not loaded) */
	rounds: Round[];
	/** Boolean indicating whether the data is currently loading */
	isLoadingRounds: boolean;
	/** Error object if the fetch failed, or null */
	errorFetchingRounds: ReadContractsErrorType | null;
	/** Function to manually refetch all rounds data */
	refetchRounds: RefetchType<ReadContractsErrorType>;
};

export const RoundsContext = createContext<RoundsContextT | null>(null);

export const useRoundsContext = () => {
	const ctx = useContext(RoundsContext);
	if (!ctx)
		throw new Error("useRoundsContext must be used inside RoundsProvider");
	return ctx;
};
