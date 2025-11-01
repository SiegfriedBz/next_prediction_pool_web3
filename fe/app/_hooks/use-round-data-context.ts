"use client";

import type {
	QueryObserverResult,
	RefetchOptions,
} from "@tanstack/react-query";
import type { ReadContractsErrorType } from "@wagmi/core";
import { createContext, useContext } from "react";
import type { Round } from "../_types";

export type RoundDataContextT = {
	/** Array of Round objects (empty if not loaded) */
	allRoundsData: Round[];
	/** Boolean indicating whether the data is currently loading */
	isLoadingAllRoundsData: boolean;
	/** Normalized error object if the fetch failed, or null */
	errorFetchingAllRoundsData: ReadContractsErrorType | null;
	/** Function to manually refetch all rounds data */
	refetchAllRoundsData: (options?: RefetchOptions | undefined) => Promise<
		QueryObserverResult<
			(
				| {
						error?: undefined;
						result: unknown;
						status: "success";
				  }
				| {
						error: Error;
						result?: undefined;
						status: "failure";
				  }
			)[],
			ReadContractsErrorType
		>
	>;
};

export const RoundDataContext = createContext<RoundDataContextT | null>(null);

export const useRoundDataContext = () => {
	const ctx = useContext(RoundDataContext);
	if (!ctx)
		throw new Error(
			"useRoundDataContext must be used inside RoundDataProvider",
		);
	return ctx;
};
